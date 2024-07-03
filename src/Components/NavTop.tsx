import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react'

export default function NavTop() {
    const [selectedDirPath, setSelectedDirPath] = useState("");

    const handleOpenDirDialog = async () => {
        const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
        if (filePaths.length > 0) {
          setSelectedDirPath(filePaths[0]);
        }
      };

    //logging dir info
    useEffect(() => {
        if (selectedDirPath) {
        console.log("Incoming directory information");
        console.log("Selected Dir: ", selectedDirPath);
        }
    }, [selectedDirPath]);
  
  return (
    <div className="flex relative border-b-2 border-slate-700 p-3 justify-center">
        <div className="absolute top-0 left-2">
          <label className="block mb-2 text-sm text-gray-900 dark:text-white">Select Music Directory</label>
          <div>
            <button onClick={handleOpenDirDialog} className="text-sm text-black bg-slate-100 p-1 px-2 rounded-l-lg hover:bg-slate-300">
              Browse
            </button>
            <input className="text-sm truncate p-1 bg-slate-600" placeholder={selectedDirPath} disabled />
          </div>
        </div>
        <form>
          <div className="flex relative">
            <input className="peer transition duration-200 border-2 caret-white border-slate-600 bg-slate-600 h-10 px-5 pl-10 rounded-lg text-sm text-white outline-none focus:border-white"
            placeholder="Search" />
            <MagnifyingGlassIcon className="transition duration-200 absolute inset-2.5 size-5 text-gray-400 peer-focus:text-white" />
          </div>
        </form>
      </div>
  )
}
