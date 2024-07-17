import React from "react";
//import { useToast } from "./Toast";
import { useToastContext } from "../Contexts/ToastContext";

type EllipsisMenuProps = {
  song: any;
  onClick: (event: React.MouseEvent) => void; //used to stop propagation
};

export default function EllipsisMenu( { song, onClick }: EllipsisMenuProps) {
  const toast = useToastContext();

  const handleRemove = () => {
    console.log("Remove button: ", song);
    toast.success("Success toast notification");
  };

  return (
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
  );
}
