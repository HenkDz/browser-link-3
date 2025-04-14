import React, { useCallback } from 'react';
import type { Settings, DetectedBrowser } from '../../../types/index.js';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip.js';
import { CheckCircle, Globe } from 'lucide-react';
import { BrowserIconDisplay } from '../BrowserIconDisplay.js';

interface BrowsersTabProps {
  settings: Settings | null;
  availableBrowsers: DetectedBrowser[];
  onDataRefresh: () => Promise<void>;
}

export function BrowsersTab({ settings, availableBrowsers, onDataRefresh }: BrowsersTabProps) {
  const handleSetDefaultBrowser = useCallback(async (browser: DetectedBrowser | null) => {
    try {
      const result = await window.electronApi.setDefaultBrowser(browser);
      if (result.success) {
        toast.success(`Default fallback browser set to ${browser ? browser.name : 'None'}.`);
        await onDataRefresh();
      } else {
        throw new Error('API returned failure.');
      }
    } catch (error) {
      console.error('Error setting default browser:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to set default browser: ${message}`);
    }
  }, [onDataRefresh]);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Detected Browsers</CardTitle>
          <CardDescription>
            Manage detected browsers and set the default fallback browser used when no rules match.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Button to set default to None */}
             <div className="flex items-center justify-between space-x-4 rounded-lg border border-dashed p-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">No Default Fallback</p>
                    <p className="text-sm text-muted-foreground">Require a rule to match for a URL to be opened.</p>
                </div>
                 <Button
                    variant={!settings?.defaultBrowserPath ? 'default' : 'outline'}
                    onClick={() => handleSetDefaultBrowser(null)}
                    size="sm"
                 >
                     { !settings?.defaultBrowserPath && <CheckCircle className="mr-2 h-4 w-4" /> }
                    { !settings?.defaultBrowserPath ? 'Current Default' : 'Set as Default' }
                </Button>
            </div>
            {/* List of detected browsers */}
            {availableBrowsers?.map((browser) => (
              <div
                key={browser.path}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                    <BrowserIconDisplay 
                        iconDataUrl={browser.iconDataUrl}
                        browserName={browser.name} 
                    />
                    <div className="flex-1 space-y-1 overflow-hidden">
                        <p className="text-sm font-medium leading-none truncate" title={browser.name}>
                            {browser.name}
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground truncate cursor-default">
                                    {browser.path}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                                <p>{browser.path}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <Button
                  variant={settings?.defaultBrowserPath === browser.path ? 'default' : 'outline'}
                  onClick={() => handleSetDefaultBrowser(browser)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  { settings?.defaultBrowserPath === browser.path && <CheckCircle className="mr-2 h-4 w-4" /> }
                  { settings?.defaultBrowserPath === browser.path ? 'Current Default' : 'Set as Default' }
                </Button>
              </div>
            ))}
            {/* Empty State */}
            {(!availableBrowsers || availableBrowsers.length === 0) && (
              <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
                <Globe className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  No browsers detected on your system.
                </p>
                 <p className="text-xs text-muted-foreground">
                   Browser Link relies on system detection. Ensure browsers are installed correctly.
                 </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 