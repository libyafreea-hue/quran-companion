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
  const { AudioPlayer } = await import("@mediagrid/capacitor-native-audio");

  let currentIndex = 0;
  let stopped = false;
  let listenerHandle: any = null;

  const playNext = async (index: number) => {
    if (stopped || index >= urls.length) {
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    try {
      // Clean up previous
      if (listenerHandle) {
        listenerHandle.remove();
        listenerHandle = null;
      }
      try { await AudioPlayer.destroy({ audioId: "quran" }); } catch {}

      // Create, initialize, listen for end, then play
      await AudioPlayer.create({
        audioId: "quran",
        audioSource: urls[index],
        friendlyTitle: "القرآن الكريم",
        useForNotification: true,
        isBackgroundMusic: false,
      });

      await AudioPlayer.initialize({ audioId: "quran" });

      listenerHandle = await AudioPlayer.onAudioEnd(
        { audioId: "quran" },
        () => playNext(index + 1)
      );

      await AudioPlayer.play({ audioId: "quran" });
    } catch (err) {
      console.error("Native audio playNext error:", err);
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
      try { AudioPlayer.destroy({ audioId: "quran" }); } catch {}
      if (listenerHandle) {
        listenerHandle.remove();
        listenerHandle = null;
      }
      currentIndex = 0;
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
