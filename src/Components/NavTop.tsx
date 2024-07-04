import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";

async function fetchSettings() {
  try {
    const result = await window.ipcRenderer.invoke("read-settings-data");
    return result;
  } catch (error) {
    console.error("Error invoking fetch settings:", error);
    return null;
  }
}

export default function NavTop() {
  const [selectedDirPath, setSelectedDirPath] = useState("");
  const [settingsData, setSettingsData] = useState<any | null>(null);

  const handleOpenDirDialog = async () => {
    const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
    if (filePaths.length > 0) {
      setSelectedDirPath(filePaths[0]); //update for rendering

      const data = `{"selectedDir": "${filePaths[0]}"}`;

      console.log("Sending object to settings file: ", data);
      await window.ipcRenderer.invoke("write-settings-data", data);
    }
  };

  //run on render
  useEffect(() => {
    const getSettings = async () => {
      const data = await fetchSettings();
      setSettingsData(data);
      setSelectedDirPath(data.selectedDir);
    };

    getSettings();
    console.log("Feteched settings: ", settingsData);
  }, []);

  //log settings info
  useEffect(() => {
    if (settingsData) {
      console.log("Settings Data: ", settingsData);
    }
  }, [settingsData]);

  //logging dir info
  useEffect(() => {
    if (selectedDirPath) {
      console.log("Selected Dir: ", selectedDirPath);
    }
  }, [selectedDirPath]);

  return (
    <div className="relative flex justify-center border-b-2 border-slate-700 p-3">
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
      <form>
        <div className="relative flex">
          <input
            className="peer h-10 rounded-lg border-2 border-slate-600 bg-slate-600 px-5 pl-10 text-sm text-white caret-white outline-none transition duration-200 focus:border-white"
            placeholder="Search"
          />
          <MagnifyingGlassIcon className="absolute inset-2.5 size-5 text-gray-400 transition duration-200 peer-focus:text-white" />
        </div>
      </form>
    </div>
  );
}
