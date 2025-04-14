import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { DetectedBrowser } from '../types/index.js';
import { app } from 'electron'; // Import app module

/**
 * Fetches the application icon as a base64 data URL.
 */
async function getIconDataUrl(filePath: string): Promise<string | undefined> {
    try {
        const nativeImage = await app.getFileIcon(filePath, { size: 'normal' });
        if (nativeImage.isEmpty()) {
             console.warn(`Could not get non-empty icon for ${filePath}`);
             return undefined;
        }
        return nativeImage.toDataURL();
    } catch (error) {
        console.error(`Error getting file icon for ${filePath}:`, error);
        return undefined;
    }
}

/**
 * Detects installed browsers on the system, including icons.
 */
export async function detectBrowsersWithIcons(): Promise<DetectedBrowser[]> {
    console.log('Detecting browsers with icons...');
    let baseBrowsers: Omit<DetectedBrowser, 'iconDataUrl'>[] = [];

    if (process.platform === 'darwin') {
        baseBrowsers = detectMacBrowsers();
    } else if (process.platform === 'win32') {
        baseBrowsers = detectWindowsBrowsers();
    } else {
        console.warn('Browser detection not fully implemented for this platform.');
        baseBrowsers = detectLinuxBrowsers();
    }

    // Fetch icons for detected browsers
    const browsersWithIcons: DetectedBrowser[] = [];
    for (const browser of baseBrowsers) {
        const iconDataUrl = await getIconDataUrl(browser.path);
        browsersWithIcons.push({ ...browser, iconDataUrl });
    }

    console.log(`Detected ${browsersWithIcons.length} browsers (with icon fetch attempt).`);
    return browsersWithIcons;
}

// --- Detection Functions (detectMacBrowsers, detectWindowsBrowsers, detectLinuxBrowsers) ---
// These functions now return Omit<DetectedBrowser, 'iconDataUrl'>[]

