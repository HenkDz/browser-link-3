// electron/app/ipc.ts
// Centralizes the registration of all IPC handlers. 
import { ipcMain, shell } from 'electron';
import { typedStore } from './settings.js'; // Import store
import type { Settings, DetectedBrowser } from '../../types/index.js';
import { getAvailableBrowsers } from './browsers.js'; // Import browser getter
import { registerAsDefaultBrowser } from './registry.js'; // Import registry function
import { registerRuleHandlers } from './rules.js'; // Import rule handlers registration
import { APP_ID, APP_REGISTERED_APP_NAME_USER } from './config.js';
import { getAppInfo, checkForUpdates, downloadUpdate, installUpdate } from './updates.js';

/**
 * Registers all main process IPC handlers.
 */
export function registerIpcHandlers(): void {
  console.log('Registering IPC handlers...');

  // Settings Handlers
  ipcMain.handle('get-settings', () => {
    console.log('IPC: get-settings');
    return typedStore.store;
  });
  ipcMain.handle('set-settings', (event, settings: Partial<Settings>) => {
    console.log('IPC: set-settings', settings);
    try {
      const nextSettings: Settings = { ...typedStore.store, ...settings };
      typedStore.set(nextSettings);
      return { success: true };
    } catch (error: unknown) {
      console.error('Error setting settings via IPC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  });

  // Browser Handlers
  ipcMain.handle('get-available-browsers', () => {
    console.log('IPC: get-available-browsers');
    return getAvailableBrowsers();
  });
  ipcMain.handle('set-default-browser', (event, browser: DetectedBrowser | null) => {
    console.log('IPC: set-default-browser', browser?.name ?? 'None');
    const nextSettings: Settings = {
      ...typedStore.store,
      defaultBrowserPath: browser?.path ?? null,
      defaultBrowserName: browser?.name ?? null
    };
    typedStore.set(nextSettings);
    return { success: true };
  });

  // Rule Handlers (Registered via imported function)
  registerRuleHandlers();

  // Registry/Default Handler Handlers
  ipcMain.handle('register-as-default-handler', async () => {
    console.log('IPC: register-as-default-handler');
    const result = await registerAsDefaultBrowser();
    console.log('IPC: Registration attempt result:', result);
    return result;
  });
  ipcMain.handle('open-default-apps-settings', async () => {
    console.log('IPC: open-default-apps-settings');
    const encodedName = encodeURIComponent(APP_REGISTERED_APP_NAME_USER);
    const targets = [
      `ms-settings:defaultapps?registeredAppUser=${encodedName}`,
      `ms-settings:defaultapps/app/${APP_ID}`,
      'ms-settings:defaultapps'
    ];

    for (const target of targets) {
      try {
        console.log(`Attempting to open ${target}`);
        await shell.openExternal(target);
        return { success: true };
      } catch (error) {
        console.warn(`Failed opening ${target}`, error);
      }
    }

    const message = 'All attempts to open Windows Default Apps settings failed.';
    console.error(message);
    return { success: false, error: message };
  });

  ipcMain.handle('get-app-info', () => {
    console.log('IPC: get-app-info');
    return getAppInfo();
  });

  ipcMain.handle('auto-update-check', async () => {
    console.log('IPC: auto-update-check');
    return checkForUpdates();
  });

  ipcMain.handle('auto-update-download', async () => {
    console.log('IPC: auto-update-download');
    return downloadUpdate();
  });

  ipcMain.handle('auto-update-install', async () => {
    console.log('IPC: auto-update-install');
    return installUpdate();
  });

  console.log('IPC handlers registered.');
}