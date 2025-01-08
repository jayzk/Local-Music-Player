import { XMarkIcon } from "@heroicons/react/20/solid";
import { ChangeEvent, useEffect, useState } from "react";
import CheckBox from "../ui/CheckBox";

//
type YTDownloadFormProps = {
  placeholder: string;
  onDownload: (ytURL: string, checkedItems: { [key: string]: boolean }) => void;
};

export default function YTDownloadForm({
  placeholder,
  onDownload,
}: YTDownloadFormProps) {
  const [ytURL, setYtURL] = useState("");
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    thumbnailChecked: false,
  });

  const handleCheckboxChange = (item: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: checked,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYtURL(event.target.value);
  };

  const handleClear = () => {
    console.log("Clearing input field");
    setYtURL("");
  };

  const handleDownload = () => {
    onDownload(ytURL, checkedItems);
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
    <div className="flex w-full flex-col items-center justify-center space-y-2 px-2">
      <div className="relative flex w-full">
        <input
          className="text-md w-full truncate rounded-lg border-2 border-slate-600 bg-slate-600 p-1 pr-10 text-white outline-none transition duration-200 focus:border-white lg:text-lg"
          placeholder={placeholder}
          value={ytURL}
          onChange={handleInputChange}
        />
        <button
          className="absolute right-[0.25rem] top-[0.10rem] rounded-lg bg-slate-600 p-2 text-white hover:bg-slate-500"
          onClick={handleClear}
        >
          <XMarkIcon className="size-4 lg:size-5" />
        </button>
      </div>
      <div className="pb-5">
        <CheckBox
          label="Download Thumbnail"
          checked={checkedItems.thumbnailChecked}
          onChange={(checked) =>
            handleCheckboxChange("thumbnailChecked", checked)
          }
        />
      </div>
      <button
        className="my-5 rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500"
        onClick={handleDownload}
      >
        Download
      </button>
    </div>
  );
}
