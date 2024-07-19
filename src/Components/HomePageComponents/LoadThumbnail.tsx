import React, { useEffect, useState } from "react";
import defaultThumbNail from "/assets/default-thumbnail.png";

import { useSettingsContext } from "../../Contexts/SettingsContext";

type LoadThumbnailProps = {
  thumbnailPath: string;
};

export default function LoadThumbnail({ thumbnailPath }: LoadThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(defaultThumbNail);
  const { settingsData } = useSettingsContext();

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        console.log("LoadThumbnail -> Fetching thumbnail");
        if (thumbnailPath !== "") {
          const src = await window.ipcRenderer.invoke(
            "append-filePaths",
            settingsData?.selectedDir,
            thumbnailPath,
          );
          setThumbnailSrc(src);
        }
      } catch (error) {
        console.error("LoadThumbnail -> Error fetching thumbnail:");
      }
    };

    if (settingsData) fetchThumbnail();
  }, []);

  return <img src={thumbnailSrc} className="mr-2 size-[20%]" />;
}
