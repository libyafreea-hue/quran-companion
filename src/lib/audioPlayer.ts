import { Capacitor } from "@capacitor/core";

let nativeAudioModule: any = null;
let isNativeAvailable = false;

// Lazy load native audio plugin
async function getNativeAudio() {
  if (nativeAudioModule) return nativeAudioModule;
  if (Capacitor.isNativePlatform()) {
    try {
      const mod = await import("@mediagrid/capacitor-native-audio");
      nativeAudioModule = mod.AudioPlayer;
      isNativeAvailable = true;
      return nativeAudioModule;
    } catch {
      isNativeAvailable = false;
    }
  }
  return null;
}

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
  const NativeAudio = await getNativeAudio();

  if (NativeAudio && isNativeAvailable) {
    return createNativeController(NativeAudio, urls, onEnd, onAyahChange);
  }
  return createWebController(urls, onEnd, onAyahChange);
}

function createNativeController(
  NativeAudio: any,
  urls: string[],
  onEnd: () => void,
  onAyahChange?: (index: number) => void
): AudioController {
  let currentIndex = 0;
  let stopped = false;
  let listenerResult: any = null;

  const playNext = async (index: number) => {
    if (stopped || index >= urls.length) {
      onEnd();
      return;
    }
    currentIndex = index;
    onAyahChange?.(index);

    try {
      // Remove previous listener
      if (listenerResult) {
        listenerResult.remove();
        listenerResult = null;
      }

      listenerResult = await NativeAudio.onCompleted({ audioId: "quran" }, () => {
        playNext(index + 1);
      });

      await NativeAudio.play({
        audioId: "quran",
        source: urls[index],
        isBackgroundMusic: false,
      });
    } catch {
      onEnd();
    }
  };

  return {
    isNative: true,
    play: async () => {
      stopped = false;
      await playNext(currentIndex);
    },
    pause: () => {
      try { NativeAudio.pause({ audioId: "quran" }); } catch {}
    },
    stop: () => {
      stopped = true;
      try { NativeAudio.stop({ audioId: "quran" }); } catch {}
      if (listenerResult) {
        listenerResult.remove();
        listenerResult = null;
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

    // Clean up previous audio element
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio = null;
    }

    audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.onended = () => playNext(index + 1);
    audio.onerror = (e) => {
      console.error('Audio error at ayah', index, e);
      // Try next ayah instead of stopping completely
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
