import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url'; // Import fileURLToPath
import ElectronStore from 'electron-store';
import { v4 as uuidv4 } from 'uuid'; // Use uuid for rule IDs
import { detectBrowsersWithIcons } from './browser-detector.js'; // Import the icon fetching version
import type { Settings, Rule, DetectedBrowser } from '../types/index.js'; // Add .js extension
import open from 'open'; // Import open for Phase 6
import { execSync } from 'node:child_process'; // Add node: protocol

// --- Constants for ESM __dirname equivalent ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PROTOCOLS_TO_HANDLE = ['http', 'https'];

// --- Application Constants (Customize These) ---
const APP_ID = 'BrowserLinkURLHandler'; // Unique ID for registry
const APP_NAME = 'BrowserLink';      // User-facing name
const APP_DESCRIPTION = 'Link_routing_utility'; // Description
const COMPANY_NAME = 'BrowserLinkDev'; // Your company/developer name

// --- Storage Setup ---

// Define the schema object. Type will be inferred by ElectronStore constructor.
const schemaDefinition = {
	defaultBrowserPath: {
		type: ['string', 'null'] as const, // Use 'as const' for stricter type inference
        default: null
	},
    defaultBrowserName: {
        type: ['string', 'null'] as const,
        default: null
    },
	rules: {
		type: 'array' as const,
		default: [],
        items: {
            type: 'object' as const,
            properties: {
                id: { type: 'string' as const },
                pattern: { type: 'string' as const },
                patternType: { type: 'string' as const, enum: ['domain', 'startsWith', 'includes', 'regex'] as const },
                browserPath: { type: 'string' as const },
                browserName: { type: 'string' as const },
                isEnabled: { type: 'boolean' as const }
            },
            required: ['id', 'pattern', 'patternType', 'browserPath', 'browserName', 'isEnabled'] as const
        }
	}
};

// Pass the schema object, let the constructor handle typing
const store = new ElectronStore<Settings>({ schema: schemaDefinition, watch: true });

// Store instance should now be correctly typed as ElectronStore<Settings>
const typedStore = store;

// Watch for changes (example for 'rules')
typedStore.onDidChange('rules', (newRules, oldRules) => {
    console.log('Rules changed:', newRules);
});
typedStore.onDidChange('defaultBrowserPath', (newPath, oldPath) => {
    console.log('Default browser path changed:', newPath);
});

// --- State ---
let mainWindow: BrowserWindow | null = null;
let initialUrlToOpen: string | null = null;
let availableBrowsers: DetectedBrowser[] = []; // Will store browsers with icons

// --- Core Logic ---

/**
 * Finds the matching browser path for a given URL based on stored rules.
 */
function findMatchingBrowserPath(url: string): string | null {
    const rules = typedStore.get('rules', []);
    const urlLower = url.toLowerCase();

    console.log(`Finding match for: ${url} among ${rules.length} rules.`);

    // Ensure availableBrowsers has been populated before matching
    if (availableBrowsers.length === 0) {
        console.warn('Attempted to find matching browser before browser detection finished.');
        // Optionally, trigger detection here if needed, but it should happen on ready
        return null;
    }

    for (const rule of rules) {
        if (!rule.isEnabled) continue;

        try {
            let match = false;
            const patternLower = rule.pattern.toLowerCase();

            switch (rule.patternType) {
                case 'domain': {
                    // Extract domain from URL
                    const domainMatch = urlLower.match(/^https?:\/\/([^\/]+)/);
                    // Use optional chaining
                    const domain = domainMatch?.[1]; 
                    if (domain) {
                        // Simple check: pattern is substring of domain or vice versa
                        match = domain.includes(patternLower) || patternLower.includes(domain);
                    }
                    break;
                }
                case 'startsWith':
                    match = urlLower.startsWith(patternLower);
                    break;
                case 'includes':
                    match = urlLower.includes(patternLower);
                    break;
                case 'regex': {
                    const regex = new RegExp(rule.pattern, 'i'); // Case-insensitive regex
                    match = regex.test(url);
                    break;
                }
            }

            if (match) {
                console.log(`Match found: Rule ID ${rule.id} (${rule.patternType}: ${rule.pattern}) -> ${rule.browserName}`);
                // Check if the browser path from the rule still exists in the detected list
                if (availableBrowsers.some(b => b.path === rule.browserPath)) {
                    return rule.browserPath;
                }
                console.warn(`Browser path for matched rule ${rule.id} (${rule.browserPath}) no longer exists or wasn't detected. Falling back.`);
                // Optionally: disable the rule?
            }
        } catch (e) {
            // Enhanced logging
            console.error(`Error processing rule ID ${rule.id} (Type: ${rule.patternType}, Pattern: "${rule.pattern}") with URL "${url}":`, e instanceof Error ? e.message : e);
            // Optionally: disable the rule? Consider adding:
            // rule.isEnabled = false; 
            // store.set('rules', rules); // If you decide to disable
        }
    }

    console.log('No matching rule found.');
    return null; // No match found
}

