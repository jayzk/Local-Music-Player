import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import { ChangeEvent, useEffect, useState } from "react";

import { useSettingsContext } from "../../Contexts/SettingsContext";
import { useSongListContext } from "../../Contexts/SongListContext";
import { useToastContext } from "../../Contexts/ToastContext";
import { insertSongFolder, selectDirectory, updateSelectedDirSettings } from "../../utils/IpcUtils";

export default function NavTop() {
  const [selectedDirPath, setSelectedDirPath] = useState("");
  const { settingsData, updateSettings } = useSettingsContext();
  const [ searchFilter, setSearhFilter ] = useState("");
  const { updateSongList } = useSongListContext();
  const toast = useToastContext();

  const handleOpenDirDialog = async () => {
    const filePaths = await selectDirectory();
    if (filePaths.length > 0) {
      setSelectedDirPath(filePaths[0]); //update for rendering

      //get new directory
      await updateSelectedDirSettings(filePaths[0]);

      //update settings data
      updateSettings();
    }
  };

  const handleRefresh = async () => {
    const result = await insertSongFolder();
    if (result.success) {
      updateSongList();
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    //TODO: keep this in case of any future changes to the song table
    // const updateResult = await updateSongTable();
    // if (updateResult.success) {
    //   console.log("SONG TABLE HAS BEEN UPDATED");
    // } else {
    //   console.log("ERROR UPDATING SONG TABLE");
    // }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearhFilter(event.target.value);
  }

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

  //re-render song list when search filters are applied
  useEffect(() => {
    updateSongList(searchFilter);
  }, [searchFilter]);

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
          value={searchFilter}
          onChange={handleSearchChange}
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
