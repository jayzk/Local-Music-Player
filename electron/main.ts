import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  Response as ElectronResponse,
  session,
  ProtocolResponse,
} from "electron";
import { fileURLToPath } from "node:url";

import * as path from "path";
import fs from "fs";
import { Database } from "better-sqlite3";
import { getSqlite3, setupDatabase} from "./better-sqlite3";
import { readSettings, writeSettings, updateVolume, updateSelectedDir, updateCurrentlyPlaying } from "./settings";
import { spawn } from 'child_process';

const ffmpegPath = require('ffmpeg-static'); //using import gives the wrong file path to the executable
import { parseFile } from "music-metadata";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, "..", "bin", "yt-dlp.exe");

//for formatting logs
const divider = "============================";

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
          reject(new Error('Database not initialized'));
        } else {
          setTimeout(checkDb, delay);
        }
      }
    };

    checkDb();
  });
}

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
  console.log("FFMPEG BINARY LOCATION: ", ffmpegPath);
  console.log("YT-DLP BINARY LOCATION: ", ytDlpPath);
  console.log(divider);
}

// HANDLING FILES

// Function to get all files in the selected directory
function getAllFilesInDirectory(dirPath: string): string[] {
  // Read the directory contents
  const files = fs.readdirSync(dirPath);

  // Filter out directories and return only files
  return files.filter((file) => {
    const filePath = path.join(dirPath, file);
    return fs.statSync(filePath).isFile();
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
ipcMain.handle("write-settings-data", async (event, data) => {
  try {
    await writeSettings(data);
  } catch (error) {
    console.log("Error writing to settings data: ", error);
    return null;
  }
});

ipcMain.handle("update-volume-settings", async (event, newVol:Number) => {
  const settingsData = await readSettings();
  await updateVolume(settingsData, newVol);
});

ipcMain.handle("update-directory-settings", async (event, newDir:string) => {
  //close database connection
  if(db) {
    console.log("closing database connection!");
    db?.close();
    db = null;
  }

  const settingsData = await readSettings();
  await updateSelectedDir(settingsData, newDir);
});

ipcMain.handle("update-currentlyPlaying-settings", async (event, newAudioFile:string) => {
  const settingsData = await readSettings();
  await updateCurrentlyPlaying(settingsData, newAudioFile);
});

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

//handlers for the database
ipcMain.handle("create-database", async () => {
  try {
    const settingsData = await readSettings();
    const selectedDB = path.join(settingsData?.selectedDir, "music-db.sqlite");
    db = (await getSqlite3(selectedDB)) as Database;
    console.log("Connected to database: ", db);
    setupDatabase(db);
  } catch (error) {
    console.error("ERROR: ", error);
  }
});

//IPC handler for checking for sqlite files
ipcMain.handle("sqlite-file-exists", async () => {
  const settingsData = await readSettings();
  console.log("SELECTED DIRECTORY PATH: ", settingsData?.selectedDir);

  if (settingsData.selectedDir || settingsData.selectedDir !== "") {
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

ipcMain.handle("add-folder-files", async () => {
  try {
    await waitForDbInitialization();

    const settingsData = await readSettings();
    const files = fs.readdirSync(settingsData?.selectedDir);

    // Fetch all existing file locations in the Song table
    const existingFilesQuery = db?.prepare('SELECT FileLocation FROM Song');
    const existingFiles = existingFilesQuery?.all() || [];
    
    // Store existing file locations in a Set for quick lookup
    const existingFilePaths = new Set(existingFiles.map(row => (row as any).FileLocation));

    //prepare sql statement
    const insert = db?.prepare('INSERT INTO Song (Title, Artist, Duration, ThumbnailLocation, FileLocation) VALUES (?, ?, ?, ?, ?)');

    //iterate through all the files
    for (const file of files) {
      const ext = path.extname(file); //check file extension
      if(ext === ".wav" || ext === ".mp3" || ext === ".opus") {
        const settingsData = await readSettings();

        const filePath = path.join(settingsData?.selectedDir, file);
        const thumbnailCheckPath = path.join(settingsData?.selectedDir, "thumbnails", path.parse(file).name + ".webp");

        //get metadata information of the file
        const metadata = await parseFile(filePath);
        const title = metadata.common.title || '';
        const artist = metadata.common.artist || '';
        const duration = metadata.format.duration || '';

        //check if the thumbnail path exists or not
        let thumbnailPath;
        if(fs.existsSync(thumbnailCheckPath)) {
          thumbnailPath = path.join("thumbnails", path.parse(file).name + ".webp");
        } else {
          thumbnailPath = '';
        }

        //only insert into database if it does not exist
        if (!existingFilePaths.has(file)) {
          console.log("Adding file to database: ", file);
          insert?.run(title, artist, duration, thumbnailPath, file);
        }
      }
    }

    return { success: true, message: 'Files added to the database' };
  } catch (error) {
    console.error('Error adding files to the database:', error);
    return { success: false, message: 'Error adding files to the database' };
  }
});

ipcMain.handle("fetch-songs", async () => {
  try {
    await waitForDbInitialization();

    const stmt = db?.prepare('SELECT * FROM Song');
    const songs = stmt?.all();
    return { success: true, data: songs };
  } catch (error) {
    console.error('Error fetching from song table:', error);
    return { success: false, message: 'Error fetching songs' };
  }
})

ipcMain.handle("delete-song", async (event, songID) => {
  try {
    //wait for db to be initialized
    await waitForDbInitialization();

    //read settings
    const settingsData = await readSettings();

    //delete song file and thumbnail
    const query = "SELECT ThumbnailLocation, FileLocation FROM Song WHERE SongID = ?"
    const songData = db?.prepare(query).get(songID);

    const songFileLocation = path.join(settingsData?.selectedDir, (songData as any).FileLocation);
    const songThumbnailLocation = path.join(settingsData?.selectedDir, (songData as any).ThumbnailLocation);

    console.log("Deleting audio file: ", songFileLocation);
    console.log("Deleting thumbnail file: ", songThumbnailLocation);

    fs.unlinkSync(songFileLocation);
    if(songThumbnailLocation !== '') {
      fs.unlinkSync(songThumbnailLocation);
    }

    //delete song from sqlite database
    const deleteStmt = db?.prepare('DELETE FROM Song WHERE SongID = ?');
    deleteStmt?.run(songID);

    //reset currentlyPlaying property in settings
    updateCurrentlyPlaying(settingsData, "");

    return { success: true, message: 'Delete successful!'};
  } catch (error) {
    console.error('Error fetching from song table:', error);
    return { success: false, message: 'Error deleting file' };
  }
})

ipcMain.handle("append-filePaths", async (event, path1, path2) => {
  try {
    //console.log("PATH 1: ", path1);
    //console.log("PATH 2: ", path2);
    const result = path.join(path1, path2);
    const absPath = result.replaceAll('\\', '/');
    return "media-loader:///" + absPath; //add custom protocol
  } catch (error) {
    console.error("Error joining file paths: ", error);
  }
})

//TODO: delete later
ipcMain.handle("meta-test", async () => {
  try {
    const filePath = path.join("C:/Users/jayde/Documents/TestDir/Test1/Barns Courtney - Champion (Official Audio)-[HLEn5MyXUfE].opus");
    const metadata = await parseFile(filePath);
    const title = metadata.common.title || '';
    console.log("TEST TITLE: ", title);

    return { success: true, message: 'Files added to the database' };
  } catch (error) {
    console.error('Error adding files to the database:', error);
    return { success: false, message: 'Error adding files to the database' };
  }
});

ipcMain.handle("download-yt-audio", async (event, ytURL, checkBoxes) => {
  try {
    // Log info
    console.log("YT URL: ", ytURL);
    console.log("Checkbox info: ", checkBoxes);

    // Get selected directory to download to
    const settingsData = await readSettings();
    const downloadPath = settingsData?.selectedDir;
    if (!downloadPath) {
      throw new Error('Download path not found in settings');
    }

    // Construct default command args
    const defaultArgs = [
      '--ffmpeg-location', ffmpegPath,    // Specify ffmpeg binary
      '-P', downloadPath,                 // Specify download path  
      '--no-playlist',                    // Don't download the playlist 
      '--embed-metadata',                 // get metadata from youtube URL
      '-f', 'bestaudio',                  // Download best quality audio
      '-o', '%(title)s-[%(id)s].%(ext)s', // Specify output format of file
    ];

    //construct thumbnail command args
    let thumbnailArgs: String[] = [];
    if(checkBoxes.thumbnailChecked) {
      console.log("Including thumbnail args");
      thumbnailArgs = [
        '--write-thumbnail',              // Download thumbnail
        '-P', 'thumbnail:thumbnails',     // Specify thumbnail download path
      ];
    }

    //construct url args
    const urlArg = ['-x', ytURL,];

    //pass in all args
    const args = defaultArgs.concat(thumbnailArgs, urlArg);

    console.log("Args passed to yt-dlp: ", args);

    // Wrap spawn in a Promise
    await new Promise((resolve, reject) => {
      const child = spawn(ytDlpPath, args);

      child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, message: 'Youtube URL downloaded!' });
        } else {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });

    return { success: true, message: 'Youtube URL downloaded!' };
  } catch (error) {
    console.error('Error during download:', error);
    return { success: false, message: `Error downloading Youtube URL!` };
  }
});
