import { Button } from "@headlessui/react";
import {
  PauseIcon,
  PlayIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathRoundedSquareIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/20/solid";
import Shuffle from "../../public/additional-icons/shuffle.tsx";
import { useEffect, useRef, useState } from "react";

import { useSettingsContext } from "../Contexts/SettingsContext.tsx";
import {
  appendFilePaths,
  fetchCurrentRowNum,
  fetchSongByRowNum,
  fetchTotalNumOfSongs,
  updateCurrentlyPlayingSettings,
  updateVolumeSettings,
} from "../utils/IpcUtils";
import { songType } from "../../public/types.ts";
import { formatTime, getRandomInt, sleep } from "../utils/helpers.ts";

interface AudioControlsProps {
  fileUrl: string;
}

export default function AudioControls({ fileUrl }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVol, setCurrentVol] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isRandomized, setIsRandomized] = useState(false);

  const { settingsData, updateSettings } = useSettingsContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeSliderRef = useRef<HTMLInputElement | null>(null);
  const volSliderRef = useRef<HTMLInputElement | null>(null);

  //run whenever settingsData volume changes
  useEffect(() => {
    console.log("Running audio setting updates");
    const audio = audioRef.current;

    if (audio && settingsData) {
      audio.volume = settingsData?.volume;
      setCurrentVol(audio.volume);
      console.log("Volume from settings: ", settingsData?.volume);
      console.log("Current volume: ", audio.volume);
    }
  }, [settingsData?.volume]);

  //render everytime fileUrl changes
  useEffect(() => {
    console.log("Running time updates");
    const audio = audioRef.current;

    //if playing state is still true, continue to play audio. If not pause
    if (isPlaying === true) {
      audio?.play();
    } else {
      setIsPlaying(false);
    }

    //reset current time and duration
    setCurrentTime(0);
    setDuration(0);

    if (audio) {
      const updateCurrentTime = () => {
        //continously update the slider as the audio plays
        setCurrentTime(audio.currentTime);
      };

      const updateDuration = () => {
        setDuration(audio.duration);
        console.log("Max audio duration: ", audio.duration);
      };

      //once metadata has been loaded, update the duration
      audio.addEventListener("loadedmetadata", updateDuration);

      //listen for when currentTime has been updated
      audio.addEventListener("timeupdate", updateCurrentTime);

      //cleanup
      return () => {
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("timeupdate", updateCurrentTime);
      };
    }
  }, [fileUrl]);

  //monitor if song is done playing
  useEffect(() => {
    const formattedCurrentTime = formatTime(currentTime);
    const formattedDuration = formatTime(duration);

    if ((formattedCurrentTime === formattedDuration) && duration != 0 && settingsData) {
      console.log("Audio is done!");

      if (isLooping) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          setCurrentTime(0);

          if (isPlaying === true) {
            audio?.play();
          } else {
            setIsPlaying(false);
          }
        }
      } else if (isRandomized) {
        playRandom();
      } else {
        playNextTrack();
      }
    }
  }, [currentTime]);

  async function playSong(rowNum: number) {
    //fetch song in the next row
    const songResult = await fetchSongByRowNum(rowNum);

    //could be it's own function
    let song: songType;
    if (songResult.success && settingsData) {
      console.log("Fetched song: ", songResult.data);
      song = songResult.data;

      //get the absolute file path and change what is being played
      const absolutePath = await appendFilePaths(
        settingsData.selectedDir,
        song.FileLocation,
      );
      const settingResult = await updateCurrentlyPlayingSettings(
        absolutePath,
        song.SongID,
      );

      if (settingResult.success) {
        updateSettings();
      }
    }
  }

  async function playRandom() {
    if (settingsData) {
      //get current playing song's row number in the song table
      const currentRowNumResult = await fetchCurrentRowNum(
        settingsData.currentlyPlayingID,
      );

      const totalResult = await fetchTotalNumOfSongs();

      if (currentRowNumResult.success && totalResult.success) {
        //get total number of songs
        const numOfSongs = totalResult.data.Total;
        console.log("Total number of songs: ", numOfSongs);

        //get current row number in table
        const currentRowNum = Number(currentRowNumResult.data.RowNum);
        console.log("Fetching current row of current song: ", currentRowNum);

        //get a random number from 1 - (the total number of songs)
        let randomNum = getRandomInt(1, numOfSongs);

        //ensure we don't play the current song again
        while (currentRowNum === randomNum) {
          randomNum = getRandomInt(1, numOfSongs);
        }

        playSong(randomNum);
      }
    }
  }

  async function playNextTrack() {
    if (settingsData) {
      //get current playing song's row number in the song table
      const currentRowNumResult = await fetchCurrentRowNum(
        settingsData.currentlyPlayingID,
      );

      const totalResult = await fetchTotalNumOfSongs();

      if (currentRowNumResult.success && totalResult.success) {
        //get total number of songs
        const numOfSongs = totalResult.data.Total;
        console.log("Total number of songs: ", numOfSongs);

        //get current row number in table
        const currentRowNum = Number(currentRowNumResult.data.RowNum);
        console.log("Fetching current row of current song: ", currentRowNum);

        //fetch song in the next row
        await sleep(1000);
        if (currentRowNum === numOfSongs) {
          //loop back the beginning of the list
          playSong(1);
        } else {
          playSong(currentRowNum + 1);
        }
      }
    }
  }

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        console.log("Audio paused");
      } else {
        audio.play();
        console.log("Resume audio");
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = Number(volSliderRef.current?.value);
        console.log("Volume on");
      } else {
        audio.volume = 0;
        console.log("Volume off");
      }
      setIsMuted(!isMuted);
    }
  };

  const handleTimeChange = () => {
    const audio = audioRef.current;
    if (audio && timeSliderRef.current) {
      const newTime = parseFloat(timeSliderRef.current?.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime); //used to update the slider render only

      console.log("handleSliderChange -> setting slide time to: ", newTime);
      console.log(
        "handleSliderChange -> setting audio.currentTime to: ",
        audio.currentTime,
      );
    }
  };

  const handleVolChange = async () => {
    const audio = audioRef.current;
    if (audio && volSliderRef.current) {
      const newVol = Number(volSliderRef.current?.value);
      if (!isMuted) {
        audio.volume = newVol;
      }
      setCurrentVol(newVol); //used to update the slider render only
      await updateVolumeSettings(newVol);

      console.log("audio.volume is: ", audio.volume);
    }
  };

  const handleBackwards = async () => {
    if (settingsData) {
      //get current playing song's row number in the song table
      const currentRowNumResult = await fetchCurrentRowNum(
        settingsData.currentlyPlayingID,
      );

      if (currentRowNumResult.success) {
        //get current row number in table
        const currentRowNum = Number(currentRowNumResult.data.RowNum);
        console.log("Fetching current row of current song: ", currentRowNum);

        //get previous song
        if (currentRowNum === 1) {
          playSong(1);
        } else {
          playSong(currentRowNum - 1);
        }
      }
    }
  };

  const handleForwards = async () => {
    if (settingsData) {
      //get current playing song's row number in the song table
      const currentRowNumResult = await fetchCurrentRowNum(
        settingsData.currentlyPlayingID,
      );

      const totalResult = await fetchTotalNumOfSongs();

      if (currentRowNumResult.success && totalResult.success) {
        //get total number of songs
        const numOfSongs = totalResult.data.Total;
        console.log("Total number of songs: ", numOfSongs);

        //get current row number in table
        const currentRowNum = Number(currentRowNumResult.data.RowNum);
        console.log("Fetching current row of current song: ", currentRowNum);

        //fetch next song
        if (currentRowNum === numOfSongs) {
          playSong(numOfSongs);
        } else {
          playSong(currentRowNum + 1);
        }
      }
    }
  };

  const handleLoop = () => {
    console.log("Loop toggled");
    setIsLooping((prev) => !prev);
  };

  const handleRandom = () => {
    console.log("Random toggled");
    setIsRandomized((prev) => !prev);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <audio ref={audioRef} src={fileUrl} preload="metadata"></audio>
      <div className="relative mb-2 flex w-[80%] space-x-3 rounded-full bg-slate-900 lg:w-[60%] xl:justify-center">
        <Button
          className="relative ml-20 inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600 xl:ml-2"
          onClick={handleRandom}
        >
          <Shuffle />
          {isRandomized ? (
            <span className="absolute right-1 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
          ) : (
            <></>
          )}
        </Button>

        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600"
          onClick={handleBackwards}
        >
          <BackwardIcon className="size-6" />
        </Button>

        <Button
          onClick={handlePlayPause}
          className="delay-50 inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600"
        >
          {isPlaying ? (
            <PauseIcon className="size-6" />
          ) : (
            <PlayIcon className="size-6" />
          )}
        </Button>

        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600"
          onClick={handleForwards}
        >
          <ForwardIcon className="size-6" />
        </Button>

        <Button
          className="relative inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold transition hover:scale-110 data-[hover]:bg-gray-600"
          onClick={handleLoop}
        >
          <ArrowPathRoundedSquareIcon className="size-6 text-white" />
          {isLooping ? (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
          ) : (
            <></>
          )}
        </Button>

        <div className="absolute right-5 mr-2 flex space-x-2">
          <Button
            className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600"
            onClick={handleMute}
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="size-6" />
            ) : (
              <SpeakerWaveIcon className="size-6" />
            )}
          </Button>

          <input
            className="range"
            type="range"
            ref={volSliderRef}
            max="1"
            step="0.01"
            value={currentVol.toString()}
            onChange={handleVolChange}
          />
        </div>
      </div>

      <div className="flex w-1/2 items-center justify-center space-x-2">
        <span>{formatTime(currentTime)}</span>
        <input
          className="range w-full accent-black"
          type="range"
          ref={timeSliderRef}
          max={duration.toString()}
          value={currentTime.toString()}
          onChange={handleTimeChange}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
