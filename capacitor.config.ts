
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.e343dd9d57514ffa97262cda84ba3802',
  appName: 'Rent Calculator',
  webDir: 'dist',
  server: {
    url: 'https://e343dd9d-5751-4ffa-9726-2cda84ba3802.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
