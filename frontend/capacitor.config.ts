import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zaryahplus.app',
  appName: 'ZaryahPlus',
  webDir: 'dist',
  // Make the webview think its origin is https://app.zaryahplus.com so:
  //   1. Backend CORS (which allows app.zaryahplus.com) accepts our calls
  //   2. Firebase Auth domain matches (auth domain is also app.zaryahplus.com)
  //   3. Anything sniffing window.location.origin gets a stable value
  // Without this, Android Capacitor uses https://localhost which the backend
  // rejects (so Raya + DNZ + halaqah API calls all 403).
  server: {
    hostname: 'app.zaryahplus.com',
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      // Long enough for slow Samsung A-series WebView cold-start. JS calls
      // hide() as soon as React mounts (see initNativeBridge), so on fast
      // devices this never blocks. The hard ceiling is just a safety net
      // so the splash can't get stuck if JS init fails.
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#1E293A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1E293A',
      overlaysWebView: false,
    },
    FirebaseAuthentication: {
      // Plugin defaults to no providers — must declare which to load.
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