/**
 * Processes a URL request: finds the target browser and opens the URL.
 */
async function handleUrl(url: string): Promise<void> {
    console.log(`Handling URL: ${url}`);
    const targetBrowserPath = findMatchingBrowserPath(url);
    const defaultBrowserPath = typedStore.get('defaultBrowserPath');

    const finalPath = targetBrowserPath || defaultBrowserPath;

    if (finalPath) {
        console.log(`Opening URL [${url}] in browser [${finalPath}]`);
        try {
            // Use 'open' package - Phase 6 integration
            await open(url, { app: { name: finalPath }, wait: false });
            console.log(`Successfully opened URL [${url}] in browser [${finalPath}]`); // Add success log
        } catch (error: unknown) {
            // Enhanced logging
            const browserName = path.basename(finalPath);
            const errorMessage = error instanceof Error ? error.message : String(error); // Use String() for unknown
            console.error(`Error opening URL "${url}" in specified browser "${browserName}" (${finalPath}):`, errorMessage);
            // Use regular string
            dialog.showErrorBox('Error Opening URL', `Could not open the URL:\n${url}\n\nin the selected browser:\n${browserName} (${finalPath})\n\nError: ${errorMessage}`);
            // Optionally try opening in the system's *actual* default if our default fails?
            // Consider adding:
            // try {
            //   console.log(`Attempting to open ${url} in system default browser as fallback.`);
            //   await shell.openExternal(url);
            // } catch (fallbackError: unknown) {
            //    console.error(`Fallback attempt to open ${url} in system default also failed:`, fallbackError);
            // }
        }
    } else {
        console.warn('No target browser path (rule or default) found for URL:', url);
        // Use regular string
        dialog.showErrorBox('Cannot Open URL', 'No matching rule found and no default browser configured in Browser Link.\nPlease configure a default browser in the settings.');
    }
}

