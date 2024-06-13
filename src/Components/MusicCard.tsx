import React from "react";

export default function MusicCard() {
  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="max-w-sm rounded overflow-hidden shadow-lg">
        <img className="w-full" src="/assets/ex-img.jpg" alt="Sample Image" />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Sample Image</div>
          <p className="text-gray-700 text-base">
            This is a sample image displayed using Tailwind CSS. You can
            customize the styling as needed.
          </p>
        </div>
      </div>
    </div>
  );
}
