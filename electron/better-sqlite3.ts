import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
//import Database from 'better-sqlite3'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, '..')
const TAG = '[better-sqlite3]'
let database: Database.Database

export function getSqlite3(filename: string) {
  return new Promise((resolve, reject) => {
    try {
      console.log("FILENAME DATA: ", filename);
      const database = new Database(filename, {
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L36
        // https://github.com/WiseLibs/better-sqlite3/blob/v8.5.2/lib/database.js#L50
        nativeBinding: path.join(root, import.meta.env.VITE_BETTER_SQLITE3_BINDING),
      });
      resolve(database);
    } catch (error) {
      reject(error);
    }
  });
}