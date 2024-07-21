import { FolderArrowDownIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

import DownloadingComp from "../ui/DownloadingComp";
import { useToastContext } from "../../Contexts/ToastContext";
import YTDownloadForm from "./YTDownloadForm";
import useDownloadProgress from "../../Hooks/DownloadProgressHook";

export default function AddMusicMainContainer() {
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [isDownloadingPlaylist, setIsDownloadingPlaylist] = useState(false);
  const downloadProgress = useDownloadProgress();

  const toast = useToastContext();

  const handleDownloadSingle = async (
    ytURL: string,
    checkedItems: { [key: string]: boolean },
  ) => {
    if (ytURL) {
      console.log("Downloading yt url");
      setIsDownloadingSingle(true);

      const result = await window.ipcRenderer.invoke(
        "download-yt-audio",
        ytURL,
        checkedItems,
      );

      if (result.success) {
        toast.success(result.message);
        setIsDownloadingSingle(false);
      } else {
        toast.error(result.message);
        setIsDownloadingSingle(false);
      }
    }
  };

  const handleDownloadPlaylist = async (
    ytURL: string,
    checkedItems: { [key: string]: boolean },
  ) => {
    if (ytURL) {
      console.log("Downloading yt playlist");
      setIsDownloadingPlaylist(true);

      const result = await window.ipcRenderer.invoke(
        "download-yt-playlist",
        ytURL,
        checkedItems,
      );

      if (result.success) {
        toast.success(result.message);
        setIsDownloadingPlaylist(false);
      } else {
        toast.error(result.message);
        setIsDownloadingPlaylist(false);
      }
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-1/2 flex-col items-center justify-evenly border-r-2 border-slate-700">
        <FolderArrowDownIcon className="size-24 text-gray-400 lg:size-48" />
        <div className="flex flex-col items-center justify-center text-white">
          <p className="mx-2 text-center font-bold underline underline-offset-1">
            Insert Youtube URL here!
          </p>
          <p className="mx-2 mb-2 text-center">
            {" "}
            Downloaded contents will be stored in your music folder{" "}
          </p>
          <YTDownloadForm
            placeholder="Input Youtube URL here..."
            onDownload={handleDownloadSingle}
          />
        </div>
        <DownloadingComp isDownloading={isDownloadingSingle} downloadingMsg="Downloading URL..." />
      </div>

      <div className="flex h-full w-1/2 flex-col items-center justify-evenly">
        <ListBulletIcon className="size-24 text-gray-400 lg:size-48" />
        <div className="flex flex-col items-center justify-center text-white">
          <p className="mx-2 text-center font-bold underline underline-offset-1">
            Insert Youtube playlist here!
          </p>
          <p className="mx-2 mb-2 text-center">
            {" "}
            Downloaded contents will be stored in your music folder{" "}
          </p>

          <YTDownloadForm
            placeholder="Input Youtube Playlist URL here..."
            onDownload={handleDownloadPlaylist}
          />
        </div>
        <DownloadingComp isDownloading={isDownloadingPlaylist} downloadingMsg={downloadProgress ? downloadProgress : "Downloading..."}/>
      </div>
    </div>
  );
}
