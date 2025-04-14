import { app } from 'electron';
import ElectronStore from 'electron-store';
import { v4 as uuidv4 } from 'uuid'; // Use uuid for rule IDs
import { detectBrowsersWithIcons } from './browser-detector.js'; // Import the icon fetching version
import type { Settings, Rule, DetectedBrowser } from '../types/index.js'; // Add .js extension
import path from 'node:path'; // Re-add path
import { fileURLToPath } from 'node:url'; // Re-add fileURLToPath

// Import functions from the new modules
import { setupSingleInstanceLock, setupLifecycleEvents, initialUrlToOpen } from './app/lifecycle.js';
import { createWindow } from './app/window.js';
import { createMenu } from './app/menu.js';
import { updateAvailableBrowsers, handleUrl } from './app/browsers.js';
import { registerIpcHandlers } from './app/ipc.js';

// Re-add ESM __dirname equivalent - needed for path calculation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
// Moved PROTOCOLS_TO_HANDLE to app/registry.ts (or a future shared config)

// --- Application Constants (Customize These) ---
// Moved APP_ID, APP_NAME, APP_DESCRIPTION, COMPANY_NAME to app/registry.ts (or a future shared config)

// --- Storage Setup --- (Moved to app/settings.ts)

// --- State ---
// mainWindow moved to app/window.ts
// initialUrlToOpen moved to app/lifecycle.ts
// availableBrowsers moved to app/browsers.ts

// --- Core Logic ---
// findMatchingBrowserPath and handleUrl moved to app/browsers.ts

// --- Windows Registry Registration using reg.exe --- (Moved to app/registry.ts)

/**
 * Tries to register capabilities and set the app as the default handler for HTTP/HTTPS.
 * Returns a detailed status object.
 */
// Moved registerAsDefaultBrowser to app/registry.ts

// --- Single Instance Lock --- (Moved to app/lifecycle.ts)

// --- Main Window Creation --- (Moved to app/window.ts)

// --- App Lifecycle Events --- (Moved to app/lifecycle.ts)

// --- Application Menu --- (Moved to app/menu.ts)

// --- App Initialization ---

// Check for initial URL *before* requesting the lock or doing anything else
// This helps decide if we even need to start the full app.
// Note: This check might need refinement depending on how single instance lock
// handles command line args on second instances.
let isLaunchedByUrl = false;
if (process.platform !== 'darwin') {
  const urlArg = process.argv.find(arg => arg.startsWith('http://') || arg.startsWith('https://')); // Simpler check for startup
  if (urlArg) {
    isLaunchedByUrl = true;
    console.log('App likely launched by URL argument:', urlArg);
    // We'll handle this URL *after* the ready event, but *before* creating the window.
  }
}

// Setup single instance lock *before* app is ready
// The second-instance handler in lifecycle.ts needs to handle URLs.
setupSingleInstanceLock(); 

app.whenReady().then(async () => {
  console.log('App is ready.');

  // Detect browsers FIRST, needed for handleUrl
  await updateAvailableBrowsers();

  // Check if we were launched by URL argument (Windows/Linux initial launch)
  const startupUrl = process.argv.find(arg => arg.startsWith('http://') || arg.startsWith('https://'));

  if (startupUrl) {
    console.log('Handling startup URL immediately:', startupUrl);
    await handleUrl(startupUrl);
    // Give a moment for the browser to launch before quitting
    setTimeout(() => app.quit(), 500);
    return; // Don't proceed to create window or set up UI
  }

  // --- If not launched by URL, proceed with normal UI setup ---
  console.log('App launched normally, creating UI.');

  // Create the application menu
  createMenu();

  // Calculate paths for the window
  const preloadPath = path.join(__dirname, 'preload.js');
  const loadUrl = app.isPackaged
    ? path.join(__dirname, '../dist/renderer/index.html') // Adjust if renderer output is elsewhere
    : 'http://localhost:3000';

  // Create the main window, passing the calculated paths
  createWindow(preloadPath, loadUrl);

  // Setup lifecycle event handlers (activate, open-url, window-all-closed)
  setupLifecycleEvents(); 

  // Register all IPC handlers for the UI
  registerIpcHandlers();

  console.log('Main process UI initialization complete.');
});

// window-all-closed is handled within setupLifecycleEvents

console.log('Main process script started.');
// --- URL Handling (Placeholder for Phase 3) ---
// We'll add URL handling logic here in the next phase
