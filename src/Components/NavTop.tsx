import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";

type NavTopProps = {
  settingsData: any;
  setSettingsData: React.Dispatch<any>;
};

export default function NavTop({ settingsData, setSettingsData }: NavTopProps) {
  const [selectedDirPath, setSelectedDirPath] = useState("");

  const handleOpenDirDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
    if (filePaths.length > 0) {
      setSelectedDirPath(filePaths[0]); //update for rendering

      //get new directory
      console.log("New directory selected: ", filePaths[0]);
      await window.ipcRenderer.invoke("update-directory-settings", filePaths[0]);

      //update settings data to let parent component know
      const newSettingsData = await window.ipcRenderer.invoke("read-settings-data");
      console.log("New settings: ", newSettingsData);
      setSettingsData(newSettingsData);
    }
  };

  //re-render when settingsData updates
  useEffect(() => {
    if (settingsData) {
      console.log("NavTop -> Passed settings: ", settingsData);
      setSelectedDirPath(settingsData?.selectedDir); //used for rendering
    }
  }, [settingsData]);

  //logging dir info
  useEffect(() => {
    if (selectedDirPath) {
      console.log("NavTop -> Selected Dir: ", selectedDirPath);
    }
  }, [selectedDirPath]);

  return (
    <div className="relative flex justify-end border-b-2 border-slate-700 p-3 lg:justify-center">
      <div className="absolute left-2 top-0">
        <label className="mb-2 block text-sm text-gray-900 dark:text-white">
          Select Music Directory
        </label>
        <div>
          <button
            onClick={handleOpenDirDialog}
            className="rounded-l-lg bg-slate-100 p-1 px-2 text-sm text-black hover:bg-slate-300"
          >
            Browse
          </button>
          <input
            className="truncate bg-slate-600 p-1 text-sm"
            placeholder={selectedDirPath}
            disabled
          />
        </div>
      </div>
      <div className="relative flex">
        <input
          className="peer h-10 rounded-lg border-2 border-slate-600 bg-slate-600 px-5 pl-10 text-sm text-white caret-white outline-none transition duration-200 focus:border-white"
          placeholder="Search"
        />
        <MagnifyingGlassIcon className="absolute inset-2.5 size-5 text-gray-400 transition duration-200 peer-focus:text-white" />
      </div>
    </div>
  );
}
