import { Capacitor } from "@capacitor/core";
import { createNativeController } from "./audioPlayerNative";
import type { AudioCallbacks, AudioController } from "./audioPlayer.types";
import { createWebController } from "./audioPlayerWeb";

export type { AudioCallbacks, AudioController } from "./audioPlayer.types";

export async function createAudioController(
  urls: string[],
  callbacks: AudioCallbacks
): Promise<AudioController> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() !== "android") {
    return createNativeController(urls, callbacks);
  }

  return createWebController(urls, callbacks);
}
