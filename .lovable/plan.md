

## Problem Analysis

Two issues identified:

1. **`capacitor.config.ts` is corrupted on your local machine** — the Arabic app name `ختمة القرآن الكريم` turned into mojibake (`Ø®ØªÙ…Ø©...`), and problematic settings were added: `androidScheme: 'https'` and `allowNavigation: ['*']`. The `androidScheme: 'https'` forces the WebView to use HTTPS scheme which breaks loading remote audio streams from the CDN.

2. **Missing `cleartext: true`** in the Lovable repo version — needed for Android WebView to allow HTTP streaming.

The `AndroidManifest.xml`, `proguard-rules.pro`, and `audioPlayer.ts` are all fine. The root cause is solely the Capacitor config.

## Plan

### Step 1: Fix `capacitor.config.ts`
Update to the correct version with proper encoding, `cleartext: true`, proper domain list, and **no** `androidScheme: 'https'`:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.khatmaapp',
  appName: 'ختمة القرآن الكريم',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: [
      'api.alquran.cloud',
      'cdn.islamic.network',
      '*.islamic.network',
      '*.quranicaudio.com',
      '*.quran.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#0a3d2a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
```

Key changes:
- Added `cleartext: true` — allows HTTP audio streams in WebView
- Removed `androidScheme: 'https'` — this was blocking remote media loading
- Removed wildcard `'*'` from allowNavigation — not needed and a security risk
- Fixed Arabic encoding

### Step 2: After approval, rebuild Android
After I apply the fix, you will need to:
```powershell
git pull origin main
rmdir /s /q android
npx cap add android
npx cap sync android
```
Then rebuild in Android Studio.

No changes needed to AndroidManifest.xml, ProGuard rules, or audioPlayer.ts — those are all correct.

