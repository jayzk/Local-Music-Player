import { useEffect, useState } from 'react';

const useDownloadProgress = () => {
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    const handleProgress = (event: any, data: string) => {
      setProgress(data);
    };

    window.ipcRenderer.on('playlist-download-progress', handleProgress);

    return () => { //TODO: review again
      console.log("DownloadProgressHook: removing listener");
      window.ipcRenderer.off('playlist-download-progress', handleProgress);
    };
  }, []);

  return progress;
};

export default useDownloadProgress;