import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
} from "electron";
import { fileURLToPath } from "node:url";

import * as path from "path";
import fs from "fs";
import { Database } from "better-sqlite3";
import { getSqlite3, setupDatabase } from "./better-sqlite3";
import {
  readSettings,
  writeSettings,
  updateVolume,
  updateSelectedDir,
  updateCurrentlyPlaying,
} from "./settings";
import { CheckBoxType, songType } from "../public/types.ts";

import { parseFile } from "music-metadata";
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

// HANDLING DATABASE
let db: Database | null;

// function to wait for db init
function waitForDbInitialization(maxRetries = 10, delay = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const checkDb = () => {
      if (db) {
        resolve();
      } else {
        retries++;
        if (retries > maxRetries) {
          reject(new Error("Database not initialized"));
        } else {
          setTimeout(checkDb, delay);
        }
      }
    };

    checkDb();
  });
}

// IPC handler for opening file dialog
ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  console.log("TEST FILEPATHS: ", result.filePaths);
  return result.filePaths;
});

// IPC handler for opening directory dialog
ipcMain.handle("open-dir-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths;
});

// IPC handler for reading local settings data (Do we need a IPC handler for this???)
ipcMain.handle("read-settings-data", async () => {
  try {
    //return settings
    return readSettings();
  } catch (error) {
    console.log("Error retrieving settings data: ", error);
    return null;
  }
});

// IPC handler for writing local settings data

// TODO: may delete later
ipcMain.handle("write-settings-data", async (_event, data) => {
  try {
    await writeSettings(data);
  } catch (error) {
    console.log("Error writing to settings data: ", error);
    return null;
  }
});

ipcMain.handle("update-volume-settings", async (_event, newVol: Number) => {
  const settingsData = await readSettings();
  await updateVolume(settingsData, newVol);
});

ipcMain.handle("update-directory-settings", async (_event, newDir: string) => {
  //close database connection
  if (db) {
    console.log("closing database connection!");
    db?.close();
    db = null;
  }

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
  try {
    const settingsData = await readSettings();
    if(settingsData) {
      const selectedDB = path.join(settingsData?.selectedDir, "music-db.sqlite");
      db = (await getSqlite3(selectedDB)) as Database;
      console.log("Connected to database: ", db);
      setupDatabase(db);
    }
    return { success: true, message: "Database created!" };
  } catch (error) {
    console.error("ERROR: ", error);
    return { success: false, message: "Database created!" };
  }
});

//IPC handler for checking for sqlite files (HAVE TO WAIT FOR THIS)
ipcMain.handle("sqlite-file-exists", async () => {
  const settingsData = await readSettings();
  console.log("SELECTED DIRECTORY PATH: ", settingsData?.selectedDir);

  if (settingsData && (settingsData.selectedDir || settingsData.selectedDir !== "")) {
    //check for .sqlite file
    const files = fs.readdirSync(settingsData?.selectedDir);
    console.log("FILES IN DIRECTORY PATH: ", files);
    const sqliteFile = files.find((file) => path.extname(file) === ".sqlite");

    if (sqliteFile) {
      console.log(`Found .sqlite file: ${sqliteFile}`);

      const selectedDir = path.join(settingsData?.selectedDir, sqliteFile);
      db = (await getSqlite3(selectedDir)) as Database;

      console.log("Connected to new database: ", db);
      return true;
    } else {
      console.log("No .sqlite file found in the directory.");
      return false;
    }
  } else {
    return false;
  }
});

