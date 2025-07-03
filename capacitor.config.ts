
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.e343dd9d57514ffa97262cda84ba3802',
  appName: 'Rent Calculator',
  webDir: 'dist',
  server: {
    // Remove the server URL for offline mode
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
