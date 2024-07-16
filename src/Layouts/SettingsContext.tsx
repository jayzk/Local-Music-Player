import React, {createContext, useContext, useEffect, useState} from 'react'

type SettingsContextType = {
    settingsData: any;
    setSettingsData: React.Dispatch<React.SetStateAction<any | null>>;
  }

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

//wrap useContext to detect errors as well
export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
      throw new Error('context is undefined!');
    }
    return context;
  };

export const SettingsProvider = ({children}: any) => {
    const [settingsData, setSettingsData] = useState<any | null>(null);

    useEffect(() => {
        const getSettings = async () => {
          const result = await window.ipcRenderer.invoke('read-settings-data');
          if (result) {
            setSettingsData(result);
          } else {
            console.error('Error fetching settings');
          }
        };
    
        getSettings();
      }, []);
    
      // Log settings info
      useEffect(() => {
        if (settingsData) {
          console.log('Settings Data: ', settingsData);
        }
      }, [settingsData]);

      return (
        <SettingsContext.Provider value={{ settingsData, setSettingsData }}>
          {children}
        </SettingsContext.Provider>
      );
}