//TODO: NEED to refactor
ipcMain.handle("add-folder-files", async () => {
  try {
    //wait for db initialization or throw an error if db is not initialized
    await waitForDbInitialization();

    //get settings data
    const settingsData = await readSettings();

    //specify song folder path and get all it's files
    let songFolderPath = path.join(settingsData?.selectedDir || '', "Songs"); //TODO: review later
    const files = fs.readdirSync(songFolderPath); //change to song folder

    // Fetch all existing file locations in the Song table
    const existingFilesQuery = db?.prepare("SELECT FileLocation FROM Song");
    const existingFiles = existingFilesQuery?.all() || [];

    // Store existing file locations in a Set for quick lookup
    const existingFilePaths = new Set(
      existingFiles.map((row) => (row as any).FileLocation),
    );

    //prepare sql statement
    const insert = db?.prepare(
      "INSERT INTO Song (Title, Artist, Duration, ThumbnailLocation, FileLocation) VALUES (?, ?, ?, ?, ?)",
    );

    //iterate through all the files
    for (const file of files) {
      const ext = path.extname(file); //check file extension
      if ((ext === ".wav" || ext === ".mp3" || ext === ".opus") && settingsData) {
        //const settingsData = await readSettings();

        //get song file path and it's thumbnail file path (if it has one)
        const filePath = path.join(songFolderPath, file);
        const thumbnailCheckPath = path.join(
          settingsData?.selectedDir,
          "Thumbnails",
          path.parse(file).name + ".webp",
        ); //TODO" review

        //get metadata information of the file
        const metadata = await parseFile(filePath);
        const title = metadata.common.title || "";
        const artist = metadata.common.artist || "";
        const duration = metadata.format.duration || "";

        //check if the thumbnail path exists or not
        let thumbnailPath;
        if (fs.existsSync(thumbnailCheckPath)) {
          thumbnailPath = path.join(
            "thumbnails",
            path.parse(file).name + ".webp",
          );
        } else {
          thumbnailPath = "";
        }

        const songFilePath = path.join("Songs/", file);
        //only insert into database if it does not exist
        if (!existingFilePaths.has(songFilePath)) {
          
          console.log("Adding file to database: ", songFilePath);
          insert?.run(title, artist, duration, thumbnailPath, songFilePath);
        }
      }
    }

    return { success: true, message: "Files added to the database!" };
  } catch (error) {
    console.error("Error adding files to the database:", error);
    return { success: false, message: "Error adding files to the database!" };
  }
});

ipcMain.handle("fetch-songs", async () => {
  try {
    await waitForDbInitialization();

    const stmt = db?.prepare("SELECT * FROM Song");
    const songs = stmt?.all();
    return { success: true, data: songs };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error fetching songs" };
  }
});

ipcMain.handle("delete-song", async (_event, songID) => {
  try {
    //wait for db to be initialized
    await waitForDbInitialization();

    //read settings
    const settingsData = await readSettings();

    if(settingsData) {
      //delete song file and thumbnail
      const query =
      "SELECT ThumbnailLocation, FileLocation FROM Song WHERE SongID = ?";
      const songData = db?.prepare(query).get(songID) as songType;

      const songFileLocation = path.join(
        settingsData?.selectedDir,
        songData.FileLocation,
      );
      const songThumbnailLocation = path.join(
        settingsData?.selectedDir,
        songData?.ThumbnailLocation,
      );

      console.log("Deleting audio file: ", songFileLocation);
      console.log("Deleting thumbnail file: ", songThumbnailLocation);

      fs.unlinkSync(songFileLocation);
      if (songThumbnailLocation !== "") {
        fs.unlinkSync(songThumbnailLocation);
      }

      //delete song from sqlite database
      const deleteStmt = db?.prepare("DELETE FROM Song WHERE SongID = ?");
      deleteStmt?.run(songID);

      //reset currentlyPlaying property in settings
      updateCurrentlyPlaying(settingsData, "");
    }

    return { success: true, message: "Delete successful!" };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error deleting file" };
  }
});

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

//TODO: delete later
ipcMain.handle("meta-test", async () => {
  try {
    const filePath = path.join(
      "C:/Users/jayde/Documents/TestDir/Test1/Barns Courtney - Champion (Official Audio)-[HLEn5MyXUfE].opus",
    );
    const metadata = await parseFile(filePath);
    const title = metadata.common.title || "";
    console.log("TEST TITLE: ", title);

    return { success: true, message: "Files added to the database" };
  } catch (error) {
    console.error("Error adding files to the database:", error);
    return { success: false, message: "Error adding files to the database" };
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
