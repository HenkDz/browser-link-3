const { contextBridge, ipcRenderer } = require("electron");
const api = {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  getAvailableBrowsers: () => ipcRenderer.invoke("get-available-browsers"),
  setSettings: (settings) => ipcRenderer.invoke("set-settings", settings),
  addRule: (rule) => ipcRenderer.invoke("add-rule", rule),
  updateRule: (rule) => ipcRenderer.invoke("update-rule", rule),
  deleteRule: (ruleId) => ipcRenderer.invoke("delete-rule", ruleId),
  setDefaultBrowser: (browser) => ipcRenderer.invoke("set-default-browser", browser),
  registerAsDefaultHandler: () => ipcRenderer.invoke("register-as-default-handler"),
  openDefaultAppsSettings: () => ipcRenderer.invoke("open-default-apps-settings")
};
contextBridge.exposeInMainWorld("electronApi", api);
console.log("Preload script loaded.");
