import React, { ChangeEvent, useState } from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type DialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onExecute: (arg0: string) => Promise<any>;
  initialInputValue?: string;
  inputPlaceholder?: string;
  dialogTitle?: string;
};

export default function FormDialog({
  isDialogOpen,
  setIsDialogOpen,
  onExecute,
  initialInputValue = "",
  inputPlaceholder = "",
  dialogTitle = "Enter new value",
}: DialogProps) {
  const [newValue, setNewValue] = useState(initialInputValue);

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewValue(event.target.value);
  };

  const handleSave = async () => {
    onExecute(newValue);
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
          <DialogTitle className="font-bold">{dialogTitle}</DialogTitle>
          <Description>
            <input
              className="text-md w-96 truncate rounded-lg border-2 border-slate-600 bg-slate-600 p-1 text-white outline-none transition duration-200 focus:border-white lg:text-lg"
              placeholder={inputPlaceholder}
              value={newValue}
              onChange={handleInputChange}
            />
          </Description>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDialogCancel}
              className="rounded-full p-2 hover:bg-slate-500"
            >
              Cancel
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
