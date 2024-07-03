import { app, BrowserWindow, dialog, ipcMain, protocol, Response as ElectronResponse, session, ProtocolResponse } from 'electron'
import { fileURLToPath } from 'node:url'

import * as path from 'path'
import fs from 'fs';
import {Database} from "better-sqlite3";
import { getSqlite3 } from './better-sqlite3'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_DATA_PATH = path.join(app.getPath("userData"), 'settings_data.json');

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
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

protocol.registerSchemesAsPrivileged([
  { scheme: 'media-loader', 
    privileges: { 
      bypassCSP: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
     } }
])

//custom protocol handler for media-loader URL's 
app.whenReady().then(() => {
  //protocol.handle isn't able to support seekable media atm, using the depreciated version for now
  // protocol.handle('media-loader', (request) =>
  // net.fetch('file://' + request.url.slice('media-loader://'.length)));

  // Create custom protocol for local media loading (depreciated)
  protocol.registerFileProtocol("media-loader", (request, callback) => {
    const url = request.url.replace("media-loader://", "");
    try {
      return callback({ path: url});
    } catch (err) {
      console.error(err);
    }
  });

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://*.github.com/*', '*://electron.github.io/*', '*:///*',]
  }

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
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    minWidth: 768,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Open the DevTools in development mode
  // if (process.env.NODE_ENV === 'development') {
  //   win.webContents.openDevTools();
  // }

  win.maximize();

  console.log("FILE LOCATION: ", __filename);
  console.log("DIRECTORY LOCATION: ", __dirname);
}

// IPC handler for opening file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  console.log("TEST FILEPATHS: ", result.filePaths);
  return result.filePaths;
});

// IPC handler for opening directory dialog
ipcMain.handle('open-dir-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths;
});

// Define default settings
const defaultSettings = {
  selectedDir: '',
};

// IPC handler for reading local settings data
ipcMain.handle('read-settings-data', async () => {
  try {
    //check if the settings file exists, if not create it
    if(!fs.existsSync(SETTINGS_DATA_PATH)) {
      fs.writeFileSync(SETTINGS_DATA_PATH, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    }

    //reading the file
    const data = fs.readFileSync(SETTINGS_DATA_PATH, 'utf-8');
    return JSON.parse(data); //TODO: may have to just return as a string and parse in the renderer
  } catch (error) {
    console.log('Error retrieving settings data: ', error);
    return null;
  }
});

// IPC handler for writing local settings data
ipcMain.handle('write-settings-data', async (data) => {
  try {
    fs.writeFileSync(SETTINGS_DATA_PATH, JSON.stringify(data)); //TODO: check if we can send data as an object
  } catch (error) {
    console.log('Error writing to settings data: ', error);
    return null;
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let db: Database;

function setupDatabase() {
  // Create the "User" table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS User (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL UNIQUE
    )
  `).run();

  // Create the "Song" table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS Song (
      SongID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      FileLocation TEXT NOT NULL
    )
  `).run();

  // Create the "Playlist" table (one-to-many relationship with User)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS Playlist (
      PlaylistID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      UserID_FK INTEGER NOT NULL,
      FOREIGN KEY (UserID_FK) REFERENCES User(UserID)
    )
  `).run();

  // Many-to-Many "Manages" relationship table between User and Song
  db.prepare(`
    CREATE TABLE IF NOT EXISTS Manages (
      UserID_FK INTEGER NOT NULL,
      SongID_FK INTEGER NOT NULL,
      FOREIGN KEY (UserID_FK) REFERENCES User(UserID),
      FOREIGN KEY (SongID_FK) REFERENCES Song(SongID),
      PRIMARY KEY (UserID_FK, SongID_FK)
    )
  `).run();

  // Many-to-Many "Contains" relationship table between Song and Playlist 
  db.prepare(`
    CREATE TABLE IF NOT EXISTS Contains (
      PlaylistID_FK INTEGER NOT NULL,
      SongID_FK INTEGER NOT NULL,
      FOREIGN KEY (PlaylistID_FK) REFERENCES Playlist(PlaylistID),
      FOREIGN KEY (SongID_FK) REFERENCES Song(SongID),
      PRIMARY KEY (PlaylistID_FK, SongID_FK)
    )
  `).run();

  console.log("Database initialized");
};

app.whenReady().then(() => {
  createWindow();
  // ensure did-finish-load
  setTimeout(() => {
    db = getSqlite3();
    console.log("Connected to database: ", db);
    setupDatabase();
    //win?.webContents.send('main-process-message', `[better-sqlite3] ${JSON.stringify(db.pragma('journal_mode = WAL'))}`);
  }, 999);
})

//handlers for the database

ipcMain.handle('get-names', async () => {
  try {
    //Retrive all rows of usernames from the table User
    const rows: any = db.prepare('SELECT Username FROM User').all();
    const names = rows.map((row: { Username: any; }) => row.Username);
    return { success: true, data: names };
  } catch (error) {
    console.error('Get names error:', error);
    return { success: false, error: (error as Error).message };
  }
});
