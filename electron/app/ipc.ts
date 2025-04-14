// electron/app/ipc.ts
// Centralizes the registration of all IPC handlers. 
import { ipcMain, shell } from 'electron';
import { typedStore } from './settings.js'; // Import store
import type { Settings, DetectedBrowser } from '../../types/index.js';
import { getAvailableBrowsers } from './browsers.js'; // Import browser getter
import { registerAsDefaultBrowser } from './registry.js'; // Import registry function
import { registerRuleHandlers } from './rules.js'; // Import rule handlers registration

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
      typedStore.set(settings);
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
    typedStore.set({
      defaultBrowserPath: browser?.path ?? null,
      defaultBrowserName: browser?.name ?? null
    });
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
    try {
      await shell.openExternal('ms-settings:defaultapps');
      console.log('Successfully requested opening ms-settings:defaultapps');
      return { success: true };
    } catch (error: unknown) {
      console.error('Error opening default apps settings:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  });

  console.log('IPC handlers registered.');
} 