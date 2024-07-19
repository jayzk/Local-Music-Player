import React from "react";
import LoadingIcon from "../../../public/additional-icons/loadingIcon.tsx";

type DownloadingCompProps = {
  isDownloading: boolean;
};

export default function DownloadingComp({
  isDownloading,
}: DownloadingCompProps) {
  if (isDownloading) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin">
          <LoadingIcon />
        </div>
        <p className="text-white">Downloading URL...</p>
      </div>
    );
  }
}
