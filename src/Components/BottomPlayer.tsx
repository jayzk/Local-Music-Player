import React, { useEffect, useState } from 'react'
import AudioControls from './AudioControls'

export default function BottomPlayer() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const fileUrl = `media-loader:///${encodeURIComponent("C:/Users/jayde/Music/Overwhelmed - Ryan Mack & Christian Gates-[ApsgDNiZhXI].opus")}`;
    //const fileUrl = `media-loader:///${encodeURIComponent("C:/Users/jayde/Music/はいよろこんで こっちのけんと MV-[jzi6RNVEOtA].opus")}`;
    
    // const filePath = "C:/Users/jayde/Music/はいよろこんで こっちのけんと MV-[jzi6RNVEOtA].opus";
    // const fileUrl = `media-loader:///${decodeURIComponent(filePath)}`;

    console.log("BOTTOM FILE URL: ", fileUrl)

    setUrl(fileUrl);
  }, []);

  useEffect(() => {
    if(url) {
      console.log("BOTTOM URL: ", url)
    }
  }, [url])

  return (
    <div className='flex h-full justify-center content-center items-center w-screen'>
        <AudioControls fileUrl={url} />
    </div>
  )
}
