import React, { ChangeEvent, useState } from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

type DialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FormDialog({
  isDialogOpen,
  setIsDialogOpen,
}: DialogProps) {

  const handleDialogClose = () => {
    setIsDialogOpen(false);
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
          className="max-w-lg space-y-4 rounded-xl border bg-red-600/70 p-12 text-white backdrop-blur-2xl transition duration-300 ease-out data-[closed]:opacity-0"
        >
          <DialogTitle className="font-bold">
            <div className="flex items-center justify-center">
                <ExclamationTriangleIcon className="size-9 fill-white mr-2" />
                WARNING!
            </div>
          </DialogTitle>
          <Description>
            <p>
                It's recommended to use a <a className="font-bold underline">VPN</a> when downloading videos from YouTube!
                Additionally you can manually move downloaded audio files into the 'Songs' folder.
            </p>
          </Description>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDialogClose}
              className="rounded-full p-2 hover:bg-slate-500"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}