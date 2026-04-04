import { AudioPlayer as NativeAudioPlayer } from "@mediagrid/capacitor-native-audio";
import type { AudioCallbacks, AudioController } from "./audioPlayer.types";

const QURAN_ALBUM_TITLE = "القرآن الكريم";
const RECITER_NAME = "مشاري العفاسي";

function createAudioId() {
  return `surah-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createNativeController(
  urls: string[],
  { onEnd, onAyahChange, onDownloadProgress }: AudioCallbacks
): AudioController {
  const audioId = createAudioId();
  let currentIndex = 0;
  let stopped = true;
  let created = false;
  let destroyed = false;

  const updateMetadata = async () => {
    if (!created) return;

    try {
      await NativeAudioPlayer.changeMetadata({
        audioId,
        albumTitle: QURAN_ALBUM_TITLE,
        artistName: RECITER_NAME,
        friendlyTitle: `الآية ${currentIndex + 1}`,
      });
    } catch (error) {
      console.error("Native audio metadata update failed:", error);
    }
  };

  const stopPlayer = async () => {
    if (!created) return;

    try {
      await NativeAudioPlayer.stop({ audioId });
    } catch (error) {
      console.error("Native audio stop failed:", error);
    }
  };

  const destroyPlayer = async () => {
    if (!created || destroyed) return;

    try {
      await NativeAudioPlayer.destroy({ audioId });
    } catch (error) {
      console.error("Native audio destroy failed:", error);
    } finally {
      created = false;
      destroyed = true;
    }
  };

  const finishPlayback = async () => {
    stopped = true;
    await stopPlayer();
    await destroyPlayer();
    onEnd();
  };

  const playCurrentAyah = async (): Promise<void> => {
    if (stopped) return;

    if (currentIndex >= urls.length) {
      await finishPlayback();
      return;
    }

    onAyahChange?.(currentIndex);
    onDownloadProgress?.(100);

    try {
      if (!created) {
        await NativeAudioPlayer.create({
          audioId,
          audioSource: urls[currentIndex],
          friendlyTitle: `الآية ${currentIndex + 1}`,
          albumTitle: QURAN_ALBUM_TITLE,
          artistName: RECITER_NAME,
          useForNotification: true,
          isBackgroundMusic: false,
          showSeekBackward: false,
          showSeekForward: false,
        });

        created = true;
        destroyed = false;

        await NativeAudioPlayer.onAudioReady({ audioId }, () => {
          if (stopped) return;

          void NativeAudioPlayer.play({ audioId }).catch(async (error) => {
            console.error("Native audio play failed:", error);
            currentIndex += 1;
            await playCurrentAyah();
          });
        });

        await NativeAudioPlayer.onAudioEnd({ audioId }, () => {
          if (stopped) return;

          currentIndex += 1;
          void playCurrentAyah();
        });
      } else {
        await NativeAudioPlayer.changeAudioSource({
          audioId,
          source: urls[currentIndex],
        });
      }

      if (stopped) {
        await destroyPlayer();
        return;
      }

      await updateMetadata();
      await NativeAudioPlayer.initialize({ audioId });
    } catch (error) {
      console.error("Native audio prepare failed:", error);
      currentIndex += 1;

      if (currentIndex < urls.length) {
        await playCurrentAyah();
      } else {
        await finishPlayback();
      }
    }
  };

  return {
    isNative: true,
    play: async () => {
      stopped = false;
      await playCurrentAyah();
    },
    pause: () => {
      if (!created) return;

      void NativeAudioPlayer.pause({ audioId }).catch((error) => {
        console.error("Native audio pause failed:", error);
      });
    },
    stop: () => {
      stopped = true;
      currentIndex = 0;

      void (async () => {
        await stopPlayer();
        await destroyPlayer();
      })();
    },
  };
}