// --- Windows Registry Registration using reg.exe --- 
// Disable rule for the whole function as it flags correct usage
// eslint-disable-next-line @typescript-eslint/no-unnecessary-template-literal 
async function registerAppCapabilitiesWindows(): Promise<{ success: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { success: true };
  }
  console.log('Registering application capabilities via reg.exe...');
  try {
    const rawAppPath = app.getPath('exe');
    const appPathCmd = rawAppPath.replace(/\\/g, '\\\\');
    const appIconCmd = `${appPathCmd},0`;

    const capabilitiesKeyPath = `HKCU\\Software\\${COMPANY_NAME}\\${APP_NAME}\\Capabilities`;
    const urlAssociationsPath = `${capabilitiesKeyPath}\\URLAssociations`;
    const classKeyPath = `HKCU\\Software\\Classes\\${APP_ID}`;
    const commandPath = `${classKeyPath}\\shell\\open\\command`;
    const defaultIconPath = `${classKeyPath}\\DefaultIcon`;
    const registeredAppPath = 'HKCU\\Software\\RegisteredApplications';

    const regCommands = [
      // Create Capabilities key and values
      `reg add "${capabilitiesKeyPath}" /v ApplicationName /t REG_SZ /d "${APP_NAME}" /f`,
      `reg add "${capabilitiesKeyPath}" /v ApplicationDescription /t REG_SZ /d "${APP_DESCRIPTION}" /f`,
      `reg add "${capabilitiesKeyPath}" /v ApplicationIcon /t REG_SZ /d "${appIconCmd}" /f`, // Use escaped path
      // Create URLAssociations subkey
      `reg add "${urlAssociationsPath}" /f`,
      // Add protocol associations
      ...PROTOCOLS_TO_HANDLE.map(protocol => 
        `reg add "${urlAssociationsPath}" /v ${protocol} /t REG_SZ /d "${APP_ID}" /f`
      ),
      // Register application entry
      `reg add "${registeredAppPath}" /v "${APP_NAME}" /t REG_SZ /d "Software\${COMPANY_NAME}\${APP_NAME}\Capabilities" /f`,
      // Create Class key and values
      `reg add "${classKeyPath}" /ve /t REG_SZ /d "${APP_NAME} URL Handler" /f`, 
      `reg add "${classKeyPath}" /v "URL Protocol" /t REG_SZ /d "" /f`,
      // Create DefaultIcon subkey and set value
      `reg add "${defaultIconPath}" /ve /t REG_SZ /d "${appIconCmd}" /f`, // Use escaped path
      // Create command subkey and set value
      `reg add "${commandPath}" /ve /t REG_SZ /d "\"${appPathCmd}\" \"%1\"" /f` // Use escaped path
    ];

    // Execute commands synchronously
    for (const cmd of regCommands) {
      console.log(`Executing: ${cmd}`);
      execSync(cmd);
    }

    console.log('Successfully executed registry commands.');
    return { success: true };

  } catch (error: unknown) {
    console.error('Error executing registry commands:', error);
    // Enhanced logging
    const message = error instanceof Error ? error.message : 'Unknown error executing reg.exe';
    // If error includes stdout/stderr from execSync, log it too (might be useful)
    if (error && typeof error === 'object') {
        if ('stdout' in error && typeof (error as Record<string, unknown>).stdout === 'object' && (error as Record<string, unknown>).stdout !== null && typeof (error as { stdout: { toString?: () => string } }).stdout?.toString === 'function') {
            console.error('stdout:', (error as { stdout: { toString: () => string } }).stdout.toString());
        }
        if ('stderr' in error && typeof (error as Record<string, unknown>).stderr === 'object' && (error as Record<string, unknown>).stderr !== null && typeof (error as { stderr: { toString?: () => string } }).stderr?.toString === 'function') {
            console.error('stderr:', (error as { stderr: { toString: () => string } }).stderr.toString());
        }
    }
    return { success: false, error: message };
  }
}

/**
 * Tries to register capabilities and set the app as the default handler for HTTP/HTTPS.
 * Returns a detailed status object.
 */
