import React, { useEffect } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type DisplayConfirmProps = {
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<any>;
};

export default function DisplayConfirm({
  isConfirmed,
  setIsConfirmed,
}: DisplayConfirmProps) {
  const handleConfirm = async () => {
    setIsConfirmed((prevIsConfirmed: boolean) => !prevIsConfirmed);
    console.log("Toggling previous confirm state: ", isConfirmed);

    await window.ipcRenderer.invoke("create-database");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-gray-400">
      <QuestionMarkCircleIcon className="size-48 animate-bounce" />
      <p>
        Confirm and initialize this directory/folder as your music directory?
      </p>
      <p>(A database file will be added in this directory/folder)</p>
      <button
        className="m-2 rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500"
        onClick={handleConfirm}
      >
        Confirm
      </button>
    </div>
  );
}
