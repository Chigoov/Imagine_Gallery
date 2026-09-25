import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.privateboard.app',
  appName: 'Private Photo Fantasy Board',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
