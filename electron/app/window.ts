// electron/app/window.ts
// Responsible for creating and managing the BrowserWindow. 
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

// Need to get __dirname correctly for preload script path
// Option 1: Pass it in during initialization
// Option 2: Re-calculate it here (less ideal)
// For now, assume __dirname is available globally or passed in somehow.
// Let's recalculate it for simplicity here, but this might need adjustment
// depending on the final structure and build process.
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname_window = path.dirname(__filename);

// --- State ---
let mainWindow: BrowserWindow | null = null;

// --- Functions ---

/**
 * Creates the main application window.
 * @param preloadPath Absolute path to the preload script.
 * @param loadUrl URL (dev server) or file path (packaged app) to load.
 */
function createWindow(preloadPath: string, loadUrl: string): void {
  if (mainWindow) {
    console.warn('Attempted to create main window when one already exists.');
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 900,
    icon: path.join(__dirname_window, 'assets', 'icon.png'),
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log('[Window Process] Using Preload Path:', preloadPath);

  if (loadUrl.startsWith('http')) {
    console.log(`[Window Process - Dev] Loading URL: ${loadUrl}`);
    mainWindow.loadURL(loadUrl);
    mainWindow.webContents.openDevTools();
  } else {
    console.log(`[Window Process - Packaged] Loading File: ${loadUrl}`);
    mainWindow.loadFile(loadUrl);
  }

  // Show window once page is ready (avoids blank screen)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Gets the main window instance.
 */
function getMainWindow(): BrowserWindow | null {
    return mainWindow;
}

export { createWindow, getMainWindow }; 