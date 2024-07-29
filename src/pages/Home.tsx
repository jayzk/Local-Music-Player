import NavTop from "../Components/HomePageComponents/NavTop";
import { useEffect, useState } from "react";
import { useSettingsContext } from "../Contexts/SettingsContext";
import DisplayPleaseSelect from "../Components/ui/DisplayPleaseSelect";
import DisplayConfirm from "../Components/ui/DisplayConfirm";
import SongTable from "../Components/HomePageComponents/SongTable";

export default function Home() {
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
    
    setIsInitialized(false);
    checkSqliteFile();
  }, [settingsData?.selectedDir]);

  let mainContent;

  if (!settingsData || settingsData?.selectedDir === "") {
    //if no folder is selected
    mainContent = <DisplayPleaseSelect />;
  } else if (!isInitialized && !isConfirmed) {
    //if folder is not initialized
    mainContent = (
      <DisplayConfirm
        isConfirmed={isConfirmed}
        setIsConfirmed={setIsConfirmed}
      />
    );
  } else {
    //folder is initialized
    mainContent = <SongTable />;
  }

  return (
    <div className="h-full py-2">
      <div className="h-[30%] lg:h-[10%]">
        <NavTop />
      </div>
      <div className="h-[70%] lg:h-[90%]">
        {mainContent}
      </div>
    </div>
  );
}
