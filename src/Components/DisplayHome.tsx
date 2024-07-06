import { FolderIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

type DisplayHomeProps = {
  settingsData: any;
};

export default function DisplayHome({ settingsData }: DisplayHomeProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  //re-render when settingsData updates
  useEffect(() => {
    //check if an sqlite file exists in the new directory
    const checkSqliteFile = async () => {
      if(settingsData) {
        const sqliteFileExists = await window.ipcRenderer.invoke('sqlite-file-exists');
        console.log("Does sqlite file exist: ", sqliteFileExists);
        setIsInitialized(sqliteFileExists);
        setIsConfirmed(false); //reset confirm state
      }
    }

    //display new settings data
    if (settingsData) {
      console.log("DisplayHome -> Passed settings: ", settingsData);
    }

    checkSqliteFile();
  }, [settingsData]);

  const handleConfirm = async () => {  
    setIsConfirmed(!isConfirmed);
    console.log("Confirm btn pressed, confirm = ", isConfirmed);

    await window.ipcRenderer.invoke('create-database');
  }

  if (!settingsData || settingsData?.selectedDir === "") {
    //No directory/folder is selected
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <FolderIcon className="size-48 animate-bounce" />
        <p>Please select your music directory</p>
      </div>
    );
  } else {

    return (
      <div className="h-full">
        {isConfirmed || isInitialized ? (
          <p>test</p>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <QuestionMarkCircleIcon className="size-48 animate-bounce" />
            <p>Confirm and initialize this directory/folder as your music directory?</p>
            <p>(A database file will be added in this directory/folder)</p>
            <button className="rounded-lg p-2 m-2 bg-indigo-600 text-white hover:bg-indigo-500" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        )}
      </div>
    );
  }
}
