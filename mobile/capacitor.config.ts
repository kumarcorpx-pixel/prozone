import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "cloud.corporatepro.app",
  appName: "CorporatePRO",
  webDir: "dist",
  server: {
    // In development, point to live server for API
    // In production, uses bundled web assets
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
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
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "CorporatePRO",
  },
}

export default config
