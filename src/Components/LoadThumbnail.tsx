import React, { useEffect, useState } from "react";
import defaultThumbNail from "../../public/assets/default-thumbnail.png";

import { useSettingsContext } from "../Layouts/SettingsContext";

type LoadThumbnailProps = {
  thumbnailPath: string;
};

export default function LoadThumbnail({
  thumbnailPath,
}: LoadThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(defaultThumbNail);
  const {settingsData} = useSettingsContext();

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        if (thumbnailPath !== "") {
          const src = await window.ipcRenderer.invoke(
            "append-filePaths",
            settingsData?.selectedDir,
            thumbnailPath,
          );
          setThumbnailSrc(src);
        }
      } catch (error) {
        console.error("LoadThumbnail -> Error fetching thumbnail:", error);
      }
    };

    if (settingsData) fetchThumbnail();
  }, [settingsData]);

  return <img src={thumbnailSrc} className="mr-2 size-[20%]" />;
}
