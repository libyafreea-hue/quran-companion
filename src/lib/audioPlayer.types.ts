export interface AudioController {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isNative: boolean;
}

export interface AudioCallbacks {
  onEnd: () => void;
  onAyahChange?: (index: number) => void;
  onDownloadProgress?: (percent: number) => void;
}