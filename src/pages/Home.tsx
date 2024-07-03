import React, { useEffect, useState } from "react";
import 'react-h5-audio-player/lib/styles.css';
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import NavTop from "../Components/NavTop";

export default function Home() {
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

  //logging file info
  useEffect(() => {
    if (selectedFilePath) {
      console.log("Incoming file information");
      console.log("fileUrl: ", fileUrl);
      console.log("fileExtension: ", fileExtension);
    }
  }, [selectedFilePath, fileUrl, fileExtension]);

  return (
    <div className="py-2">
      <NavTop />
      <h1>Electron React Directory Dialog</h1>
      <button onClick={handleOpenDirDialog}>Open Directory Dialog</button>
      {selectedDirPath && <p>Selected Path: {selectedDirPath}</p>}
    </div>
  );
}
