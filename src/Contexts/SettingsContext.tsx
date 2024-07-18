import React, { createContext, useContext, useEffect, useState } from "react";

type SettingsContextType = {
  settingsData: any;
  updateSettings: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

//wrap useContext to detect errors as well
export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("Settings context is undefined!");
  }
  return context;
}

export const SettingsProvider = ({ children }: any) => {
  const [settingsData, setSettingsData] = useState<any | null>(null);

  const updateSettings = async () => {
    const result = await window.ipcRenderer.invoke("read-settings-data");
    if (result) {
      setSettingsData(result);
    } else {
      console.error("Error fetching settings");
    }
  };

  useEffect(() => {

    updateSettings();
  }, []);

  // Log settings info and re-render
  useEffect(() => {
    if (settingsData) {
      console.log("Settings Data: ", settingsData);
    }
  }, [settingsData]);

  return (
    <SettingsContext.Provider value={{ settingsData, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
