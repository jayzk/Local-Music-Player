import { useEffect, useState } from 'react';

const useDownloadProgress = () => {
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  useEffect(() => {
    const handleProgress = (_event: any, data: string) => {
      setDownloadProgress(data);
    };

    window.ipcRenderer.on('playlist-download-progress', handleProgress);

    return () => { //TODO: review again
      console.log("DownloadProgressHook: removing listener");
      window.ipcRenderer.off('playlist-download-progress', handleProgress);
    };
  }, []);

  const resetDownloadProgress = () => {
    setDownloadProgress(null);
  };

  return {downloadProgress, resetDownloadProgress};
};

export default useDownloadProgress;