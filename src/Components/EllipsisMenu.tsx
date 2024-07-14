import React from "react";

type EllipsisMenuProps = {
  onClick: (event: React.MouseEvent) => void; //used to stop propagation
};

export default function EllipsisMenu({ onClick }: EllipsisMenuProps) {
  const handleRemove = () => {
    console.log("Remove button");
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
