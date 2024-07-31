import { createContext, useState, useEffect, useContext } from "react";
import { useSettingsContext } from "./SettingsContext";
import { songType } from "../../public/types";
import { fetchSongs } from "../utils/IpcUtils";

type SongsContextType = {
  songs: songType[];
  updateSongList: () => void;
};

const SongsContext = createContext<SongsContextType | undefined>(undefined);

export const SongsListProvider = ({ children }: any) => {
  const [songs, setSongs] = useState<songType[]>([]);
  const { settingsData } = useSettingsContext();

  const updateSongList = async () => {
    const result = await fetchSongs();
    if (result.success) {
      setSongs(result.data);
    } else {
      console.error("Error: ", result.message);
    }
  };

  useEffect(() => {
    //empty song list
    setSongs([]);

    console.log("selected dir has been updated, updating song list!");
    updateSongList();
  }, [settingsData?.selectedDir]); //re-render everytime selectedDir in settings changes

  //log info and re-render when song list updates
  useEffect(() => {
    console.log("Song list has been updated!");
  }, [songs]);

  return (
    <SongsContext.Provider value={{ songs, updateSongList }}>
      {children}
    </SongsContext.Provider>
  );
};

export function useSongListContext() {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error("Songs list context is undefined!");
  }
  return context;
}
