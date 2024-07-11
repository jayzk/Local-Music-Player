import React, { ChangeEvent, useEffect, useState } from "react";
import {
  FolderIcon,
  FolderArrowDownIcon,
  CheckBadgeIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/20/solid";
import CheckBox from "../Components/CheckBox";
import DownloadingComp from "../Components/DownloadingComp";
import { useToast } from "../Components/Toast";

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
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    thumbnailChecked: false,
  });
  const [ytURL, setYtURL] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<any | null>(null);

  const { addToast, ToastContainer } = useToast();

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

  const handleCheckboxChange = (item: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: checked,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYtURL(event.target.value);
  };

  const handleDownload = async () => {
    if (ytURL) {
      console.log("Downloading yt url");
      setIsDownloading(true);
      const result = await window.ipcRenderer.invoke(
        "download-yt-audio",
        ytURL,
        checkedItems,
      );
      setDownloadStatus(result);
    }
  };

  //TODO: DELTE LATER
  const handleToast1 = async () => {
    console.log("Click Toast");
    addToast(
      "ALL IS GOOD!",
      3000,
      <CheckBadgeIcon className="mr-2 size-5" />,
      "bg-green-600",
    );
    //addToast('ALL IS BAD!', 4000, <ShieldExclamationIcon className="size-5 mr-2" />, "bg-red-600");
  };
  const handleToast2 = async () => {
    console.log("Click Toast");
    //addToast('ALL IS GOOD!', 3000, <CheckBadgeIcon className="size-5 mr-2" />, "bg-green-600");
    addToast(
      "ALL IS BAD!",
      4000,
      <ShieldExclamationIcon className="mr-2 size-5" />,
      "bg-red-600",
    );
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

  //log checkbox info
  useEffect(() => {
    if (checkedItems) {
      console.log("AddMusicYT -> CheckBox data: ", checkedItems);
    }
  }, [checkedItems]);

  //log input box info
  useEffect(() => {
    if (ytURL) {
      console.log("AddMusicYT -> input box data: ", ytURL);
    }
  }, [ytURL]);

  //log download status
  useEffect(() => {
    console.log("DOWNLOAD RESULT", downloadStatus);
    setIsDownloading(false);
  }, [downloadStatus]);

  return (
    <div className="h-full">
      <div className="h-[15%] space-y-2 border-b-2 border-slate-700 py-2">
        <div className="flex w-full items-center justify-center text-white">
          <FolderIcon className="mr-2 size-10" />
          Current Music Folder
        </div>
        <div className="flex w-full items-center justify-center space-x-2 text-white">
          <input
            className="truncate rounded-lg bg-slate-600 p-1"
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
      <div className="flex h-[85%] flex-col items-center justify-center space-y-2">
        <FolderArrowDownIcon className="size-48 animate-bounce text-gray-400" />
        <div className="flex flex-row text-lg text-white">
          <p className="mx-2 font-bold underline underline-offset-1">
            Insert Youtube URL here!
          </p>
          Downloaded contents will be stored in your music folder
        </div>
        <div className="flex flex-row space-x-2">
          <input
            className="truncate rounded-lg border-2 border-slate-600 bg-slate-600 p-1 text-lg text-white outline-none transition duration-200 focus:border-white"
            placeholder="Input Youtube URL here..."
            value={ytURL}
            onChange={handleInputChange}
            size={50}
          />
          <button
            className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
        <div>
          <CheckBox
            label="Download Thumbnail"
            checked={checkedItems.thumbnailChecked}
            onChange={(checked) =>
              handleCheckboxChange("thumbnailChecked", checked)
            }
          />
        </div>
        <button
          className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
          onClick={handleToast1}
        >
          Toast1
        </button>
        <button
          className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
          onClick={handleToast2}
        >
          Toast2
        </button>
        <ToastContainer />

        <DownloadingComp isDownloading={isDownloading} />
      </div>
    </div>
  );
}
