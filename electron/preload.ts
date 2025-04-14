const { contextBridge, ipcRenderer } = require("electron");
import type { Settings, Rule, DetectedBrowser, ElectronApi } from '../types/index.js';

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
};

contextBridge.exposeInMainWorld('electronApi', api);

console.log('Preload script loaded.'); 