import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { app } from "electron";
async function getIconDataUrl(filePath) {
  try {
    const nativeImage = await app.getFileIcon(filePath, { size: "normal" });
    if (nativeImage.isEmpty()) {
      console.warn(`Could not get non-empty icon for ${filePath}`);
      return void 0;
    }
    return nativeImage.toDataURL();
  } catch (error) {
    console.error(`Error getting file icon for ${filePath}:`, error);
    return void 0;
  }
}
async function detectBrowsersWithIcons() {
  console.log("Detecting browsers with icons...");
  let baseBrowsers = [];
  if (process.platform === "darwin") {
    baseBrowsers = detectMacBrowsers();
  } else if (process.platform === "win32") {
    baseBrowsers = detectWindowsBrowsers();
  } else {
    console.warn("Browser detection not fully implemented for this platform.");
    baseBrowsers = detectLinuxBrowsers();
  }
  const browsersWithIcons = [];
  for (const browser of baseBrowsers) {
    const iconDataUrl = await getIconDataUrl(browser.path);
    browsersWithIcons.push({ ...browser, iconDataUrl });
  }
  console.log(`Detected ${browsersWithIcons.length} browsers (with icon fetch attempt).`);
  return browsersWithIcons;
}
function detectMacBrowsers() {
  const detected = [];
  const browserBundleIds = [
    "com.google.Chrome",
    "com.google.Chrome.canary",
    "org.mozilla.firefox",
    "com.apple.Safari",
    "com.microsoft.edgemac",
    "com.operasoftware.Opera",
    "com.brave.Browser",
    "com.vivaldi.Vivaldi"
  ];
  for (const bundleId of browserBundleIds) {
    try {
      const cmd = `mdfind "kMDItemCFBundleIdentifier == '${bundleId}'"`;
      const appPathsOutput = execSync(cmd, { encoding: "utf8", stdio: "pipe" });
      const appPaths = appPathsOutput.split("\n").filter((p) => p.endsWith(".app"));
      if (appPaths.length > 0) {
        const appPath = appPaths[0];
        const plistPath = path.join(appPath, "Contents", "Info.plist");
        const executableNameCmd = `/usr/libexec/PlistBuddy -c "Print CFBundleExecutable" "${plistPath}"`;
        const executableName = execSync(executableNameCmd, { encoding: "utf8", stdio: "pipe" }).trim();
        const executablePath = path.join(appPath, "Contents", "MacOS", executableName);
        if (fs.existsSync(executablePath)) {
          const name = path.basename(appPath, ".app");
          detected.push({ name, path: executablePath });
          console.log(`Found macOS browser: ${name} at ${executablePath}`);
        }
      }
    } catch (error) {
    }
  }
  return detected;
}
function detectWindowsBrowsers() {
  var _a;
  const detected = [];
  const registryKeys = [
    "HKEY_CURRENT_USER\\Software\\Clients\\StartMenuInternet",
    "HKEY_LOCAL_MACHINE\\Software\\Clients\\StartMenuInternet"
  ];
  const commonPaths = [
    // Chrome
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    { path: process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    // Firefox
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    { path: process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    // Edge
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    { path: process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    // Opera (Add opera.exe check in AppData)
    { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Programs\\Opera\\opera.exe") : null, nameHint: "Opera" },
    { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Programs\\Opera\\launcher.exe") : null, nameHint: "Opera" },
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Opera\\launcher.exe") : null, nameHint: "Opera" },
    // Brave
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    { path: process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    // Vivaldi
    { path: process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Vivaldi\\Application\\vivaldi.exe") : null, nameHint: "Vivaldi" },
    // Internet Explorer
    { path: process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" },
    { path: process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" }
  ].filter((item) => item.path !== null);
  const foundPaths = /* @__PURE__ */ new Set();
  for (const item of commonPaths) {
    const p = item.path;
    if (fs.existsSync(p) && !foundPaths.has(p)) {
      path.basename(path.dirname(p));
      const grandParentDirName = path.basename(path.dirname(path.dirname(p)));
      let derivedName = item.nameHint || (grandParentDirName !== "Application" && grandParentDirName !== "Default" ? grandParentDirName : path.basename(p, ".exe"));
      derivedName = derivedName.replace(/\.exe$/i, "");
      console.log(`[Detector] Common Path Found: Path=${p}, Derived Name=${derivedName}`);
      detected.push({ name: derivedName, path: p });
      foundPaths.add(p);
    }
  }
  for (const key of registryKeys) {
    try {
      const regQueryCmd = `reg query "${key}" /s`;
      const output = execSync(regQueryCmd, { encoding: "utf8", stdio: "pipe", maxBuffer: 1024 * 1024 * 5 });
      const lines = output.split("\r\n");
      let currentBrowserKey = "";
      for (const line of lines) {
        if (line.startsWith("HKEY_")) {
          currentBrowserKey = line.trim();
        } else if (line.includes("(Default)") && line.includes(".exe")) {
          const match = line.match(/REG_SZ\s+(.*\.exe)/);
          const executablePath = (_a = match == null ? void 0 : match[1]) == null ? void 0 : _a.trim();
          if (executablePath && fs.existsSync(executablePath) && !foundPaths.has(executablePath)) {
            const keyParts = currentBrowserKey.split("\\");
            let derivedName = keyParts[keyParts.length - 1] || path.basename(executablePath, ".exe");
            derivedName = derivedName.replace(/\s+Stable$/i, "").replace(/\s+Beta$/i, "").replace(/\s+Canary$/i, "").replace(/\s+Developer Edition$/i, "");
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
  const finalDetected = [];
  const seenPaths = /* @__PURE__ */ new Set();
  for (const browser of detected) {
    if (!seenPaths.has(browser.path)) {
      finalDetected.push(browser);
      seenPaths.add(browser.path);
    }
  }
  return finalDetected;
}
function detectLinuxBrowsers() {
  const detected = [];
  const commands = ["google-chrome", "google-chrome-stable", "firefox", "microsoft-edge", "brave-browser", "opera", "vivaldi-stable"];
  for (const cmd of commands) {
    try {
      const executablePath = execSync(`which ${cmd}`, { encoding: "utf8", stdio: "pipe" }).trim();
      if (executablePath && fs.existsSync(executablePath)) {
        const name = cmd.replace("-stable", "").replace("-browser", "");
        detected.push({ name, path: executablePath });
        console.log(`Found Linux browser: ${name} at ${executablePath}`);
      }
    } catch (error) {
    }
  }
  return detected;
}
export {
  detectBrowsersWithIcons
};
