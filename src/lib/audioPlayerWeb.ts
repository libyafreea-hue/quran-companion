import type { AudioCallbacks, AudioController } from "./audioPlayer.types";

export function createWebController(
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
    audio.onerror = (event) => {
      console.error("Audio error at ayah", index, event);
      if (index + 1 < urls.length) playNext(index + 1);
      else onEnd();
    };
    audio.src = urls[index];
    audio.play().catch((error) => {
      console.error("Audio play failed:", error);
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