function detectMacBrowsers(): Omit<DetectedBrowser, 'iconDataUrl'>[] {
    const detected: Omit<DetectedBrowser, 'iconDataUrl'>[] = [];
    const browserBundleIds = [
        'com.google.Chrome',
        'com.google.Chrome.canary',
        'org.mozilla.firefox',
        'com.apple.Safari',
        'com.microsoft.edgemac',
        'com.operasoftware.Opera',
        'com.brave.Browser',
        'com.vivaldi.Vivaldi'
    ];

    for (const bundleId of browserBundleIds) {
        try {
            const cmd = `mdfind "kMDItemCFBundleIdentifier == '${bundleId}'"`;
            const appPathsOutput = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
            const appPaths = appPathsOutput.split('\n').filter(p => p.endsWith('.app'));

            if (appPaths.length > 0) {
                const appPath = appPaths[0];
                const plistPath = path.join(appPath, 'Contents', 'Info.plist');
                const executableNameCmd = `/usr/libexec/PlistBuddy -c "Print CFBundleExecutable" "${plistPath}"`;
                const executableName = execSync(executableNameCmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
                const executablePath = path.join(appPath, 'Contents', 'MacOS', executableName);

                if (fs.existsSync(executablePath)) {
                    const name = path.basename(appPath, '.app');
                    detected.push({ name, path: executablePath });
                    console.log(`Found macOS browser: ${name} at ${executablePath}`);
                }
            }
        } catch (error) {
            // console.warn(`Could not find macOS browser for bundle ID ${bundleId}:`, error);
        }
    }
    return detected;
}

function detectWindowsBrowsers(): Omit<DetectedBrowser, 'iconDataUrl'>[] {
    const detected: Omit<DetectedBrowser, 'iconDataUrl'>[] = [];
    const registryKeys = [
        'HKEY_CURRENT_USER\\Software\\Clients\\StartMenuInternet',
        'HKEY_LOCAL_MACHINE\\Software\\Clients\\StartMenuInternet',
    ];
    const commonPaths = [
        // Chrome
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Google\\Chrome\\Application\\chrome.exe') : null, nameHint: 'Google Chrome' },
        { path: process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Google\\Chrome\\Application\\chrome.exe') : null, nameHint: 'Google Chrome' },
        // Firefox
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Mozilla Firefox\\firefox.exe') : null, nameHint: 'Mozilla Firefox' },
        { path: process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Mozilla Firefox\\firefox.exe') : null, nameHint: 'Mozilla Firefox' },
        // Edge
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Microsoft\\Edge\\Application\\msedge.exe') : null, nameHint: 'Microsoft Edge' },
        { path: process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Microsoft\\Edge\\Application\\msedge.exe') : null, nameHint: 'Microsoft Edge' },
        // Opera (Add opera.exe check in AppData)
        { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs\\Opera\\opera.exe') : null, nameHint: 'Opera' }, 
        { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs\\Opera\\launcher.exe') : null, nameHint: 'Opera' }, 
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Opera\\launcher.exe') : null, nameHint: 'Opera' }, 
        // Brave
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe') : null, nameHint: 'Brave Browser' },
        { path: process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'BraveSoftware\\Brave-Browser\\Application\\brave.exe') : null, nameHint: 'Brave Browser' },
        // Vivaldi
        { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Vivaldi\\Application\\vivaldi.exe') : null, nameHint: 'Vivaldi' },
        // Internet Explorer
        { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Internet Explorer\\iexplore.exe') : null, nameHint: 'Internet Explorer' },
        { path: process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Internet Explorer\\iexplore.exe') : null, nameHint: 'Internet Explorer' },
    ].filter(item => item.path !== null);

    const foundPaths = new Set<string>();

    // 1. Check common paths
    for (const item of commonPaths) {
        const p = item.path as string;
        if (fs.existsSync(p) && !foundPaths.has(p)) {
            const parentDirName = path.basename(path.dirname(p));
            const grandParentDirName = path.basename(path.dirname(path.dirname(p)));
            let derivedName = item.nameHint || (grandParentDirName !== 'Application' && grandParentDirName !== 'Default' ? grandParentDirName : path.basename(p, '.exe'));
            derivedName = derivedName.replace(/\.exe$/i, '');
            console.log(`[Detector] Common Path Found: Path=${p}, Derived Name=${derivedName}`);
            detected.push({ name: derivedName, path: p });
            foundPaths.add(p);
        }
    }

    // 2. Check Registry
    for (const key of registryKeys) {
        try {
            const regQueryCmd = `reg query "${key}" /s`;
            const output = execSync(regQueryCmd, { encoding: 'utf8', stdio: 'pipe', maxBuffer: 1024 * 1024 * 5 });
            const lines = output.split('\r\n');
            let currentBrowserKey = '';
            for (const line of lines) {
                if (line.startsWith('HKEY_')) {
                    currentBrowserKey = line.trim();
                } else if (line.includes('(Default)') && line.includes('.exe')) {
                    const match = line.match(/REG_SZ\s+(.*\.exe)/);
                    const executablePath = match?.[1]?.trim();
                    if (executablePath && fs.existsSync(executablePath) && !foundPaths.has(executablePath)) {
                        const keyParts = currentBrowserKey.split('\\');
                        // Prioritize registry key name
                        let derivedName = keyParts[keyParts.length - 1] || path.basename(executablePath, '.exe');
                         // Clean up common suffixes
                        derivedName = derivedName.replace(/\s+Stable$/i, '').replace(/\s+Beta$/i, '').replace(/\s+Canary$/i, '').replace(/\s+Developer Edition$/i, '');
                        console.log(`[Detector] Registry Found: Path=${executablePath}, Derived Name=${derivedName}`);
                        detected.push({ name: derivedName, path: executablePath });
                        foundPaths.add(executablePath);
                    }
                }
            }
        } catch (error) {
             console.warn(`Could not query Windows registry key ${key}:`, error);
        }
    }

    // Deduplicate based on path, preferring registry names if conflicts exist (simple approach)
    const finalDetected: Omit<DetectedBrowser, 'iconDataUrl'>[] = [];
    const seenPaths = new Set<string>();
    for(const browser of detected) {
        if (!seenPaths.has(browser.path)) {
            finalDetected.push(browser);
            seenPaths.add(browser.path);
        }
    }

    return finalDetected;
}

function detectLinuxBrowsers(): Omit<DetectedBrowser, 'iconDataUrl'>[] {
    const detected: Omit<DetectedBrowser, 'iconDataUrl'>[] = [];
    const commands = ['google-chrome', 'google-chrome-stable', 'firefox', 'microsoft-edge', 'brave-browser', 'opera', 'vivaldi-stable'];

    for (const cmd of commands) {
        try {
            const executablePath = execSync(`which ${cmd}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
            if (executablePath && fs.existsSync(executablePath)) {
                const name = cmd.replace('-stable', '').replace('-browser', '');
                detected.push({ name, path: executablePath });
                 console.log(`Found Linux browser: ${name} at ${executablePath}`);
            }
        } catch (error) {
             // console.warn(`Could not find Linux browser for command ${cmd}`);
        }
    }
    return detected;
} 