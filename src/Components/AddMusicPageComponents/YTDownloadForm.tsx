import { FolderArrowDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { ChangeEvent, useEffect, useState } from 'react'
import CheckBox from '../ui/CheckBox'
import DownloadingComp from '../ui/DownloadingComp'
import { useToastContext } from '../../Contexts/ToastContext';

export default function YTDownloadForm() {
    const [ytURL, setYtURL] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
        thumbnailChecked: false,
      });

      const toast = useToastContext();
    
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
          
          if (result.success) {
            toast.success(result.message);
            setIsDownloading(false);
          } else {
            toast.error(result.message);
            setIsDownloading(false);
          }
        }
      };
    
      const handleClear = () => {
        console.log("Clearing input field");
        setYtURL("");
      };

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

  return (
    <>
    <FolderArrowDownIcon className="size-48 animate-bounce text-gray-400" />
        <div className="flex flex-row text-lg text-white">
          <p className="mx-2 font-bold underline underline-offset-1">
            Insert Youtube URL here!
          </p>
          Downloaded contents will be stored in your music folder
        </div>
        <div className="relative flex flex-row space-x-2">
          <input
            className="truncate rounded-lg border-2 border-slate-600 bg-slate-600 p-1 pr-10 text-lg text-white outline-none transition duration-200 focus:border-white"
            placeholder="Input Youtube URL here..."
            value={ytURL}
            onChange={handleInputChange}
            size={50}
          />
          <button
            className="absolute right-[6.5rem] top-[0.10rem] rounded-full bg-slate-600 p-2 text-white hover:bg-slate-500"
            onClick={handleClear}
          >
            <XMarkIcon className="size-5" />
          </button>
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

        <DownloadingComp isDownloading={isDownloading} />
    </>
  )
}
