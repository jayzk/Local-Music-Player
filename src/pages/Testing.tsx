import React, { useEffect, useState } from "react";
import 'react-h5-audio-player/lib/styles.css';
import AudioControls from "../Components/AudioControls";

async function fetchNames() {
    try {
      const result = await window.ipcRenderer.invoke('get-names');
      if (result.success) {
        return result.data;
      } else {
        console.error('Error fetching names:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error invoking fetch names:', error);
      return [];
    }
  }
  
  async function fetchSettings() {
    try {
      const result = await window.ipcRenderer.invoke('read-settings-data');
      console.log("Settings test: ", result);
    } catch (error) {
      console.error('Error invoking fetch settings:', error);
    }
  }

export default function Testing() {
    const [selectedFilePath, setSelectedFilePath] = useState("");
    const [selectedDirPath, setSelectedDirPath] = useState("");
    const [userNames, setUserNames] = useState([]);
  
    const handleOpenFileDialog = async () => {
      const filePaths = await window.ipcRenderer.invoke("open-file-dialog");
      if (filePaths.length > 0) {
        setSelectedFilePath(filePaths[0]);
      }
    };
  
    const handleOpenDirDialog = async () => {
      const filePaths = await window.ipcRenderer.invoke("open-dir-dialog");
      if (filePaths.length > 0) {
        setSelectedDirPath(filePaths[0]);
      }
    };
  
    const fileUrl = selectedFilePath
      ? `media-loader:///${encodeURIComponent(selectedFilePath)
          .replace(/%3A/g, ":")
          .replace(/%5C/g, "/")
          .replace(/%20/g, " ")}`
      : "";
      
    const fileExtension = selectedFilePath
      ? selectedFilePath.split(".").pop()?.toLowerCase()
      : "";
  
      useEffect(() => {
        //createTable();
        fetchNames().then(setUserNames);
        fetchSettings();
        console.log("TABLE CREATED PLS WORK");
      }, []);
  
    //logging file info
    useEffect(() => {
      if (selectedFilePath) {
        console.log("Incoming file information");
        console.log("fileUrl: ", fileUrl);
        console.log("fileExtension: ", fileExtension);
      }
    }, [selectedFilePath, fileUrl, fileExtension]);
  
    return (
      <div>
        <h1>Electron React File Dialog</h1>
        <button onClick={handleOpenFileDialog}>Open File Dialog</button>
        {selectedFilePath && <p>Selected Path: {selectedFilePath}</p>}
  
        <h1>Electron React Directory Dialog</h1>
        <button onClick={handleOpenDirDialog}>Open Directory Dialog</button>
        {selectedDirPath && <p>Selected Path: {selectedDirPath}</p>}
  
        <h1>IMAGE TEST</h1>
        {/* <img src={selectedFilePath} alt="My Image" /> */}
        {fileUrl && (
          <img
            src={fileUrl}
            alt="My Image"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        )}
  
        {fileUrl &&
          fileExtension &&
          (fileExtension === "mp3" ||
            fileExtension === "wav" ||
            fileExtension === "ogg") && (
            <AudioControls fileUrl={fileUrl} />
          )}
  
        <h1>User Names from Database</h1>
        <ul>
          {userNames.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    );
}
