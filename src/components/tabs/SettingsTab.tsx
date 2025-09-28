import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Settings, UpdateStatus } from '../../../types/index.js'; // Corrected relative path with .js
import { Button } from '../ui/button.js'; // Use alias
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js'; // Use alias
import { toast } from "sonner"; // Use sonner
import { Label } from '../ui/label.js'; // Corrected path
import { Switch } from '../ui/switch.js'; // Corrected path

interface SettingsTabProps {
  settings: Settings | null; // Settings might be null initially
  onDataRefresh: () => Promise<void>;
  appVersion: string;
}

export function SettingsTab({ settings, onDataRefresh, appVersion }: SettingsTabProps) {

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    state: 'idle',
    currentVersion: appVersion
  });
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const userInitiatedRef = useRef(false);

  useEffect(() => {
    setUpdateStatus(prev => ({ ...prev, currentVersion: appVersion }));
  }, [appVersion]);

  useEffect(() => {
    const unsubscribe = window.electronApi.onUpdateStatus(status => {
      setUpdateStatus(status);

      if (status.state === 'available') {
        if (userInitiatedRef.current) {
          toast.info(`Update ${status.availableVersion ?? ''} is available.`);
          userInitiatedRef.current = false;
        }
      } else if (status.state === 'not-available' && userInitiatedRef.current) {
        toast.success('Browser Link is up to date.');
        userInitiatedRef.current = false;
      } else if (status.state === 'downloaded') {
        toast.success(`Update ${status.availableVersion ?? ''} downloaded. Restart to install.`);
        userInitiatedRef.current = false;
      } else if (status.state === 'error' && userInitiatedRef.current) {
        toast.error(status.message || 'Update process failed.');
        userInitiatedRef.current = false;
      }
    });

    return unsubscribe;
  }, []);

  const openAppDefaults = useCallback(async () => {
    console.log('Attempting to open Browser Link default app page...');
    const result = await window.electronApi.openDefaultAppsSettings();
    if (!result.success) {
      toast.error(`Could not open default app settings: ${result.error || 'Unknown error'}`);
    }
  }, []);

  const handleCheckForUpdates = useCallback(async () => {
    userInitiatedRef.current = true;
    setIsCheckingForUpdate(true);
    try {
      const status = await window.electronApi.checkForUpdates();
      setUpdateStatus(status);
      if (status.state === 'error') {
        toast.error(status.message || 'Update check failed.');
        userInitiatedRef.current = false;
      }
    } catch (error) {
      userInitiatedRef.current = false;
      const message = error instanceof Error ? error.message : 'Unknown error checking for updates.';
      toast.error(`Update check failed: ${message}`);
    } finally {
      setIsCheckingForUpdate(false);
    }
  }, []);

  const handleDownloadUpdate = useCallback(async () => {
    userInitiatedRef.current = true;
    setIsDownloadingUpdate(true);
    try {
      const status = await window.electronApi.downloadUpdate();
      setUpdateStatus(status);
      if (status.state === 'error') {
        toast.error(status.message || 'Failed to download update.');
        userInitiatedRef.current = false;
      }
    } catch (error) {
      userInitiatedRef.current = false;
      const message = error instanceof Error ? error.message : 'Unknown error downloading update.';
      toast.error(`Download failed: ${message}`);
    } finally {
      setIsDownloadingUpdate(false);
    }
  }, []);

  const handleInstallUpdate = useCallback(async () => {
    try {
      const result = await window.electronApi.installUpdate();
      if (!result.success) {
        toast.error(result.error || 'Failed to start update installation.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error installing update.';
      toast.error(`Install failed: ${message}`);
    }
  }, []);

  const downloadPercent = typeof updateStatus.downloadProgress === 'number'
    ? Math.round(updateStatus.downloadProgress)
    : null;
  const canDownloadUpdate = updateStatus.state === 'available';
  const canInstallUpdate = updateStatus.state === 'downloaded';
  const formattedReleaseNotes = useMemo(() => {
    if (!updateStatus.releaseNotes) {
      return null;
    }

    const normalizeBreaks = updateStatus.releaseNotes
      .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '');

    const stripped = normalizeBreaks.replace(/<[^>]+>/g, '');
    const cleaned = stripped.replace(/\n{3,}/g, '\n\n').trim();
    return cleaned.length > 0 ? cleaned : null;
  }, [updateStatus.releaseNotes]);
 
   // Handler for the first button (Attempt Registration)
   const handleRegisterAsDefault = useCallback(async () => {
    console.log('SettingsTab: Requesting registration as default handler...');
    try {
        const result = await window.electronApi.registerAsDefaultHandler();
        console.log('SettingsTab: Registration result:', result);

        // Remove action buttons from these toasts
        if (result.alreadyRegistered) {
            toast.info(result.message || "Already registered as default.");
        } else if (result.success) {
            toast.success(result.message || "Registration attempt successful. Please verify in Windows Settings.");
        } else if (result.requiresAdmin) {
             toast.warning(result.message || "Registration failed. Try running as administrator or set manually via Windows Settings.");
        } else {
             toast.error(result.message || "Registration attempt failed. Check main process logs.");
        }
    } catch (error) {
        console.error('Error registering as default handler:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(`Failed to register: ${message}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies intentionally left empty; this handler reads no reactive values

  // Placeholder for handling other setting changes (e.g., launch on startup)
  const handleSettingChange = useCallback(async (key: keyof Settings, value: boolean) => {
    console.log(`SettingsTab: Updating setting ${key} to ${value}`);
    try {
        const result = await window.electronApi.setSettings({ [key]: value });
        if(result.success) {
            toast.success(`Setting '${key}' updated.`);
            await onDataRefresh(); // Refresh settings data after successful update
        } else {
            toast.error(`Failed to update setting '${key}': ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast.error(`Failed to update setting '${key}': ${message}`);
    }
  }, [onDataRefresh]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Configure Browser Link behavior and system integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
         <div className="space-y-3">
            <h3 className="text-sm font-medium">Version &amp; Updates</h3>
            <p className="text-sm text-muted-foreground">
              Current version: <span className="font-mono">{appVersion || 'unknown'}</span>
            </p>
            {updateStatus.availableVersion && updateStatus.availableVersion !== appVersion && (
              <p className="text-sm text-muted-foreground">
                Latest available: <span className="font-mono">{updateStatus.availableVersion}</span>
              </p>
            )}
            {updateStatus.state === 'downloading' && (
              <p className="text-sm text-muted-foreground">
                Downloading update... {downloadPercent !== null ? `${downloadPercent}%` : ''}
              </p>
            )}
            {updateStatus.state === 'error' && updateStatus.message && (
              <p className="text-sm text-destructive">
                Update error: {updateStatus.message}
              </p>
            )}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckForUpdates}
                disabled={isCheckingForUpdate}
              >
                Check for Updates
              </Button>
              <Button
                type="button"
                onClick={handleDownloadUpdate}
                variant={canDownloadUpdate ? 'default' : 'secondary'}
                className={canDownloadUpdate ? 'font-semibold shadow-sm' : undefined}
                disabled={!canDownloadUpdate || isDownloadingUpdate}
                title={canDownloadUpdate ? 'Download the new version' : 'No update available yet'}
              >
                {isDownloadingUpdate ? 'Downloading…' : 'Download Update'}
              </Button>
              <Button
                type="button"
                onClick={handleInstallUpdate}
                disabled={!canInstallUpdate}
              >
                Install &amp; Restart
              </Button>
            </div>
            {formattedReleaseNotes && (
              <details className="rounded border border-border/60 bg-muted/30 p-3 text-sm">
                <summary className="cursor-pointer font-medium">Release notes</summary>
                <div className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">
                  {formattedReleaseNotes}
                </div>
              </details>
            )}
         </div>
          {/* --- Default Handler Setting --- */}
          <div className="space-y-3"> {/* Slightly more space */} 
            <h3 className="text-sm font-medium">System Protocol Handler</h3>
             <p className="text-sm text-muted-foreground">
                 To make Browser Link handle HTTP/HTTPS links, first attempt registration, then set it manually in Windows Settings.
             </p>
             <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2"> {/* Arrange buttons */} 
                {/* Button 1: Attempt Registration */}
                <Button
                    type="button"
                    variant="outline" // Use outline for the first step
                    onClick={handleRegisterAsDefault}
                >
                    1. Attempt Registration
                </Button>
                <Button
                    type="button"
                    onClick={openAppDefaults}
                >
                    2. Open Browser Link Default Apps Page
                </Button>
             </div>
              <p className="mt-1 text-xs text-muted-foreground">
                  Step 1 might require administrator privileges. Step 2 opens the Browser Link entry so you can press "Set default" and apply all associations at once.
              </p>
         </div>

         {/* --- Launch at Startup Setting --- */}
         <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
                <Label htmlFor="launch-startup">
                    Launch at Startup
                </Label>
                <p className="text-sm text-muted-foreground">
                    Automatically start Browser Link when you log in
                </p>
            </div>
            <Switch
                id="launch-startup"
                checked={settings?.launchAtStartup || false}
                onCheckedChange={(checked: boolean) => handleSettingChange('launchAtStartup', checked)}
            />
         </div>

         {/* --- Minimize to Tray Setting --- */}
         <div className="flex items-center justify-between space-x-4">
             <div className="space-y-1">
                 <Label htmlFor="minimize-tray">
                     Minimize to Tray
                 </Label>
                 <p className="text-sm text-muted-foreground">
                     Keep Browser Link running in the system tray when closed
                 </p>
             </div>
             <Switch
                 id="minimize-tray"
                 checked={settings?.minimizeToTray || false}
                 onCheckedChange={(checked: boolean) => handleSettingChange('minimizeToTray', checked)}
             />
         </div>

         {/* --- Show Notification Setting --- */}
         <div className="flex items-center justify-between space-x-4">
             <div className="space-y-1">
                 <Label htmlFor="show-notification">
                     Show Notification on Link Open
                 </Label>
                 <p className="text-sm text-muted-foreground">
                     Display a system notification when a link is opened successfully.
                 </p>
             </div>
             <Switch
                 id="show-notification"
                 checked={settings?.showNotificationOnSuccess ?? true} // Default to true if setting is missing initially
                 onCheckedChange={(checked: boolean) => handleSettingChange('showNotificationOnSuccess', checked)}
             />
         </div>
      </CardContent>
    </Card>
  );
}