async function registerAsDefaultBrowser(): Promise<{ success: boolean; requiresAdmin?: boolean; alreadyRegistered: boolean; message: string }> {
  console.log('Starting registration process...');
  let overallSuccess = true;
  let attemptedRegistration = false;
  let requiresAdminLikely = false;
  let alreadyDefaultForAll = true;
  const messages: string[] = [];

  // Step 1: Register capabilities
  if (process.platform === 'win32') {
    const capResult = await registerAppCapabilitiesWindows();
    if (!capResult.success) {
      messages.push(`Failed to register application capabilities: ${capResult.error || 'Unknown error'}.`);
      overallSuccess = false;
    } else {
      messages.push('Application capabilities registered successfully.');
    }
  }

  // Step 2: Attempt to set as default
  for (const protocol of PROTOCOLS_TO_HANDLE) {
    let isCurrentlyDefault = false;
    try {
        isCurrentlyDefault = app.isDefaultProtocolClient(protocol);
    } catch (e: unknown) { // Add type annotation
        // Enhanced logging
        console.warn(`Could not check default status for ${protocol} due to error:`, e instanceof Error ? e.message : e);
        isCurrentlyDefault = false; // Assume not default if check fails
    }

    if (!isCurrentlyDefault) {
      alreadyDefaultForAll = false;
      console.log(`Attempting to set as default for ${protocol}...`);
      attemptedRegistration = true;
      let setAttemptSuccess = false;
      try {
        setAttemptSuccess = app.setAsDefaultProtocolClient(protocol);
        console.log(`Electron setAsDefaultProtocolClient attempt for ${protocol} returned: ${setAttemptSuccess}`);
        let isNowDefault = false;
        try {
            isNowDefault = app.isDefaultProtocolClient(protocol);
            console.log(`Verification check: Is now default for ${protocol}? ${isNowDefault}`);
        } catch (e: unknown) { // Add type annotation
            // Enhanced logging
            console.warn(`Could not verify default status for ${protocol} after setting attempt due to error:`, e instanceof Error ? e.message : e);
            // Proceed assuming verification failed for safety
        }
        if (setAttemptSuccess && isNowDefault) {
           messages.push(`Successfully set as default handler for ${protocol}.`);
        } else {
            overallSuccess = false;
            requiresAdminLikely = true;
            messages.push(`Failed to set/verify as default for ${protocol}. Admin rights or manual setting via Windows Settings likely required.`);
        }
      } catch (error: unknown) {
        // Enhanced logging
        console.error(`Error during setAsDefaultProtocolClient for ${protocol}:`, error instanceof Error ? error.message : error);
        overallSuccess = false;
        requiresAdminLikely = true;
        messages.push(`Error setting default for ${protocol}: ${error instanceof Error ? error.message : 'Unknown error'}. Admin rights might be needed.`);
      }
    } else {
      console.log(`Already default for ${protocol}.`);
      messages.push(`Already the default handler for ${protocol}.`);
    }
  }

  // Step 3: Determine final message (Simplified logic)
  let finalMessage = messages.join(' ');
  if (alreadyDefaultForAll && overallSuccess) {
       finalMessage = "Browser Link is already the default handler and capabilities seem registered.";
  } else if (attemptedRegistration && overallSuccess) {
      finalMessage = "Registration attempt succeeded. Please verify in Windows Settings if needed.";
  } else if (!overallSuccess && requiresAdminLikely) {
       finalMessage = "Registration attempt failed, likely due to permissions. Please try running as administrator, or set manually via Windows Settings.";
  } else if (!overallSuccess) {
       finalMessage = "Registration process completed with errors. Check logs and try setting manually via Windows Settings.";
  } else if (overallSuccess && !attemptedRegistration) { 
       finalMessage = "Already default and capabilities registered. No changes made.";
  }

  console.log('Registration process finished. Result:', { success: overallSuccess, requiresAdmin: requiresAdminLikely, alreadyRegistered: alreadyDefaultForAll, message: finalMessage });
  return {
    success: overallSuccess,
    requiresAdmin: requiresAdminLikely && !overallSuccess,
    alreadyRegistered: alreadyDefaultForAll,
    message: finalMessage
  };
}

// --- Single Instance Lock ---
// Ensure only one instance of the app runs
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is running. Quitting this instance.');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('Second instance detected.');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.pop();
    if (url && PROTOCOLS_TO_HANDLE.some(p => url.startsWith(`${p}://`))) {
      console.log('URL from second instance:', url);
      handleUrl(url).catch((e: unknown) => console.error('Error handling URL from second instance:', e instanceof Error ? e.message : e));
    }
  });
}

