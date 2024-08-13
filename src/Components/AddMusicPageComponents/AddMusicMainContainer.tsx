import { FolderArrowDownIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

import DownloadingComp from "../ui/DownloadingComp";
import { useToastContext } from "../../Contexts/ToastContext";
import YTDownloadForm from "./YTDownloadForm";
import useDownloadProgress from "../../Hooks/DownloadProgressHook";
import { downloadYtAudio, downloadYtPlaylist } from "../../utils/IpcUtils";
import { useSongListContext } from "../../Contexts/SongListContext";

export default function AddMusicMainContainer() {
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [isDownloadingPlaylist, setIsDownloadingPlaylist] = useState(false);
  const {downloadProgress, resetDownloadProgress} = useDownloadProgress();
  const { updateSongList } = useSongListContext();

  const toast = useToastContext();

  const handleDownloadSingle = async (
    ytURL: string,
    checkedItems: { [key: string]: boolean },
  ) => {
    if (ytURL) {
      console.log("Downloading yt url");
      setIsDownloadingSingle(true);

      const result = await downloadYtAudio(ytURL, checkedItems);

      if (result.success) {
        toast.success(result.message);
        setIsDownloadingSingle(false);
        updateSongList();
        
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
      setIsDownloadingPlaylist(true);

      const result = await downloadYtPlaylist(ytURL, checkedItems);

      // update the song list regardless of errors as some urls could be downloaded
      if (result.success) {
        toast.success(result.message);
        setIsDownloadingPlaylist(false);
        resetDownloadProgress();

        updateSongList();
      } else {
        toast.error(result.message);
        setIsDownloadingPlaylist(false);
        resetDownloadProgress();

        updateSongList();
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
