import electron from "electron";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@headlessui/react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import AudioControls from "../Components/AudioControls";

export default function Home() {
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [selectedDirPath, setSelectedDirPath] = useState("");

  //For music player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  //const [metadata, setMetadata] = useState<{ duration: number }>({ duration: 0 });

  const handleOpenFileDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-file-dialog");
    if (filePaths.length > 0) {
      setSelectedFilePath(filePaths[0]);
    }
  };

  const handleOpenDirDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
    if (filePaths.length > 0) {
      setSelectedDirPath(filePaths[0]);
    }
  };

  //functions for music player
  useEffect(() => {
    console.log("Running time updates");
    const audio = audioRef.current;

    if (audio) {

      const updateCurrentTime = () => {
        //audio.currentTime = Number(sliderRef.current?.value);
        setCurrentTime(audio.currentTime); //continuoslly update the slider
        console.log("Current audio time: ", audio.currentTime); //Auto-updates, how????
      };

      const updateDuration = () => {
        setDuration(audio.duration);
        console.log("Max audio duration: ", audio.duration);
      }

      //once metadata has been loaded, update the duration
      audio.addEventListener("loadedmetadata", updateDuration); 

      //listen for when currentTime has been updated
      audio.addEventListener("timeupdate", updateCurrentTime); //MAYBE: i have to use this in the other func?

      //cleanup
      return () => {
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("timeupdate", updateCurrentTime);
      }
    }

  }, []); //useEffect if audioRef & current exists and the metadata is avaliable

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
      audio.currentTime = newTime; //WHY DOESNT THIS CHANGE FFS
      setCurrentTime(newTime); //used to update the slider render only
      console.log("handleSliderChange -> setting slide time to: ", newTime);
      console.log("handleSliderChange -> setting audio.currentTime to: ", audio.currentTime);
      //console.log("handleSliderChange -> Current state audio time: ", currentTime); //we do not want this

      const timeRangesObj = audio.seekable;
      console.log("Test 1:", timeRangesObj);
    }
  };

  const handleTest = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 80;
      setCurrentTime(80); //used to update the slider render only
      console.log("handleSliderChange -> setting audio.currentTime to: ", audio.currentTime);
      //console.log("handleSliderChange -> Current state audio time: ", currentTime); //we do not want this
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // media-loader:///D:/Music/Galantis-NoMoney-Copy.wav

  const fileUrl = selectedFilePath
    ? `media-loader:///${encodeURIComponent(selectedFilePath)
        .replace(/%3A/g, ":")
        .replace(/%5C/g, "/")}`
    : "";
  const fileExtension = selectedFilePath
    ? selectedFilePath.split(".").pop()?.toLowerCase()
    : "";

  //logging file info
  useEffect(() => {
    if (selectedFilePath) {
      console.log("Incoming file information");
      console.log("fileUrl: ", fileUrl);
      console.log("fileExtension: ", fileExtension);
    }

    console.log("Running time updates");
    const audio = audioRef.current;

    if (audio) {

      const updateCurrentTime = () => {
        //audio.currentTime = Number(sliderRef.current?.value);
        setCurrentTime(audio.currentTime); //continuoslly update the slider
        console.log("Current audio time: ", audio.currentTime); //Auto-updates, how????
      };

      const updateDuration = () => {
        setDuration(audio.duration);
        console.log("Max audio duration: ", audio.duration);
      }

      //once metadata has been loaded, update the duration
      audio.addEventListener("loadedmetadata", updateDuration); 

      //listen for when currentTime has been updated
      audio.addEventListener("timeupdate", updateCurrentTime); //MAYBE: i have to use this in the other func?

      //cleanup
      return () => {
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("timeupdate", updateCurrentTime);
      }
    }
  }, [selectedFilePath, fileUrl, fileExtension]);

  return (
    <div>
      <h1>Electron React File Dialog</h1>
      <button onClick={handleOpenFileDialog}>Open File Dialog</button>
      {selectedFilePath && <p>Selected Path: {selectedFilePath}</p>}

      <h1>Electron React Directory Dialog</h1>
      <button onClick={handleOpenDirDialog}>Open Directory Dialog</button>
      {selectedDirPath && <p>Selected Path: {selectedDirPath}</p>}

      <h1>IMAGE TEST</h1>
      {/* <img src={selectedFilePath} alt="My Image" /> */}
      {fileUrl && (
        <img
          src={fileUrl}
          alt="My Image"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      )}

      {/* TESTING AUDIO */}
      {/* <audio ref={audioRef} src="media-loader:///D:/Music/Galantis-NoMoney.mp3" preload="metadata">
      </audio>
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
      <span>{formatTime(duration)}</span> */}

      {/* <AudioPlayer
      src="file:///D:/Music/Galantis-NoMoney.mp3"
      onPlay={e => console.log("onPlay")}
      // other props here
    /> */}

      {fileUrl &&
        fileExtension &&
        (fileExtension === "mp3" ||
          fileExtension === "wav" ||
          fileExtension === "ogg") && (
          // <div>
          //   <audio ref={audioRef} src={fileUrl} preload="metadata">
          //   </audio>
          //   <Button
          //     onClick={handlePlayPause}
          //     className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white data-[hover]:bg-gray-600"
          //   >
          //     {isPlaying ? "Pause" : "Play"}
          //   </Button>
          //   <input
          //     type="range"
          //     ref={sliderRef}
          //     max={duration.toString()}
          //     value={currentTime.toString()}
          //     onChange={handleSliderChange}
          //   />
          //   <span>{formatTime(currentTime)}</span> /{" "}
          //   <span>{formatTime(duration)}</span>
          // </div>
          <AudioControls fileUrl={fileUrl} fileExtension={fileExtension} _audioRef={audioRef} _sliderRef={sliderRef} />
        )}
    </div>
  );
}
