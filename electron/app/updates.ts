import { app, BrowserWindow } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import type { AppInfo, UpdateStatus } from '../../types/index.js';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';

let windowAccessor: (() => BrowserWindow | null) | null = null;
let latestAvailableVersion: string | undefined;
const UPDATE_CHANNEL = 'auto-update-status';

function sendStatusToRenderer(status: UpdateStatus): void {
  const win = windowAccessor?.();
  if (win) {
    win.webContents.send(UPDATE_CHANNEL, status);
  }
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowDowngrade = false;
autoUpdater.logger = console;

autoUpdater.on('checking-for-update', () => {
  sendStatusToRenderer({
    state: 'checking',
    currentVersion: app.getVersion()
  });
});

autoUpdater.on('update-available', (info: UpdateInfo) => {
  latestAvailableVersion = info.version;
  sendStatusToRenderer({
    state: 'available',
    currentVersion: app.getVersion(),
    availableVersion: info.version,
    releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : null
  });
});

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
  latestAvailableVersion = undefined;
  sendStatusToRenderer({
    state: 'not-available',
    currentVersion: app.getVersion(),
    availableVersion: info?.version
  });
});

autoUpdater.on('download-progress', (progress: ProgressInfo) => {
  sendStatusToRenderer({
    state: 'downloading',
    currentVersion: app.getVersion(),
    availableVersion: latestAvailableVersion,
    downloadProgress: progress.percent
  });
});

autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
  latestAvailableVersion = info.version;
  sendStatusToRenderer({
    state: 'downloaded',
    currentVersion: app.getVersion(),
    availableVersion: info.version,
    releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : null
  });
});

autoUpdater.on('error', (error: Error) => {
  sendStatusToRenderer({
    state: 'error',
    currentVersion: app.getVersion(),
    availableVersion: latestAvailableVersion,
    message: error instanceof Error ? error.message : 'Unknown update error'
  });
});

export function initializeAutoUpdater(getWindow: () => BrowserWindow | null): void {
  windowAccessor = getWindow;
  // Perform a background check shortly after startup to keep status fresh.
   setTimeout(() => {
    void checkForUpdates();
   }, 5000);
}

function toStatusFromResult(result: UpdateCheckResult | null): UpdateStatus {
  const currentVersion = app.getVersion();
  if (!result) {
    return {
      state: 'not-available',
      currentVersion
    };
  }

  const available = result.updateInfo?.version;
  latestAvailableVersion = available;

  if (available && available !== currentVersion) {
    return {
      state: 'available',
      currentVersion,
      availableVersion: available,
      releaseNotes:
        typeof result.updateInfo.releaseNotes === 'string'
          ? result.updateInfo.releaseNotes
          : null
    };
  }

  return {
    state: 'not-available',
    currentVersion,
    availableVersion: available
  };
}

export async function checkForUpdates(silent = false): Promise<UpdateStatus> {
  try {
    const result = await autoUpdater.checkForUpdates();
    const status = toStatusFromResult(result);
    if (!silent) {
      sendStatusToRenderer(status);
    }
    return status;
  } catch (error) {
    const status: UpdateStatus = {
      state: 'error',
      currentVersion: app.getVersion(),
      availableVersion: latestAvailableVersion,
      message: error instanceof Error ? error.message : 'Unknown error checking for updates'
    };
    if (!silent) {
      sendStatusToRenderer(status);
    }
    return status;
  }
}

export async function downloadUpdate(): Promise<UpdateStatus> {
  try {
    const info = await autoUpdater.downloadUpdate();
    const details = info as UpdateInfo;
    latestAvailableVersion = details.version ?? latestAvailableVersion;
    const status: UpdateStatus = {
      state: 'downloaded',
      currentVersion: app.getVersion(),
      availableVersion: latestAvailableVersion,
      releaseNotes: typeof details.releaseNotes === 'string' ? details.releaseNotes : null
    };
    sendStatusToRenderer(status);
    return status;
  } catch (error) {
    const status: UpdateStatus = {
      state: 'error',
      currentVersion: app.getVersion(),
      availableVersion: latestAvailableVersion,
      message: error instanceof Error ? error.message : 'Failed to download update'
    };
    sendStatusToRenderer(status);
    return status;
  }
}

export function installUpdate(): { success: boolean; error?: string } {
  try {
    autoUpdater.quitAndInstall(false, true);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to install update';
    return { success: false, error: message };
  }
}

export function getAppInfo(): AppInfo {
  return {
    version: app.getVersion()
  };
}
