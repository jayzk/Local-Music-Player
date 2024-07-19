import { useEffect, useState } from "react";
import AddMusicNavTop from "../Components/AddMusicPageComponents/AddMusicNavTop";
import YTDownloadForm from "../Components/AddMusicPageComponents/YTDownloadForm";
import { useSettingsContext } from "../Contexts/SettingsContext";
import DisplayPleaseSelect from "../Components/ui/DisplayPleaseSelect";
import DisplayConfirm from "../Components/ui/DisplayConfirm";

export default function AddMusicYT() {
  const [isConfirmed, setIsConfirmed] = useState(false); //if user has confirmed if they want to initialize the folder
  const [isInitialized, setIsInitialized] = useState(false); //if sqlite file exists, then it is initialized
  const { settingsData } = useSettingsContext();

  //re-render when selectedDir in settings updates
  useEffect(() => {
    //check if an sqlite file exists in the new directory
    const checkSqliteFile = async () => {
      if (settingsData) {
        const sqliteFileExists =
          await window.ipcRenderer.invoke("sqlite-file-exists");
        console.log("Does sqlite file exist: ", sqliteFileExists);
        setIsInitialized(sqliteFileExists);
        setIsConfirmed(false); //reset confirm state
      }
    };

    checkSqliteFile();
  }, [settingsData?.selectedDir]);

  let mainContent;

  if (!settingsData || settingsData?.selectedDir === "") { //if no folder is selected
    mainContent = <DisplayPleaseSelect />;
  } else if (!isConfirmed && !isInitialized) { //if folder is not initialized
    mainContent = (
      <DisplayConfirm
        isConfirmed={isConfirmed}
        setIsConfirmed={setIsConfirmed}
      />
    );
  } else { //folder is initialized
    mainContent = <YTDownloadForm />;
  }

  return (
    <div className="h-full">
      <div className="h-[15%] space-y-2 border-b-2 border-slate-700 py-2">
        <AddMusicNavTop />
      </div>
      <div className="flex h-[85%] flex-col items-center justify-center space-y-2">
        {mainContent}
      </div>
    </div>
  );
}
