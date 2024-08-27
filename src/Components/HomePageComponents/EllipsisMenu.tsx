import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";
import { songType } from "../../../public/types";
import DialogDeleteSong from "./Dialogs/DialogDeleteSong";

type EllipsisMenuProps = {
  song: songType;
  onClick: (event: React.MouseEvent) => void; //used to stop propagation
  componentRef?: React.RefObject<HTMLDivElement>;
};

export default function EllipsisMenu({ song, onClick, componentRef }: EllipsisMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemove = () => {
    console.log("Remove button: ", song);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div
        className="flex items-center justify-center rounded-lg bg-slate-900 p-2"
        onClick={onClick}
        ref={componentRef}
      >
        <button
          className="p-1 px-2 text-sm text-white hover:bg-slate-600"
          onClick={handleRemove}
        >
          <div className="flex items-center justify-center">
            <TrashIcon className="mr-2 size-4" />
            Remove
          </div>
        </button>
      </div>
      <DialogDeleteSong song={song} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}/>
    </>
  );
}
