import Navbar from "../Components/Navbar";
import BottomPlayer from "../Components/BottomPlayer";
import { Outlet } from "react-router-dom";
import { SettingsProvider } from "../Contexts/SettingsContext";
import { ToastProvider } from "../Contexts/ToastContext";
import { SongsListProvider } from "../Contexts/SongListContext";

export default function MainLayout() {
  return (
    <SettingsProvider>
      <div className="h-screen">
        <ToastProvider>
          <div className="flex h-[87%]">
            <Navbar />
            <SongsListProvider>
              <div className="w-screen bg-slate-800">
                <Outlet />
              </div>
            </SongsListProvider>
          </div>
          <div className="h-[13%] bg-gradient-to-t from-violet-500 to-fuchsia-500">
            <BottomPlayer />
          </div>
        </ToastProvider>
      </div>
    </SettingsProvider>
  );
}
