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

  //TODO: delete later
  const handleOpenFileDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-file-dialog");
    if (filePaths.length > 0) {
      const fileUrl = `media-loader:///${encodeURIComponent(filePaths[0])}`;
      setUrl(fileUrl);

      await window.ipcRenderer.invoke(
        "update-currentlyPlaying-settings",
        filePaths[0],
      );
    }
  };

  //TODO: delete later
  const handleTest = async () => {
    const filePaths = await window.ipcRenderer.invoke("meta-test");
  };

  return (
    <div className='flex h-full justify-center content-center items-center w-screen'>
        <AudioControls fileUrl={url} />
        <button
            className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
            onClick={handleTest}
          >
            test
          </button>
    </div>
  )
}
