import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Initialize mobile-specific features when running on Capacitor
 */
export async function initializeMobile() {
    if (!Capacitor.isNativePlatform()) {
        return; // Not running on mobile, skip initialization
    }

    console.log('Initializing mobile features...');
    console.log('Platform:', Capacitor.getPlatform());

    // Configure status bar
    try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
        console.log('Status bar configured');
    } catch (error) {
        console.warn('Status bar configuration failed:', error);
    }

    // Add app lifecycle listeners
    App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Active:', isActive);
    });

    App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
            App.exitApp();
        } else {
            window.history.back();
        }
    });

    console.log('Mobile initialization complete');
}
