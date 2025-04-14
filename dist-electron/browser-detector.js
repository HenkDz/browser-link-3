import g from "node:fs";
import e from "node:path";
import { execSync as x } from "node:child_process";
import { app as w } from "electron";
async function A(o) {
  try {
    const t = await w.getFileIcon(o, { size: "normal" });
    if (t.isEmpty()) {
      console.warn(`Could not get non-empty icon for ${o}`);
      return;
    }
    return t.toDataURL();
  } catch (t) {
    console.error(`Error getting file icon for ${o}:`, t);
    return;
  }
}
async function E() {
  console.log("Detecting browsers with icons...");
  let o = [];
  process.platform === "darwin" ? o = F() : process.platform === "win32" ? o = b() : (console.warn("Browser detection not fully implemented for this platform."), o = y());
  const t = [];
  for (const i of o) {
    const r = await A(i.path);
    t.push({ ...i, iconDataUrl: r });
  }
  return console.log(`Detected ${t.length} browsers (with icon fetch attempt).`), t;
}
function F() {
  const o = [], t = [
    "com.google.Chrome",
    "com.google.Chrome.canary",
    "org.mozilla.firefox",
    "com.apple.Safari",
    "com.microsoft.edgemac",
    "com.operasoftware.Opera",
    "com.brave.Browser",
    "com.vivaldi.Vivaldi"
  ];
  for (const i of t)
    try {
      const r = `mdfind "kMDItemCFBundleIdentifier == '${i}'"`, d = x(r, { encoding: "utf8", stdio: "pipe" }).split(`
`).filter((c) => c.endsWith(".app"));
      if (d.length > 0) {
        const c = d[0], n = `/usr/libexec/PlistBuddy -c "Print CFBundleExecutable" "${e.join(c, "Contents", "Info.plist")}"`, m = x(n, { encoding: "utf8", stdio: "pipe" }).trim(), a = e.join(c, "Contents", "MacOS", m);
        if (g.existsSync(a)) {
          const f = e.basename(c, ".app");
          o.push({ name: f, path: a }), console.log(`Found macOS browser: ${f} at ${a}`);
        }
      }
    } catch {
    }
  return o;
}
function b() {
  var c;
  const o = [], t = [
    "HKEY_CURRENT_USER\\Software\\Clients\\StartMenuInternet",
    "HKEY_LOCAL_MACHINE\\Software\\Clients\\StartMenuInternet"
  ], i = [
    // Chrome
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    { path: process.env["ProgramFiles(x86)"] ? e.join(process.env["ProgramFiles(x86)"], "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    // Firefox
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    { path: process.env["ProgramFiles(x86)"] ? e.join(process.env["ProgramFiles(x86)"], "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    // Edge
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    { path: process.env["ProgramFiles(x86)"] ? e.join(process.env["ProgramFiles(x86)"], "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    // Opera (Add opera.exe check in AppData)
    { path: process.env.LOCALAPPDATA ? e.join(process.env.LOCALAPPDATA, "Programs\\Opera\\opera.exe") : null, nameHint: "Opera" },
    { path: process.env.LOCALAPPDATA ? e.join(process.env.LOCALAPPDATA, "Programs\\Opera\\launcher.exe") : null, nameHint: "Opera" },
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "Opera\\launcher.exe") : null, nameHint: "Opera" },
    // Brave
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    { path: process.env["ProgramFiles(x86)"] ? e.join(process.env["ProgramFiles(x86)"], "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    // Vivaldi
    { path: process.env.LOCALAPPDATA ? e.join(process.env.LOCALAPPDATA, "Vivaldi\\Application\\vivaldi.exe") : null, nameHint: "Vivaldi" },
    // Internet Explorer
    { path: process.env.ProgramFiles ? e.join(process.env.ProgramFiles, "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" },
    { path: process.env["ProgramFiles(x86)"] ? e.join(process.env["ProgramFiles(x86)"], "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" }
  ].filter((s) => s.path !== null), r = /* @__PURE__ */ new Set();
  for (const s of i) {
    const n = s.path;
    if (g.existsSync(n) && !r.has(n)) {
      e.basename(e.dirname(n));
      const m = e.basename(e.dirname(e.dirname(n)));
      let a = s.nameHint || (m !== "Application" && m !== "Default" ? m : e.basename(n, ".exe"));
      a = a.replace(/\.exe$/i, ""), console.log(`[Detector] Common Path Found: Path=${n}, Derived Name=${a}`), o.push({ name: a, path: n }), r.add(n);
    }
  }
  for (const s of t)
    try {
      const n = `reg query "${s}" /s`, a = x(n, { encoding: "utf8", stdio: "pipe", maxBuffer: 1024 * 1024 * 5 }).split(`\r
`);
      let f = "";
      for (const u of a)
        if (u.startsWith("HKEY_"))
          f = u.trim();
        else if (u.includes("(Default)") && u.includes(".exe")) {
          const v = u.match(/REG_SZ\s+(.*\.exe)/), l = (c = v == null ? void 0 : v[1]) == null ? void 0 : c.trim();
          if (l && g.existsSync(l) && !r.has(l)) {
            const P = f.split("\\");
            let h = P[P.length - 1] || e.basename(l, ".exe");
            h = h.replace(/\s+Stable$/i, "").replace(/\s+Beta$/i, "").replace(/\s+Canary$/i, "").replace(/\s+Developer Edition$/i, ""), console.log(`[Detector] Registry Found: Path=${l}, Derived Name=${h}`), o.push({ name: h, path: l }), r.add(l);
          }
        }
    } catch (n) {
      console.warn(`Could not query Windows registry key ${s}:`, n);
    }
  const p = [], d = /* @__PURE__ */ new Set();
  for (const s of o)
    d.has(s.path) || (p.push(s), d.add(s.path));
  return p;
}
function y() {
  const o = [], t = ["google-chrome", "google-chrome-stable", "firefox", "microsoft-edge", "brave-browser", "opera", "vivaldi-stable"];
  for (const i of t)
    try {
      const r = x(`which ${i}`, { encoding: "utf8", stdio: "pipe" }).trim();
      if (r && g.existsSync(r)) {
        const p = i.replace("-stable", "").replace("-browser", "");
        o.push({ name: p, path: r }), console.log(`Found Linux browser: ${p} at ${r}`);
      }
    } catch {
    }
  return o;
}
export {
  E as detectBrowsersWithIcons
};
