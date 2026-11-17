import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.spoplayer.app",
  appName: "SpoPlayer",
  webDir: "dist",
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#080c0a",
      showSpinner: false,
    },
  },
  server: {
    // Allow YouTube/API requests from WebView
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
