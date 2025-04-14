const { contextBridge: s, ipcRenderer: t } = require("electron"), n = {
  getSettings: () => t.invoke("get-settings"),
  getAvailableBrowsers: () => t.invoke("get-available-browsers"),
  setSettings: (e) => t.invoke("set-settings", e),
  addRule: (e) => t.invoke("add-rule", e),
  updateRule: (e) => t.invoke("update-rule", e),
  deleteRule: (e) => t.invoke("delete-rule", e),
  setDefaultBrowser: (e) => t.invoke("set-default-browser", e),
  registerAsDefaultHandler: () => t.invoke("register-as-default-handler"),
  openDefaultAppsSettings: () => t.invoke("open-default-apps-settings")
};
s.exposeInMainWorld("electronApi", n);
console.log("Preload script loaded.");
