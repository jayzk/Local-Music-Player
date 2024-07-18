import React, { useState } from "react";
import { Description, Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { useToastContext } from "../Contexts/ToastContext";

type EllipsisMenuProps = {
  song: any;
  onClick: (event: React.MouseEvent) => void; //used to stop propagation
};

export default function EllipsisMenu( { song, onClick }: EllipsisMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const toast = useToastContext();

  const handleRemove = () => {
    console.log("Remove button: ", song);
    setIsDialogOpen(true);
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  }

  const handleDialogDelete = async () => {
    setIsDialogOpen(false);
    const result = await window.ipcRenderer.invoke("delete-song", song.SongID);
    if(result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <div
      className="flex items-center justify-center rounded-lg bg-slate-900 p-2"
      onClick={onClick}
    >
      <button
        className="p-1 px-2 text-sm text-white hover:bg-slate-600"
        onClick={handleRemove}
      >
        Remove
      </button>
    </div>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel transition className="max-w-lg space-y-4 rounded-xl backdrop-blur-2xl border bg-black/50 p-12 text-white transition duration-300 ease-out data-[closed]:opacity-0">
            <DialogTitle className="font-bold">Delete Song?</DialogTitle>
            <Description>This will permanently delete the song from your folder</Description>
            <p>Are you sure?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleDialogCancel} className="p-2 rounded-full hover:bg-slate-500">Cancel</button>
              <button onClick={handleDialogDelete} className="text-red-500 p-2 rounded-full hover:bg-red-600 hover:text-white">Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
