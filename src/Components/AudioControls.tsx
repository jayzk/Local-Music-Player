import { Button } from "@headlessui/react";
import { PauseIcon, PlayIcon, ForwardIcon, BackwardIcon, ArrowPathRoundedSquareIcon } from "@heroicons/react/20/solid";
import Shuffle from "../../public/additional-icons/shuffle.tsx"
import React, { useEffect, useRef, useState } from "react";

interface AudioControlsProps {
  fileUrl: string;
}

export default function AudioControls({
  fileUrl,

}: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);

  //functions for music player
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
      audio.addEventListener("timeupdate", updateCurrentTime); //MAYBE: i have to use this in the other func?

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

  const handleSliderChange = () => {
    const audio = audioRef.current;
    if (audio && sliderRef.current) {
      const newTime = Number(sliderRef.current?.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime); //used to update the slider render only

      console.log("handleSliderChange -> setting slide time to: ", newTime);
      console.log(
        "handleSliderChange -> setting audio.currentTime to: ",
        audio.currentTime
      );
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      <audio ref={audioRef} src={fileUrl} preload="metadata"></audio>
      <div className="flex justify-center w-1/2 mb-2 space-x-3 bg-gray-700 rounded-full">
        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
        >
          <Shuffle />
        </Button>

        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
        >
          <BackwardIcon className="size-6"/>
        </Button>

        <Button
          onClick={handlePlayPause}
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
        >
          {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6"/>}
        </Button>

        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
        >
          <ForwardIcon className="size-6"/>
        </Button>

        <Button
          className="inline-flex items-center justify-center gap-2 rounded-full p-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
        >
          <ArrowPathRoundedSquareIcon className="size-6" />
        </Button>
      </div>
      
      <div className="flex w-1/2 items-center justify-center space-x-2">
        <span>{formatTime(currentTime)}</span>
        <input
          className="w-full"
          type="range"
          ref={sliderRef}
          max={duration.toString()}
          value={currentTime.toString()}
          onChange={handleSliderChange}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
