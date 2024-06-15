import electron from "electron";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@headlessui/react";

export default function Home() {
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [selectedDirPath, setSelectedDirPath] = useState("");

  //For music player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const [metadata, setMetadata] = useState<{ duration: number }>({ duration: 0 });

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
    const audio = audioRef.current;
    console.log("init test");

    const handleLoadedMetadata = () => {
      if (audio) {
        setMetadata({
          duration: audio.duration,
        });
        
        console.log('Duration:', audio.duration);
      }
    };

    if (audio) {
      console.log("init test2");
      const getDuration = (event: Event) => {
        const target = event.target as HTMLAudioElement;
        target.currentTime = 24*60*60;
        target.removeEventListener('timeupdate', getDuration);
        console.log(target.duration);
        setDuration(target.duration);
      };

      const updateCurrentTime = () => {
        setCurrentTime(audio.currentTime);
      };

      const updateDuration = () => {
        if (audio.duration !== Infinity && !isNaN(audio.duration)) {
          //audio.addEventListener('timeupdate', getDuration);
          audio.currentTime = 1e101;
          setDuration(audio.duration);
          console.log(audio.duration);
        }
      };

      

      audio.onloadedmetadata = handleLoadedMetadata;

      audio.addEventListener("timeupdate", updateCurrentTime);
      //audio.addEventListener("loadedmetadata", updateDuration);

      return () => {
        audio.removeEventListener("timeupdate", updateCurrentTime);
        //audio.removeEventListener("loadedmetadata", updateDuration);
        if (audio) {
          audio.onloadedmetadata = null;
        }
      };
    }
  }, []);

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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
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
      <audio ref={audioRef} src="media-loader:///D:/Music/Galantis-NoMoney.mp3">
        {/* <source src="media-loader:///D:/Music/Galantis-NoMoney-Copy.wav" type={`audio/wav`} />
        Your browser does not support the audio element. */}
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
        max={metadata.duration.toString()}
        value={currentTime.toString()}
        onChange={handleSliderChange}
      />
      <span>{formatTime(currentTime)}</span> /{" "}
      <span>{formatTime(metadata.duration)}</span>

      {fileUrl &&
        fileExtension &&
        (fileExtension === "mp3" ||
          fileExtension === "wav" ||
          fileExtension === "ogg") && (
          <div>
            <audio>
              <source src={fileUrl} type={`audio/${fileExtension}`} />
              Your browser does not support the audio element.
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
            <span>{formatTime(duration)}</span>
          </div>
        )}
    </div>
  );
}
