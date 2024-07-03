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
import React, { useEffect, useRef, useState } from "react";

interface AudioControlsProps {
  fileUrl: string;
}

export default function AudioControls({ fileUrl }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVol, setCurrentVol] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeSliderRef = useRef<HTMLInputElement | null>(null);
  const volSliderRef = useRef<HTMLInputElement | null>(null);

  //functions for music player
  useEffect(() => {
    console.log("Running time updates");
    const audio = audioRef.current;

    if (audio) {
      //setting current volume
      setCurrentVol(audio.volume);
      console.log("Current volume: ", audio.volume);

      const updateCurrentTime = () => {
        //continously update the slider as the audio plays
        setCurrentTime(audio.currentTime);
        console.log("Current audio time: ", audio.currentTime); //TODO: remove this later
      };

      const updateDuration = () => {
        setDuration(audio.duration);
        console.log("Max audio duration: ", audio.duration);
      };

      // const updateVolume = () => {
      //   setCurrentVol(audio.volume);
      //   console.log("Current volume: ", audio.volume);
      // }

      //once metadata has been loaded, update the duration
      audio.addEventListener("loadedmetadata", updateDuration);

      //listen for when currentTime has been updated
      audio.addEventListener("timeupdate", updateCurrentTime);

      //listen for when volume has been updated
      //audio.addEventListener("volumechange", updateVolume);

      //cleanup
      return () => {
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("timeupdate", updateCurrentTime);
        //audio.removeEventListener("volumechange", updateVolume);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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

  const handleTimeChange = () => {
    const audio = audioRef.current;
    if (audio && timeSliderRef.current) {
      const newTime = parseFloat(timeSliderRef.current?.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime); //used to update the slider render only

      console.log("handleSliderChange -> setting slide time to: ", newTime);
      console.log(
        "handleSliderChange -> setting audio.currentTime to: ",
        audio.currentTime
      );
    }
  };

  const handleVolChange = () => {
    const audio = audioRef.current;
    if (audio && volSliderRef.current) {
      const newVol = Number(volSliderRef.current?.value);
      audio.volume = newVol;
      setCurrentVol(newVol); //used to update the slider render only

      console.log("setting volume time to: ", newVol);
      console.log("audio.volume is: ", audio.volume);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <audio ref={audioRef} src={fileUrl} preload="metadata"></audio>
      <div className="flex relative xl:justify-center w-[80%] lg:w-[60%] mb-2 space-x-3 bg-slate-900 rounded-full">
        <Button
          className="transition inline-flex items-center justify-center gap-2 rounded-full p-3 ml-20 xl:ml-2 text-sm/6 font-semibold text-white 
          data-[hover]:bg-gray-600 hover:scale-110"
        >
          <Shuffle />
        </Button>

        <Button
          className="transition inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white 
          data-[hover]:bg-gray-600 hover:scale-110"
        >
          <BackwardIcon className="size-6" />
        </Button>

        <Button
          onClick={handlePlayPause}
          className="transition delay-50 inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold 
          text-white data-[hover]:bg-gray-600 hover:scale-110"
        >
          {isPlaying ? (
            <PauseIcon className="size-6" />
          ) : (
            <PlayIcon className="size-6" />
          )}
        </Button>

        <Button
          className="transition inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold 
          text-white data-[hover]:bg-gray-600 hover:scale-110"
        >
          <ForwardIcon className="size-6" />
        </Button>

        <Button
          className="transition inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold 
          text-white data-[hover]:bg-gray-600 hover:scale-110"
        >
          <ArrowPathRoundedSquareIcon className="size-6" />
        </Button>

        <div className="flex absolute right-5 space-x-2 mr-2">
          <Button
            className="transition inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold 
            text-white data-[hover]:bg-gray-600 hover:scale-110"
          >
            <SpeakerWaveIcon className="size-6" />
          </Button>

          <input className="range"
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
