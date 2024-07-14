import React, { useEffect, useRef, useState } from "react";
import defaultThumbNail from "../../public/assets/default-thumbnail.png";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import EllipsisMenu from "./EllipsisMenu";

export default function () {
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const [whichSubMenu, setWhichSubMenu] = useState<Number>();
  const componentRef = useRef<HTMLDivElement>(null);

  const testData = [
    {
      song: "The Sliding Mr. Bones (Next Stop, Pottersville)",
      artist: "Malcolm Lockyer",
      year: 1961,
    },
    { song: "Witchy Woman", artist: "The Eagles", year: 1972 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
    { song: "Shining Star", artist: "Earth, Wind, and Fire", year: 1975 },
  ];

  const handleRowClick = (song: any) => {
    console.log("Row clicked: ", song);
    // Add your logic here
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

  return (
    <div className="mx-2 mt-2 h-full">
      <div className="h-[10%] pr-2">
        <table className="w-full table-fixed">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="w-10 lg:w-16 xl:w-24">#</th>
              <th className="w-64 lg:w-80 xl:w-96">Song</th>
              <th className="w-24 lg:w-40 xl:w-64">Artist</th>
              <th className="w-24 lg:w-40 xl:w-48">Year</th>
              <th className=""></th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="scroller h-[90%] overflow-hidden overflow-y-auto">
        <table className="w-full table-fixed">
          <tbody className="text-slate-100">
            {testData.map((song, index) => (
              <tr
                key={index}
                className="group cursor-pointer hover:bg-slate-600"
                onClick={() => handleRowClick(song)}
              >
                <td className="w-10 lg:w-16 xl:w-24">{index + 1}</td>
                <td className="w-64 lg:w-80 xl:w-96">
                  <div className="flex items-center">
                    <img src={defaultThumbNail} className="mr-2 size-10" />
                    {song.song}
                  </div>
                </td>
                <td className="w-24 lg:w-40 xl:w-64">{song.artist}</td>
                <td className="relative w-24 lg:w-40 xl:w-48">{song.year}</td>
                <td className="relative">
                  <div className="flex items-center">
                    <button
                      className="z-50 rounded-full p-2 opacity-0 hover:bg-slate-500 group-hover:opacity-100"
                      onClick={handleEllipsis(index)}
                    >
                      <EllipsisHorizontalIcon className="size-5" />
                    </button>
                  </div>
                  <div
                    className="absolute inset-y-2 -left-24 z-10"
                    ref={componentRef}
                  >
                    {isSubMenuVisible && index === whichSubMenu && (
                      <EllipsisMenu onClick={(e) => e.stopPropagation()} />
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
