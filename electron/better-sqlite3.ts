import path from "node:path";
import Database from "better-sqlite3";
import { readSettings, updateCurrentlyPlaying } from "./settings";
import fs from "fs";
import { parseFile } from "music-metadata";
import { songType } from "../public/types";
import { isValidAudioExt } from "./helpers";

let database: Database.Database | null;

//stores existing files already in the current database (does not store absolute file paths, just relative to the Song folder)
let existingFilePathsInDB: Set<any> = new Set();

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
      CreationDate INTEGER DEFAULT -1,
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

      database = new Database(filename);

      resolve(database);
    } catch (error) {
      reject(error);
    }
  });
}

// function getExistingFilePaths() {
//   // Fetch all existing file locations in the Song table
//   const existingFilesQuery = database?.prepare("SELECT FileLocation FROM Song");
//   const existingFiles = existingFilesQuery?.all() || [];

//   // Store existing file locations in a Set for quick lookup
//   const existingFilePaths = new Set(
//     existingFiles.map((row) => (row as any).FileLocation),
//   );

//   return existingFilePaths;
// }

/**
 * TODO: keep this for now
 * @description updates the song table if any future changes are made (currently adding a new column "CreationDate")
 */
export async function updateSongTable() {
  try {
    await waitForDbInitialization();
    const settingsData = await readSettings();

    database?.exec(`
      ALTER TABLE Song
      ADD COLUMN CreationDate INTEGER
    `);

    //prepare insert statement
    const updateCreationDate = database?.prepare(`
      UPDATE Song
      SET CreationDate = ?
      WHERE SongID = ?
    `);

    // Fetch all existing file locations in the Song table
    const getAllStmt = database?.prepare("SELECT * FROM Song");
    const songs = getAllStmt?.all() as songType[];

    if (songs && settingsData) {
      songs.forEach((song) => {
        //get absolute file path
        const filePath = path.join(settingsData.selectedDir, song.FileLocation);

        //get metadata information of the file
        const stats = fs.statSync(filePath);
        const creationDate = stats.birthtime.getTime();

        //update creation date
        updateCreationDate?.run(creationDate, song.SongID);
      });
    }

    return { success: true, message: "Updated song table!" };
  } catch (error) {
    return { success: false, message: "Error updating song table!" };
  }
}

async function updateExistingFilePaths() {
  try {
    await waitForDbInitialization();
    // Fetch all existing file locations in the Song table
    const existingFilesQuery = database?.prepare(
      "SELECT FileLocation FROM Song",
    );
    const existingFiles = existingFilesQuery?.all() || [];

    // Store existing file locations in a Set for quick lookup
    existingFilePathsInDB = new Set(
      existingFiles.map((row) => (row as any).FileLocation),
    );

    return { success: true, message: "Updated existing file paths!" };
  } catch (error) {
    console.error("ERROR: ", error);
    return { success: false, message: "Error updating existing file paths!" };
  }
}

function createFolder(path: string) {
  fs.mkdir(path, (err) => {
    if (err) {
      console.error(`Error creating folder: ${err}`);
    } else {
      console.log(`Folder created at: ${path}`);
    }
  });
}