// --- Main Window Creation ---
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900, 
    height: 900, 
    show: false, 
    webPreferences: {
      // Correct the path to point from 'electron' dir to 'dist-electron' dir
      // Simplify path: Since main.js and preload.js are both in dist-electron during dev,
      // use a path relative to the executing main.js file (__dirname will be dist-electron).
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Ensure this is true
    },
  });

  // Load the index.html of the app.
  // Update log message to show the corrected path calculation logic
  // Update log message to reflect the simplified path calculation.
  console.log('[Main Process] Calculated Preload Path:', path.join(__dirname, 'preload.js'));
  if (app.isPackaged) {
    // Production: load built renderer index.html
    // Path goes up from dist-electron (__dirname) then into dist/renderer
    const packagedIndexPath = path.join(__dirname, '../dist/renderer/index.html');
    console.log(`[Main Process - Packaged] Attempting to load index.html from: ${packagedIndexPath}`);
    mainWindow.loadFile(packagedIndexPath);
  } else {
    // Development: load Vite dev server URL
    mainWindow.loadURL('http://localhost:3000'); 
    mainWindow.webContents.openDevTools();
  }

  // Show window once page is ready (avoids blank screen)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- App Lifecycle Events ---

// Handle URL passed via command line arguments (Windows/Linux primarily)
if (process.platform !== 'darwin') {
    const urlArg = process.argv.find(arg => PROTOCOLS_TO_HANDLE.some(p => arg.startsWith(`${p}://`)));
    if (urlArg) {
        console.log('Initial URL from argv:', urlArg);
        initialUrlToOpen = urlArg; 
    }
}

