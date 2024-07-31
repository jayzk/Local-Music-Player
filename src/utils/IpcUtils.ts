import { CheckBoxType } from "../../public/types";

export async function doesSqliteFileExist() {
  const result = await window.ipcRenderer.invoke("sqlite-file-exists");
  console.log("[DEBUG] Does sqlite file exist: ", result);
  return result;
}

//TODO: make a return lol
export async function updateVolumeSettings(newVol: number) {
  await window.ipcRenderer.invoke("update-volume-settings", newVol); //update new volume in settings

  console.log("[DEBUG] new volume in settings: ", newVol);
}

//TODO: make a return
export async function updateSelectedDirSettings(newDir: string) {
    await window.ipcRenderer.invoke(
        "update-directory-settings",
        newDir,
      );

      console.log("[DEBUG] current selected directory in settings: ", newDir);
}

export async function updateCurrentlyPlayingSettings(filePath: string) {
    await window.ipcRenderer.invoke(
        "update-currentlyPlaying-settings",
        filePath,
      );

      console.log("[DEBUG] currently playing in settings: ", filePath);
}

export async function downloadYtAudio(
  ytURL: string,
  checkedItems: CheckBoxType,
) {
  const result = await window.ipcRenderer.invoke(
    "download-yt-audio",
    ytURL,
    checkedItems,
  );

  return result;
}

export async function downloadYtPlaylist(
  ytURL: string,
  checkedItems: CheckBoxType,
) {
    console.log("[DEBUG] Downloading yt playlist");
  const result = await window.ipcRenderer.invoke(
    "download-yt-playlist",
    ytURL,
    checkedItems,
  );

  return result;
}

export async function deleteSong(songID: number) {
    const result = await window.ipcRenderer.invoke("delete-song", songID);
    return result;
}

export async function insertSongFolder() {
    const result = await window.ipcRenderer.invoke("add-folder-files");
    return result;
}

export async function createDatabase() {
    const result = await window.ipcRenderer.invoke("create-database");
    return result;
}

export async function fetchSongs() {
    console.log("[DEBUG] fetching songs from song table");
    const result = await window.ipcRenderer.invoke("fetch-songs");
    return result;
}

export async function appendFilePaths(selectedDir: string | undefined, thumbnailPath: string) {
    const result = await window.ipcRenderer.invoke(
        "append-filePaths",
        selectedDir,
        thumbnailPath,
      );

    return result;
}

export async function readSettingsData() {
    const result = await window.ipcRenderer.invoke("read-settings-data");
    return result;
}

export async function selectDirectory() {
  const result = await window.ipcRenderer.invoke("open-dir-dialog");
  console.log("[DEBUG] New directory selected: ", result);
  return result;
}
