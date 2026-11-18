import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.spoplayer.app",
  appName: "SpoPlayer",
  webDir: "dist",
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
  server: {
    androidScheme: "https",
    cleartext: true,
  },
};

export default config;
