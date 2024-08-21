import { createContext, useContext, useEffect, useState } from "react";
import { settingsType } from "../../public/types.ts";
import { readSettingsData } from "../utils/IpcUtils";

type SettingsContextType = {
  settingsData: settingsType;
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
  const [settingsData, setSettingsData] = useState<settingsType | null>(null);

  const updateSettings = async () => {
    const result = await readSettingsData();
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
