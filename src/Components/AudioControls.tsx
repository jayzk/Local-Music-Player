import { Button } from "@headlessui/react";
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
    <div>
      <audio ref={audioRef} src={fileUrl} preload="metadata"></audio>
      <Button
        onClick={handlePlayPause}
        className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <input
        type="range"
        ref={sliderRef}
        max={duration.toString()}
        value={currentTime.toString()}
        onChange={handleSliderChange}
      />
      <span>{formatTime(currentTime)}</span> /{" "}
      <span>{formatTime(duration)}</span>
    </div>
  );
}
