export type CheckBoxType = { [key: string]: boolean }

export type settingsType = {
    selectedDir: string;
    volume: number;
    currentlyPlaying: string;
  } | null;

export type songType = {
  SongID: number;
  Title: string;
  Artist: string;
  Duration: number;
  CreationDate: number;
  ThumbnailLocation: string;
  FileLocation: string;
}