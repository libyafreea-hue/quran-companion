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
      // Deprecated on Android 15 (LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES)
      splashFullScreen: false,
      splashImmersive: false
    }

  }
};

export default config;
