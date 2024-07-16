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

import { useSettingsContext } from "../Layouts/SettingsContext.tsx";

interface AudioControlsProps {
  fileUrl: string;
}

export default function AudioControls({ fileUrl }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVol, setCurrentVol] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const {settingsData} = useSettingsContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeSliderRef = useRef<HTMLInputElement | null>(null);
  const volSliderRef = useRef<HTMLInputElement | null>(null);

  //run whenever settingsData changes
  useEffect(() => {
    console.log("Running audio setting updates");
    const audio = audioRef.current;

    if (audio && settingsData) {
      audio.volume = settingsData?.volume;
      setCurrentVol(audio.volume);
      console.log("Volume from settings: ", settingsData?.volume);
      console.log("Current volume: ", audio.volume);
    }
  }, [settingsData]);

  //functions for music player (run on mount as well)
  useEffect(() => {
    console.log("Running time updates");
    const audio = audioRef.current;

    if (audio) {
      const updateCurrentTime = () => {
        //continously update the slider as the audio plays
        setCurrentTime(audio.currentTime);
        console.log("Current audio time: ", audio.currentTime); //TODO: remove this later
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
      await window.ipcRenderer.invoke("update-volume-settings", newVol); //update new volume in settings

      console.log("setting volume time to: ", newVol);
      console.log("audio.volume is: ", audio.volume);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <audio ref={audioRef} src={fileUrl} preload="metadata"></audio>
      <div className="relative mb-2 flex w-[80%] space-x-3 rounded-full bg-slate-900 lg:w-[60%] xl:justify-center">
        <Button className="ml-20 inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600 xl:ml-2">
          <Shuffle />
        </Button>

        <Button className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600">
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

        <Button className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600">
          <ForwardIcon className="size-6" />
        </Button>

        <Button className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white transition hover:scale-110 data-[hover]:bg-gray-600">
          <ArrowPathRoundedSquareIcon className="size-6" />
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
