import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.classmate.ai',
  appName: 'ClassMate AI',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0f172a',
  },
};

export default config;
