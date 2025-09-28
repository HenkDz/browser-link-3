const { contextBridge, ipcRenderer } = require("electron");
import type {
  Settings,
  Rule,
  DetectedBrowser,
  ElectronApi,
  UpdateStatus,
  AppInfo
} from '../types/index.js';

// No need to export the interface from preload, define it in types/index.ts
// export interface ElectronApi { ... }

// Expose the API to the renderer process
// Ensure the implementation matches the ElectronApi interface defined in types/index.ts
const api: ElectronApi = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getAvailableBrowsers: () => ipcRenderer.invoke('get-available-browsers'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),
  addRule: (rule) => ipcRenderer.invoke('add-rule', rule),
  updateRule: (rule) => ipcRenderer.invoke('update-rule', rule),
  deleteRule: (ruleId) => ipcRenderer.invoke('delete-rule', ruleId),
  setDefaultBrowser: (browser) => ipcRenderer.invoke('set-default-browser', browser),
  registerAsDefaultHandler: () => ipcRenderer.invoke('register-as-default-handler'),
  openDefaultAppsSettings: () => ipcRenderer.invoke('open-default-apps-settings'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info') as Promise<AppInfo>,
  checkForUpdates: () => ipcRenderer.invoke('auto-update-check') as Promise<UpdateStatus>,
  downloadUpdate: () => ipcRenderer.invoke('auto-update-download') as Promise<UpdateStatus>,
  installUpdate: () => ipcRenderer.invoke('auto-update-install'),
  onUpdateStatus: (listener) => {
    const channel = 'auto-update-status';
    const wrapped = (_event: unknown, status: UpdateStatus) => listener(status);
    ipcRenderer.on(channel, wrapped);
    return () => {
      ipcRenderer.removeListener(channel, wrapped);
    };
  }
};

contextBridge.exposeInMainWorld('electronApi', api);

console.log('Preload script loaded.');