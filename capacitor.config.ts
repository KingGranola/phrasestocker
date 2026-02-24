import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.phrasestocker.app',
    appName: 'PhraseStocker',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        StatusBar: {
            style: 'dark',
            backgroundColor: '#0f172a'
        }
    }
};

export default config;
