import { useEffect, useState } from "react";
import DisplayConfirm from "../ui/DisplayConfirm";
import DisplayPleaseSelect from "../ui/DisplayPleaseSelect";
import SongTable from "./SongTable";

import { useSettingsContext } from "../../Contexts/SettingsContext";

export default function DisplayHome() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  if (!settingsData || settingsData?.selectedDir === "") {
    //No directory/folder is selected
    return (
      <DisplayPleaseSelect />
    );
  } else {
    return (
      <div className="h-full">
        {isConfirmed || isInitialized ? (
          <SongTable />
        ) : (
          <DisplayConfirm
            isConfirmed={isConfirmed}
            setIsConfirmed={setIsConfirmed}
          />
        )}
      </div>
    );
  }
}
