import { Capacitor } from "@capacitor/core";

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

export async function createAudioController(
  urls: string[],
  callbacks: AudioCallbacks
): Promise<AudioController> {
  if (Capacitor.isNativePlatform()) {
    return createNativeWebController(urls, callbacks);
  }
  return createWebController(urls, callbacks);
}

/**
 * Native: download audio to cache via Capacitor Filesystem,
 * then play from local file URI using HTMLAudioElement.
 */
function createNativeWebController(
  urls: string[],
  { onEnd, onAyahChange, onDownloadProgress }: AudioCallbacks
): AudioController {
  let audio: HTMLAudioElement | null = null;
  let currentIndex = 0;
  let stopped = false;
  let currentObjectUrl: string | null = null;

  const cleanupObjectUrl = () => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };

  const getCachedBlob = async (path: string): Promise<Blob | null> => {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");

    try {
      await Filesystem.stat({
        directory: Directory.Cache,
        path,
      });

      const cachedFile = await Filesystem.readFile({
        directory: Directory.Cache,
        path,
      });

      if (typeof cachedFile.data !== "string") {
        return null;
      }

      return base64ToBlob(cachedFile.data, "audio/mpeg");
    } catch {
      return null;
    }
  };

  const downloadAndGetPlayableSrc = async (url: string): Promise<string> => {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const safeName = url.replace(/[^a-zA-Z0-9]/g, "_").slice(-80) + ".mp3";

    const cachedBlob = await getCachedBlob(safeName);
    if (cachedBlob) {
      cleanupObjectUrl();
      currentObjectUrl = URL.createObjectURL(cachedBlob);
      return currentObjectUrl;
    }

    onDownloadProgress?.(0);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let blob: Blob;

    if (total && response.body) {
      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onDownloadProgress?.(Math.round((received / total) * 100));
      }

      blob = new Blob(chunks, { type: "audio/mpeg" });
      const base64 = await blobToBase64(blob);

      await Filesystem.writeFile({
        directory: Directory.Cache,
        path: safeName,
        data: base64,
      });
    } else {
      // Fallback: no content-length
      blob = await response.blob();
      const base64 = await blobToBase64(blob);
      await Filesystem.writeFile({
        directory: Directory.Cache,
        path: safeName,
        data: base64,
      });
    }

    onDownloadProgress?.(100);
    cleanupObjectUrl();
    currentObjectUrl = URL.createObjectURL(blob);
    return currentObjectUrl;
  };

  const playNext = async (index: number) => {
    if (stopped || index >= urls.length) {
      cleanupObjectUrl();
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio = null;
      cleanupObjectUrl();
    }

    try {
      const localSrc = await downloadAndGetPlayableSrc(urls[index]);
      if (stopped) return;

      audio = new Audio();
      audio.preload = "auto";
      audio.onended = () => {
        cleanupObjectUrl();
        void playNext(index + 1);
      };
      audio.onerror = (e) => {
        cleanupObjectUrl();
        console.error("Native audio error at ayah", index, e);
        if (index + 1 < urls.length) void playNext(index + 1);
        else onEnd();
      };
      audio.src = localSrc;
      await audio.play();
    } catch (err) {
      cleanupObjectUrl();
      console.error("Download/play error at ayah", index, err);
      if (index + 1 < urls.length) void playNext(index + 1);
      else onEnd();
    }
  };

  return {
    isNative: true,
    play: async () => {
      stopped = false;
      await playNext(currentIndex);
    },
    pause: () => audio?.pause(),
    stop: () => {
      stopped = true;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio = null;
      }
      cleanupObjectUrl();
      currentIndex = 0;
    },
  };
}

/** Web: standard HTML5 Audio */
function createWebController(
  urls: string[],
  { onEnd, onAyahChange }: AudioCallbacks
): AudioController {
  let audio: HTMLAudioElement | null = null;
  let currentIndex = 0;
  let stopped = false;

  const playNext = (index: number) => {
    if (stopped || index >= urls.length) {
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio = null;
    }

    audio = new Audio();
    audio.preload = "auto";
    audio.onended = () => playNext(index + 1);
    audio.onerror = (e) => {
      console.error("Audio error at ayah", index, e);
      if (index + 1 < urls.length) playNext(index + 1);
      else onEnd();
    };
    audio.src = urls[index];
    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      onEnd();
    });
  };

  return {
    isNative: false,
    play: async () => {
      stopped = false;
      playNext(currentIndex);
    },
    pause: () => audio?.pause(),
    stop: () => {
      stopped = true;
      if (audio) {
        audio.pause();
        audio = null;
      }
      currentIndex = 0;
    },
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType });
}
