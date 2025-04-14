// electron/app/browsers.ts
// Handles browser detection, rule matching, URL opening, and related IPC calls.
import { dialog, Notification } from 'electron';
import path from 'node:path';
import open from 'open';
import type { DetectedBrowser, Rule } from '../../types/index.js';
import { typedStore } from './settings.js';
import { detectBrowsersWithIcons } from '../browser-detector.js';
import { APP_NAME } from './config.js'; // Import APP_NAME for notification title

// --- State ---
let availableBrowsers: DetectedBrowser[] = [];

// --- Core Logic (Moved from main.ts) ---

/**
 * Finds the matching browser path and name for a given URL based on stored rules.
 * Returns null if no enabled rule matches or the matched browser isn't available.
 */
function findMatchingRuleTarget(url: string): { path: string; name: string } | null {
  const rules = typedStore.get('rules', []);
  const urlLower = url.toLowerCase();

  console.log(`Finding rule match for: ${url} among ${rules.length} rules.`);

  if (availableBrowsers.length === 0) {
    console.warn('Attempted to find matching browser before browser detection finished.');
    return null;
  }

  for (const rule of rules) {
    if (!rule.isEnabled) continue;

    try {
      let match = false;
      const patternLower = rule.pattern.toLowerCase();

      switch (rule.patternType) {
        case 'domain': {
          const domainMatch = urlLower.match(/^https?:\/\/([^\/]+)/);
          const domain = domainMatch?.[1];
          if (domain) {
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
          const regex = new RegExp(rule.pattern, 'i');
          match = regex.test(url);
          break;
        }
      }

      if (match) {
        console.log(`Rule matched: ID ${rule.id} (${rule.patternType}: ${rule.pattern}) -> ${rule.browserName}`);
        // Check if the browser path from the rule still exists in the detected list
        if (availableBrowsers.some(b => b.path === rule.browserPath)) {
          return { path: rule.browserPath, name: rule.browserName }; // Return path and name
        }
        console.warn(`Browser path for matched rule ${rule.id} (${rule.browserPath}) no longer exists or wasn't detected. Falling back.`);
        return null; // Return null if browser is gone
      }
    } catch (e) {
      console.error(`Error processing rule ${rule.id} (${rule.patternType}: ${rule.pattern}) with URL ${url}:`, e);
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
  const ruleTarget = findMatchingRuleTarget(url);
  const defaultBrowserPath = typedStore.get('defaultBrowserPath');
  const defaultBrowserName = typedStore.get('defaultBrowserName');

  const finalPath = ruleTarget?.path || defaultBrowserPath;
  const finalName = ruleTarget?.name || defaultBrowserName;

  if (finalPath) {
    const displayName = finalName || path.basename(finalPath).replace('.exe', '');
    console.log(`Opening URL [${url}] in browser [${displayName}] (${finalPath})`);
    try {
      await open(url, { app: { name: finalPath }, wait: false });

      // Show notification on success
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: `${APP_NAME} Rule Matched`, // Use app name from config
          //body: `Opened in ${displayName}`,
          // Optional: Add URL to body or use subtitle if needed, keep it concise
           body: `Opened ${url} in ${displayName}`,
          silent: true // Don't play sound
        });
        notification.show();
      } else {
        console.log('Notifications not supported on this system.');
      }

    } catch (error: unknown) {
      console.error(`Error opening URL ${url} in ${displayName} (${finalPath}):`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dialog.showErrorBox('Error Opening URL', `Could not open the URL ${url} in the selected browser (${displayName}).\n\nError: ${errorMessage}`);
    }
  } else {
    console.warn('No target browser path (rule or default) found for URL:', url);
    dialog.showErrorBox('Cannot Open URL', 'No matching rule found and no default browser configured in Browser Link.\nPlease configure a default browser in the settings.');
  }
}

/**
 * Fetches available browsers using the detector and updates the state.
 */
async function updateAvailableBrowsers(): Promise<void> {
  try {
    availableBrowsers = await detectBrowsersWithIcons();
    console.log('Browser detection with icons complete.');
  } catch (error) {
    console.error("Browser detection failed:", error);
    availableBrowsers = [];
  }
}

/**
 * Returns the currently detected available browsers.
 */
function getAvailableBrowsers(): DetectedBrowser[] {
  return availableBrowsers;
}


export { handleUrl, updateAvailableBrowsers, getAvailableBrowsers }; 