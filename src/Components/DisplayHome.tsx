import {
  FolderIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import DisplayConfirm from "./DisplayConfirm";
import SongTable from "./SongTable";

import { useSettingsContext } from "../Layouts/SettingsContext";

export default function DisplayHome() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {settingsData} = useSettingsContext();

  //re-render when settingsData updates
  useEffect(() => {
    //check if an sqlite file exists in the new directory
    const checkSqliteFile = async () => {
      if (settingsData) {
        const sqliteFileExists =
          await window.ipcRenderer.invoke("sqlite-file-exists");
        console.log("Does sqlite file exist: ", sqliteFileExists);
        setIsInitialized(sqliteFileExists);
        setIsConfirmed(false); //reset confirm state
      }
    };

    //display new settings data
    if (settingsData) {
      console.log("DisplayHome -> Passed settings: ", settingsData);
    }

    checkSqliteFile();
  }, [settingsData]);

  

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
          <SongTable />
        ) : (
          <DisplayConfirm isConfirmed={isConfirmed} setIsConfirmed={setIsConfirmed} />
        )}
      </div>
    );
  }
}
