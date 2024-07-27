import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { readSettings, updateCurrentlyPlaying } from "./settings";
import fs from "fs";
import { parseFile } from "music-metadata";
import { songType } from "../public/types";
import { isValidAudioExt } from "./helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, "..");
const TAG = "[better-sqlite3]";
let database: Database.Database | null;

function waitForDbInitialization(maxRetries = 10, delay = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const checkDb = () => {
      if (database) {
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

function setupDatabase(database: Database.Database | null) {
  // Create the "Song" table
  database
    ?.prepare(
      `
    CREATE TABLE IF NOT EXISTS Song (
      SongID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT DEFAULT '',
      Artist TEXT DEFAULT '',
      Duration REAL DEFAULT 0,
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

function getSqlite3(filename: string) {
  return new Promise((resolve, reject) => {
    try {
      console.log("FILENAME DATA: ", filename);
      database = new Database(filename, {
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

export async function createDatabase() {
  try {
    const settingsData = await readSettings();
    if(settingsData) {
      const selectedDB = path.join(settingsData?.selectedDir, "music-db.sqlite");
      database = (await getSqlite3(selectedDB)) as Database.Database;
      console.log("Connected to database: ", database);
      setupDatabase(database);
    }
    return { success: true, message: "Database created!" };
  } catch (error) {
    console.error("ERROR: ", error);
    return { success: false, message: "Database created!" };
  }
}

export async function detectSqliteFile() {
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
      database = (await getSqlite3(selectedDir)) as Database.Database;

      console.log("Connected to new database: ", database);
      return true;
    } else {
      console.log("No .sqlite file found in the directory.");
      return false;
    }
  } else {
    return false;
  }
}

export async function insertSongFolder() {
  try {
    //wait for db initialization or throw an error if db is not initialized
    await waitForDbInitialization();

    //get settings data
    const settingsData = await readSettings();

    //specify song folder path and get all it's files
    let songFolderPath = path.join(settingsData?.selectedDir || '', "Songs"); //TODO: review later
    const files = fs.readdirSync(songFolderPath); //change to song folder

    // Fetch all existing file locations in the Song table
    const existingFilesQuery = database?.prepare("SELECT FileLocation FROM Song");
    const existingFiles = existingFilesQuery?.all() || [];

    // Store existing file locations in a Set for quick lookup
    const existingFilePaths = new Set(
      existingFiles.map((row) => (row as any).FileLocation),
    );

    //prepare sql statement
    const insert = database?.prepare(
      "INSERT INTO Song (Title, Artist, Duration, ThumbnailLocation, FileLocation) VALUES (?, ?, ?, ?, ?)",
    );

    //iterate through all the files
    for (const file of files) {
      const ext = path.extname(file); //check file extension
      if (isValidAudioExt(ext) && settingsData) {
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
}

export function insertRow() {

}

export async function deleteSong(songID: number) {
  try {
    //wait for db to be initialized
    await waitForDbInitialization();

    //read settings
    const settingsData = await readSettings();

    if(settingsData) {
      //delete song file and thumbnail
      const query =
      "SELECT ThumbnailLocation, FileLocation FROM Song WHERE SongID = ?";
      const songData = database?.prepare(query).get(songID) as songType;

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
      const deleteStmt = database?.prepare("DELETE FROM Song WHERE SongID = ?");
      deleteStmt?.run(songID);

      //reset currentlyPlaying property in settings
      updateCurrentlyPlaying(settingsData, "");
    }

    return { success: true, message: "Delete successful!" };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error deleting file" };
  }
}

export async function fetchSongs() {
  try {
    await waitForDbInitialization();

    const stmt = database?.prepare("SELECT * FROM Song");
    const songs = stmt?.all();
    return { success: true, data: songs };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error fetching songs" };
  }
}

export function closeDatabase() {
  if (database) {
    console.log("closing database connection!");
    database?.close();
    database = null;
  }
}
