import React, { useEffect, useState } from "react";
import "react-h5-audio-player/lib/styles.css";
import NavTop from "../Components/NavTop";
import DisplayHome from "../Components/DisplayHome";

async function fetchSettings() {
  try {
    const result = await window.ipcRenderer.invoke("read-settings-data");
    return result;
  } catch (error) {
    console.error("Home -> Error invoking fetch settings:", error);
    return null;
  }
}

export default function Home() {
  const [settingsData, setSettingsData] = useState<any | null>(null);

  //run on mount
  useEffect(() => {
    const getSettings = async () => {
      const data = await fetchSettings();
      setSettingsData(data);
    };

    getSettings();
  }, []);

  //log settings info
  useEffect(() => {
    if (settingsData) {
      console.log("Home -> Settings Data: ", settingsData);
    }
  }, [settingsData]);

  return (
    <div className="h-full py-2">
      <div className="h-[30%] lg:h-[10%]">
        <NavTop settingsData={settingsData} setSettingsData={setSettingsData} />
      </div>
      <div className="h-[70%] lg:h-[90%]">
        <DisplayHome settingsData={settingsData} />
      </div>
    </div>
  );
}
