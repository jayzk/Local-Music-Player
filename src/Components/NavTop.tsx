import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";

import { useSettingsContext } from "../Contexts/SettingsContext";
import { useSongListContext } from "../Contexts/SongListContext";
import { useToastContext } from "../Contexts/ToastContext";

export default function NavTop() {
  const [selectedDirPath, setSelectedDirPath] = useState("");
  const { settingsData, updateSettings } = useSettingsContext();
  const {updateSongList} = useSongListContext();
  const toast = useToastContext();

  const handleOpenDirDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
    if (filePaths.length > 0) {
      setSelectedDirPath(filePaths[0]); //update for rendering

      //get new directory
      console.log("New directory selected: ", filePaths[0]);
      await window.ipcRenderer.invoke(
        "update-directory-settings",
        filePaths[0],
      );

      //update settings data
      updateSettings();
    }
  };

  const handleRefresh = async () => {
    const result = await window.ipcRenderer.invoke("add-folder-files");
    if(result.success) {
      updateSongList();
      toast.success(result.message);
    } else {
      toast.error(result.message);
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
    <div className="relative flex flex-col items-center justify-center space-y-2 border-b-2 border-slate-700 p-3 lg:flex-row lg:justify-center">
      <div className="lg:absolute lg:left-2 lg:top-0">
        <label className="mb-2 block text-sm text-gray-900 dark:text-white">
          Select Music Directory
        </label>
        <div>
          <button
            onClick={handleOpenDirDialog}
            className="rounded-l-lg bg-indigo-600 p-1 px-2 text-sm text-white hover:bg-indigo-500"
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
      <div className="lg:absolute lg:right-20 lg:top-2">
        <button
          className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500"
          onClick={handleRefresh}
        >
          <div className="group flex items-center justify-center">
            <ArrowPathIcon className="mr-1 size-5 group-hover:animate-[spin_1s_ease-in-out_infinite]" />
            Refresh Music Folder
          </div>
        </button>
      </div>
    </div>
  );
}
