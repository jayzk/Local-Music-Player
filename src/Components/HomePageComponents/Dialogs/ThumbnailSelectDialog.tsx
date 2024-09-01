import React, { useState } from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { selectThumbnail, updateSongThumbnail } from "../../../utils/IpcUtils";
import LoadThumbnail from "../LoadThumbnail";
import { songType } from "../../../../public/types";
import { useToastContext } from "../../../Contexts/ToastContext";
import { useSongListContext } from "../../../Contexts/SongListContext";

type DialogProps = {
  song: songType;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ThumbnailSelectDialog({
  song,
  isDialogOpen,
  setIsDialogOpen,
}: DialogProps) {
  const [selectedThumbnailPath, setSelectedThumbnailPath] = useState(
    song.ThumbnailLocation,
  );
  const { updateSongList } = useSongListContext();
  const toast = useToastContext();

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    const result = await updateSongThumbnail(
      song.SongID,
      selectedThumbnailPath,
    );
    if (result.success) {
      updateSongList();
      toast.success(result.message);
      setIsDialogOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDefault = () => {
    setSelectedThumbnailPath("");
  };

  const handleSelectThumbnail = async () => {
    const result = await selectThumbnail();
    if (result.success) {
      const parsedFile = "Thumbnails\\" + result.data.split("\\").pop();

      setSelectedThumbnailPath(parsedFile); //update for rendering
    } else {
      toast.error(result.message);
      console.log("Error fetching thumbnail: ", result.message);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="max-w-lg space-y-4 rounded-xl border bg-black/50 p-12 text-white backdrop-blur-2xl transition duration-300 ease-out data-[closed]:opacity-0"
        >
          <DialogTitle className="flex items-center justify-center font-bold">
            Select new picture from thumbnail folder
          </DialogTitle>
          <Description className="flex flex-col items-center justify-center space-y-2">
            <LoadThumbnail
              thumbnailPath={selectedThumbnailPath}
              size="medium"
            />
            <button
              onClick={handleSelectThumbnail}
              className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
            >
              Browse...
            </button>
          </Description>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDialogCancel}
              className="rounded-full p-2 hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDefault}
              className="rounded-full p-2 hover:bg-slate-500"
            >
              Reset to default
            </button>
            <button
              onClick={handleSave}
              className="rounded-full p-2 px-5 text-green-500 hover:bg-green-600 hover:text-white"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
