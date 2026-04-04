import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "cloud.corporatepro.app",
  appName: "CorporatePRO",
  webDir: "dist",
  // Production: uses bundled web assets (no server URL)
  server: {
    androidScheme: "https",
    iosScheme: "https",
    // Only uncomment for local development:
    // url: "http://localhost:5173",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f2340",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#0f2340",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Preferences: {
      // Data encrypted at rest on iOS via Keychain
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "CorporatePRO",
    backgroundColor: "#f2f2f7",
  },
  android: {
    backgroundColor: "#f2f2f7",
  },
}

export default config
