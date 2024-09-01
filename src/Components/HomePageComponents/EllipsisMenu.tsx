import React, { useState } from "react";
import {
  TrashIcon,
  MusicalNoteIcon,
  UserIcon,
  PhotoIcon,
} from "@heroicons/react/20/solid";
import { songType } from "../../../public/types";
import RemoveSongDialog from "./Dialogs/RemoveSongDialog";
import FormDialog from "./Dialogs/FormDialog";
import { updateSongArtist, updateSongTitle } from "../../utils/IpcUtils";
import { useSongListContext } from "../../Contexts/SongListContext";
import { useToastContext } from "../../Contexts/ToastContext";
import ThumbnailSelectDialog from "./Dialogs/ThumbnailSelectDialog";

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
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const { updateSongList } = useSongListContext();
  const toast = useToastContext();

  const handleRemove = () => {
    console.log("Remove button: ", song);
    setIsRemoveDialogOpen(true);
  };

  const handleSongChangeOption = () => {
    console.log("Change song title on: ", song);
    setIsTitleDialogOpen(true);
  };

  const handleUpdateSongTitle = async (newSongTitle: string) => {
    console.log("New song title: ", newSongTitle);
    const result = await updateSongTitle(song.SongID, newSongTitle);
    if (result.success) {
      updateSongList();

      toast.success(result.message);
      setIsTitleDialogOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleSongArtistOption = () => {
    console.log("Change song artist on: ", song);
    setIsArtistDialogOpen(true);
  };

  const handleUpdateSongArtist = async (newSongArtist: string) => {
    console.log("New song title: ", newSongArtist);
    const result = await updateSongArtist(song.SongID, newSongArtist);
    if (result.success) {
      updateSongList();

      toast.success(result.message);
      setIsArtistDialogOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleSongThumbnailOption = () => {
    setIsFileDialogOpen(true);
  };

  return (
    <>
      <div
        className="flex flex-col justify-center rounded-lg bg-slate-900 p-2"
        onClick={onClick}
        ref={componentRef}
      >
        <button
          className="p-1 px-2 text-sm text-white hover:bg-slate-600"
          onClick={handleSongChangeOption}
        >
          <div className="flex items-center">
            <MusicalNoteIcon className="mr-2 size-4" />
            Change song title
          </div>
        </button>
        <button
          className="p-1 px-2 text-sm text-white hover:bg-slate-600"
          onClick={handleSongArtistOption}
        >
          <div className="flex items-center">
            <UserIcon className="mr-2 size-4" />
            Change artist
          </div>
        </button>
        <button
          className="p-1 px-2 text-sm text-white hover:bg-slate-600"
          onClick={handleSongThumbnailOption}
        >
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
      <FormDialog
        isDialogOpen={isTitleDialogOpen}
        setIsDialogOpen={setIsTitleDialogOpen}
        onExecute={handleUpdateSongTitle}
        initialInputValue={song.Title}
        inputPlaceholder="Enter new song title here"
        dialogTitle="Enter new song title"
      />
      <FormDialog
        isDialogOpen={isArtistDialogOpen}
        setIsDialogOpen={setIsArtistDialogOpen}
        onExecute={handleUpdateSongArtist}
        initialInputValue={song.Artist}
        inputPlaceholder="Enter new song artist here"
        dialogTitle="Enter new song artist"
      />
      <ThumbnailSelectDialog
        song={song}
        isDialogOpen={isFileDialogOpen}
        setIsDialogOpen={setIsFileDialogOpen}
      />
    </>
  );
}
