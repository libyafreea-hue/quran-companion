import { AdMob, AdMobRewardItem, InterstitialAdPluginEvents, AdLoadInfo, AdOptions } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

export type AdSlot = "adhkar" | "evening" | "morning" | "home" | "menu";

const AD_UNIT_IDS: Record<AdSlot, string> = {
  adhkar:  "ca-app-pub-4980157773430355/5914062451", // 1 - Adhkar icon
  evening: "ca-app-pub-4980157773430355/2974693481", // 2 - Evening adhkar tab
  morning: "ca-app-pub-4980157773430355/3605248872", // 3 - Morning adhkar tab
  home:    "ca-app-pub-4980157773430355/2292167207", // 4 - Home icon
  menu:    "ca-app-pub-4980157773430355/7798201792", // 5 - Main menu
};

let initialized = false;
let lastShownAt = 0;
const MIN_INTERVAL_MS = 60_000; // throttle: at most one interstitial per minute
const preloaded: Partial<Record<AdSlot, boolean>> = {};

async function ensureInit() {
  if (!Capacitor.isNativePlatform()) return false;
  if (initialized) return true;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
    return true;
  } catch (e) {
    console.warn("AdMob init failed", e);
    return false;
  }
}

/**
 * Fire-and-forget interstitial. Never blocks the UI / navigation.
 * Throttled so we don't show an ad on every single click.
 */
export function showInterstitial(slot: AdSlot): void {
  if (!Capacitor.isNativePlatform()) return;
  const now = Date.now();
  if (now - lastShownAt < MIN_INTERVAL_MS) return;
  lastShownAt = now;

  // Run async in background so the caller is never awaited.
  void (async () => {
    const ok = await ensureInit();
    if (!ok) return;
    const adId = AD_UNIT_IDS[slot];
    try {
      const options: AdOptions = { adId };
      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      preloaded[slot] = false;
    } catch (e) {
      console.warn("Interstitial failed", slot, e);
    }
  })();
}