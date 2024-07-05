import { FolderIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";

type DisplayHomeProps = {
  settingsData: any;
};

export default function DisplayHome({ settingsData }: DisplayHomeProps) {
  //re-render when settingsData updates
  useEffect(() => {
    if (settingsData) {
      console.log("DisplayHome -> Passed settings: ", settingsData);
    }
  }, [settingsData]);

  if (!settingsData || settingsData?.selectedDir === "") {
    //No directory/folder is selected
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <FolderIcon className="size-48 animate-bounce" />
        <p>Please select your music directory</p>
      </div>
    );
  } else {

    return <div>DisplayHome</div>;
  }
}
