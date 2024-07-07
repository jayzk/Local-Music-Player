import {
  FolderIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import DisplayConfirm from "./DisplayConfirm";

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

  const testData = [
    { song: "The Sliding Mr. Bones (Next Stop, Pottersville)", artist: "Malcolm Lockyer", year: 1961 },
    { song: "Witchy Woman", artist: "The Eagles", year: 1972 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 }
  ];

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
          <DisplayConfirm isConfirmed={isConfirmed} setIsConfirmed={setIsConfirmed} />
        )}
      </div>
    );
  }
}
