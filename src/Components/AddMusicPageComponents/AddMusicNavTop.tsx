import { FolderIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { useSettingsContext } from '../../Contexts/SettingsContext';
import { selectDirectory, updateSelectedDirSettings } from '../../utils/IpcUtils';
import { useToastContext } from '../../Contexts/ToastContext';
import { useState } from 'react';
import WarningDialog from './WarningDialog';

export default function () {
    const {settingsData, updateSettings} = useSettingsContext();
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const toast = useToastContext();


    const handleOpenDirDialog = async () => {
        const result = await selectDirectory();
        if (result.success) {
          //update to new directory
          await updateSelectedDirSettings(result.data);
    
          //update settings data
          updateSettings(); //TODO: may move this into ipcUtils.ts

          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      };

    const handleOpenWarningDialog = async () => {
      setIsWarningDialogOpen(true);
    }

  return (
    <>
        <div className="flex w-full items-center justify-center text-white">
          <FolderIcon className="mr-2 size-10" />
          Current Music Folder
        </div>
        <div className="flex w-full items-center justify-center space-x-2 text-white">
          <input
            className="truncate rounded-lg bg-slate-600 p-1"
            placeholder={settingsData?.selectedDir}
            size={50}
            disabled
          />
          <button
            onClick={handleOpenDirDialog}
            className="rounded-lg bg-indigo-600 p-1 px-2 text-white hover:bg-indigo-500"
          >
            Change...
          </button>
        </div>  
        {/* <div className='flex w-full items-center justify-center rounded-full'>
          <button
            onClick={handleOpenWarningDialog}
            className='rounded-full bg-red-800 p-1 z-10'>
            <ExclamationTriangleIcon className="size-9 fill-white" />
          </button>
        </div> */}
    </>
  )
}
