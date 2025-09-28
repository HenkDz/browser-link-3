// Remove the problematic import
// import type { ElectronApi as PreloadElectronApi } from "../electron/preload.js";

/**
 * Represents a detected browser application on the system.
 */
export interface DetectedBrowser {
  name: string;
  path: string;
  iconDataUrl?: string; // Add optional field for base64 icon data
}

/**
 * Represents a single routing rule.
 */
export interface Rule {
  id: string; // Unique identifier
  pattern: string; // URL pattern (glob, regex, domain, etc.)
  patternType: 'domain' | 'startsWith' | 'includes' | 'regex'; // Type of pattern matching
  browserPath: string; // Full path to the browser executable
  browserName: string; // Display name of the browser
  isEnabled: boolean; // Whether the rule is active
}

/**
 * Represents the application settings stored persistently.
 */
export interface Settings {
  defaultBrowserPath: string | null; // Path to the default browser if no rule matches
  defaultBrowserName: string | null; // Display name of the default browser
  rules: Rule[];
  // Potential future settings:
  launchAtStartup?: boolean;
  minimizeToTray?: boolean;
  showNotificationOnSuccess?: boolean;
  // checkForUpdates?: boolean;
}

/**
 * Represents the API exposed from the main process to the renderer via preload script.
 */
export interface ElectronApi {
  getSettings: () => Promise<Settings>;
  getAvailableBrowsers: () => Promise<DetectedBrowser[]>; // Use the updated DetectedBrowser type
  setSettings: (settings: Partial<Settings>) => Promise<{ success: boolean; error?: string }>;
  addRule: (rule: Omit<Rule, 'id' | 'isEnabled'> & { isEnabled?: boolean }) => Promise<Rule>;
  updateRule: (rule: Rule) => Promise<{ success: boolean; error?: string }>;
  deleteRule: (ruleId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultBrowser: (browser: DetectedBrowser | null) => Promise<{ success: boolean }>;
  registerAsDefaultHandler: () => Promise<{ success: boolean; requiresAdmin?: boolean; alreadyRegistered: boolean; message: string }>;
  openDefaultAppsSettings: () => Promise<{ success: boolean; error?: string }>;
  getAppInfo: () => Promise<AppInfo>;
  checkForUpdates: () => Promise<UpdateStatus>;
  downloadUpdate: () => Promise<UpdateStatus>;
  installUpdate: () => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (listener: (status: UpdateStatus) => void) => () => void;
}

// Declare the API exposed on the window object
declare global {
    interface Window {
        electronApi: ElectronApi;
    }
}

export interface AppInfo {
  version: string;
}

export type UpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdateStatus {
  state: UpdateState;
  currentVersion: string;
  availableVersion?: string;
  downloadProgress?: number;
  message?: string;
  releaseNotes?: string | null;
}