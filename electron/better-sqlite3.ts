import { app } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
//import Database from 'better-sqlite3'
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, "..");
const TAG = "[better-sqlite3]";
let database: Database.Database;

export function setupDatabase(database: Database.Database) {
  // Create the "Song" table
  database
    ?.prepare(
      `
    CREATE TABLE IF NOT EXISTS Song (
      SongID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT DEFAULT '',
      Artist TEXT DEFAULT '',
      ThumbnailLocation TEXT DEFAULT '',
      FileLocation TEXT NOT NULL UNIQUE
    )
  `,
    )
    .run();

  // Create the "Playlist" table (one-to-many relationship with User)
  database
    ?.prepare(
      `
    CREATE TABLE IF NOT EXISTS Playlist (
      PlaylistID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL
    )
  `,
    )
    .run();

  // Many-to-Many "Contains" relationship table between Song and Playlist
  database
    ?.prepare(
      `
    CREATE TABLE IF NOT EXISTS Contains (
      PlaylistID_FK INTEGER NOT NULL,
      SongID_FK INTEGER NOT NULL,
      FOREIGN KEY (PlaylistID_FK) REFERENCES Playlist(PlaylistID),
      FOREIGN KEY (SongID_FK) REFERENCES Song(SongID),
      PRIMARY KEY (PlaylistID_FK, SongID_FK)
    )
  `,
    )
    .run();

  console.log("Database initialized");
}

export function getSqlite3(filename: string) {
  return new Promise((resolve, reject) => {
    try {
      console.log("FILENAME DATA: ", filename);
      const database = new Database(filename, {
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L36
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L50
        nativeBinding: path.join(
          root,
          import.meta.env.VITE_BETTER_SQLITE3_BINDING,
        ),
      });
      resolve(database);
    } catch (error) {
      reject(error);
    }
  });
}
