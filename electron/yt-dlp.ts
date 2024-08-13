import { readSettings } from "./settings";
import { spawn } from "child_process";
import * as path from "path";
import { CheckBoxType } from "../public/types";
import { writeToErrorFile } from "./helpers";
import { insertSongFolder } from "./better-sqlite3";

// import binaries
export const FFMPEG_BINARY_PATH = require("ffmpeg-static"); //using import gives the wrong file path to the executable
export const YT_DLP_BINARY_PATH = path.join(__dirname, "..", "bin", "yt-dlp.exe");

// output templates for yt-dlp
const SongOutputTemplate = "Songs/%(title)s-[%(id)s].%(ext)s";
const ThumbnailOutputTemplate = "thumbnail:Thumbnails/%(title)s-[%(id)s].%(ext)s";
const ProgressOutputTemplate = "download:[DOWNLOADING]-Downloading item %(info.playlist_autonumber)s of %(info.playlist_count)s";

// default arguments
const defaultArgs = [
  "--ffmpeg-location", FFMPEG_BINARY_PATH, // Specify ffmpeg binary
  "--embed-metadata",       // get metadata from youtube URL
  "--sleep-requests", "1.25",
  "--sleep-interval", "5",
  "-f", "bestaudio",        // Download best quality audio
  "-o", SongOutputTemplate, // Specify output format of audio file  
];

// using yt-dlp to extract audio from a youtube video (along with metadata)
export async function downloadVideo(ytURL: string, checkBoxes: CheckBoxType) {
  try {
    // Log info
    console.log("YT URL: ", ytURL);
    console.log("Checkbox info: ", checkBoxes);

    // Get selected directory to download to
    const settingsData = await readSettings();
    const downloadPath = settingsData?.selectedDir;
    if (!downloadPath) {
      throw new Error("Download path not found in settings");
    }

    //construct thumbnail command args
    let thumbnailArgs: String[] = [];
    if (checkBoxes.thumbnailChecked) {
      console.log("Including thumbnail args");
      thumbnailArgs = [
        "--write-thumbnail",            // Download thumbnail
        "-o", ThumbnailOutputTemplate,  // Specify thumbnail download path
      ];
    }

    const additionalVideoArgs = [
      "-P", downloadPath, // Specify download path
      "--no-playlist",    // Don't download the playlist
      "--print", "after_move:[FILENAME]-%(title)s-[%(id)s].%(ext)s",  // Testing
      "--no-simulate", "--no-quiet",
      "-x", ytURL,        // extract audio from youtube url
    ];

    //pass in all args
    const args = defaultArgs.concat(thumbnailArgs, additionalVideoArgs);

    console.log("Args passed to yt-dlp: ", args);

    // Wrap spawn in a Promise
    await new Promise((resolve, reject) => {
      const child = spawn(YT_DLP_BINARY_PATH, args);

      child.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      child.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      child.on("close", async (code) => {
        if (code === 0) {
          //update sqlite database
          const result = await insertSongFolder();
          if(result.success) {
            resolve({ success: true, message: "Youtube URL downloaded!" });
          } else {
            reject(new Error(`Error inserting into sqlite database!`));
          }
        } else {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });

    return { success: true, message: "Youtube URL downloaded!" };
  } catch (error) {
    console.error("Error during download:", error);
    return { success: false, message: `Error downloading Youtube URL!` };
  }
}

// using yt-dlp to extract audio from a youtube playlist (along with metadata)
export async function downloadPlaylist(event: Electron.IpcMainInvokeEvent, ytURL: string, checkBoxes: CheckBoxType) {
  const settingsData = await readSettings();

  // count number of missed urls
  let numOfMissedURLs = 0;
  let listOfMissedURLs: {url: string, error: string}[] = [];

  try {
    // Log info
    console.log("YT playlist URL: ", ytURL);
    console.log("Checkbox info: ", checkBoxes);

    // Get selected directory to download to
    const downloadPath = settingsData?.selectedDir;
    if (!downloadPath) {
      throw new Error("Download path not found in settings");
    }

    //construct thumbnail command args
    let thumbnailArgs: String[] = [];
    if (checkBoxes.thumbnailChecked) {
      console.log("Including thumbnail args");
      thumbnailArgs = [
        "--write-thumbnail", // Download thumbnail
        "-o", ThumbnailOutputTemplate, // Specify thumbnail download path
      ];
    }

    const additionalPlaylistArgs = [
      "-P", downloadPath,     // Specify download path
      "--yes-playlist",       // download the playlist
      "--continue", "--no-overwrites", "--ignore-errors",     // in general, good to have if downloading a playlist
      "--print", "before_dl:[EXTRACT URL]-%(original_url)s",  // Testing custom output for extracting the youtube URL (not working before errors occur)
      "--no-simulate", "--no-quiet",                              
      "--progress-template", ProgressOutputTemplate,          // custom template for progress output to parse it later
      "--no-write-playlist-metafiles",                        // don't write any metadata for the playlist
      "-x", ytURL             // extract audio from youtube urls
    ];

    //pass in all args
    const args = defaultArgs.concat(thumbnailArgs, additionalPlaylistArgs);

    console.log("Args passed to yt-dlp: ", args);

    // Wrap spawn in a Promise
    await new Promise((resolve, reject) => {
      const child = spawn(YT_DLP_BINARY_PATH, args);
      let currentURL: string | undefined;

      child.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);

        const output = data.toString();
        const lines = output.split("\n");

        lines.forEach((line: string) => {
          if (
            line.includes("Extracting URL") &&
            !line.includes("[youtube:tab]")
          ) {
            //parse output (TODO: might want to review, not my custom output, not reliable)
            currentURL = line.split(" ").pop(); //removing [EXTRACT URL] tag
            console.log(`Current URL: ${currentURL}`);
          }

          if (line.includes("[DOWNLOADING]")) {
            //parse output
            console.log(`Filtered stdout: ${line}`);
            const sendOutput = line.split("-").pop(); //removing [DOWNLOADING] tag
            event.sender.send("playlist-download-progress", sendOutput);
          }
        });
      });

      child.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
        const output = data.toString();
  
        // ensure to not include warnings inside the list of missed URLs (they still download but in m4a format)
        if (currentURL && output.includes("ERROR")) {
          listOfMissedURLs.push({"url": currentURL, "error": data});
          numOfMissedURLs++;
        }
      });

      child.on("close", async (code) => {
        //update sqlite database regardless of errors just in case as urls can still be downloaded
        const result = await insertSongFolder();
        
        if (code === 0) {
          if(result.success) {
            resolve({ success: true, message: "Youtube playlist downloaded!" });
          } else {
            reject(new Error(`Error inserting into sqlite database!`));
          }
        } else {
          if(result.success) {
            reject(new Error(`Child process exited with code ${code}`));
          } else {
            reject(new Error(`Error inserting into sqlite database!`));
          }
        }
      });
    });

    return { success: true, message: "Youtube playlist downloaded!" };
  } catch (error) {
    console.error("Error during download:", error);
    writeToErrorFile(listOfMissedURLs, settingsData);

    return {
      success: false,
      message: `Some errors occured while downloading Youtube playlist! Could not download ${numOfMissedURLs} URLs`,
    };
  }
}
