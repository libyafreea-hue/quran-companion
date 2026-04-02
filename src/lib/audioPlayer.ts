import { Capacitor } from "@capacitor/core";

export interface AudioController {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isNative: boolean;
}

// Creates an audio controller that works in background on native
export async function createAudioController(
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
): Promise<AudioController> {
  if (Capacitor.isNativePlatform()) {
    try {
      return await createNativeController(urls, onEnd, onAyahChange);
    } catch (e) {
      console.warn("Native audio failed, falling back to web:", e);
    }
  }
  return createWebController(urls, onEnd, onAyahChange);
}

async function createNativeController(
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
): Promise<AudioController> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { AudioPlayer } = await import("@mediagrid/capacitor-native-audio");

  let currentIndex = 0;
  let stopped = false;
  let listenerHandle: any = null;

  // Download a remote audio file to cache and return the local URI
  async function downloadToCache(url: string, id: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // Convert to base64
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);

    const path = `audio_cache/${id}.mp3`;
    await Filesystem.mkdir({
      path: 'audio_cache',
      directory: Directory.Cache,
      recursive: true
    }).catch(() => {});

    await Filesystem.writeFile({
      path,
      directory: Directory.Cache,
      data: base64
    });

    const result = await Filesystem.getUri({
      path,
      directory: Directory.Cache
    });

    return result.uri;
  }

  const playNext = async (index: number) => {
    if (stopped || index >= urls.length) {
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    try {
      // Remove previous listener
      if (listenerHandle) {
        listenerHandle.remove();
        listenerHandle = null;
      }

      // Download audio file to local cache first
      const localUri = await downloadToCache(urls[index], `ayah_${index}`);

      // Create and initialize audio source
      await AudioPlayer.create({ audioId: "quran", source: localUri, friendlyTitle: "Quran", useForNotification: true });
      await AudioPlayer.initialize({ audioId: "quran" });

      listenerHandle = await AudioPlayer.onAudioEnd(
        { audioId: "quran" },
        () => playNext(index + 1)
      );

      await AudioPlayer.play({ audioId: "quran" });
    } catch (err) {
      console.error("Native audio playNext error:", err);
      // Try next ayah
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
      try { AudioPlayer.pause({ audioId: "quran" }); } catch {}
    },
    stop: () => {
      stopped = true;
      try { AudioPlayer.stop({ audioId: "quran" }); } catch {}
      if (listenerHandle) {
        listenerHandle.remove();
        listenerHandle = null;
      }
      currentIndex = 0;
      // Clean up cache
      Filesystem.rmdir({
        path: 'audio_cache',
        directory: Directory.Cache,
        recursive: true
      }).catch(() => {});
    },
  };
}

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
      audio.removeAttribute('src');
      audio.load();
      audio = null;
    }

    audio = new Audio();
    audio.preload = 'auto';
    audio.onended = () => playNext(index + 1);
    audio.onerror = (e) => {
      console.error('Audio error at ayah', index, e);
      if (index + 1 < urls.length) {
        playNext(index + 1);
      } else {
        onEnd();
      }
    };
    audio.src = urls[index];
    audio.play().catch((err) => {
      console.error('Audio play failed:', err);
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