export async function createDatabase() {
  try {
    const settingsData = await readSettings();
    if (settingsData) {
      const selectedDB = path.join(
        settingsData.selectedDir,
        "music-db.sqlite",
      );
      database = (await getSqlite3(selectedDB)) as Database.Database;
      console.log("Connected to database: ", database);
      setupDatabase(database);

      //create necessary folders
      createFolder(path.join(settingsData.selectedDir, "Songs"));
      createFolder(path.join(settingsData.selectedDir, "Thumbnails"));
    }

    const result = await updateExistingFilePaths();
    if (result.success) {
      console.log("TEST EXISTING FILE PATHS: ", existingFilePathsInDB);
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

  if (
    settingsData &&
    (settingsData.selectedDir || settingsData.selectedDir !== "")
  ) {
    //check for .sqlite file
    const files = fs.readdirSync(settingsData?.selectedDir);
    console.log("FILES IN DIRECTORY PATH: ", files);
    const sqliteFile = files.find((file) => path.extname(file) === ".sqlite");

    if (sqliteFile) {
      console.log(`Found .sqlite file: ${sqliteFile}`);

      const selectedDir = path.join(settingsData?.selectedDir, sqliteFile);
      database = (await getSqlite3(selectedDir)) as Database.Database;

      console.log("Connected to new database: ", database);

      const result = await updateExistingFilePaths();
      if (result.success) {
        console.log("TEST EXISTING FILE PATHS: ", existingFilePathsInDB);
      }
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

    //specify song folder absolute path and get all it's files
    let songFolderPath = path.join(settingsData?.selectedDir || "", "Songs"); //TODO: review later
    const files = fs.readdirSync(songFolderPath); //change to song folder

    let result;

    //iterate through all the files
    for (const file of files) {
      result = await insertSong(songFolderPath, file);
    }

    if (result?.success) {
      return { success: true, message: "Files added to the database!" };
    } else {
      return { success: false, message: "Error adding files to the database!" };
    }
  } catch (error) {
    console.error("Error adding files to the database:", error);
    return { success: false, message: "Error adding files to the database!" };
  }
}

/**
 *
 * @param songFolderPath - absolute path for the song folder
 * @param file - song file
 * @returns
 */
export async function insertSong(songFolderPath: string, file: string) {
  try {
    //wait for db initialization or throw an error if db is not initialized
    await waitForDbInitialization();

    //TODO: delete later
    console.log("TEST - Song folder abs path: ", songFolderPath);

    //get settings data
    const settingsData = await readSettings();

    //prepare insert statement
    const insert = database?.prepare(
      "INSERT INTO Song (Title, Artist, Duration, CreationDate, ThumbnailLocation, FileLocation) VALUES (?, ?, ?, ?, ?, ?)",
    );

    const ext = path.extname(file);

    if (isValidAudioExt(ext) && settingsData) {
      //get song absolute file path
      const filePath = path.join(songFolderPath, file);

      //get metadata information of the file
      const stats = fs.statSync(filePath);
      const metadata = await parseFile(filePath);
      const title = metadata.common.title || "";
      const artist = metadata.common.artist || "";
      const duration = metadata.format.duration || "";
      const creationDate = stats.birthtime.getTime();

      //check if the thumbnail path exists or not
      let thumbnailPath;
      const thumbnailCheckPath = path.join(
        settingsData?.selectedDir,
        "Thumbnails",
        path.parse(file).name + ".webp",
      ); //TODO" review

      if (fs.existsSync(thumbnailCheckPath)) {
        thumbnailPath = path.join(
          "Thumbnails",
          path.parse(file).name + ".webp",
        );
      } else {
        thumbnailPath = "";
      }

      const songDbFilePath = path.join("Songs/", file);
      //only insert into database if it does not exist
      if (!existingFilePathsInDB.has(songDbFilePath)) {
        console.log("Adding file to database: ", songDbFilePath);
        existingFilePathsInDB.add(songDbFilePath);
        insert?.run(
          title,
          artist,
          duration,
          creationDate,
          thumbnailPath,
          songDbFilePath,
        );

        console.log("TEST EXISTING FILE PATHS: ", existingFilePathsInDB);
      }
    }

    return { success: true, message: "Audio file added to the database!" };
  } catch (error) {
    console.error("Error adding audio file to the database:", error);
    return { success: false, message: "Error audio file to the database!" };
  }
}

export async function deleteSong(songID: number) {
  try {
    //wait for db to be initialized
    await waitForDbInitialization();

    //read settings
    const settingsData = await readSettings();

    if (settingsData) {
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
      console.log("Deleting thumbnail file: ", songData?.ThumbnailLocation);

      fs.unlinkSync(songFileLocation);
      if (songData?.ThumbnailLocation !== "") {
        fs.unlinkSync(songThumbnailLocation);
      }

      existingFilePathsInDB.delete(songData.FileLocation);
      console.log("TEST EXISTING FILE PATHS: ", existingFilePathsInDB);

      //delete song from sqlite database
      const deleteStmt = database?.prepare("DELETE FROM Song WHERE SongID = ?");
      deleteStmt?.run(songID);

      //reset currentlyPlaying property in settings
      updateCurrentlyPlaying(settingsData, "", 0);
    }

    return { success: true, message: "Delete successful!" };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error deleting file" };
  }
}

export async function fetchSongs(filter: string = "") {
  try {
    await waitForDbInitialization();

    const stmt = database?.prepare(`SELECT * FROM Song WHERE Title LIKE ?`);
    const songs = stmt?.all(`%${filter}%`);
    return { success: true, data: songs };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error fetching songs" };
  }
}

export async function fetchSongByRowNum(rowNum: number) {
  try {
    await waitForDbInitialization();

    const query = database?.prepare(
      `SELECT * FROM
        (SELECT *, 
          ROW_NUMBER() OVER() AS RowNum
          FROM Song)
        WHERE RowNum = ?`,
    );

    const songData = query?.get(rowNum) as songType;
    return { success: true, data: songData };
  } catch (error) {
    console.error("Error fetching from song table:", error);
    return { success: false, message: "Error fetching song" };
  }
}

export async function fetchCurrentRowNum(songID: number) {
  try {
    await waitForDbInitialization();

    const query = database?.prepare(
      `SELECT RowNum FROM
        (SELECT *, 
          ROW_NUMBER() OVER() AS RowNum
          FROM Song)
        WHERE SongID = ?`,
    );

    const rowNum = query?.get(songID);

    return { success: true, data: rowNum };
  } catch (error) {
    console.error("Error fetching row number from song table:", error);
    return { success: false, message: "Error fetching current row number" };
  }
}

export async function fetchTotalNumOfSongs() {
  try {
    await waitForDbInitialization();

    const query = database?.prepare(`SELECT COUNT(*) AS Total FROM Song`);
    const totalNumOfSongs = query?.get();

    return { success: true, data: totalNumOfSongs };
  } catch (error) {
    console.error("Error fetching number of rows in the song table:", error);
    return { success: false, message: "Error fetching total number of rows/songs" };
  }
}

export async function updateSongTitle(songID: number, newSongTitle: string) {
  try {
    await waitForDbInitialization();

    const statement = database?.prepare(`UPDATE Song Set Title = ? WHERE SongID = ?`);
    statement?.run(newSongTitle, songID);

    return { success: true, message: "Updated song title!" };
  } catch (error) {
    console.error("Error updating song title in database:", error);
    return { success: false, message: "Error updating song title!" };
  }
}

export async function updateSongArtist(songID: number, newSongArtist: string) {
  try {
    await waitForDbInitialization();

    const statement = database?.prepare(`UPDATE Song Set Artist = ? WHERE SongID = ?`);
    statement?.run(newSongArtist, songID);

    return { success: true, message: "Updated song artist!" };
  } catch (error) {
    console.error("Error updating song artist in database:", error);
    return { success: false, message: "Error updating song artist!" };
  }
}

export async function updateSongThumbnail(songID: number, newSongThumbnail: string) {
  try {
    await waitForDbInitialization();

    const statement = database?.prepare(`UPDATE Song Set ThumbnailLocation = ? WHERE SongID = ?`);
    statement?.run(newSongThumbnail, songID);

    return { success: true, message: "Updated song thumbnail!" };
  } catch (error) {
    console.error("Error updating song thumbnail in database:", error);
    return { success: false, message: "Error updating song thumbnail!" };
  }
}

export function closeDatabase() {
  if (database) {
    console.log("closing database connection!");
    database?.close();
    database = null;
  }
}
