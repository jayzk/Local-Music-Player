import { FolderIcon } from '@heroicons/react/20/solid'
import { useSettingsContext } from '../../Contexts/SettingsContext';
import { selectDirectory, updateVolumeSettings } from '../../utils/IpcUtils';

export default function () {
    const {settingsData, updateSettings} = useSettingsContext();

    const handleOpenDirDialog = async () => {
        const filePaths = await selectDirectory();
        if (filePaths.length > 0) {
          //get new directory
          await updateVolumeSettings(filePaths[0]);
    
          //update settings data
          updateSettings(); //TODO: may move this into ipcUtils.ts
        }
      };

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
    </>
  )
}
