import { app } from "electron";
import fs from "fs";
import path from "path";

const divider = "============================";
const SETTINGS_DATA_PATH = path.join(
  app.getPath("userData"),
  "settings_data.json",
);

// Define default settings
const defaultSettings = {
  selectedDir: "",
  volume: 0.5,
  currentlyPlaying: "",
};

export function readSettings(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      //if settings file does not exist
      if (!fs.existsSync(SETTINGS_DATA_PATH)) {
        fs.writeFileSync(
          SETTINGS_DATA_PATH,
          JSON.stringify(defaultSettings, null, 2),
          "utf-8",
        );
      }

      //read file info
      const data = fs.readFileSync(SETTINGS_DATA_PATH, "utf-8");

      //log file info
      console.log(divider);
      console.log("File read from: ", SETTINGS_DATA_PATH);
      console.log("Settings data: ", data);
      console.log(divider);

      if (data) resolve(JSON.parse(data));
    } catch (error) {
      reject(error);
    }
  });
}

export function writeSettings(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(SETTINGS_DATA_PATH, data);

            console.log(divider);
            console.log("Writing data: ", data);
            console.log(divider);
            resolve();
        } catch (error) {
            console.log('Error writing to settings data: ', error);
            reject(error);
        }
    })
}

export function updateVolume(settings: any, newVol: Number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      //update new volume
      const newData = {...settings, volume: newVol};

      //write new settings to file
      writeSettings(JSON.stringify(newData, null, 2));

      //log info
      console.log(divider);
      console.log("Updated volume in settings: ", newVol);
      console.log(divider);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}

export function updateSelectedDir(settings: any, newDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      //update to new directory
      const newData = {...settings, selectedDir: newDir};

      //write new settings to file
      writeSettings(JSON.stringify(newData, null, 2));

      //log info
      console.log(divider);
      console.log("Updated selected directory in settings: ", newDir);
      console.log(divider);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}

export function updateCurrentlyPlaying(settings: any, newAudioFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      //update to new directory
      const newData = {...settings, currentlyPlaying: newAudioFile};

      //write new settings to file
      writeSettings(JSON.stringify(newData, null, 2));

      //log info
      console.log(divider);
      console.log("Updated selected directory in settings: ", newAudioFile);
      console.log(divider);
      resolve();
    } catch (error) {
      reject(error);
    }
  })
}