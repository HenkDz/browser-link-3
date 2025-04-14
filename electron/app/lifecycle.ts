// electron/app/lifecycle.ts
// Manages app lifecycle events, single instance lock, and initial URL handling. 
import { app, BrowserWindow } from 'electron';
import path from 'node:path'; // Add path import
import { handleUrl } from './browsers.js'; // Import handleUrl
import { PROTOCOLS_TO_HANDLE } from './config.js'; // Import from config
import { createWindow, getMainWindow } from './window.js'; // Import window functions

// Need __dirname for path calculation within activate handler
import { fileURLToPath } from 'node:url'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname_lifecycle = path.dirname(__filename);

let initialUrlToOpen: string | null = null; // Changed back to let

/**
 * Checks for URL argument passed on startup (Windows/Linux).
 */
function checkForInitialUrl(): void {
  if (process.platform !== 'darwin') {
    const urlArg = process.argv.find(arg => PROTOCOLS_TO_HANDLE.some((p: string) => arg.startsWith(`${p}://`)));
    if (urlArg) {
      console.log('Initial URL from argv:', urlArg);
      initialUrlToOpen = urlArg;
    }
  }
  // console.warn('checkForInitialUrl needs PROTOCOLS_TO_HANDLE'); // Placeholder removed
}

/**
 * Handles the single instance lock logic.
 * Ensures only one instance runs and handles URLs passed to second instances.
 */
function setupSingleInstanceLock(): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    console.log('Another instance is running. Quitting this instance.');
    app.quit();
  } else {
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      console.log('Second instance detected.');
      // Don't necessarily focus/restore window if just handling URL
      // const mainWindow = getMainWindow();
      // if (mainWindow) {
      //   if (mainWindow.isMinimized()) mainWindow.restore();
      //   mainWindow.focus();
      // }

      // Handle URL from command line
      const url = commandLine.pop();
      if (url && PROTOCOLS_TO_HANDLE.some((p: string) => url.startsWith(`${p}://`))) {
        console.log('Handling URL from second instance:', url);
        try {
          await handleUrl(url); // Await the handler
          // Quit after handling - REMOVED
          // setTimeout(app.quit.bind(app), 500); 
        } catch (e) {
          console.error('Error handling URL from second instance:', e instanceof Error ? e.message : e);
          // Decide if we should quit even on error - REMOVED
          // setTimeout(app.quit.bind(app), 500);
        }
        // *** URL handled, but we don't quit the existing instance ***
      } else {
        // If no URL, maybe focus existing window?
        const mainWindow = getMainWindow();
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
        }
      }
    });
  }
}

/**
 * Sets up core application lifecycle event listeners.
 */
function setupLifecycleEvents(): void {
  // Handle initial URL check before app is fully ready if needed
  checkForInitialUrl();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      // Calculate paths similar to main.ts, but relative to lifecycle.ts
      const preloadPath = path.join(__dirname_lifecycle, '../preload.js'); // Assumes preload.js is one level up
      const loadUrl = app.isPackaged
        ? path.join(__dirname_lifecycle, '../../dist/renderer/index.html') // Adjust if needed
        : 'http://localhost:3000';
      createWindow(preloadPath, loadUrl); // Pass arguments
    }
    // console.warn('activate handler needs createWindow'); // Placeholder removed
  });

  // Handle URLs opened when the app is already running (macOS primarily)
  app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log('URL from open-url event:', url);
    handleUrl(url).catch((e: unknown) => console.error('Error handling open-url event:', e instanceof Error ? e.message : e));
    // console.warn('open-url handler needs handleUrl'); // Placeholder removed
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Export initialUrlToOpen so main.ts can check it after ready
export { initialUrlToOpen, setupSingleInstanceLock, setupLifecycleEvents }; 