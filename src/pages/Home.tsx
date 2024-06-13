import React, { useState } from 'react'

export default function Home() {
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const [selectedDirPath, setSelectedDirPath] = useState('');

    const handleOpenFileDialog = async () => {
        const filePaths = await window.ipcRenderer.invoke('open-file-dialog');
        if (filePaths.length > 0) {
          setSelectedFilePath(filePaths[0]);
        }
      };

    const handleOpenDirDialog = async () => {
        const filePaths = await window.ipcRenderer.invoke('open-dir-dialog');
        if (filePaths.length > 0) {
          setSelectedDirPath(filePaths[0]);
        }
      };

  return (
    <div>
      <h1>Electron React File Dialog</h1>
      <button onClick={handleOpenFileDialog}>Open File Dialog</button>
      {selectedFilePath && <p>Selected Path: {selectedFilePath}</p>}

      <h1>Electron React Directory Dialog</h1>
      <button onClick={handleOpenDirDialog}>Open Directory Dialog</button>
      {selectedDirPath && <p>Selected Path: {selectedDirPath}</p>}
    </div>
  )
}
