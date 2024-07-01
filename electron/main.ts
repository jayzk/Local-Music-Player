import { app, BrowserWindow, dialog, ipcMain, protocol, Response as ElectronResponse, session, ProtocolResponse } from 'electron'
import { fileURLToPath } from 'node:url'

//import path from 'node:path'
import * as path from 'path'
//import { getNames } from '../src/Database/models/user-manager'
//import getNames from "../src/Database/models/user-manager";
import {Database} from "better-sqlite3";
//import Database from 'better-sqlite3';

import { getSqlite3 } from './better-sqlite3'
const __filename = fileURLToPath(import.meta.url);
//const __filename = import.meta.filename;
const __dirname = path.dirname(__filename);

//let db: Database = new DatabaseConstructor('./test.db');
// const db = new Database("../src/Database/music-db.sqlite", { verbose: console.log });

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

//const db = new Database(path.join(__dirname, `../database.db3`));

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
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

  //const dbPath = "C:\Users\jayde\Documents\Personal projects\Local-Music-Player\src\Database\music-db.sqlite";
  //const dbPath = path.resolve("test.db");

  //const db = new Database('my-database.db', { verbose: console.log });

  //const dbPath = path.join(__dirname, 'data.db');

  // const dbPath =
  //   process.env.NODE_ENV === "development"
  //       ? "./demo_table.db"
  //       : path.join(process.resourcesPath, "./demo_table.db")

  //let db: Database = new DatabaseConstructor("test.db");

  //const db = new Database(dbPath);

  //let nativeLoc = path.join(process.env.APP_ROOT, "node_modules/better-sqlite3/build/Release/better_sqlite3.node");
  //const db = new DatabaseConstructor('data.db', { nativeBinding: nativeLoc });

  // const db = new Database('foobar.db');
  // db.pragma("journal_mode = WAL");

  console.log("FILE: ", __filename);
  console.log("DIR: ", __dirname);
  console.log("DIR TEST: ", process.env.APP_ROOT);
}

// IPC handler for opening file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  return result.filePaths;
});

// IPC handler for opening directory dialog
ipcMain.handle('open-dir-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths;
});

// TESTING
// ipcMain.handle('get-usernames', async () => {
//   try {
//     console.log('Fetching usernames...');
//     const names = await getNames();
//     console.log('Usernames fetched:', names);
//     return names;
//   } catch (error) {
//     console.error('Error fetching user names:', error);
//     return { error: 'Failed to fetch user names' };
//   }
// });

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



// app.whenReady().then(createWindow)

let db: Database;

app.whenReady().then(() => {
  createWindow();
  // ensure did-finish-load
  setTimeout(() => {
    db = getSqlite3();
    console.log("database initialized: ", db);
    win?.webContents.send('main-process-message', `[better-sqlite3] ${JSON.stringify(db.pragma('journal_mode = WAL'))}`);
  }, 999)

  console.log("TEST PROCESS COMPLETE");
})

ipcMain.handle('db-create', async() => {
  try {
    const statement = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE
    )
  `;
    
    db.prepare(statement).run();
    return { success: true };
    
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-names', async () => {
  try {
    //Retrive all rows of results only from the column Username
    const rows: any = db.prepare('SELECT Username FROM User').all();
    const names = rows.map((row: { Username: any; }) => row.Username);
    return { success: true, data: names };
  } catch (error) {
    console.error('Get names error:', error);
    return { success: false, error: (error as Error).message };
  }
});
