import React, { useEffect, useRef, useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import EllipsisMenu from "./EllipsisMenu";
import LoadThumbnail from "./LoadThumbnail";

import { useSettingsContext } from "../Contexts/SettingsContext";
import { useSongListContext } from "../Contexts/SongListContext";

export default function () {
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const [whichSubMenu, setWhichSubMenu] = useState<Number>();
  const componentRef = useRef<HTMLDivElement>(null);
  const {songs} = useSongListContext();
  const { settingsData, updateSettings } = useSettingsContext();

  const handleRowClick = async (fileLocation: string) => {
    if (fileLocation) {
      const absolutePath = await window.ipcRenderer.invoke(
        "append-filePaths",
        settingsData?.selectedDir,
        fileLocation,
      );
      await window.ipcRenderer.invoke(
        "update-currentlyPlaying-settings",
        absolutePath,
      );
      console.log("SongTable -> Now playing: ", absolutePath);

      //update settings data
      updateSettings();
    }
  };

  const handleEllipsis =
    (index: Number) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation(); //ensure parent event does not trigger
      setIsSubMenuVisible((prev) => !prev);
      setWhichSubMenu(index);
      console.log("Ellipsis clicked!");
    };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(event.target as Node)
    ) {
      setIsSubMenuVisible(false);
    }
  };

  useEffect(() => {
    if (isSubMenuVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSubMenuVisible]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="mx-2 mt-2 h-full">
      <div className="h-[10%] pr-2">
        <table className="w-full table-fixed">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="w-10 lg:w-16 xl:w-24">#</th>
              <th className="w-64 lg:w-80 xl:w-96">Song</th>
              <th className="w-24 lg:w-40 xl:w-64">Artist</th>
              <th className="w-24 lg:w-40 xl:w-48">Duration</th>
              <th className=""></th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="scroller h-[90%] overflow-hidden overflow-y-auto">
        <table className="w-full table-fixed">
          <tbody className="text-slate-100">
            {songs.map((song, index) => (
              <tr
                key={song.SongID}
                className="group cursor-pointer hover:bg-slate-600"
                onClick={() => handleRowClick(song.FileLocation)}
              >
                <td className="w-10 lg:w-16 xl:w-24">{index + 1}</td>
                <td className="w-64 lg:w-80 xl:w-96">
                  <div className="flex items-center">
                    <LoadThumbnail thumbnailPath={song.ThumbnailLocation} />
                    {song.Title}
                  </div>
                </td>
                <td className="w-24 lg:w-40 xl:w-64">{song.Artist}</td>
                <td className="relative w-24 lg:w-40 xl:w-48">
                  {formatTime(song.Duration)}
                </td>
                <td className="relative">
                  <div className="flex items-center">
                    <button
                      className="z-50 rounded-full p-2 opacity-0 hover:bg-slate-500 group-hover:opacity-100"
                      onClick={handleEllipsis(song.SongID)}
                    >
                      <EllipsisHorizontalIcon className="size-5" />
                    </button>
                  </div>
                  <div
                    className="absolute inset-y-2 -left-24 z-10"
                    ref={componentRef}
                  >
                    {isSubMenuVisible && song.SongID === whichSubMenu && (
                      <EllipsisMenu
                        song={song}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
