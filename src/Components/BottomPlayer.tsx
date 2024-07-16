import React, { useEffect, useState } from 'react'
import AudioControls from './AudioControls'

import { useSettingsContext } from '../Layouts/SettingsContext';

export default function BottomPlayer() {
  const [url, setUrl] = useState("");

  const {settingsData} = useSettingsContext();

  useEffect(() => {
    const fileUrl = settingsData?.currentlyPlaying;

    console.log("BottomPlayer -> Now Playing: ", fileUrl)

    setUrl(fileUrl);
  }, [settingsData?.currentlyPlaying]); //re-render everytime currentlyPlaying in settings changes

  return (
    <div className='flex h-full justify-center content-center items-center w-screen'>
        <AudioControls fileUrl={url} />
    </div>
  )
}
