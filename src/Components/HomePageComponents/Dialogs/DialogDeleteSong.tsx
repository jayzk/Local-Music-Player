import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { deleteSong } from "../../../utils/IpcUtils";
import { useSongListContext } from "../../../Contexts/SongListContext";
import { useSettingsContext } from "../../../Contexts/SettingsContext";
import { useToastContext } from "../../../Contexts/ToastContext";
import { songType } from "../../../../public/types";

type DialogProps = {
  song: songType;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DialogDeleteSong({song, isDialogOpen, setIsDialogOpen}: DialogProps) {
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { updateSongList } = useSongListContext();
  const { updateSettings } = useSettingsContext();
  const toast = useToastContext();

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  };

  const handleDialogDelete = async () => {
    setIsDialogOpen(false);
    const result = await deleteSong(song.SongID);
    if (result.success) {
      updateSongList();

      //will have to update settings to as currentlyPlaying property will be updated
      updateSettings();

      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="max-w-lg space-y-4 rounded-xl border bg-black/50 p-12 text-white backdrop-blur-2xl transition duration-300 ease-out data-[closed]:opacity-0"
        >
          <DialogTitle className="font-bold">Delete Song?</DialogTitle>
          <Description>
            This will permanently delete the song from your folder
          </Description>
          <p>Are you sure?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDialogCancel}
              className="rounded-full p-2 hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDialogDelete}
              className="rounded-full p-2 text-red-500 hover:bg-red-600 hover:text-white"
            >
              Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
