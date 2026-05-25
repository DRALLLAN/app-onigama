import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onigama.trading',
  appName: 'Onigama Trading',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