// --- Application Menu --- 
function createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
        // { role: 'appMenu' } // Basic macOS app menu
        ...((process.platform === 'darwin') ? [{
            label: app.getName(),
            submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                { role: 'services' as const },
                { type: 'separator' as const },
                { role: 'hide' as const },
                { role: 'hideOthers' as const },
                { role: 'unhide' as const },
                { type: 'separator' as const },
                { role: 'quit' as const }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                (process.platform === 'darwin') ? { role: 'close' as const } : { role: 'quit' as const }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' as const },
                { role: 'redo' as const },
                { type: 'separator' as const },
                { role: 'cut' as const },
                { role: 'copy' as const },
                { role: 'paste' as const },
                ...(process.platform === 'darwin' ? [
                    { role: 'pasteAndMatchStyle' as const },
                    { role: 'delete' as const },
                    { role: 'selectAll' as const },
                    { type: 'separator' as const },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' as const },
                            { role: 'stopSpeaking' as const }
                        ]
                    }
                ] : [
                    { role: 'delete' as const },
                    { type: 'separator' as const },
                    { role: 'selectAll' as const }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' as const },
                { role: 'forceReload' as const },
                { role: 'toggleDevTools' as const }, 
                { type: 'separator' as const },
                { role: 'resetZoom' as const },
                { role: 'zoomIn' as const },
                { role: 'zoomOut' as const },
                { type: 'separator' as const },
                { role: 'togglefullscreen' as const }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' as const },
                { role: 'zoom' as const },
                ...(process.platform === 'darwin' ? [
                    { type: 'separator' as const },
                    { role: 'front' as const },
                    { type: 'separator' as const },
                    { role: 'window' as const }
                ] : [
                    { role: 'close' as const }
                ])
            ]
        },
        {
            role: 'help' as const,
            submenu: [
                {
                    label: 'Learn More (GitHub)',
                    click: async () => {
                        await shell.openExternal('https://github.com/your-repo-here'); // TODO: Update link
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// --- App Ready ---
app.whenReady().then(async () => {
  console.log('App is ready.');

  // Create the application menu
  createMenu(); 

  // Detect browsers *with icons* first
  console.log('Starting browser detection...'); // Add log
  try {
    availableBrowsers = await detectBrowsersWithIcons();
    console.log(`Browser detection with icons complete. Found ${availableBrowsers.length} browsers.`);
  } catch (error: unknown) { // Add type annotation and logging
      console.error("Fatal error during initial browser detection:", error instanceof Error ? error.message : error);
      // Proceed without browsers, frontend should handle empty list
      availableBrowsers = [];
       // Optional: Show an error to the user if this is critical
      // dialog.showErrorBox('Browser Detection Failed', 'Could not detect available browsers. Some features might be limited.');
  }

  // Do NOT attempt registration automatically on startup
  // Let the user trigger it from the UI
  // const registrationResult = await registerAsDefaultBrowser();

  // Create the main window
  createWindow();

  // ADD initial URL handling HERE, after window is created and browsers detected
  if (initialUrlToOpen) {
    console.log('Handling initial URL after app ready and window created.');
    handleUrl(initialUrlToOpen).catch((e: unknown) => console.error('Error handling initial URL:', e instanceof Error ? e.message : e));
    initialUrlToOpen = null; // Consume it
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Handle URLs opened when the app is already running (macOS primarily)
  app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log('URL from open-url event:', url);
    handleUrl(url).catch((e: unknown) => console.error('Error handling open-url event:', e instanceof Error ? e.message : e));
  });

  // --- IPC Handlers (Example for future UI) ---
  ipcMain.handle('get-settings', () => typedStore.store); // Use typedStore
  ipcMain.handle('get-available-browsers', () => availableBrowsers);
  ipcMain.handle('set-settings', (event, settings: Partial<Settings>) => { // Allow partial settings update
      try {
          // Add validation logic here before setting
          console.log('IPC: Setting settings:', settings);
          typedStore.set(settings); // Use typedStore
          return { success: true };
      } catch (error: unknown) {
          console.error('Error setting settings via IPC:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { success: false, error: errorMessage };
      }
  });
   ipcMain.handle('add-rule', (event, rule: Omit<Rule, 'id'>) => {
      const newRule: Rule = { ...rule, id: uuidv4(), isEnabled: rule.isEnabled ?? true };
      const rules = typedStore.get('rules', []); // Use typedStore
      typedStore.set('rules', [...rules, newRule]); // Use typedStore
      return newRule; // Return the full rule with ID
  });
   ipcMain.handle('update-rule', (event, ruleToUpdate: Rule) => {
      const rules = typedStore.get('rules', []); // Use typedStore
      const index = rules.findIndex(r => r.id === ruleToUpdate.id);
      if (index !== -1) {
          rules[index] = ruleToUpdate;
          typedStore.set('rules', rules); // Use typedStore
          return { success: true };
      }
      return { success: false, error: 'Rule not found' };
  });
   ipcMain.handle('delete-rule', (event, ruleId: string) => {
      const rules = typedStore.get('rules', []); // Use typedStore
      const newRules = rules.filter(r => r.id !== ruleId);
      if (newRules.length !== rules.length) {
          typedStore.set('rules', newRules); // Use typedStore
          return { success: true };
      }
      return { success: false, error: 'Rule not found' };
  });
   ipcMain.handle('set-default-browser', (event, browser: DetectedBrowser | null) => {
      typedStore.set({ // Use typedStore and set object
        defaultBrowserPath: browser?.path ?? null,
        defaultBrowserName: browser?.name ?? null
      });
      return { success: true };
  });
  // Update handler to be async
  ipcMain.handle('register-as-default-handler', async () => { // Make async
      console.log('IPC: Received request to register as default handler.');
      // Await the async registration function
      const result = await registerAsDefaultBrowser();
      console.log('IPC: Registration attempt result:', result);
      return result; 
  });

  // --- NEW: Handler to open Default Apps settings --- 
  ipcMain.handle('open-default-apps-settings', async () => {
    console.log('IPC: Received request to open default apps settings.');
    try {
      await shell.openExternal('ms-settings:defaultapps');
      console.log('Successfully requested opening ms-settings:defaultapps');
      return { success: true };
    } catch (error: unknown) {
      console.error('Error opening default apps settings:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message }; // Ensure return in catch block
    }
  }); // Close handle for open-default-apps-settings

}); // Close app.whenReady().then(...)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('Main process script started.');

// --- URL Handling (Placeholder for Phase 3) ---
// We'll add URL handling logic here in the next phase 