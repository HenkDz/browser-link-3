import React, { useCallback } from 'react';
import type { Settings } from '../../../types/index.js'; // Corrected relative path with .js
import { Button } from '../ui/button.js'; // Use alias
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js'; // Use alias
import { toast } from "sonner"; // Use sonner
import { Label } from '../ui/label.js'; // Corrected path
import { Switch } from '../ui/switch.js'; // Corrected path

interface SettingsTabProps {
  settings: Settings | null; // Settings might be null initially
  onDataRefresh: () => Promise<void>;
}

export function SettingsTab({ settings, onDataRefresh }: SettingsTabProps) {

  // --- NEW: Action function to open settings ---
  // Wrap in useCallback to ensure stable identity for dependency array
  const openSettingsAction = useCallback(async () => {
    console.log('Attempting to open default apps settings...');
    const result = await window.electronApi.openDefaultAppsSettings();
    if (!result.success) {
      toast.error(`Could not open settings: ${result.error || 'Unknown error'}`);
    }
  }, []); // No dependencies needed for this action

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
  }, []); // Dependencies still empty as openSettingsAction is not called directly here

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
                {/* Button 2: Open Settings */}
                 <Button
                    type="button"
                    onClick={openSettingsAction} // Directly call the open action
                >
                    2. Open Windows Default Apps Settings
                </Button>
             </div>
              <p className="mt-1 text-xs text-muted-foreground">
                  Step 1 might require administrator privileges. Step 2 lets you choose Browser Link as the default.
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