import React, { useEffect, useState } from 'react'
import { FolderIcon } from '@heroicons/react/20/solid'

async function fetchSettings() {
  try {
    const result = await window.ipcRenderer.invoke("read-settings-data");
    return result;
  } catch (error) {
    console.error("AddMusicYT -> Error invoking fetch settings:", error);
    return null;
  }
}

export default function AddMusicYT() {
  const [settingsData, setSettingsData] = useState<any | null>(null);

  const handleOpenDirDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
    if (filePaths.length > 0) {

      //get new directory
      console.log("New directory selected: ", filePaths[0]);
      await window.ipcRenderer.invoke(
        "update-directory-settings",
        filePaths[0],
      );

      //update settings data to let parent component know
      const newSettingsData =
        await window.ipcRenderer.invoke("read-settings-data");
      console.log("New settings: ", newSettingsData);
      setSettingsData(newSettingsData);
    }
  };

  //run on mount
  useEffect(() => {
    const getSettings = async () => {
      const data = await fetchSettings();
      setSettingsData(data);
    };

    getSettings();
  }, []);

  //log settings info
  useEffect(() => {
    if (settingsData) {
      console.log("AddMusicYT -> Settings Data: ", settingsData);
    }
  }, [settingsData]);
  
  return (
    <div className='h-full'>
      <div className='h-[15%] space-y-2 py-2 border-b-2 border-slate-700'>
        <div className='flex w-full text-white justify-center items-center'>
          <FolderIcon className='size-10 mr-2'/>
          Current Music Folder
        </div>
        <div className='flex w-full text-white justify-center items-center space-x-2'>
          <input
              className="truncate bg-slate-600 p-1 rounded-lg"
              placeholder={settingsData?.selectedDir}
              size={50}
              disabled
            />
            <button
              onClick={handleOpenDirDialog}
              className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
            >
              Change...
            </button>
        </div>
      </div>
      <div className='h-[85%] flex flex-col justify-center items-center space-y-2'>
        <div className='text-lg text-white flex flex-row'>
          <p className='font-bold underline underline-offset-1 mx-2'>Insert Youtube URL here!</p> 
          Downloaded contents will be stored in your music folder
        </div>
        <div className='flex flex-row space-x-2'>
          <input
              className="truncate transition duration-200 bg-slate-600 p-1 rounded-lg text-lg text-white outline-none border-2 border-slate-600 focus:border-white"
              placeholder="Input Youtube URL here..."
              size={50}
            />
            <button
              className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
            >
              Download
            </button>
        </div>
        
      </div>
    </div>
  )
}
