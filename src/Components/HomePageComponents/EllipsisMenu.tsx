import React, { useState } from "react";
import {
  TrashIcon,
  MusicalNoteIcon,
  UserIcon,
  PhotoIcon,
} from "@heroicons/react/20/solid";
import { songType } from "../../../public/types";
import RemoveSongDialog from "./Dialogs/RemoveSongDialog";

type EllipsisMenuProps = {
  song: songType;
  onClick: (event: React.MouseEvent) => void; //used to stop propagation
  componentRef?: React.RefObject<HTMLDivElement>;
};

export default function EllipsisMenu({
  song,
  onClick,
  componentRef,
}: EllipsisMenuProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = () => {
    console.log("Remove button: ", song);
    setIsRemoveDialogOpen(true);
  };

  return (
    <>
      <div
        className="flex flex-col justify-center rounded-lg bg-slate-900 p-2"
        onClick={onClick}
        ref={componentRef}
      >
        <button className="p-1 px-2 text-sm text-white hover:bg-slate-600">
          <div className="flex items-center">
            <MusicalNoteIcon className="mr-2 size-4" />
            Change song title
          </div>
        </button>
        <button className="p-1 px-2 text-sm text-white hover:bg-slate-600">
          <div className="flex items-center">
            <UserIcon className="mr-2 size-4" />
            Change artist
          </div>
        </button>
        <button className="p-1 px-2 text-sm text-white hover:bg-slate-600">
          <div className="flex items-center">
            <PhotoIcon className="mr-2 size-4" />
            Change Thumbnail
          </div>
        </button>
        <button
          className="p-1 px-2 text-sm text-white hover:bg-slate-600"
          onClick={handleRemove}
        >
          <div className="flex items-center">
            <TrashIcon className="mr-2 size-4" />
            Remove
          </div>
        </button>
      </div>
      <RemoveSongDialog
        song={song}
        isDialogOpen={isRemoveDialogOpen}
        setIsDialogOpen={setIsRemoveDialogOpen}
      />
    </>
  );
}
