import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.english.listen',
  appName: '英语听写',
  webDir: 'dist',
  plugins: {
    TextToSpeech: {},
  },
};

export default config;
