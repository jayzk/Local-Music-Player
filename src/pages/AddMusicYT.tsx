import AddMusicNavTop from "../Components/AddMusicPageComponents/AddMusicNavTop";
import YTDownloadForm from "../Components/AddMusicPageComponents/YTDownloadForm";

export default function AddMusicYT() {
  return (
    <div className="h-full">
      <div className="h-[15%] space-y-2 border-b-2 border-slate-700 py-2">
        <AddMusicNavTop />
      </div>
      <div className="flex h-[85%] flex-col items-center justify-center space-y-2">
        <YTDownloadForm />
      </div>
    </div>
  );
}
