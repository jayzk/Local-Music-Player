import React, { useEffect, useState } from "react";
import AudioControls from "./AudioControls";

import { useSettingsContext } from "../Contexts/SettingsContext";

export default function BottomPlayer() {
  const [url, setUrl] = useState("");

  const { settingsData } = useSettingsContext();

  useEffect(() => {
    const fileUrl = settingsData?.currentlyPlaying;

    console.log("BottomPlayer -> Now Playing: ", fileUrl);

    if(fileUrl)
      setUrl(fileUrl);
    else 
      setUrl("");
  }, [settingsData?.currentlyPlaying]); //re-render everytime currentlyPlaying in settings changes

  return (
    <div className="flex h-full w-screen content-center items-center justify-center">
      <AudioControls fileUrl={url} />
    </div>
  );
}
