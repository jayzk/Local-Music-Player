import { useEffect, useState } from "react";
import defaultThumbNail from "/assets/default-thumbnail.png";

import { useSettingsContext } from "../../Contexts/SettingsContext";
import { appendFilePaths } from "../../utils/IpcUtils";

type LoadThumbnailProps = {
  thumbnailPath: string;
  size?: string;
};

export default function LoadThumbnail({ thumbnailPath, size="small" }: LoadThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(defaultThumbNail);
  const { settingsData } = useSettingsContext();

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        console.log("LoadThumbnail -> Fetching thumbnail: ", thumbnailPath);
        if (thumbnailPath !== "") {
          const src = await appendFilePaths(settingsData?.selectedDir, thumbnailPath);
          setThumbnailSrc(src);
        } else {
          setThumbnailSrc(defaultThumbNail);
        }
      } catch (error) {
        console.error("LoadThumbnail -> Error fetching thumbnail:");
      }
    };

    if (settingsData) fetchThumbnail();
  }, [thumbnailPath]);

  let thumbnailDisplay;

  if (size === "small") {
    thumbnailDisplay = <img src={thumbnailSrc} className={`mr-2 size-[20%]`} />;
  } else if (size === "medium") {
    thumbnailDisplay = <img src={thumbnailSrc} className={`mr-2 size-[50%]`} />;
  } else {
    thumbnailDisplay = <img src={thumbnailSrc} className={`mr-2`} />;
  }

  return thumbnailDisplay;
}
