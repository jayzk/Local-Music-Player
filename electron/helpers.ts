import { settingsType } from "../public/types";
import fs from "fs";
import * as path from "path";

// Function to write any missed youtube urls (downloaded from a playlist) to a file
export function writeToErrorFile(missedURLs: {url: string, error: string}[], settingsData: settingsType) {
    if (settingsData) {
      //create error file name based on current date
      const date = new Date();
      const currentDate =
        date.toJSON().slice(0, 10) +
        " T" +
        date.getHours() +
        date.getMinutes() +
        date.getSeconds();
      const errorFileName = "MissedURLs-" + currentDate + ".txt";
      const errorFile = path.join(settingsData?.selectedDir, errorFileName);
  
      //record the missing urls and their errors into the file
      missedURLs.forEach((obj: {url: string, error: string}) => {
        fs.appendFileSync(errorFile, "Unable to download url: " + obj.url + "\n" + "Reason -> " + obj.error + "\n\n");
      });
      
      //log info
      console.log("Writing to error file: ", errorFile);
    }
  }

// Function to get all files in the selected directory
export function getAllFilesInDirectory(dirPath: string): string[] {
    // Read the directory contents
    const files = fs.readdirSync(dirPath);
  
    // Filter out directories and return only files
    return files.filter((file) => {
      const filePath = path.join(dirPath, file);
      return fs.statSync(filePath).isFile();
    });
  }

export function isValidAudioExt(ext: string) {
  const validExtensions = [".wav", ".mp3", ".opus"];
  return validExtensions.includes(ext);
}