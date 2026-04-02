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
  // Always use web player (HTML5 Audio)
  return createWebController(urls, onEnd, onAyahChange);
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
