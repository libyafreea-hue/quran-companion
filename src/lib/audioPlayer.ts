import { Capacitor } from "@capacitor/core";

export interface AudioController {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isNative: boolean;
}

export async function createAudioController(
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
): Promise<AudioController> {
  if (Capacitor.isNativePlatform()) {
    return createNativeWebController(urls, onEnd, onAyahChange);
  }
  return createWebController(urls, onEnd, onAyahChange);
}

/**
 * Native: download audio to cache via Capacitor Filesystem, 
 * then play from local file URI using HTMLAudioElement.
 * This fixes Android WebView refusing to stream remote audio.
 */
function createNativeWebController(
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
): AudioController {
  let audio: HTMLAudioElement | null = null;
  let currentIndex = 0;
  let stopped = false;

  const downloadAndGetLocalUri = async (url: string): Promise<string> => {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");

    // Create a safe filename from the URL
    const safeName = url.replace(/[^a-zA-Z0-9]/g, "_").slice(-80) + ".mp3";

    // Check if already cached
    try {
      const result = await Filesystem.getUri({
        directory: Directory.Cache,
        path: safeName,
      });
      return Capacitor.convertFileSrc(result.uri);
    } catch {
      // Not cached, download it
    }

    const response = await fetch(url);
    const blob = await response.blob();

    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await Filesystem.writeFile({
      directory: Directory.Cache,
      path: safeName,
      data: base64,
    });

    const { uri } = await Filesystem.getUri({
      directory: Directory.Cache,
      path: safeName,
    });

    return Capacitor.convertFileSrc(uri);
  };

  const playNext = async (index: number) => {
    if (stopped || index >= urls.length) {
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    // Clean up previous audio
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio = null;
    }

    try {
      const localSrc = await downloadAndGetLocalUri(urls[index]);

      if (stopped) return; // Check again after async download

      audio = new Audio();
      audio.onended = () => playNext(index + 1);
      audio.onerror = (e) => {
        console.error("Native audio error at ayah", index, e);
        if (index + 1 < urls.length) {
          playNext(index + 1);
        } else {
          onEnd();
        }
      };
      audio.src = localSrc;
      await audio.play();
    } catch (err) {
      console.error("Download/play error at ayah", index, err);
      if (index + 1 < urls.length) {
        playNext(index + 1);
      } else {
        onEnd();
      }
    }
  };

  return {
    isNative: true,
    play: async () => {
      stopped = false;
      await playNext(currentIndex);
    },
    pause: () => {
      audio?.pause();
    },
    stop: () => {
      stopped = true;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio = null;
      }
      currentIndex = 0;
    },
  };
}

/** Web: standard HTML5 Audio (works fine in browsers) */
function createWebController(
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
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
      if (index + 1 < urls.length) {
        playNext(index + 1);
      } else {
        onEnd();
      }
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
    pause: () => {
      audio?.pause();
    },
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
