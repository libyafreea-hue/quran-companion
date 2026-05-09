import type { AudioCallbacks, AudioController } from "./audioPlayer.types";

export function createWebController(
  urls: string[],
  { onEnd, onAyahChange }: AudioCallbacks
): AudioController {
  let audio: HTMLAudioElement | null = null;
  let nextAudio: HTMLAudioElement | null = null;
  let currentIndex = 0;
  let stopped = false;

  const prefetch = (index: number) => {
    if (index >= urls.length) {
      nextAudio = null;
      return;
    }
    const a = new Audio();
    a.preload = "auto";
    a.src = urls[index];
    // Trigger buffering
    try { a.load(); } catch {}
    nextAudio = a;
  };

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

    // Reuse prefetched audio if available
    if (nextAudio && nextAudio.src === urls[index]) {
      audio = nextAudio;
      nextAudio = null;
    } else {
      audio = new Audio();
      audio.preload = "auto";
      audio.src = urls[index];
    }
    audio.onended = () => playNext(index + 1);
    audio.onerror = (event) => {
      console.error("Audio error at ayah", index, event);
      if (index + 1 < urls.length) playNext(index + 1);
      else onEnd();
    };
    audio.play().catch((error) => {
      console.error("Audio play failed:", error);
      onEnd();
    });

    // Start prefetching the next ayah immediately
    prefetch(index + 1);
  };

  return {
    isNative: false,
    play: async () => {
      stopped = false;
      playNext(currentIndex);
    },
    pause: () => audio?.pause(),
    resume: () => {
      if (audio) {
        audio.play().catch((error) => {
          console.error("Audio resume failed:", error);
        });
      }
    },
    stop: () => {
      stopped = true;
      if (audio) {
        audio.pause();
        audio = null;
      }
      if (nextAudio) {
        try { nextAudio.removeAttribute("src"); nextAudio.load(); } catch {}
        nextAudio = null;
      }
      currentIndex = 0;
    },
  };
}
