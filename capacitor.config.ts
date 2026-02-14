import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.57f6f173fbe241de95eff8969da5bbc6',
  appName: 'ختمة القرآن الكريم',
  webDir: 'dist',
  server: {
    url: 'https://57f6f173-fbe2-41de-95ef-f8969da5bbc6.lovableproject.com?forceHideBadge=true',
    cleartext: true
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
