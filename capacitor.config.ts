import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fizcool.stickerinmotion',
  appName: 'Sticker in Motion',
  webDir: 'dist',
  android: { backgroundColor: '#080605' },
  plugins: {
    App: { disableBackButtonHandler: true },
    SystemBars: { style: 'DARK', insetsHandling: 'css', initialViewportFitValueHint: 'cover' },
  },
};

export default config;
