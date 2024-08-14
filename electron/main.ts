import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
} from "electron";
import { fileURLToPath } from "node:url";

import * as path from "path";
import { closeDatabase, createDatabase, deleteSong, detectSqliteFile, fetchSongs, insertSongFolder, updateSongTable } from "./better-sqlite3";
import {
  readSettings,
  writeSettings,
  updateVolume,
  updateSelectedDir,
  updateCurrentlyPlaying,
} from "./settings";
import { CheckBoxType } from "../public/types.ts";
import { downloadPlaylist, downloadVideo, FFMPEG_BINARY_PATH, YT_DLP_BINARY_PATH } from "./yt-dlp.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//for formatting logs
const divider = "============================";

//TODO: trace warnings
// process.traceProcessWarnings = true;
// process.on('uncaughtException', function (error) {
//   // Do nothing if the user has a custom uncaught exception handler.
//   if (process.listenerCount('uncaughtException') > 1) {
//     console.log("ERROR TEST", error);
//     return;
//   }

//   // Show error in GUI.
//   // We can't import { dialog } at the top of this file as this file is
//   // responsible for setting up the require hook for the "electron" module
//   // so we import it inside the handler down here
//   import('electron')
//     .then(({ dialog }) => {
//       const stack = error.stack ? error.stack : `${error.name}: ${error.message}`;
//       const message = 'Uncaught Exception:\n' + stack;
//       dialog.showErrorBox('A JavaScript error occurred in the main process', message);
//     });
// });

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media-loader",
    privileges: {
      bypassCSP: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

//custom protocol handler for media-loader URL's
app.whenReady().then(() => {
  //protocol.handle isn't able to support seekable media atm, using the depreciated version for now
  // protocol.handle('media-loader', (request) =>
  // net.fetch('file://' + request.url.slice('media-loader://'.length)));

  // Create custom protocol for local media loading (depreciated)
  protocol.registerFileProtocol("media-loader", (request, callback) => {
    const url = request.url.replace("media-loader://", "");
    const decodedUrl = decodeURIComponent(url);
    //console.log("Decoded path: ", decodedUrl);
    try {
      return callback({ path: decodedUrl });
    } catch (err) {
      console.error(err);
    }
  });

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ["https://*.github.com/*", "*://electron.github.io/*", "*:///*"],
  };

  //Leave this here just in case because chromium can be buggy with ranges
  //   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //     callback({ responseHeaders: Object.assign({
  //         "accept-ranges": [ "bytes" ],
  //         "Content-Length": [4718592],
  //         "Content-Range": ["bytes 0-4718592/4718592"],
  //         "Content-Type": ["audio/mp3"],
  //         "status": [206],
  //         "Connection": "keep-alive",
  //     }, details.responseHeaders)});
  // });
});

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    minWidth: 768,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  win.maximize();

  console.log(divider);
  console.log("FILE LOCATION: ", __filename);
  console.log("DIRECTORY LOCATION: ", __dirname);
  console.log("FFMPEG BINARY LOCATION: ", FFMPEG_BINARY_PATH);
  console.log("YT-DLP BINARY LOCATION: ", YT_DLP_BINARY_PATH);
  console.log(divider);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
});

// IPC HANDLERS

// IPC handler for opening file dialog
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
  });

  return result.filePaths;
});

// IPC handler for opening directory dialog
ipcMain.handle("open-dir-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  return result.filePaths;
});

// IPC handler for reading local settings data
ipcMain.handle("read-settings-data", async () => {
  try {
    //return settings
    return readSettings();
  } catch (error) {
    console.log("Error retrieving settings data: ", error);
    return null;
  }
});

ipcMain.handle("update-volume-settings", async (_event, newVol: Number) => {
  const settingsData = await readSettings();
  await updateVolume(settingsData, newVol);
});

ipcMain.handle("update-directory-settings", async (_event, newDir: string) => {
  closeDatabase();

  const settingsData = await readSettings();
  await updateSelectedDir(settingsData, newDir);
});

ipcMain.handle(
  "update-currentlyPlaying-settings",
  async (_event, newAudioFile: string) => {
    const settingsData = await readSettings();
    await updateCurrentlyPlaying(settingsData, newAudioFile);
  },
);

//handlers for the database (HAVE TO WAIT FOR THIS)
ipcMain.handle("create-database", async () => {
  const result = await createDatabase();
  return result;
});

//IPC handler for checking for sqlite files (HAVE TO WAIT FOR THIS)
ipcMain.handle("sqlite-file-exists", async () => {
  const result = await detectSqliteFile();
  return result;
});

ipcMain.handle("add-folder-files", async () => {
  const result = await insertSongFolder();
  return result;
});

ipcMain.handle("fetch-songs", async () => {
  const result = await fetchSongs();
  return result;
});

ipcMain.handle("delete-song", async (_event, songID: number) => {
  const result = await deleteSong(songID);
  return result;
});

/**
 * TODO: keep this for now
 * @description updates the song table if any future changes are made
 */
ipcMain.handle("update-song-table", async () => {
  const result = await updateSongTable();
  return result;
})

ipcMain.handle("append-filePaths", async (_event, path1, path2) => {
  try {
    //console.log("PATH 1: ", path1);
    //console.log("PATH 2: ", path2);
    const result = path.join(path1, path2);
    const absPath = result.replaceAll("\\", "/");
    return "media-loader:///" + absPath; //add custom protocol
  } catch (error) {
    console.error("Error joining file paths: ", error);
  }
});

ipcMain.handle("download-yt-audio", async (_event, ytURL, checkBoxes: CheckBoxType) => {
    const result = await downloadVideo(ytURL, checkBoxes);
    return result;
  },
);

ipcMain.handle("download-yt-playlist", async (event, ytURL, checkBoxes) => {
  const result = await downloadPlaylist(event, ytURL, checkBoxes);
  return result;
});
