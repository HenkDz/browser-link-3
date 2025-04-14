var _l = Object.defineProperty;
var Ga = (e) => {
  throw TypeError(e);
};
var wl = (e, t, s) => t in e ? _l(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var jt = (e, t, s) => wl(e, typeof t != "symbol" ? t + "" : t, s), Ka = (e, t, s) => t.has(e) || Ga("Cannot " + s);
var pe = (e, t, s) => (Ka(e, t, "read from private field"), s ? s.call(e) : t.get(e)), Ct = (e, t, s) => t.has(e) ? Ga("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), kt = (e, t, s, r) => (Ka(e, t, "write to private field"), r ? r.call(e, s) : t.set(e, s), s);
import Bu, { app as Ee, Notification as Ha, dialog as Ba, BrowserWindow as Wu, shell as xu, Menu as Wa, ipcMain as Xe } from "electron";
import Q from "node:path";
import { fileURLToPath as Fn } from "node:url";
import ue from "node:process";
import { Buffer as El } from "node:buffer";
import bl, { execFile as Vn, execSync as Ut } from "node:child_process";
import wa, { constants as Ju } from "node:fs/promises";
import Gt from "node:os";
import ee from "node:fs";
import { promisify as ge, isDeepStrictEqual as Sl } from "node:util";
import qt from "node:crypto";
import Pl from "node:assert";
import { randomFillSync as Rl, randomUUID as Nl } from "crypto";
let as;
function Il() {
  try {
    return ee.statSync("/.dockerenv"), !0;
  } catch {
    return !1;
  }
}
function Ol() {
  try {
    return ee.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
  } catch {
    return !1;
  }
}
function Tl() {
  return as === void 0 && (as = Il() || Ol()), as;
}
let os;
const Al = () => {
  try {
    return ee.statSync("/run/.containerenv"), !0;
  } catch {
    return !1;
  }
};
function Ea() {
  return os === void 0 && (os = Al() || Tl()), os;
}
const xa = () => {
  if (ue.platform !== "linux")
    return !1;
  if (Gt.release().toLowerCase().includes("microsoft"))
    return !Ea();
  try {
    return ee.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !Ea() : !1;
  } catch {
    return !1;
  }
}, Tn = ue.env.__IS_WSL_TEST__ ? xa : xa();
function Kt(e, t, s) {
  const r = (l) => Object.defineProperty(e, t, { value: l, enumerable: !0, writable: !0 });
  return Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    get() {
      const l = s();
      return r(l), l;
    },
    set(l) {
      r(l);
    }
  }), e;
}
const jl = ge(Vn);
async function Cl() {
  if (ue.platform !== "darwin")
    throw new Error("macOS only");
  const { stdout: e } = await jl("defaults", ["read", "com.apple.LaunchServices/com.apple.launchservices.secure", "LSHandlers"]), t = /LSHandlerRoleAll = "(?!-)(?<id>[^"]+?)";\s+?LSHandlerURLScheme = (?:http|https);/.exec(e);
  return (t == null ? void 0 : t.groups.id) ?? "com.apple.Safari";
}
const kl = ge(Vn);
async function ql(e, { humanReadableOutput: t = !0 } = {}) {
  if (ue.platform !== "darwin")
    throw new Error("macOS only");
  const s = t ? [] : ["-ss"], { stdout: r } = await kl("osascript", ["-e", e, s]);
  return r.trim();
}
async function Dl(e) {
  return ql(`tell application "Finder" to set app_path to application file id "${e}" as string
tell application "System Events" to get value of property list item "CFBundleName" of property list file (app_path & ":Contents:Info.plist")`);
}
const Ml = ge(Vn), Ll = {
  AppXq0fevzme2pys62n3e0fbqa7peapykr8v: { name: "Edge", id: "com.microsoft.edge.old" },
  MSEdgeDHTML: { name: "Edge", id: "com.microsoft.edge" },
  // On macOS, it's "com.microsoft.edgemac"
  MSEdgeHTM: { name: "Edge", id: "com.microsoft.edge" },
  // Newer Edge/Win10 releases
  "IE.HTTP": { name: "Internet Explorer", id: "com.microsoft.ie" },
  FirefoxURL: { name: "Firefox", id: "org.mozilla.firefox" },
  ChromeHTML: { name: "Chrome", id: "com.google.chrome" },
  BraveHTML: { name: "Brave", id: "com.brave.Browser" },
  BraveBHTML: { name: "Brave Beta", id: "com.brave.Browser.beta" },
  BraveSSHTM: { name: "Brave Nightly", id: "com.brave.Browser.nightly" }
};
class Ja extends Error {
}
async function Fl(e = Ml) {
  const { stdout: t } = await e("reg", [
    "QUERY",
    " HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice",
    "/v",
    "ProgId"
  ]), s = /ProgId\s*REG_SZ\s*(?<id>\S+)/.exec(t);
  if (!s)
    throw new Ja(`Cannot find Windows browser in stdout: ${JSON.stringify(t)}`);
  const { id: r } = s.groups, l = Ll[r];
  if (!l)
    throw new Ja(`Unknown browser ID: ${r}`);
  return l;
}
const Vl = ge(Vn), Ul = (e) => e.toLowerCase().replaceAll(/(?:^|\s|-)\S/g, (t) => t.toUpperCase());
async function zl() {
  if (ue.platform === "darwin") {
    const e = await Cl();
    return { name: await Dl(e), id: e };
  }
  if (ue.platform === "linux") {
    const { stdout: e } = await Vl("xdg-mime", ["query", "default", "x-scheme-handler/http"]), t = e.trim();
    return { name: Ul(t.replace(/.desktop$/, "").replace("-", " ")), id: t };
  }
  if (ue.platform === "win32")
    return Fl();
  throw new Error("Only macOS, Linux, and Windows are supported");
}
const ba = Q.dirname(Fn(import.meta.url)), Xa = Q.join(ba, "xdg-open"), { platform: Rt, arch: Ya } = ue, Gl = /* @__PURE__ */ (() => {
  const e = "/mnt/";
  let t;
  return async function() {
    if (t)
      return t;
    const s = "/etc/wsl.conf";
    let r = !1;
    try {
      await wa.access(s, Ju.F_OK), r = !0;
    } catch {
    }
    if (!r)
      return e;
    const l = await wa.readFile(s, { encoding: "utf8" }), n = new RegExp("(?<!#.*)root\\s*=\\s*(?<mountPoint>.*)", "g").exec(l);
    return n ? (t = n.groups.mountPoint.trim(), t = t.endsWith("/") ? t : `${t}/`, t) : e;
  };
})(), Za = async (e, t) => {
  let s;
  for (const r of e)
    try {
      return await t(r);
    } catch (l) {
      s = l;
    }
  throw s;
}, An = async (e) => {
  if (e = {
    wait: !1,
    background: !1,
    newInstance: !1,
    allowNonzeroExitCode: !1,
    ...e
  }, Array.isArray(e.app))
    return Za(e.app, (o) => An({
      ...e,
      app: o
    }));
  let { name: t, arguments: s = [] } = e.app ?? {};
  if (s = [...s], Array.isArray(t))
    return Za(t, (o) => An({
      ...e,
      app: {
        name: o,
        arguments: s
      }
    }));
  if (t === "browser" || t === "browserPrivate") {
    const o = {
      "com.google.chrome": "chrome",
      "google-chrome.desktop": "chrome",
      "org.mozilla.firefox": "firefox",
      "firefox.desktop": "firefox",
      "com.microsoft.msedge": "edge",
      "com.microsoft.edge": "edge",
      "microsoft-edge.desktop": "edge"
    }, u = {
      chrome: "--incognito",
      firefox: "--private-window",
      edge: "--inPrivate"
    }, p = await zl();
    if (p.id in o) {
      const c = o[p.id];
      return t === "browserPrivate" && s.push(u[c]), An({
        ...e,
        app: {
          name: It[c],
          arguments: s
        }
      });
    }
    throw new Error(`${p.name} is not supported as a default browser`);
  }
  let r;
  const l = [], n = {};
  if (Rt === "darwin")
    r = "open", e.wait && l.push("--wait-apps"), e.background && l.push("--background"), e.newInstance && l.push("--new"), t && l.push("-a", t);
  else if (Rt === "win32" || Tn && !Ea() && !t) {
    const o = await Gl();
    r = Tn ? `${o}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe` : `${ue.env.SYSTEMROOT || ue.env.windir || "C:\\Windows"}\\System32\\WindowsPowerShell\\v1.0\\powershell`, l.push(
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-EncodedCommand"
    ), Tn || (n.windowsVerbatimArguments = !0);
    const u = ["Start"];
    e.wait && u.push("-Wait"), t ? (u.push(`"\`"${t}\`""`), e.target && s.push(e.target)) : e.target && u.push(`"${e.target}"`), s.length > 0 && (s = s.map((p) => `"\`"${p}\`""`), u.push("-ArgumentList", s.join(","))), e.target = El.from(u.join(" "), "utf16le").toString("base64");
  } else {
    if (t)
      r = t;
    else {
      const o = !ba || ba === "/";
      let u = !1;
      try {
        await wa.access(Xa, Ju.X_OK), u = !0;
      } catch {
      }
      r = ue.versions.electron ?? (Rt === "android" || o || !u) ? "xdg-open" : Xa;
    }
    s.length > 0 && l.push(...s), e.wait || (n.stdio = "ignore", n.detached = !0);
  }
  Rt === "darwin" && s.length > 0 && l.push("--args", ...s), e.target && l.push(e.target);
  const i = bl.spawn(r, l, n);
  return e.wait ? new Promise((o, u) => {
    i.once("error", u), i.once("close", (p) => {
      if (!e.allowNonzeroExitCode && p > 0) {
        u(new Error(`Exited with code ${p}`));
        return;
      }
      o(i);
    });
  }) : (i.unref(), i);
}, Kl = (e, t) => {
  if (typeof e != "string")
    throw new TypeError("Expected a `target`");
  return An({
    ...t,
    target: e
  });
};
function Qa(e) {
  if (typeof e == "string" || Array.isArray(e))
    return e;
  const { [Ya]: t } = e;
  if (!t)
    throw new Error(`${Ya} is not supported`);
  return t;
}
function Pa({ [Rt]: e }, { wsl: t }) {
  if (t && Tn)
    return Qa(t);
  if (!e)
    throw new Error(`${Rt} is not supported`);
  return Qa(e);
}
const It = {};
Kt(It, "chrome", () => Pa({
  darwin: "google chrome",
  win32: "chrome",
  linux: ["google-chrome", "google-chrome-stable", "chromium"]
}, {
  wsl: {
    ia32: "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    x64: ["/mnt/c/Program Files/Google/Chrome/Application/chrome.exe", "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"]
  }
}));
Kt(It, "firefox", () => Pa({
  darwin: "firefox",
  win32: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
  linux: "firefox"
}, {
  wsl: "/mnt/c/Program Files/Mozilla Firefox/firefox.exe"
}));
Kt(It, "edge", () => Pa({
  darwin: "microsoft edge",
  win32: "msedge",
  linux: ["microsoft-edge", "microsoft-edge-dev"]
}, {
  wsl: "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
}));
Kt(It, "browser", () => "browser");
Kt(It, "browserPrivate", () => "browserPrivate");
const yt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, is = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Hl = new Set("0123456789");
function Un(e) {
  const t = [];
  let s = "", r = "start", l = !1;
  for (const n of e)
    switch (n) {
      case "\\": {
        if (r === "index")
          throw new Error("Invalid character in an index");
        if (r === "indexEnd")
          throw new Error("Invalid character after an index");
        l && (s += n), r = "property", l = !l;
        break;
      }
      case ".": {
        if (r === "index")
          throw new Error("Invalid character in an index");
        if (r === "indexEnd") {
          r = "property";
          break;
        }
        if (l) {
          l = !1, s += n;
          break;
        }
        if (is.has(s))
          return [];
        t.push(s), s = "", r = "property";
        break;
      }
      case "[": {
        if (r === "index")
          throw new Error("Invalid character in an index");
        if (r === "indexEnd") {
          r = "index";
          break;
        }
        if (l) {
          l = !1, s += n;
          break;
        }
        if (r === "property") {
          if (is.has(s))
            return [];
          t.push(s), s = "";
        }
        r = "index";
        break;
      }
      case "]": {
        if (r === "index") {
          t.push(Number.parseInt(s, 10)), s = "", r = "indexEnd";
          break;
        }
        if (r === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (r === "index" && !Hl.has(n))
          throw new Error("Invalid character in an index");
        if (r === "indexEnd")
          throw new Error("Invalid character after an index");
        r === "start" && (r = "property"), l && (l = !1, s += "\\"), s += n;
      }
    }
  switch (l && (s += "\\"), r) {
    case "property": {
      if (is.has(s))
        return [];
      t.push(s);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function Ra(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const s = Number.parseInt(t, 10);
    return Number.isInteger(s) && e[s] === e[t];
  }
  return !1;
}
function Xu(e, t) {
  if (Ra(e, t))
    throw new Error("Cannot use string index");
}
function Bl(e, t, s) {
  if (!yt(e) || typeof t != "string")
    return s === void 0 ? e : s;
  const r = Un(t);
  if (r.length === 0)
    return s;
  for (let l = 0; l < r.length; l++) {
    const n = r[l];
    if (Ra(e, n) ? e = l === r.length - 1 ? void 0 : null : e = e[n], e == null) {
      if (l !== r.length - 1)
        return s;
      break;
    }
  }
  return e === void 0 ? s : e;
}
function eo(e, t, s) {
  if (!yt(e) || typeof t != "string")
    return e;
  const r = e, l = Un(t);
  for (let n = 0; n < l.length; n++) {
    const i = l[n];
    Xu(e, i), n === l.length - 1 ? e[i] = s : yt(e[i]) || (e[i] = typeof l[n + 1] == "number" ? [] : {}), e = e[i];
  }
  return r;
}
function Wl(e, t) {
  if (!yt(e) || typeof t != "string")
    return !1;
  const s = Un(t);
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    if (Xu(e, l), r === s.length - 1)
      return delete e[l], !0;
    if (e = e[l], !yt(e))
      return !1;
  }
}
function xl(e, t) {
  if (!yt(e) || typeof t != "string")
    return !1;
  const s = Un(t);
  if (s.length === 0)
    return !1;
  for (const r of s) {
    if (!yt(e) || !(r in e) || Ra(e, r))
      return !1;
    e = e[r];
  }
  return !0;
}
const st = Gt.homedir(), Na = Gt.tmpdir(), { env: Nt } = ue, Jl = (e) => {
  const t = Q.join(st, "Library");
  return {
    data: Q.join(t, "Application Support", e),
    config: Q.join(t, "Preferences", e),
    cache: Q.join(t, "Caches", e),
    log: Q.join(t, "Logs", e),
    temp: Q.join(Na, e)
  };
}, Xl = (e) => {
  const t = Nt.APPDATA || Q.join(st, "AppData", "Roaming"), s = Nt.LOCALAPPDATA || Q.join(st, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: Q.join(s, e, "Data"),
    config: Q.join(t, e, "Config"),
    cache: Q.join(s, e, "Cache"),
    log: Q.join(s, e, "Log"),
    temp: Q.join(Na, e)
  };
}, Yl = (e) => {
  const t = Q.basename(st);
  return {
    data: Q.join(Nt.XDG_DATA_HOME || Q.join(st, ".local", "share"), e),
    config: Q.join(Nt.XDG_CONFIG_HOME || Q.join(st, ".config"), e),
    cache: Q.join(Nt.XDG_CACHE_HOME || Q.join(st, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: Q.join(Nt.XDG_STATE_HOME || Q.join(st, ".local", "state"), e),
    temp: Q.join(Na, t, e)
  };
};
function Zl(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ue.platform === "darwin" ? Jl(e) : ue.platform === "win32" ? Xl(e) : Yl(e);
}
const Qe = (e, t) => function(...r) {
  return e.apply(void 0, r).catch(t);
}, Ge = (e, t) => function(...r) {
  try {
    return e.apply(void 0, r);
  } catch (l) {
    return t(l);
  }
}, Ql = ue.getuid ? !ue.getuid() : !1, ed = 1e4, Oe = () => {
}, ye = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ye.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Ql && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ye.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ye.isNodeError(e))
      throw e;
    if (!ye.isChangeErrorOk(e))
      throw e;
  }
};
class td {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = ed, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (t) => {
      this.queueWaiting.add(t), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (t) => {
      this.queueWaiting.delete(t), this.queueActive.delete(t);
    }, this.schedule = () => new Promise((t) => {
      const s = () => this.remove(r), r = () => t(s);
      this.add(r);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const t of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(t), this.queueActive.add(t), t();
        }
      }
    };
  }
}
const rd = new td(), et = (e, t) => function(r) {
  return function l(...n) {
    return rd.schedule().then((i) => {
      const o = (p) => (i(), p), u = (p) => {
        if (i(), Date.now() >= r)
          throw p;
        if (t(p)) {
          const c = Math.round(100 * Math.random());
          return new Promise((w) => setTimeout(w, c)).then(() => l.apply(void 0, n));
        }
        throw p;
      };
      return e.apply(void 0, n).then(o, u);
    });
  };
}, tt = (e, t) => function(r) {
  return function l(...n) {
    try {
      return e.apply(void 0, n);
    } catch (i) {
      if (Date.now() > r)
        throw i;
      if (t(i))
        return l.apply(void 0, n);
      throw i;
    }
  };
}, be = {
  attempt: {
    /* ASYNC */
    chmod: Qe(ge(ee.chmod), ye.onChangeError),
    chown: Qe(ge(ee.chown), ye.onChangeError),
    close: Qe(ge(ee.close), Oe),
    fsync: Qe(ge(ee.fsync), Oe),
    mkdir: Qe(ge(ee.mkdir), Oe),
    realpath: Qe(ge(ee.realpath), Oe),
    stat: Qe(ge(ee.stat), Oe),
    unlink: Qe(ge(ee.unlink), Oe),
    /* SYNC */
    chmodSync: Ge(ee.chmodSync, ye.onChangeError),
    chownSync: Ge(ee.chownSync, ye.onChangeError),
    closeSync: Ge(ee.closeSync, Oe),
    existsSync: Ge(ee.existsSync, Oe),
    fsyncSync: Ge(ee.fsync, Oe),
    mkdirSync: Ge(ee.mkdirSync, Oe),
    realpathSync: Ge(ee.realpathSync, Oe),
    statSync: Ge(ee.statSync, Oe),
    unlinkSync: Ge(ee.unlinkSync, Oe)
  },
  retry: {
    /* ASYNC */
    close: et(ge(ee.close), ye.isRetriableError),
    fsync: et(ge(ee.fsync), ye.isRetriableError),
    open: et(ge(ee.open), ye.isRetriableError),
    readFile: et(ge(ee.readFile), ye.isRetriableError),
    rename: et(ge(ee.rename), ye.isRetriableError),
    stat: et(ge(ee.stat), ye.isRetriableError),
    write: et(ge(ee.write), ye.isRetriableError),
    writeFile: et(ge(ee.writeFile), ye.isRetriableError),
    /* SYNC */
    closeSync: tt(ee.closeSync, ye.isRetriableError),
    fsyncSync: tt(ee.fsyncSync, ye.isRetriableError),
    openSync: tt(ee.openSync, ye.isRetriableError),
    readFileSync: tt(ee.readFileSync, ye.isRetriableError),
    renameSync: tt(ee.renameSync, ye.isRetriableError),
    statSync: tt(ee.statSync, ye.isRetriableError),
    writeSync: tt(ee.writeSync, ye.isRetriableError),
    writeFileSync: tt(ee.writeFileSync, ye.isRetriableError)
  }
}, nd = "utf8", to = 438, sd = 511, ad = {}, od = Gt.userInfo().uid, id = Gt.userInfo().gid, cd = 1e3, ud = !!ue.getuid;
ue.getuid && ue.getuid();
const ro = 128, ld = (e) => e instanceof Error && "code" in e, no = (e) => typeof e == "string", cs = (e) => e === void 0, dd = ue.platform === "linux", Yu = ue.platform === "win32", Ia = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Yu || Ia.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
dd && Ia.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class fd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const s of this.callbacks)
          s();
        t && (Yu && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ue.kill(ue.pid, "SIGTERM") : ue.kill(ue.pid, t));
      }
    }, this.hook = () => {
      ue.once("exit", () => this.exit());
      for (const t of Ia)
        try {
          ue.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const hd = new fd(), md = hd.register, Se = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), l = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${l}`;
  },
  get: (e, t, s = !0) => {
    const r = Se.truncate(t(e));
    return r in Se.store ? Se.get(e, t, s) : (Se.store[r] = s, [r, () => delete Se.store[r]]);
  },
  purge: (e) => {
    Se.store[e] && (delete Se.store[e], be.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Se.store[e] && (delete Se.store[e], be.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Se.store)
      Se.purgeSync(e);
  },
  truncate: (e) => {
    const t = Q.basename(e);
    if (t.length <= ro)
      return e;
    const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!s)
      return e;
    const r = t.length - ro;
    return `${e.slice(0, -t.length)}${s[1]}${s[2].slice(0, -r)}${s[3]}`;
  }
};
md(Se.purgeSyncAll);
function Zu(e, t, s = ad) {
  if (no(s))
    return Zu(e, t, { encoding: s });
  const r = Date.now() + ((s.timeout ?? cd) || -1);
  let l = null, n = null, i = null;
  try {
    const o = be.attempt.realpathSync(e), u = !!o;
    e = o || e, [n, l] = Se.get(e, s.tmpCreate || Se.create, s.tmpPurge !== !1);
    const p = ud && cs(s.chown), c = cs(s.mode);
    if (u && (p || c)) {
      const $ = be.attempt.statSync(e);
      $ && (s = { ...s }, p && (s.chown = { uid: $.uid, gid: $.gid }), c && (s.mode = $.mode));
    }
    if (!u) {
      const $ = Q.dirname(e);
      be.attempt.mkdirSync($, {
        mode: sd,
        recursive: !0
      });
    }
    i = be.retry.openSync(r)(n, "w", s.mode || to), s.tmpCreated && s.tmpCreated(n), no(t) ? be.retry.writeSync(r)(i, t, 0, s.encoding || nd) : cs(t) || be.retry.writeSync(r)(i, t, 0, t.length, 0), s.fsync !== !1 && (s.fsyncWait !== !1 ? be.retry.fsyncSync(r)(i) : be.attempt.fsync(i)), be.retry.closeSync(r)(i), i = null, s.chown && (s.chown.uid !== od || s.chown.gid !== id) && be.attempt.chownSync(n, s.chown.uid, s.chown.gid), s.mode && s.mode !== to && be.attempt.chmodSync(n, s.mode);
    try {
      be.retry.renameSync(r)(n, e);
    } catch ($) {
      if (!ld($) || $.code !== "ENAMETOOLONG")
        throw $;
      be.retry.renameSync(r)(n, Se.truncate(e));
    }
    l(), n = null;
  } finally {
    i && be.attempt.closeSync(i), n && Se.purge(n);
  }
}
function Qu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Bt = { exports: {} }, us = {}, Ke = {}, lt = {}, ls = {}, ds = {}, fs = {}, so;
function qn() {
  return so || (so = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(a) {
        if (super(), !e.IDENTIFIER.test(a))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(a) {
        super(), this._items = typeof a == "string" ? [a] : a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const a = this._items[0];
        return a === "" || a === '""';
      }
      get str() {
        var a;
        return (a = this._str) !== null && a !== void 0 ? a : this._str = this._items.reduce((h, _) => `${h}${_}`, "");
      }
      get names() {
        var a;
        return (a = this._names) !== null && a !== void 0 ? a : this._names = this._items.reduce((h, _) => (_ instanceof s && (h[_.str] = (h[_.str] || 0) + 1), h), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(f, ...a) {
      const h = [f[0]];
      let _ = 0;
      for (; _ < a.length; )
        o(h, a[_]), h.push(f[++_]);
      return new r(h);
    }
    e._ = l;
    const n = new r("+");
    function i(f, ...a) {
      const h = [E(f[0])];
      let _ = 0;
      for (; _ < a.length; )
        h.push(n), o(h, a[_]), h.push(n, E(f[++_]));
      return u(h), new r(h);
    }
    e.str = i;
    function o(f, a) {
      a instanceof r ? f.push(...a._items) : a instanceof s ? f.push(a) : f.push($(a));
    }
    e.addCodeArg = o;
    function u(f) {
      let a = 1;
      for (; a < f.length - 1; ) {
        if (f[a] === n) {
          const h = p(f[a - 1], f[a + 1]);
          if (h !== void 0) {
            f.splice(a - 1, 3, h);
            continue;
          }
          f[a++] = "+";
        }
        a++;
      }
    }
    function p(f, a) {
      if (a === '""')
        return f;
      if (f === '""')
        return a;
      if (typeof f == "string")
        return a instanceof s || f[f.length - 1] !== '"' ? void 0 : typeof a != "string" ? `${f.slice(0, -1)}${a}"` : a[0] === '"' ? f.slice(0, -1) + a.slice(1) : void 0;
      if (typeof a == "string" && a[0] === '"' && !(f instanceof s))
        return `"${f}${a.slice(1)}`;
    }
    function c(f, a) {
      return a.emptyStr() ? f : f.emptyStr() ? a : i`${f}${a}`;
    }
    e.strConcat = c;
    function $(f) {
      return typeof f == "number" || typeof f == "boolean" || f === null ? f : E(Array.isArray(f) ? f.join(",") : f);
    }
    function w(f) {
      return new r(E(f));
    }
    e.stringify = w;
    function E(f) {
      return JSON.stringify(f).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = E;
    function S(f) {
      return typeof f == "string" && e.IDENTIFIER.test(f) ? new r(`.${f}`) : l`[${f}]`;
    }
    e.getProperty = S;
    function g(f) {
      if (typeof f == "string" && e.IDENTIFIER.test(f))
        return new r(`${f}`);
      throw new Error(`CodeGen: invalid export name: ${f}, use explicit $id name mapping`);
    }
    e.getEsmExportName = g;
    function d(f) {
      return new r(f.toString());
    }
    e.regexpCode = d;
  }(fs)), fs;
}
var hs = {}, ao;
function oo() {
  return ao || (ao = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = qn();
    class s extends Error {
      constructor(p) {
        super(`CodeGen: "code" for ${p} not defined`), this.value = p.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: p, parent: c } = {}) {
        this._names = {}, this._prefixes = p, this._parent = c;
      }
      toName(p) {
        return p instanceof t.Name ? p : this.name(p);
      }
      name(p) {
        return new t.Name(this._newName(p));
      }
      _newName(p) {
        const c = this._names[p] || this._nameGroup(p);
        return `${p}${c.index++}`;
      }
      _nameGroup(p) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(p) || this._prefixes && !this._prefixes.has(p))
          throw new Error(`CodeGen: prefix "${p}" is not allowed in this scope`);
        return this._names[p] = { prefix: p, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(p, c) {
        super(c), this.prefix = p;
      }
      setValue(p, { property: c, itemIndex: $ }) {
        this.value = p, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class o extends l {
      constructor(p) {
        super(p), this._values = {}, this._scope = p.scope, this.opts = { ...p, _n: p.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(p) {
        return new n(p, this._newName(p));
      }
      value(p, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const w = this.toName(p), { prefix: E } = w, S = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let g = this._values[E];
        if (g) {
          const a = g.get(S);
          if (a)
            return a;
        } else
          g = this._values[E] = /* @__PURE__ */ new Map();
        g.set(S, w);
        const d = this._scope[E] || (this._scope[E] = []), f = d.length;
        return d[f] = c.ref, w.setValue(c, { property: E, itemIndex: f }), w;
      }
      getValue(p, c) {
        const $ = this._values[p];
        if ($)
          return $.get(c);
      }
      scopeRefs(p, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${p}${$.scopePath}`;
        });
      }
      scopeCode(p = this._values, c, $) {
        return this._reduceValues(p, (w) => {
          if (w.value === void 0)
            throw new Error(`CodeGen: name "${w}" has no value`);
          return w.value.code;
        }, c, $);
      }
      _reduceValues(p, c, $ = {}, w) {
        let E = t.nil;
        for (const S in p) {
          const g = p[S];
          if (!g)
            continue;
          const d = $[S] = $[S] || /* @__PURE__ */ new Map();
          g.forEach((f) => {
            if (d.has(f))
              return;
            d.set(f, r.Started);
            let a = c(f);
            if (a) {
              const h = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              E = (0, t._)`${E}${h} ${f} = ${a};${this.opts._n}`;
            } else if (a = w == null ? void 0 : w(f))
              E = (0, t._)`${E}${a}${this.opts._n}`;
            else
              throw new s(f);
            d.set(f, r.Completed);
          });
        }
        return E;
      }
    }
    e.ValueScope = o;
  }(hs)), hs;
}
var io;
function te() {
  return io || (io = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = qn(), s = oo();
    var r = qn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = oo();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(m, b) {
        return this;
      }
    }
    class i extends n {
      constructor(m, b, A) {
        super(), this.varKind = m, this.name = b, this.rhs = A;
      }
      render({ es5: m, _n: b }) {
        const A = m ? s.varKinds.var : this.varKind, G = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${A} ${this.name}${G};` + b;
      }
      optimizeNames(m, b) {
        if (m[this.name.str])
          return this.rhs && (this.rhs = L(this.rhs, m, b)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class o extends n {
      constructor(m, b, A) {
        super(), this.lhs = m, this.rhs = b, this.sideEffects = A;
      }
      render({ _n: m }) {
        return `${this.lhs} = ${this.rhs};` + m;
      }
      optimizeNames(m, b) {
        if (!(this.lhs instanceof t.Name && !m[this.lhs.str] && !this.sideEffects))
          return this.rhs = L(this.rhs, m, b), this;
      }
      get names() {
        const m = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(m, this.rhs);
      }
    }
    class u extends o {
      constructor(m, b, A, G) {
        super(m, A, G), this.op = b;
      }
      render({ _n: m }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + m;
      }
    }
    class p extends n {
      constructor(m) {
        super(), this.label = m, this.names = {};
      }
      render({ _n: m }) {
        return `${this.label}:` + m;
      }
    }
    class c extends n {
      constructor(m) {
        super(), this.label = m, this.names = {};
      }
      render({ _n: m }) {
        return `break${this.label ? ` ${this.label}` : ""};` + m;
      }
    }
    class $ extends n {
      constructor(m) {
        super(), this.error = m;
      }
      render({ _n: m }) {
        return `throw ${this.error};` + m;
      }
      get names() {
        return this.error.names;
      }
    }
    class w extends n {
      constructor(m) {
        super(), this.code = m;
      }
      render({ _n: m }) {
        return `${this.code};` + m;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(m, b) {
        return this.code = L(this.code, m, b), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class E extends n {
      constructor(m = []) {
        super(), this.nodes = m;
      }
      render(m) {
        return this.nodes.reduce((b, A) => b + A.render(m), "");
      }
      optimizeNodes() {
        const { nodes: m } = this;
        let b = m.length;
        for (; b--; ) {
          const A = m[b].optimizeNodes();
          Array.isArray(A) ? m.splice(b, 1, ...A) : A ? m[b] = A : m.splice(b, 1);
        }
        return m.length > 0 ? this : void 0;
      }
      optimizeNames(m, b) {
        const { nodes: A } = this;
        let G = A.length;
        for (; G--; ) {
          const H = A[G];
          H.optimizeNames(m, b) || (V(m, H.names), A.splice(G, 1));
        }
        return A.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((m, b) => U(m, b.names), {});
      }
    }
    class S extends E {
      render(m) {
        return "{" + m._n + super.render(m) + "}" + m._n;
      }
    }
    class g extends E {
    }
    class d extends S {
    }
    d.kind = "else";
    class f extends S {
      constructor(m, b) {
        super(b), this.condition = m;
      }
      render(m) {
        let b = `if(${this.condition})` + super.render(m);
        return this.else && (b += "else " + this.else.render(m)), b;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const m = this.condition;
        if (m === !0)
          return this.nodes;
        let b = this.else;
        if (b) {
          const A = b.optimizeNodes();
          b = this.else = Array.isArray(A) ? new d(A) : A;
        }
        if (b)
          return m === !1 ? b instanceof f ? b : b.nodes : this.nodes.length ? this : new f(x(m), b instanceof f ? [b] : b.nodes);
        if (!(m === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(m, b) {
        var A;
        if (this.else = (A = this.else) === null || A === void 0 ? void 0 : A.optimizeNames(m, b), !!(super.optimizeNames(m, b) || this.else))
          return this.condition = L(this.condition, m, b), this;
      }
      get names() {
        const m = super.names;
        return z(m, this.condition), this.else && U(m, this.else.names), m;
      }
    }
    f.kind = "if";
    class a extends S {
    }
    a.kind = "for";
    class h extends a {
      constructor(m) {
        super(), this.iteration = m;
      }
      render(m) {
        return `for(${this.iteration})` + super.render(m);
      }
      optimizeNames(m, b) {
        if (super.optimizeNames(m, b))
          return this.iteration = L(this.iteration, m, b), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class _ extends a {
      constructor(m, b, A, G) {
        super(), this.varKind = m, this.name = b, this.from = A, this.to = G;
      }
      render(m) {
        const b = m.es5 ? s.varKinds.var : this.varKind, { name: A, from: G, to: H } = this;
        return `for(${b} ${A}=${G}; ${A}<${H}; ${A}++)` + super.render(m);
      }
      get names() {
        const m = z(super.names, this.from);
        return z(m, this.to);
      }
    }
    class v extends a {
      constructor(m, b, A, G) {
        super(), this.loop = m, this.varKind = b, this.name = A, this.iterable = G;
      }
      render(m) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(m);
      }
      optimizeNames(m, b) {
        if (super.optimizeNames(m, b))
          return this.iterable = L(this.iterable, m, b), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class y extends S {
      constructor(m, b, A) {
        super(), this.name = m, this.args = b, this.async = A;
      }
      render(m) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(m);
      }
    }
    y.kind = "func";
    class P extends E {
      render(m) {
        return "return " + super.render(m);
      }
    }
    P.kind = "return";
    class T extends S {
      render(m) {
        let b = "try" + super.render(m);
        return this.catch && (b += this.catch.render(m)), this.finally && (b += this.finally.render(m)), b;
      }
      optimizeNodes() {
        var m, b;
        return super.optimizeNodes(), (m = this.catch) === null || m === void 0 || m.optimizeNodes(), (b = this.finally) === null || b === void 0 || b.optimizeNodes(), this;
      }
      optimizeNames(m, b) {
        var A, G;
        return super.optimizeNames(m, b), (A = this.catch) === null || A === void 0 || A.optimizeNames(m, b), (G = this.finally) === null || G === void 0 || G.optimizeNames(m, b), this;
      }
      get names() {
        const m = super.names;
        return this.catch && U(m, this.catch.names), this.finally && U(m, this.finally.names), m;
      }
    }
    class q extends S {
      constructor(m) {
        super(), this.error = m;
      }
      render(m) {
        return `catch(${this.error})` + super.render(m);
      }
    }
    q.kind = "catch";
    class F extends S {
      render(m) {
        return "finally" + super.render(m);
      }
    }
    F.kind = "finally";
    class D {
      constructor(m, b = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...b, _n: b.lines ? `
` : "" }, this._extScope = m, this._scope = new s.Scope({ parent: m }), this._nodes = [new g()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(m) {
        return this._scope.name(m);
      }
      // reserves unique name in the external scope
      scopeName(m) {
        return this._extScope.name(m);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(m, b) {
        const A = this._extScope.value(m, b);
        return (this._values[A.prefix] || (this._values[A.prefix] = /* @__PURE__ */ new Set())).add(A), A;
      }
      getScopeValue(m, b) {
        return this._extScope.getValue(m, b);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(m) {
        return this._extScope.scopeRefs(m, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(m, b, A, G) {
        const H = this._scope.toName(b);
        return A !== void 0 && G && (this._constants[H.str] = A), this._leafNode(new i(m, H, A)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(m, b, A) {
        return this._def(s.varKinds.const, m, b, A);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(m, b, A) {
        return this._def(s.varKinds.let, m, b, A);
      }
      // `var` declaration with optional assignment
      var(m, b, A) {
        return this._def(s.varKinds.var, m, b, A);
      }
      // assignment code
      assign(m, b, A) {
        return this._leafNode(new o(m, b, A));
      }
      // `+=` code
      add(m, b) {
        return this._leafNode(new u(m, e.operators.ADD, b));
      }
      // appends passed SafeExpr to code or executes Block
      code(m) {
        return typeof m == "function" ? m() : m !== t.nil && this._leafNode(new w(m)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...m) {
        const b = ["{"];
        for (const [A, G] of m)
          b.length > 1 && b.push(","), b.push(A), (A !== G || this.opts.es5) && (b.push(":"), (0, t.addCodeArg)(b, G));
        return b.push("}"), new t._Code(b);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(m, b, A) {
        if (this._blockNode(new f(m)), b && A)
          this.code(b).else().code(A).endIf();
        else if (b)
          this.code(b).endIf();
        else if (A)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(m) {
        return this._elseNode(new f(m));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new d());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(f, d);
      }
      _for(m, b) {
        return this._blockNode(m), b && this.code(b).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(m, b) {
        return this._for(new h(m), b);
      }
      // `for` statement for a range of values
      forRange(m, b, A, G, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(m);
        return this._for(new _(H, Z, b, A), () => G(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(m, b, A, G = s.varKinds.const) {
        const H = this._scope.toName(m);
        if (this.opts.es5) {
          const Z = b instanceof t.Name ? b : this.var("_arr", b);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Y) => {
            this.var(H, (0, t._)`${Z}[${Y}]`), A(H);
          });
        }
        return this._for(new v("of", G, H, b), () => A(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(m, b, A, G = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(m, (0, t._)`Object.keys(${b})`, A);
        const H = this._scope.toName(m);
        return this._for(new v("in", G, H, b), () => A(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(a);
      }
      // `label` statement
      label(m) {
        return this._leafNode(new p(m));
      }
      // `break` statement
      break(m) {
        return this._leafNode(new c(m));
      }
      // `return` statement
      return(m) {
        const b = new P();
        if (this._blockNode(b), this.code(m), b.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(P);
      }
      // `try` statement
      try(m, b, A) {
        if (!b && !A)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const G = new T();
        if (this._blockNode(G), this.code(m), b) {
          const H = this.name("e");
          this._currNode = G.catch = new q(H), b(H);
        }
        return A && (this._currNode = G.finally = new F(), this.code(A)), this._endBlockNode(q, F);
      }
      // `throw` statement
      throw(m) {
        return this._leafNode(new $(m));
      }
      // start self-balancing block
      block(m, b) {
        return this._blockStarts.push(this._nodes.length), m && this.code(m).endBlock(b), this;
      }
      // end the current self-balancing block
      endBlock(m) {
        const b = this._blockStarts.pop();
        if (b === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const A = this._nodes.length - b;
        if (A < 0 || m !== void 0 && A !== m)
          throw new Error(`CodeGen: wrong number of nodes: ${A} vs ${m} expected`);
        return this._nodes.length = b, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(m, b = t.nil, A, G) {
        return this._blockNode(new y(m, b, A)), G && this.code(G).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(y);
      }
      optimize(m = 1) {
        for (; m-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(m) {
        return this._currNode.nodes.push(m), this;
      }
      _blockNode(m) {
        this._currNode.nodes.push(m), this._nodes.push(m);
      }
      _endBlockNode(m, b) {
        const A = this._currNode;
        if (A instanceof m || b && A instanceof b)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${b ? `${m.kind}/${b.kind}` : m.kind}"`);
      }
      _elseNode(m) {
        const b = this._currNode;
        if (!(b instanceof f))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = b.else = m, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const m = this._nodes;
        return m[m.length - 1];
      }
      set _currNode(m) {
        const b = this._nodes;
        b[b.length - 1] = m;
      }
    }
    e.CodeGen = D;
    function U(I, m) {
      for (const b in m)
        I[b] = (I[b] || 0) + (m[b] || 0);
      return I;
    }
    function z(I, m) {
      return m instanceof t._CodeOrName ? U(I, m.names) : I;
    }
    function L(I, m, b) {
      if (I instanceof t.Name)
        return A(I);
      if (!G(I))
        return I;
      return new t._Code(I._items.reduce((H, Z) => (Z instanceof t.Name && (Z = A(Z)), Z instanceof t._Code ? H.push(...Z._items) : H.push(Z), H), []));
      function A(H) {
        const Z = b[H.str];
        return Z === void 0 || m[H.str] !== 1 ? H : (delete m[H.str], Z);
      }
      function G(H) {
        return H instanceof t._Code && H._items.some((Z) => Z instanceof t.Name && m[Z.str] === 1 && b[Z.str] !== void 0);
      }
    }
    function V(I, m) {
      for (const b in m)
        I[b] = (I[b] || 0) - (m[b] || 0);
    }
    function x(I) {
      return typeof I == "boolean" || typeof I == "number" || I === null ? !I : (0, t._)`!${j(I)}`;
    }
    e.not = x;
    const W = N(e.operators.AND);
    function B(...I) {
      return I.reduce(W);
    }
    e.and = B;
    const X = N(e.operators.OR);
    function C(...I) {
      return I.reduce(X);
    }
    e.or = C;
    function N(I) {
      return (m, b) => m === t.nil ? b : b === t.nil ? m : (0, t._)`${j(m)} ${I} ${j(b)}`;
    }
    function j(I) {
      return I instanceof t.Name ? I : (0, t._)`(${I})`;
    }
  }(ds)), ds;
}
var re = {}, co;
function ae() {
  if (co) return re;
  co = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.checkStrictMode = re.getErrorPath = re.Type = re.useFunc = re.setEvaluated = re.evaluatedPropsToName = re.mergeEvaluated = re.eachItem = re.unescapeJsonPointer = re.escapeJsonPointer = re.escapeFragment = re.unescapeFragment = re.schemaRefOrVal = re.schemaHasRulesButRef = re.schemaHasRules = re.checkUnknownRules = re.alwaysValidSchema = re.toHash = void 0;
  const e = te(), t = qn();
  function s(v) {
    const y = {};
    for (const P of v)
      y[P] = !0;
    return y;
  }
  re.toHash = s;
  function r(v, y) {
    return typeof y == "boolean" ? y : Object.keys(y).length === 0 ? !0 : (l(v, y), !n(y, v.self.RULES.all));
  }
  re.alwaysValidSchema = r;
  function l(v, y = v.schema) {
    const { opts: P, self: T } = v;
    if (!P.strictSchema || typeof y == "boolean")
      return;
    const q = T.RULES.keywords;
    for (const F in y)
      q[F] || _(v, `unknown keyword: "${F}"`);
  }
  re.checkUnknownRules = l;
  function n(v, y) {
    if (typeof v == "boolean")
      return !v;
    for (const P in v)
      if (y[P])
        return !0;
    return !1;
  }
  re.schemaHasRules = n;
  function i(v, y) {
    if (typeof v == "boolean")
      return !v;
    for (const P in v)
      if (P !== "$ref" && y.all[P])
        return !0;
    return !1;
  }
  re.schemaHasRulesButRef = i;
  function o({ topSchemaRef: v, schemaPath: y }, P, T, q) {
    if (!q) {
      if (typeof P == "number" || typeof P == "boolean")
        return P;
      if (typeof P == "string")
        return (0, e._)`${P}`;
    }
    return (0, e._)`${v}${y}${(0, e.getProperty)(T)}`;
  }
  re.schemaRefOrVal = o;
  function u(v) {
    return $(decodeURIComponent(v));
  }
  re.unescapeFragment = u;
  function p(v) {
    return encodeURIComponent(c(v));
  }
  re.escapeFragment = p;
  function c(v) {
    return typeof v == "number" ? `${v}` : v.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  re.escapeJsonPointer = c;
  function $(v) {
    return v.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  re.unescapeJsonPointer = $;
  function w(v, y) {
    if (Array.isArray(v))
      for (const P of v)
        y(P);
    else
      y(v);
  }
  re.eachItem = w;
  function E({ mergeNames: v, mergeToName: y, mergeValues: P, resultToName: T }) {
    return (q, F, D, U) => {
      const z = D === void 0 ? F : D instanceof e.Name ? (F instanceof e.Name ? v(q, F, D) : y(q, F, D), D) : F instanceof e.Name ? (y(q, D, F), F) : P(F, D);
      return U === e.Name && !(z instanceof e.Name) ? T(q, z) : z;
    };
  }
  re.mergeEvaluated = {
    props: E({
      mergeNames: (v, y, P) => v.if((0, e._)`${P} !== true && ${y} !== undefined`, () => {
        v.if((0, e._)`${y} === true`, () => v.assign(P, !0), () => v.assign(P, (0, e._)`${P} || {}`).code((0, e._)`Object.assign(${P}, ${y})`));
      }),
      mergeToName: (v, y, P) => v.if((0, e._)`${P} !== true`, () => {
        y === !0 ? v.assign(P, !0) : (v.assign(P, (0, e._)`${P} || {}`), g(v, P, y));
      }),
      mergeValues: (v, y) => v === !0 ? !0 : { ...v, ...y },
      resultToName: S
    }),
    items: E({
      mergeNames: (v, y, P) => v.if((0, e._)`${P} !== true && ${y} !== undefined`, () => v.assign(P, (0, e._)`${y} === true ? true : ${P} > ${y} ? ${P} : ${y}`)),
      mergeToName: (v, y, P) => v.if((0, e._)`${P} !== true`, () => v.assign(P, y === !0 ? !0 : (0, e._)`${P} > ${y} ? ${P} : ${y}`)),
      mergeValues: (v, y) => v === !0 ? !0 : Math.max(v, y),
      resultToName: (v, y) => v.var("items", y)
    })
  };
  function S(v, y) {
    if (y === !0)
      return v.var("props", !0);
    const P = v.var("props", (0, e._)`{}`);
    return y !== void 0 && g(v, P, y), P;
  }
  re.evaluatedPropsToName = S;
  function g(v, y, P) {
    Object.keys(P).forEach((T) => v.assign((0, e._)`${y}${(0, e.getProperty)(T)}`, !0));
  }
  re.setEvaluated = g;
  const d = {};
  function f(v, y) {
    return v.scopeValue("func", {
      ref: y,
      code: d[y.code] || (d[y.code] = new t._Code(y.code))
    });
  }
  re.useFunc = f;
  var a;
  (function(v) {
    v[v.Num = 0] = "Num", v[v.Str = 1] = "Str";
  })(a || (re.Type = a = {}));
  function h(v, y, P) {
    if (v instanceof e.Name) {
      const T = y === a.Num;
      return P ? T ? (0, e._)`"[" + ${v} + "]"` : (0, e._)`"['" + ${v} + "']"` : T ? (0, e._)`"/" + ${v}` : (0, e._)`"/" + ${v}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return P ? (0, e.getProperty)(v).toString() : "/" + c(v);
  }
  re.getErrorPath = h;
  function _(v, y, P = v.opts.strictSchema) {
    if (P) {
      if (y = `strict mode: ${y}`, P === !0)
        throw new Error(y);
      v.self.logger.warn(y);
    }
  }
  return re.checkStrictMode = _, re;
}
var Wt = {}, uo;
function Le() {
  if (uo) return Wt;
  uo = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = te(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Wt.default = t, Wt;
}
var lo;
function zn() {
  return lo || (lo = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = te(), s = ae(), r = Le();
    e.keywordError = {
      message: ({ keyword: d }) => (0, t.str)`must pass "${d}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: d, schemaType: f }) => f ? (0, t.str)`"${d}" keyword must be ${f} ($data)` : (0, t.str)`"${d}" keyword is invalid ($data)`
    };
    function l(d, f = e.keywordError, a, h) {
      const { it: _ } = d, { gen: v, compositeRule: y, allErrors: P } = _, T = $(d, f, a);
      h ?? (y || P) ? u(v, T) : p(_, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(d, f = e.keywordError, a) {
      const { it: h } = d, { gen: _, compositeRule: v, allErrors: y } = h, P = $(d, f, a);
      u(_, P), v || y || p(h, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(d, f) {
      d.assign(r.default.errors, f), d.if((0, t._)`${r.default.vErrors} !== null`, () => d.if(f, () => d.assign((0, t._)`${r.default.vErrors}.length`, f), () => d.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function o({ gen: d, keyword: f, schemaValue: a, data: h, errsCount: _, it: v }) {
      if (_ === void 0)
        throw new Error("ajv implementation error");
      const y = d.name("err");
      d.forRange("i", _, r.default.errors, (P) => {
        d.const(y, (0, t._)`${r.default.vErrors}[${P}]`), d.if((0, t._)`${y}.instancePath === undefined`, () => d.assign((0, t._)`${y}.instancePath`, (0, t.strConcat)(r.default.instancePath, v.errorPath))), d.assign((0, t._)`${y}.schemaPath`, (0, t.str)`${v.errSchemaPath}/${f}`), v.opts.verbose && (d.assign((0, t._)`${y}.schema`, a), d.assign((0, t._)`${y}.data`, h));
      });
    }
    e.extendErrors = o;
    function u(d, f) {
      const a = d.const("err", f);
      d.if((0, t._)`${r.default.vErrors} === null`, () => d.assign(r.default.vErrors, (0, t._)`[${a}]`), (0, t._)`${r.default.vErrors}.push(${a})`), d.code((0, t._)`${r.default.errors}++`);
    }
    function p(d, f) {
      const { gen: a, validateName: h, schemaEnv: _ } = d;
      _.$async ? a.throw((0, t._)`new ${d.ValidationError}(${f})`) : (a.assign((0, t._)`${h}.errors`, f), a.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(d, f, a) {
      const { createErrors: h } = d.it;
      return h === !1 ? (0, t._)`{}` : w(d, f, a);
    }
    function w(d, f, a = {}) {
      const { gen: h, it: _ } = d, v = [
        E(_, a),
        S(d, a)
      ];
      return g(d, f, v), h.object(...v);
    }
    function E({ errorPath: d }, { instancePath: f }) {
      const a = f ? (0, t.str)`${d}${(0, s.getErrorPath)(f, s.Type.Str)}` : d;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, a)];
    }
    function S({ keyword: d, it: { errSchemaPath: f } }, { schemaPath: a, parentSchema: h }) {
      let _ = h ? f : (0, t.str)`${f}/${d}`;
      return a && (_ = (0, t.str)`${_}${(0, s.getErrorPath)(a, s.Type.Str)}`), [c.schemaPath, _];
    }
    function g(d, { params: f, message: a }, h) {
      const { keyword: _, data: v, schemaValue: y, it: P } = d, { opts: T, propertyName: q, topSchemaRef: F, schemaPath: D } = P;
      h.push([c.keyword, _], [c.params, typeof f == "function" ? f(d) : f || (0, t._)`{}`]), T.messages && h.push([c.message, typeof a == "function" ? a(d) : a]), T.verbose && h.push([c.schema, y], [c.parentSchema, (0, t._)`${F}${D}`], [r.default.data, v]), q && h.push([c.propertyName, q]);
    }
  }(ls)), ls;
}
var fo;
function pd() {
  if (fo) return lt;
  fo = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.boolOrEmptySchema = lt.topBoolOrEmptySchema = void 0;
  const e = zn(), t = te(), s = Le(), r = {
    message: "boolean schema is false"
  };
  function l(o) {
    const { gen: u, schema: p, validateName: c } = o;
    p === !1 ? i(o, !1) : typeof p == "object" && p.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  lt.topBoolOrEmptySchema = l;
  function n(o, u) {
    const { gen: p, schema: c } = o;
    c === !1 ? (p.var(u, !1), i(o)) : p.var(u, !0);
  }
  lt.boolOrEmptySchema = n;
  function i(o, u) {
    const { gen: p, data: c } = o, $ = {
      gen: p,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)($, r, void 0, u);
  }
  return lt;
}
var ve = {}, dt = {}, ho;
function el() {
  if (ho) return dt;
  ho = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.getRules = dt.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  dt.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return dt.getRules = r, dt;
}
var He = {}, mo;
function tl() {
  if (mo) return He;
  mo = 1, Object.defineProperty(He, "__esModule", { value: !0 }), He.shouldUseRule = He.shouldUseGroup = He.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  He.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  He.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return He.shouldUseRule = s, He;
}
var po;
function Dn() {
  if (po) return ve;
  po = 1, Object.defineProperty(ve, "__esModule", { value: !0 }), ve.reportTypeError = ve.checkDataTypes = ve.checkDataType = ve.coerceAndCheckDataType = ve.getJSONTypes = ve.getSchemaTypes = ve.DataType = void 0;
  const e = el(), t = tl(), s = zn(), r = te(), l = ae();
  var n;
  (function(a) {
    a[a.Correct = 0] = "Correct", a[a.Wrong = 1] = "Wrong";
  })(n || (ve.DataType = n = {}));
  function i(a) {
    const h = o(a.type);
    if (h.includes("null")) {
      if (a.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!h.length && a.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      a.nullable === !0 && h.push("null");
    }
    return h;
  }
  ve.getSchemaTypes = i;
  function o(a) {
    const h = Array.isArray(a) ? a : a ? [a] : [];
    if (h.every(e.isJSONType))
      return h;
    throw new Error("type must be JSONType or JSONType[]: " + h.join(","));
  }
  ve.getJSONTypes = o;
  function u(a, h) {
    const { gen: _, data: v, opts: y } = a, P = c(h, y.coerceTypes), T = h.length > 0 && !(P.length === 0 && h.length === 1 && (0, t.schemaHasRulesForType)(a, h[0]));
    if (T) {
      const q = S(h, v, y.strictNumbers, n.Wrong);
      _.if(q, () => {
        P.length ? $(a, h, P) : d(a);
      });
    }
    return T;
  }
  ve.coerceAndCheckDataType = u;
  const p = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(a, h) {
    return h ? a.filter((_) => p.has(_) || h === "array" && _ === "array") : [];
  }
  function $(a, h, _) {
    const { gen: v, data: y, opts: P } = a, T = v.let("dataType", (0, r._)`typeof ${y}`), q = v.let("coerced", (0, r._)`undefined`);
    P.coerceTypes === "array" && v.if((0, r._)`${T} == 'object' && Array.isArray(${y}) && ${y}.length == 1`, () => v.assign(y, (0, r._)`${y}[0]`).assign(T, (0, r._)`typeof ${y}`).if(S(h, y, P.strictNumbers), () => v.assign(q, y))), v.if((0, r._)`${q} !== undefined`);
    for (const D of _)
      (p.has(D) || D === "array" && P.coerceTypes === "array") && F(D);
    v.else(), d(a), v.endIf(), v.if((0, r._)`${q} !== undefined`, () => {
      v.assign(y, q), w(a, q);
    });
    function F(D) {
      switch (D) {
        case "string":
          v.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(q, (0, r._)`"" + ${y}`).elseIf((0, r._)`${y} === null`).assign(q, (0, r._)`""`);
          return;
        case "number":
          v.elseIf((0, r._)`${T} == "boolean" || ${y} === null
              || (${T} == "string" && ${y} && ${y} == +${y})`).assign(q, (0, r._)`+${y}`);
          return;
        case "integer":
          v.elseIf((0, r._)`${T} === "boolean" || ${y} === null
              || (${T} === "string" && ${y} && ${y} == +${y} && !(${y} % 1))`).assign(q, (0, r._)`+${y}`);
          return;
        case "boolean":
          v.elseIf((0, r._)`${y} === "false" || ${y} === 0 || ${y} === null`).assign(q, !1).elseIf((0, r._)`${y} === "true" || ${y} === 1`).assign(q, !0);
          return;
        case "null":
          v.elseIf((0, r._)`${y} === "" || ${y} === 0 || ${y} === false`), v.assign(q, null);
          return;
        case "array":
          v.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${y} === null`).assign(q, (0, r._)`[${y}]`);
      }
    }
  }
  function w({ gen: a, parentData: h, parentDataProperty: _ }, v) {
    a.if((0, r._)`${h} !== undefined`, () => a.assign((0, r._)`${h}[${_}]`, v));
  }
  function E(a, h, _, v = n.Correct) {
    const y = v === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let P;
    switch (a) {
      case "null":
        return (0, r._)`${h} ${y} null`;
      case "array":
        P = (0, r._)`Array.isArray(${h})`;
        break;
      case "object":
        P = (0, r._)`${h} && typeof ${h} == "object" && !Array.isArray(${h})`;
        break;
      case "integer":
        P = T((0, r._)`!(${h} % 1) && !isNaN(${h})`);
        break;
      case "number":
        P = T();
        break;
      default:
        return (0, r._)`typeof ${h} ${y} ${a}`;
    }
    return v === n.Correct ? P : (0, r.not)(P);
    function T(q = r.nil) {
      return (0, r.and)((0, r._)`typeof ${h} == "number"`, q, _ ? (0, r._)`isFinite(${h})` : r.nil);
    }
  }
  ve.checkDataType = E;
  function S(a, h, _, v) {
    if (a.length === 1)
      return E(a[0], h, _, v);
    let y;
    const P = (0, l.toHash)(a);
    if (P.array && P.object) {
      const T = (0, r._)`typeof ${h} != "object"`;
      y = P.null ? T : (0, r._)`!${h} || ${T}`, delete P.null, delete P.array, delete P.object;
    } else
      y = r.nil;
    P.number && delete P.integer;
    for (const T in P)
      y = (0, r.and)(y, E(T, h, _, v));
    return y;
  }
  ve.checkDataTypes = S;
  const g = {
    message: ({ schema: a }) => `must be ${a}`,
    params: ({ schema: a, schemaValue: h }) => typeof a == "string" ? (0, r._)`{type: ${a}}` : (0, r._)`{type: ${h}}`
  };
  function d(a) {
    const h = f(a);
    (0, s.reportError)(h, g);
  }
  ve.reportTypeError = d;
  function f(a) {
    const { gen: h, data: _, schema: v } = a, y = (0, l.schemaRefOrVal)(a, v, "type");
    return {
      gen: h,
      keyword: "type",
      data: _,
      schema: v.type,
      schemaCode: y,
      schemaValue: y,
      parentSchema: v,
      params: {},
      it: a
    };
  }
  return ve;
}
var Dt = {}, yo;
function yd() {
  if (yo) return Dt;
  yo = 1, Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.assignDefaults = void 0;
  const e = te(), t = ae();
  function s(l, n) {
    const { properties: i, items: o } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(o) && o.forEach((u, p) => r(l, p, u.default));
  }
  Dt.assignDefaults = s;
  function r(l, n, i) {
    const { gen: o, compositeRule: u, data: p, opts: c } = l;
    if (i === void 0)
      return;
    const $ = (0, e._)`${p}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${$}`);
      return;
    }
    let w = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (w = (0, e._)`${w} || ${$} === null || ${$} === ""`), o.if(w, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return Dt;
}
var De = {}, fe = {}, $o;
function Fe() {
  if ($o) return fe;
  $o = 1, Object.defineProperty(fe, "__esModule", { value: !0 }), fe.validateUnion = fe.validateArray = fe.usePattern = fe.callValidateCode = fe.schemaProperties = fe.allSchemaProperties = fe.noPropertyInData = fe.propertyInData = fe.isOwnProperty = fe.hasPropFunc = fe.reportMissingProp = fe.checkMissingProp = fe.checkReportMissingProp = void 0;
  const e = te(), t = ae(), s = Le(), r = ae();
  function l(a, h) {
    const { gen: _, data: v, it: y } = a;
    _.if(c(_, v, h, y.opts.ownProperties), () => {
      a.setParams({ missingProperty: (0, e._)`${h}` }, !0), a.error();
    });
  }
  fe.checkReportMissingProp = l;
  function n({ gen: a, data: h, it: { opts: _ } }, v, y) {
    return (0, e.or)(...v.map((P) => (0, e.and)(c(a, h, P, _.ownProperties), (0, e._)`${y} = ${P}`)));
  }
  fe.checkMissingProp = n;
  function i(a, h) {
    a.setParams({ missingProperty: h }, !0), a.error();
  }
  fe.reportMissingProp = i;
  function o(a) {
    return a.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  fe.hasPropFunc = o;
  function u(a, h, _) {
    return (0, e._)`${o(a)}.call(${h}, ${_})`;
  }
  fe.isOwnProperty = u;
  function p(a, h, _, v) {
    const y = (0, e._)`${h}${(0, e.getProperty)(_)} !== undefined`;
    return v ? (0, e._)`${y} && ${u(a, h, _)}` : y;
  }
  fe.propertyInData = p;
  function c(a, h, _, v) {
    const y = (0, e._)`${h}${(0, e.getProperty)(_)} === undefined`;
    return v ? (0, e.or)(y, (0, e.not)(u(a, h, _))) : y;
  }
  fe.noPropertyInData = c;
  function $(a) {
    return a ? Object.keys(a).filter((h) => h !== "__proto__") : [];
  }
  fe.allSchemaProperties = $;
  function w(a, h) {
    return $(h).filter((_) => !(0, t.alwaysValidSchema)(a, h[_]));
  }
  fe.schemaProperties = w;
  function E({ schemaCode: a, data: h, it: { gen: _, topSchemaRef: v, schemaPath: y, errorPath: P }, it: T }, q, F, D) {
    const U = D ? (0, e._)`${a}, ${h}, ${v}${y}` : h, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, P)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const L = (0, e._)`${U}, ${_.object(...z)}`;
    return F !== e.nil ? (0, e._)`${q}.call(${F}, ${L})` : (0, e._)`${q}(${L})`;
  }
  fe.callValidateCode = E;
  const S = (0, e._)`new RegExp`;
  function g({ gen: a, it: { opts: h } }, _) {
    const v = h.unicodeRegExp ? "u" : "", { regExp: y } = h.code, P = y(_, v);
    return a.scopeValue("pattern", {
      key: P.toString(),
      ref: P,
      code: (0, e._)`${y.code === "new RegExp" ? S : (0, r.useFunc)(a, y)}(${_}, ${v})`
    });
  }
  fe.usePattern = g;
  function d(a) {
    const { gen: h, data: _, keyword: v, it: y } = a, P = h.name("valid");
    if (y.allErrors) {
      const q = h.let("valid", !0);
      return T(() => h.assign(q, !1)), q;
    }
    return h.var(P, !0), T(() => h.break()), P;
    function T(q) {
      const F = h.const("len", (0, e._)`${_}.length`);
      h.forRange("i", 0, F, (D) => {
        a.subschema({
          keyword: v,
          dataProp: D,
          dataPropType: t.Type.Num
        }, P), h.if((0, e.not)(P), q);
      });
    }
  }
  fe.validateArray = d;
  function f(a) {
    const { gen: h, schema: _, keyword: v, it: y } = a;
    if (!Array.isArray(_))
      throw new Error("ajv implementation error");
    if (_.some((F) => (0, t.alwaysValidSchema)(y, F)) && !y.opts.unevaluated)
      return;
    const T = h.let("valid", !1), q = h.name("_valid");
    h.block(() => _.forEach((F, D) => {
      const U = a.subschema({
        keyword: v,
        schemaProp: D,
        compositeRule: !0
      }, q);
      h.assign(T, (0, e._)`${T} || ${q}`), a.mergeValidEvaluated(U, q) || h.if((0, e.not)(T));
    })), a.result(T, () => a.reset(), () => a.error(!0));
  }
  return fe.validateUnion = f, fe;
}
var go;
function $d() {
  if (go) return De;
  go = 1, Object.defineProperty(De, "__esModule", { value: !0 }), De.validateKeywordUsage = De.validSchemaType = De.funcKeywordCode = De.macroKeywordCode = void 0;
  const e = te(), t = Le(), s = Fe(), r = zn();
  function l(w, E) {
    const { gen: S, keyword: g, schema: d, parentSchema: f, it: a } = w, h = E.macro.call(a.self, d, f, a), _ = p(S, g, h);
    a.opts.validateSchema !== !1 && a.self.validateSchema(h, !0);
    const v = S.name("valid");
    w.subschema({
      schema: h,
      schemaPath: e.nil,
      errSchemaPath: `${a.errSchemaPath}/${g}`,
      topSchemaRef: _,
      compositeRule: !0
    }, v), w.pass(v, () => w.error(!0));
  }
  De.macroKeywordCode = l;
  function n(w, E) {
    var S;
    const { gen: g, keyword: d, schema: f, parentSchema: a, $data: h, it: _ } = w;
    u(_, E);
    const v = !h && E.compile ? E.compile.call(_.self, f, a, _) : E.validate, y = p(g, d, v), P = g.let("valid");
    w.block$data(P, T), w.ok((S = E.valid) !== null && S !== void 0 ? S : P);
    function T() {
      if (E.errors === !1)
        D(), E.modifying && i(w), U(() => w.error());
      else {
        const z = E.async ? q() : F();
        E.modifying && i(w), U(() => o(w, z));
      }
    }
    function q() {
      const z = g.let("ruleErrs", null);
      return g.try(() => D((0, e._)`await `), (L) => g.assign(P, !1).if((0, e._)`${L} instanceof ${_.ValidationError}`, () => g.assign(z, (0, e._)`${L}.errors`), () => g.throw(L))), z;
    }
    function F() {
      const z = (0, e._)`${y}.errors`;
      return g.assign(z, null), D(e.nil), z;
    }
    function D(z = E.async ? (0, e._)`await ` : e.nil) {
      const L = _.opts.passContext ? t.default.this : t.default.self, V = !("compile" in E && !h || E.schema === !1);
      g.assign(P, (0, e._)`${z}${(0, s.callValidateCode)(w, y, L, V)}`, E.modifying);
    }
    function U(z) {
      var L;
      g.if((0, e.not)((L = E.valid) !== null && L !== void 0 ? L : P), z);
    }
  }
  De.funcKeywordCode = n;
  function i(w) {
    const { gen: E, data: S, it: g } = w;
    E.if(g.parentData, () => E.assign(S, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function o(w, E) {
    const { gen: S } = w;
    S.if((0, e._)`Array.isArray(${E})`, () => {
      S.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${E} : ${t.default.vErrors}.concat(${E})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(w);
    }, () => w.error());
  }
  function u({ schemaEnv: w }, E) {
    if (E.async && !w.$async)
      throw new Error("async keyword in sync schema");
  }
  function p(w, E, S) {
    if (S === void 0)
      throw new Error(`keyword "${E}" failed to compile`);
    return w.scopeValue("keyword", typeof S == "function" ? { ref: S } : { ref: S, code: (0, e.stringify)(S) });
  }
  function c(w, E, S = !1) {
    return !E.length || E.some((g) => g === "array" ? Array.isArray(w) : g === "object" ? w && typeof w == "object" && !Array.isArray(w) : typeof w == g || S && typeof w > "u");
  }
  De.validSchemaType = c;
  function $({ schema: w, opts: E, self: S, errSchemaPath: g }, d, f) {
    if (Array.isArray(d.keyword) ? !d.keyword.includes(f) : d.keyword !== f)
      throw new Error("ajv implementation error");
    const a = d.dependencies;
    if (a != null && a.some((h) => !Object.prototype.hasOwnProperty.call(w, h)))
      throw new Error(`parent schema must have dependencies of ${f}: ${a.join(",")}`);
    if (d.validateSchema && !d.validateSchema(w[f])) {
      const _ = `keyword "${f}" value is invalid at path "${g}": ` + S.errorsText(d.validateSchema.errors);
      if (E.validateSchema === "log")
        S.logger.error(_);
      else
        throw new Error(_);
    }
  }
  return De.validateKeywordUsage = $, De;
}
var Be = {}, vo;
function gd() {
  if (vo) return Be;
  vo = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.extendSubschemaMode = Be.extendSubschemaData = Be.getSubschema = void 0;
  const e = te(), t = ae();
  function s(n, { keyword: i, schemaProp: o, schema: u, schemaPath: p, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const w = n.schema[i];
      return o === void 0 ? {
        schema: w,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: w[o],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (u !== void 0) {
      if (p === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: p,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Be.getSubschema = s;
  function r(n, i, { dataProp: o, dataPropType: u, data: p, dataTypes: c, propertyName: $ }) {
    if (p !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: w } = i;
    if (o !== void 0) {
      const { errorPath: S, dataPathArr: g, opts: d } = i, f = w.let("data", (0, e._)`${i.data}${(0, e.getProperty)(o)}`, !0);
      E(f), n.errorPath = (0, e.str)`${S}${(0, t.getErrorPath)(o, u, d.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${o}`, n.dataPathArr = [...g, n.parentDataProperty];
    }
    if (p !== void 0) {
      const S = p instanceof e.Name ? p : w.let("data", p, !0);
      E(S), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function E(S) {
      n.data = S, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, S];
    }
  }
  Be.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: o, compositeRule: u, createErrors: p, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), p !== void 0 && (n.createErrors = p), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = o;
  }
  return Be.extendSubschemaMode = l, Be;
}
var Pe = {}, ms, _o;
function Gn() {
  return _o || (_o = 1, ms = function e(t, s) {
    if (t === s) return !0;
    if (t && s && typeof t == "object" && typeof s == "object") {
      if (t.constructor !== s.constructor) return !1;
      var r, l, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != s.length) return !1;
        for (l = r; l-- !== 0; )
          if (!e(t[l], s[l])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === s.source && t.flags === s.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === s.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === s.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(s).length) return !1;
      for (l = r; l-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(s, n[l])) return !1;
      for (l = r; l-- !== 0; ) {
        var i = n[l];
        if (!e(t[i], s[i])) return !1;
      }
      return !0;
    }
    return t !== t && s !== s;
  }), ms;
}
var ps = { exports: {} }, wo;
function vd() {
  if (wo) return ps.exports;
  wo = 1;
  var e = ps.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, o = n.post || function() {
    };
    t(l, i, o, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, o, u, p, c, $, w) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, o, u, p, c, $, w);
      for (var E in i) {
        var S = i[E];
        if (Array.isArray(S)) {
          if (E in e.arrayKeywords)
            for (var g = 0; g < S.length; g++)
              t(r, l, n, S[g], o + "/" + E + "/" + g, u, o, E, i, g);
        } else if (E in e.propsKeywords) {
          if (S && typeof S == "object")
            for (var d in S)
              t(r, l, n, S[d], o + "/" + E + "/" + s(d), u, o, E, i, d);
        } else (E in e.keywords || r.allKeys && !(E in e.skipKeywords)) && t(r, l, n, S, o + "/" + E, u, o, E, i);
      }
      n(i, o, u, p, c, $, w);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return ps.exports;
}
var Eo;
function Kn() {
  if (Eo) return Pe;
  Eo = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.getSchemaRefs = Pe.resolveUrl = Pe.normalizeId = Pe._getFullPath = Pe.getFullPath = Pe.inlineRef = void 0;
  const e = ae(), t = Gn(), s = vd(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(g, d = !0) {
    return typeof g == "boolean" ? !0 : d === !0 ? !i(g) : d ? o(g) <= d : !1;
  }
  Pe.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(g) {
    for (const d in g) {
      if (n.has(d))
        return !0;
      const f = g[d];
      if (Array.isArray(f) && f.some(i) || typeof f == "object" && i(f))
        return !0;
    }
    return !1;
  }
  function o(g) {
    let d = 0;
    for (const f in g) {
      if (f === "$ref")
        return 1 / 0;
      if (d++, !r.has(f) && (typeof g[f] == "object" && (0, e.eachItem)(g[f], (a) => d += o(a)), d === 1 / 0))
        return 1 / 0;
    }
    return d;
  }
  function u(g, d = "", f) {
    f !== !1 && (d = $(d));
    const a = g.parse(d);
    return p(g, a);
  }
  Pe.getFullPath = u;
  function p(g, d) {
    return g.serialize(d).split("#")[0] + "#";
  }
  Pe._getFullPath = p;
  const c = /#\/?$/;
  function $(g) {
    return g ? g.replace(c, "") : "";
  }
  Pe.normalizeId = $;
  function w(g, d, f) {
    return f = $(f), g.resolve(d, f);
  }
  Pe.resolveUrl = w;
  const E = /^[a-z_][-a-z0-9._]*$/i;
  function S(g, d) {
    if (typeof g == "boolean")
      return {};
    const { schemaId: f, uriResolver: a } = this.opts, h = $(g[f] || d), _ = { "": h }, v = u(a, h, !1), y = {}, P = /* @__PURE__ */ new Set();
    return s(g, { allKeys: !0 }, (F, D, U, z) => {
      if (z === void 0)
        return;
      const L = v + D;
      let V = _[z];
      typeof F[f] == "string" && (V = x.call(this, F[f])), W.call(this, F.$anchor), W.call(this, F.$dynamicAnchor), _[D] = V;
      function x(B) {
        const X = this.opts.uriResolver.resolve;
        if (B = $(V ? X(V, B) : B), P.has(B))
          throw q(B);
        P.add(B);
        let C = this.refs[B];
        return typeof C == "string" && (C = this.refs[C]), typeof C == "object" ? T(F, C.schema, B) : B !== $(L) && (B[0] === "#" ? (T(F, y[B], B), y[B] = F) : this.refs[B] = L), B;
      }
      function W(B) {
        if (typeof B == "string") {
          if (!E.test(B))
            throw new Error(`invalid anchor "${B}"`);
          x.call(this, `#${B}`);
        }
      }
    }), y;
    function T(F, D, U) {
      if (D !== void 0 && !t(F, D))
        throw q(U);
    }
    function q(F) {
      return new Error(`reference "${F}" resolves to more than one schema`);
    }
  }
  return Pe.getSchemaRefs = S, Pe;
}
var bo;
function Hn() {
  if (bo) return Ke;
  bo = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.getData = Ke.KeywordCxt = Ke.validateFunctionCode = void 0;
  const e = pd(), t = Dn(), s = tl(), r = Dn(), l = yd(), n = $d(), i = gd(), o = te(), u = Le(), p = Kn(), c = ae(), $ = zn();
  function w(R) {
    if (v(R) && (P(R), _(R))) {
      d(R);
      return;
    }
    E(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  Ke.validateFunctionCode = w;
  function E({ gen: R, validateName: O, schema: k, schemaEnv: M, opts: K }, J) {
    K.code.es5 ? R.func(O, (0, o._)`${u.default.data}, ${u.default.valCxt}`, M.$async, () => {
      R.code((0, o._)`"use strict"; ${a(k, K)}`), g(R, K), R.code(J);
    }) : R.func(O, (0, o._)`${u.default.data}, ${S(K)}`, M.$async, () => R.code(a(k, K)).code(J));
  }
  function S(R) {
    return (0, o._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${R.dynamicRef ? (0, o._)`, ${u.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function g(R, O) {
    R.if(u.default.valCxt, () => {
      R.var(u.default.instancePath, (0, o._)`${u.default.valCxt}.${u.default.instancePath}`), R.var(u.default.parentData, (0, o._)`${u.default.valCxt}.${u.default.parentData}`), R.var(u.default.parentDataProperty, (0, o._)`${u.default.valCxt}.${u.default.parentDataProperty}`), R.var(u.default.rootData, (0, o._)`${u.default.valCxt}.${u.default.rootData}`), O.dynamicRef && R.var(u.default.dynamicAnchors, (0, o._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      R.var(u.default.instancePath, (0, o._)`""`), R.var(u.default.parentData, (0, o._)`undefined`), R.var(u.default.parentDataProperty, (0, o._)`undefined`), R.var(u.default.rootData, u.default.data), O.dynamicRef && R.var(u.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function d(R) {
    const { schema: O, opts: k, gen: M } = R;
    E(R, () => {
      k.$comment && O.$comment && z(R), F(R), M.let(u.default.vErrors, null), M.let(u.default.errors, 0), k.unevaluated && f(R), T(R), L(R);
    });
  }
  function f(R) {
    const { gen: O, validateName: k } = R;
    R.evaluated = O.const("evaluated", (0, o._)`${k}.evaluated`), O.if((0, o._)`${R.evaluated}.dynamicProps`, () => O.assign((0, o._)`${R.evaluated}.props`, (0, o._)`undefined`)), O.if((0, o._)`${R.evaluated}.dynamicItems`, () => O.assign((0, o._)`${R.evaluated}.items`, (0, o._)`undefined`));
  }
  function a(R, O) {
    const k = typeof R == "object" && R[O.schemaId];
    return k && (O.code.source || O.code.process) ? (0, o._)`/*# sourceURL=${k} */` : o.nil;
  }
  function h(R, O) {
    if (v(R) && (P(R), _(R))) {
      y(R, O);
      return;
    }
    (0, e.boolOrEmptySchema)(R, O);
  }
  function _({ schema: R, self: O }) {
    if (typeof R == "boolean")
      return !R;
    for (const k in R)
      if (O.RULES.all[k])
        return !0;
    return !1;
  }
  function v(R) {
    return typeof R.schema != "boolean";
  }
  function y(R, O) {
    const { schema: k, gen: M, opts: K } = R;
    K.$comment && k.$comment && z(R), D(R), U(R);
    const J = M.const("_errs", u.default.errors);
    T(R, J), M.var(O, (0, o._)`${J} === ${u.default.errors}`);
  }
  function P(R) {
    (0, c.checkUnknownRules)(R), q(R);
  }
  function T(R, O) {
    if (R.opts.jtd)
      return x(R, [], !1, O);
    const k = (0, t.getSchemaTypes)(R.schema), M = (0, t.coerceAndCheckDataType)(R, k);
    x(R, k, !M, O);
  }
  function q(R) {
    const { schema: O, errSchemaPath: k, opts: M, self: K } = R;
    O.$ref && M.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(O, K.RULES) && K.logger.warn(`$ref: keywords ignored in schema at path "${k}"`);
  }
  function F(R) {
    const { schema: O, opts: k } = R;
    O.default !== void 0 && k.useDefaults && k.strictSchema && (0, c.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function D(R) {
    const O = R.schema[R.opts.schemaId];
    O && (R.baseId = (0, p.resolveUrl)(R.opts.uriResolver, R.baseId, O));
  }
  function U(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: R, schemaEnv: O, schema: k, errSchemaPath: M, opts: K }) {
    const J = k.$comment;
    if (K.$comment === !0)
      R.code((0, o._)`${u.default.self}.logger.log(${J})`);
    else if (typeof K.$comment == "function") {
      const oe = (0, o.str)`${M}/$comment`, $e = R.scopeValue("root", { ref: O.root });
      R.code((0, o._)`${u.default.self}.opts.$comment(${J}, ${oe}, ${$e}.schema)`);
    }
  }
  function L(R) {
    const { gen: O, schemaEnv: k, validateName: M, ValidationError: K, opts: J } = R;
    k.$async ? O.if((0, o._)`${u.default.errors} === 0`, () => O.return(u.default.data), () => O.throw((0, o._)`new ${K}(${u.default.vErrors})`)) : (O.assign((0, o._)`${M}.errors`, u.default.vErrors), J.unevaluated && V(R), O.return((0, o._)`${u.default.errors} === 0`));
  }
  function V({ gen: R, evaluated: O, props: k, items: M }) {
    k instanceof o.Name && R.assign((0, o._)`${O}.props`, k), M instanceof o.Name && R.assign((0, o._)`${O}.items`, M);
  }
  function x(R, O, k, M) {
    const { gen: K, schema: J, data: oe, allErrors: $e, opts: le, self: de } = R, { RULES: ie } = de;
    if (J.$ref && (le.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(J, ie))) {
      K.block(() => G(R, "$ref", ie.all.$ref.definition));
      return;
    }
    le.jtd || B(R, O), K.block(() => {
      for (const me of ie.rules)
        Ie(me);
      Ie(ie.post);
    });
    function Ie(me) {
      (0, s.shouldUseGroup)(J, me) && (me.type ? (K.if((0, r.checkDataType)(me.type, oe, le.strictNumbers)), W(R, me), O.length === 1 && O[0] === me.type && k && (K.else(), (0, r.reportTypeError)(R)), K.endIf()) : W(R, me), $e || K.if((0, o._)`${u.default.errors} === ${M || 0}`));
    }
  }
  function W(R, O) {
    const { gen: k, schema: M, opts: { useDefaults: K } } = R;
    K && (0, l.assignDefaults)(R, O.type), k.block(() => {
      for (const J of O.rules)
        (0, s.shouldUseRule)(M, J) && G(R, J.keyword, J.definition, O.type);
    });
  }
  function B(R, O) {
    R.schemaEnv.meta || !R.opts.strictTypes || (X(R, O), R.opts.allowUnionTypes || C(R, O), N(R, R.dataTypes));
  }
  function X(R, O) {
    if (O.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = O;
        return;
      }
      O.forEach((k) => {
        I(R.dataTypes, k) || b(R, `type "${k}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), m(R, O);
    }
  }
  function C(R, O) {
    O.length > 1 && !(O.length === 2 && O.includes("null")) && b(R, "use allowUnionTypes to allow union type keyword");
  }
  function N(R, O) {
    const k = R.self.RULES.all;
    for (const M in k) {
      const K = k[M];
      if (typeof K == "object" && (0, s.shouldUseRule)(R.schema, K)) {
        const { type: J } = K.definition;
        J.length && !J.some((oe) => j(O, oe)) && b(R, `missing type "${J.join(",")}" for keyword "${M}"`);
      }
    }
  }
  function j(R, O) {
    return R.includes(O) || O === "number" && R.includes("integer");
  }
  function I(R, O) {
    return R.includes(O) || O === "integer" && R.includes("number");
  }
  function m(R, O) {
    const k = [];
    for (const M of R.dataTypes)
      I(O, M) ? k.push(M) : O.includes("integer") && M === "number" && k.push("integer");
    R.dataTypes = k;
  }
  function b(R, O) {
    const k = R.schemaEnv.baseId + R.errSchemaPath;
    O += ` at "${k}" (strictTypes)`, (0, c.checkStrictMode)(R, O, R.opts.strictTypes);
  }
  class A {
    constructor(O, k, M) {
      if ((0, n.validateKeywordUsage)(O, k, M), this.gen = O.gen, this.allErrors = O.allErrors, this.keyword = M, this.data = O.data, this.schema = O.schema[M], this.$data = k.$data && O.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(O, this.schema, M, this.$data), this.schemaType = k.schemaType, this.parentSchema = O.schema, this.params = {}, this.it = O, this.def = k, this.$data)
        this.schemaCode = O.gen.const("vSchema", Y(this.$data, O));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, k.schemaType, k.allowUndefined))
        throw new Error(`${M} value must be ${JSON.stringify(k.schemaType)}`);
      ("code" in k ? k.trackErrors : k.errors !== !1) && (this.errsCount = O.gen.const("_errs", u.default.errors));
    }
    result(O, k, M) {
      this.failResult((0, o.not)(O), k, M);
    }
    failResult(O, k, M) {
      this.gen.if(O), M ? M() : this.error(), k ? (this.gen.else(), k(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(O, k) {
      this.failResult((0, o.not)(O), void 0, k);
    }
    fail(O) {
      if (O === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(O), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(O) {
      if (!this.$data)
        return this.fail(O);
      const { schemaCode: k } = this;
      this.fail((0, o._)`${k} !== undefined && (${(0, o.or)(this.invalid$data(), O)})`);
    }
    error(O, k, M) {
      if (k) {
        this.setParams(k), this._error(O, M), this.setParams({});
        return;
      }
      this._error(O, M);
    }
    _error(O, k) {
      (O ? $.reportExtraError : $.reportError)(this, this.def.error, k);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(O) {
      this.allErrors || this.gen.if(O);
    }
    setParams(O, k) {
      k ? Object.assign(this.params, O) : this.params = O;
    }
    block$data(O, k, M = o.nil) {
      this.gen.block(() => {
        this.check$data(O, M), k();
      });
    }
    check$data(O = o.nil, k = o.nil) {
      if (!this.$data)
        return;
      const { gen: M, schemaCode: K, schemaType: J, def: oe } = this;
      M.if((0, o.or)((0, o._)`${K} === undefined`, k)), O !== o.nil && M.assign(O, !0), (J.length || oe.validateSchema) && (M.elseIf(this.invalid$data()), this.$dataError(), O !== o.nil && M.assign(O, !1)), M.else();
    }
    invalid$data() {
      const { gen: O, schemaCode: k, schemaType: M, def: K, it: J } = this;
      return (0, o.or)(oe(), $e());
      function oe() {
        if (M.length) {
          if (!(k instanceof o.Name))
            throw new Error("ajv implementation error");
          const le = Array.isArray(M) ? M : [M];
          return (0, o._)`${(0, r.checkDataTypes)(le, k, J.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function $e() {
        if (K.validateSchema) {
          const le = O.scopeValue("validate$data", { ref: K.validateSchema });
          return (0, o._)`!${le}(${k})`;
        }
        return o.nil;
      }
    }
    subschema(O, k) {
      const M = (0, i.getSubschema)(this.it, O);
      (0, i.extendSubschemaData)(M, this.it, O), (0, i.extendSubschemaMode)(M, O);
      const K = { ...this.it, ...M, items: void 0, props: void 0 };
      return h(K, k), K;
    }
    mergeEvaluated(O, k) {
      const { it: M, gen: K } = this;
      M.opts.unevaluated && (M.props !== !0 && O.props !== void 0 && (M.props = c.mergeEvaluated.props(K, O.props, M.props, k)), M.items !== !0 && O.items !== void 0 && (M.items = c.mergeEvaluated.items(K, O.items, M.items, k)));
    }
    mergeValidEvaluated(O, k) {
      const { it: M, gen: K } = this;
      if (M.opts.unevaluated && (M.props !== !0 || M.items !== !0))
        return K.if(k, () => this.mergeEvaluated(O, o.Name)), !0;
    }
  }
  Ke.KeywordCxt = A;
  function G(R, O, k, M) {
    const K = new A(R, k, O);
    "code" in k ? k.code(K, M) : K.$data && k.validate ? (0, n.funcKeywordCode)(K, k) : "macro" in k ? (0, n.macroKeywordCode)(K, k) : (k.compile || k.validate) && (0, n.funcKeywordCode)(K, k);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Y(R, { dataLevel: O, dataNames: k, dataPathArr: M }) {
    let K, J;
    if (R === "")
      return u.default.rootData;
    if (R[0] === "/") {
      if (!H.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      K = R, J = u.default.rootData;
    } else {
      const de = Z.exec(R);
      if (!de)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const ie = +de[1];
      if (K = de[2], K === "#") {
        if (ie >= O)
          throw new Error(le("property/index", ie));
        return M[O - ie];
      }
      if (ie > O)
        throw new Error(le("data", ie));
      if (J = k[O - ie], !K)
        return J;
    }
    let oe = J;
    const $e = K.split("/");
    for (const de of $e)
      de && (J = (0, o._)`${J}${(0, o.getProperty)((0, c.unescapeJsonPointer)(de))}`, oe = (0, o._)`${oe} && ${J}`);
    return oe;
    function le(de, ie) {
      return `Cannot access ${de} ${ie} levels up, current level is ${O}`;
    }
  }
  return Ke.getData = Y, Ke;
}
var xt = {}, So;
function Oa() {
  if (So) return xt;
  So = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return xt.default = e, xt;
}
var Jt = {}, Po;
function Bn() {
  if (Po) return Jt;
  Po = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = Kn();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Jt.default = t, Jt;
}
var Te = {}, Ro;
function Wn() {
  if (Ro) return Te;
  Ro = 1, Object.defineProperty(Te, "__esModule", { value: !0 }), Te.resolveSchema = Te.getCompilingSchema = Te.resolveRef = Te.compileSchema = Te.SchemaEnv = void 0;
  const e = te(), t = Oa(), s = Le(), r = Kn(), l = ae(), n = Hn();
  class i {
    constructor(f) {
      var a;
      this.refs = {}, this.dynamicAnchors = {};
      let h;
      typeof f.schema == "object" && (h = f.schema), this.schema = f.schema, this.schemaId = f.schemaId, this.root = f.root || this, this.baseId = (a = f.baseId) !== null && a !== void 0 ? a : (0, r.normalizeId)(h == null ? void 0 : h[f.schemaId || "$id"]), this.schemaPath = f.schemaPath, this.localRefs = f.localRefs, this.meta = f.meta, this.$async = h == null ? void 0 : h.$async, this.refs = {};
    }
  }
  Te.SchemaEnv = i;
  function o(d) {
    const f = c.call(this, d);
    if (f)
      return f;
    const a = (0, r.getFullPath)(this.opts.uriResolver, d.root.baseId), { es5: h, lines: _ } = this.opts.code, { ownProperties: v } = this.opts, y = new e.CodeGen(this.scope, { es5: h, lines: _, ownProperties: v });
    let P;
    d.$async && (P = y.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = y.scopeName("validate");
    d.validateName = T;
    const q = {
      gen: y,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: y.scopeValue("schema", this.opts.code.source === !0 ? { ref: d.schema, code: (0, e.stringify)(d.schema) } : { ref: d.schema }),
      validateName: T,
      ValidationError: P,
      schema: d.schema,
      schemaEnv: d,
      rootId: a,
      baseId: d.baseId || a,
      schemaPath: e.nil,
      errSchemaPath: d.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let F;
    try {
      this._compilations.add(d), (0, n.validateFunctionCode)(q), y.optimize(this.opts.code.optimize);
      const D = y.toString();
      F = `${y.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (F = this.opts.code.process(F, d));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, F)(this, this.scope.get());
      if (this.scope.value(T, { ref: z }), z.errors = null, z.schema = d.schema, z.schemaEnv = d, d.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: T, validateCode: D, scopeValues: y._values }), this.opts.unevaluated) {
        const { props: L, items: V } = q;
        z.evaluated = {
          props: L instanceof e.Name ? void 0 : L,
          items: V instanceof e.Name ? void 0 : V,
          dynamicProps: L instanceof e.Name,
          dynamicItems: V instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return d.validate = z, d;
    } catch (D) {
      throw delete d.validate, delete d.validateName, F && this.logger.error("Error compiling schema, function code:", F), D;
    } finally {
      this._compilations.delete(d);
    }
  }
  Te.compileSchema = o;
  function u(d, f, a) {
    var h;
    a = (0, r.resolveUrl)(this.opts.uriResolver, f, a);
    const _ = d.refs[a];
    if (_)
      return _;
    let v = w.call(this, d, a);
    if (v === void 0) {
      const y = (h = d.localRefs) === null || h === void 0 ? void 0 : h[a], { schemaId: P } = this.opts;
      y && (v = new i({ schema: y, schemaId: P, root: d, baseId: f }));
    }
    if (v !== void 0)
      return d.refs[a] = p.call(this, v);
  }
  Te.resolveRef = u;
  function p(d) {
    return (0, r.inlineRef)(d.schema, this.opts.inlineRefs) ? d.schema : d.validate ? d : o.call(this, d);
  }
  function c(d) {
    for (const f of this._compilations)
      if ($(f, d))
        return f;
  }
  Te.getCompilingSchema = c;
  function $(d, f) {
    return d.schema === f.schema && d.root === f.root && d.baseId === f.baseId;
  }
  function w(d, f) {
    let a;
    for (; typeof (a = this.refs[f]) == "string"; )
      f = a;
    return a || this.schemas[f] || E.call(this, d, f);
  }
  function E(d, f) {
    const a = this.opts.uriResolver.parse(f), h = (0, r._getFullPath)(this.opts.uriResolver, a);
    let _ = (0, r.getFullPath)(this.opts.uriResolver, d.baseId, void 0);
    if (Object.keys(d.schema).length > 0 && h === _)
      return g.call(this, a, d);
    const v = (0, r.normalizeId)(h), y = this.refs[v] || this.schemas[v];
    if (typeof y == "string") {
      const P = E.call(this, d, y);
      return typeof (P == null ? void 0 : P.schema) != "object" ? void 0 : g.call(this, a, P);
    }
    if (typeof (y == null ? void 0 : y.schema) == "object") {
      if (y.validate || o.call(this, y), v === (0, r.normalizeId)(f)) {
        const { schema: P } = y, { schemaId: T } = this.opts, q = P[T];
        return q && (_ = (0, r.resolveUrl)(this.opts.uriResolver, _, q)), new i({ schema: P, schemaId: T, root: d, baseId: _ });
      }
      return g.call(this, a, y);
    }
  }
  Te.resolveSchema = E;
  const S = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function g(d, { baseId: f, schema: a, root: h }) {
    var _;
    if (((_ = d.fragment) === null || _ === void 0 ? void 0 : _[0]) !== "/")
      return;
    for (const P of d.fragment.slice(1).split("/")) {
      if (typeof a == "boolean")
        return;
      const T = a[(0, l.unescapeFragment)(P)];
      if (T === void 0)
        return;
      a = T;
      const q = typeof a == "object" && a[this.opts.schemaId];
      !S.has(P) && q && (f = (0, r.resolveUrl)(this.opts.uriResolver, f, q));
    }
    let v;
    if (typeof a != "boolean" && a.$ref && !(0, l.schemaHasRulesButRef)(a, this.RULES)) {
      const P = (0, r.resolveUrl)(this.opts.uriResolver, f, a.$ref);
      v = E.call(this, h, P);
    }
    const { schemaId: y } = this.opts;
    if (v = v || new i({ schema: a, schemaId: y, root: h, baseId: f }), v.schema !== v.root.schema)
      return v;
  }
  return Te;
}
const _d = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", wd = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Ed = "object", bd = ["$data"], Sd = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Pd = !1, Rd = {
  $id: _d,
  description: wd,
  type: Ed,
  required: bd,
  properties: Sd,
  additionalProperties: Pd
};
var Xt = {}, Mt = { exports: {} }, ys, No;
function Nd() {
  return No || (No = 1, ys = {
    HEX: {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      a: 10,
      A: 10,
      b: 11,
      B: 11,
      c: 12,
      C: 12,
      d: 13,
      D: 13,
      e: 14,
      E: 14,
      f: 15,
      F: 15
    }
  }), ys;
}
var $s, Io;
function Id() {
  if (Io) return $s;
  Io = 1;
  const { HEX: e } = Nd(), t = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
  function s(g) {
    if (o(g, ".") < 3)
      return { host: g, isIPV4: !1 };
    const d = g.match(t) || [], [f] = d;
    return f ? { host: i(f, "."), isIPV4: !0 } : { host: g, isIPV4: !1 };
  }
  function r(g, d = !1) {
    let f = "", a = !0;
    for (const h of g) {
      if (e[h] === void 0) return;
      h !== "0" && a === !0 && (a = !1), a || (f += h);
    }
    return d && f.length === 0 && (f = "0"), f;
  }
  function l(g) {
    let d = 0;
    const f = { error: !1, address: "", zone: "" }, a = [], h = [];
    let _ = !1, v = !1, y = !1;
    function P() {
      if (h.length) {
        if (_ === !1) {
          const T = r(h);
          if (T !== void 0)
            a.push(T);
          else
            return f.error = !0, !1;
        }
        h.length = 0;
      }
      return !0;
    }
    for (let T = 0; T < g.length; T++) {
      const q = g[T];
      if (!(q === "[" || q === "]"))
        if (q === ":") {
          if (v === !0 && (y = !0), !P())
            break;
          if (d++, a.push(":"), d > 7) {
            f.error = !0;
            break;
          }
          T - 1 >= 0 && g[T - 1] === ":" && (v = !0);
          continue;
        } else if (q === "%") {
          if (!P())
            break;
          _ = !0;
        } else {
          h.push(q);
          continue;
        }
    }
    return h.length && (_ ? f.zone = h.join("") : y ? a.push(h.join("")) : a.push(r(h))), f.address = a.join(""), f;
  }
  function n(g) {
    if (o(g, ":") < 2)
      return { host: g, isIPV6: !1 };
    const d = l(g);
    if (d.error)
      return { host: g, isIPV6: !1 };
    {
      let f = d.address, a = d.address;
      return d.zone && (f += "%" + d.zone, a += "%25" + d.zone), { host: f, escapedHost: a, isIPV6: !0 };
    }
  }
  function i(g, d) {
    let f = "", a = !0;
    const h = g.length;
    for (let _ = 0; _ < h; _++) {
      const v = g[_];
      v === "0" && a ? (_ + 1 <= h && g[_ + 1] === d || _ + 1 === h) && (f += v, a = !1) : (v === d ? a = !0 : a = !1, f += v);
    }
    return f;
  }
  function o(g, d) {
    let f = 0;
    for (let a = 0; a < g.length; a++)
      g[a] === d && f++;
    return f;
  }
  const u = /^\.\.?\//u, p = /^\/\.(?:\/|$)/u, c = /^\/\.\.(?:\/|$)/u, $ = /^\/?(?:.|\n)*?(?=\/|$)/u;
  function w(g) {
    const d = [];
    for (; g.length; )
      if (g.match(u))
        g = g.replace(u, "");
      else if (g.match(p))
        g = g.replace(p, "/");
      else if (g.match(c))
        g = g.replace(c, "/"), d.pop();
      else if (g === "." || g === "..")
        g = "";
      else {
        const f = g.match($);
        if (f) {
          const a = f[0];
          g = g.slice(a.length), d.push(a);
        } else
          throw new Error("Unexpected dot segment condition");
      }
    return d.join("");
  }
  function E(g, d) {
    const f = d !== !0 ? escape : unescape;
    return g.scheme !== void 0 && (g.scheme = f(g.scheme)), g.userinfo !== void 0 && (g.userinfo = f(g.userinfo)), g.host !== void 0 && (g.host = f(g.host)), g.path !== void 0 && (g.path = f(g.path)), g.query !== void 0 && (g.query = f(g.query)), g.fragment !== void 0 && (g.fragment = f(g.fragment)), g;
  }
  function S(g) {
    const d = [];
    if (g.userinfo !== void 0 && (d.push(g.userinfo), d.push("@")), g.host !== void 0) {
      let f = unescape(g.host);
      const a = s(f);
      if (a.isIPV4)
        f = a.host;
      else {
        const h = n(a.host);
        h.isIPV6 === !0 ? f = `[${h.escapedHost}]` : f = g.host;
      }
      d.push(f);
    }
    return (typeof g.port == "number" || typeof g.port == "string") && (d.push(":"), d.push(String(g.port))), d.length ? d.join("") : void 0;
  }
  return $s = {
    recomposeAuthority: S,
    normalizeComponentEncoding: E,
    removeDotSegments: w,
    normalizeIPv4: s,
    normalizeIPv6: n,
    stringArrayToHexStripped: r
  }, $s;
}
var gs, Oo;
function Od() {
  if (Oo) return gs;
  Oo = 1;
  const e = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
  function s(a) {
    return typeof a.secure == "boolean" ? a.secure : String(a.scheme).toLowerCase() === "wss";
  }
  function r(a) {
    return a.host || (a.error = a.error || "HTTP URIs must have a host."), a;
  }
  function l(a) {
    const h = String(a.scheme).toLowerCase() === "https";
    return (a.port === (h ? 443 : 80) || a.port === "") && (a.port = void 0), a.path || (a.path = "/"), a;
  }
  function n(a) {
    return a.secure = s(a), a.resourceName = (a.path || "/") + (a.query ? "?" + a.query : ""), a.path = void 0, a.query = void 0, a;
  }
  function i(a) {
    if ((a.port === (s(a) ? 443 : 80) || a.port === "") && (a.port = void 0), typeof a.secure == "boolean" && (a.scheme = a.secure ? "wss" : "ws", a.secure = void 0), a.resourceName) {
      const [h, _] = a.resourceName.split("?");
      a.path = h && h !== "/" ? h : void 0, a.query = _, a.resourceName = void 0;
    }
    return a.fragment = void 0, a;
  }
  function o(a, h) {
    if (!a.path)
      return a.error = "URN can not be parsed", a;
    const _ = a.path.match(t);
    if (_) {
      const v = h.scheme || a.scheme || "urn";
      a.nid = _[1].toLowerCase(), a.nss = _[2];
      const y = `${v}:${h.nid || a.nid}`, P = f[y];
      a.path = void 0, P && (a = P.parse(a, h));
    } else
      a.error = a.error || "URN can not be parsed.";
    return a;
  }
  function u(a, h) {
    const _ = h.scheme || a.scheme || "urn", v = a.nid.toLowerCase(), y = `${_}:${h.nid || v}`, P = f[y];
    P && (a = P.serialize(a, h));
    const T = a, q = a.nss;
    return T.path = `${v || h.nid}:${q}`, h.skipEscape = !0, T;
  }
  function p(a, h) {
    const _ = a;
    return _.uuid = _.nss, _.nss = void 0, !h.tolerant && (!_.uuid || !e.test(_.uuid)) && (_.error = _.error || "UUID is not valid."), _;
  }
  function c(a) {
    const h = a;
    return h.nss = (a.uuid || "").toLowerCase(), h;
  }
  const $ = {
    scheme: "http",
    domainHost: !0,
    parse: r,
    serialize: l
  }, w = {
    scheme: "https",
    domainHost: $.domainHost,
    parse: r,
    serialize: l
  }, E = {
    scheme: "ws",
    domainHost: !0,
    parse: n,
    serialize: i
  }, S = {
    scheme: "wss",
    domainHost: E.domainHost,
    parse: E.parse,
    serialize: E.serialize
  }, f = {
    http: $,
    https: w,
    ws: E,
    wss: S,
    urn: {
      scheme: "urn",
      parse: o,
      serialize: u,
      skipNormalize: !0
    },
    "urn:uuid": {
      scheme: "urn:uuid",
      parse: p,
      serialize: c,
      skipNormalize: !0
    }
  };
  return gs = f, gs;
}
var To;
function rl() {
  if (To) return Mt.exports;
  To = 1;
  const { normalizeIPv6: e, normalizeIPv4: t, removeDotSegments: s, recomposeAuthority: r, normalizeComponentEncoding: l } = Id(), n = Od();
  function i(d, f) {
    return typeof d == "string" ? d = c(S(d, f), f) : typeof d == "object" && (d = S(c(d, f), f)), d;
  }
  function o(d, f, a) {
    const h = Object.assign({ scheme: "null" }, a), _ = u(S(d, h), S(f, h), h, !0);
    return c(_, { ...h, skipEscape: !0 });
  }
  function u(d, f, a, h) {
    const _ = {};
    return h || (d = S(c(d, a), a), f = S(c(f, a), a)), a = a || {}, !a.tolerant && f.scheme ? (_.scheme = f.scheme, _.userinfo = f.userinfo, _.host = f.host, _.port = f.port, _.path = s(f.path || ""), _.query = f.query) : (f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0 ? (_.userinfo = f.userinfo, _.host = f.host, _.port = f.port, _.path = s(f.path || ""), _.query = f.query) : (f.path ? (f.path.charAt(0) === "/" ? _.path = s(f.path) : ((d.userinfo !== void 0 || d.host !== void 0 || d.port !== void 0) && !d.path ? _.path = "/" + f.path : d.path ? _.path = d.path.slice(0, d.path.lastIndexOf("/") + 1) + f.path : _.path = f.path, _.path = s(_.path)), _.query = f.query) : (_.path = d.path, f.query !== void 0 ? _.query = f.query : _.query = d.query), _.userinfo = d.userinfo, _.host = d.host, _.port = d.port), _.scheme = d.scheme), _.fragment = f.fragment, _;
  }
  function p(d, f, a) {
    return typeof d == "string" ? (d = unescape(d), d = c(l(S(d, a), !0), { ...a, skipEscape: !0 })) : typeof d == "object" && (d = c(l(d, !0), { ...a, skipEscape: !0 })), typeof f == "string" ? (f = unescape(f), f = c(l(S(f, a), !0), { ...a, skipEscape: !0 })) : typeof f == "object" && (f = c(l(f, !0), { ...a, skipEscape: !0 })), d.toLowerCase() === f.toLowerCase();
  }
  function c(d, f) {
    const a = {
      host: d.host,
      scheme: d.scheme,
      userinfo: d.userinfo,
      port: d.port,
      path: d.path,
      query: d.query,
      nid: d.nid,
      nss: d.nss,
      uuid: d.uuid,
      fragment: d.fragment,
      reference: d.reference,
      resourceName: d.resourceName,
      secure: d.secure,
      error: ""
    }, h = Object.assign({}, f), _ = [], v = n[(h.scheme || a.scheme || "").toLowerCase()];
    v && v.serialize && v.serialize(a, h), a.path !== void 0 && (h.skipEscape ? a.path = unescape(a.path) : (a.path = escape(a.path), a.scheme !== void 0 && (a.path = a.path.split("%3A").join(":")))), h.reference !== "suffix" && a.scheme && _.push(a.scheme, ":");
    const y = r(a);
    if (y !== void 0 && (h.reference !== "suffix" && _.push("//"), _.push(y), a.path && a.path.charAt(0) !== "/" && _.push("/")), a.path !== void 0) {
      let P = a.path;
      !h.absolutePath && (!v || !v.absolutePath) && (P = s(P)), y === void 0 && (P = P.replace(/^\/\//u, "/%2F")), _.push(P);
    }
    return a.query !== void 0 && _.push("?", a.query), a.fragment !== void 0 && _.push("#", a.fragment), _.join("");
  }
  const $ = Array.from({ length: 127 }, (d, f) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(f)));
  function w(d) {
    let f = 0;
    for (let a = 0, h = d.length; a < h; ++a)
      if (f = d.charCodeAt(a), f > 126 || $[f])
        return !0;
    return !1;
  }
  const E = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function S(d, f) {
    const a = Object.assign({}, f), h = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    }, _ = d.indexOf("%") !== -1;
    let v = !1;
    a.reference === "suffix" && (d = (a.scheme ? a.scheme + ":" : "") + "//" + d);
    const y = d.match(E);
    if (y) {
      if (h.scheme = y[1], h.userinfo = y[3], h.host = y[4], h.port = parseInt(y[5], 10), h.path = y[6] || "", h.query = y[7], h.fragment = y[8], isNaN(h.port) && (h.port = y[5]), h.host) {
        const T = t(h.host);
        if (T.isIPV4 === !1) {
          const q = e(T.host);
          h.host = q.host.toLowerCase(), v = q.isIPV6;
        } else
          h.host = T.host, v = !0;
      }
      h.scheme === void 0 && h.userinfo === void 0 && h.host === void 0 && h.port === void 0 && h.query === void 0 && !h.path ? h.reference = "same-document" : h.scheme === void 0 ? h.reference = "relative" : h.fragment === void 0 ? h.reference = "absolute" : h.reference = "uri", a.reference && a.reference !== "suffix" && a.reference !== h.reference && (h.error = h.error || "URI is not a " + a.reference + " reference.");
      const P = n[(a.scheme || h.scheme || "").toLowerCase()];
      if (!a.unicodeSupport && (!P || !P.unicodeSupport) && h.host && (a.domainHost || P && P.domainHost) && v === !1 && w(h.host))
        try {
          h.host = URL.domainToASCII(h.host.toLowerCase());
        } catch (T) {
          h.error = h.error || "Host's domain name can not be converted to ASCII: " + T;
        }
      (!P || P && !P.skipNormalize) && (_ && h.scheme !== void 0 && (h.scheme = unescape(h.scheme)), _ && h.host !== void 0 && (h.host = unescape(h.host)), h.path && (h.path = escape(unescape(h.path))), h.fragment && (h.fragment = encodeURI(decodeURIComponent(h.fragment)))), P && P.parse && P.parse(h, a);
    } else
      h.error = h.error || "URI can not be parsed.";
    return h;
  }
  const g = {
    SCHEMES: n,
    normalize: i,
    resolve: o,
    resolveComponents: u,
    equal: p,
    serialize: c,
    parse: S
  };
  return Mt.exports = g, Mt.exports.default = g, Mt.exports.fastUri = g, Mt.exports;
}
var Ao;
function Td() {
  if (Ao) return Xt;
  Ao = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = rl();
  return e.code = 'require("ajv/dist/runtime/uri").default', Xt.default = e, Xt;
}
var jo;
function Ad() {
  return jo || (jo = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Hn();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = te();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = Oa(), l = Bn(), n = el(), i = Wn(), o = te(), u = Kn(), p = Dn(), c = ae(), $ = Rd, w = Td(), E = (C, N) => new RegExp(C, N);
    E.code = "new RegExp";
    const S = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), d = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, f = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, a = 200;
    function h(C) {
      var N, j, I, m, b, A, G, H, Z, Y, R, O, k, M, K, J, oe, $e, le, de, ie, Ie, me, it, ct;
      const qe = C.strict, ut = (N = C.code) === null || N === void 0 ? void 0 : N.optimize, Tt = ut === !0 || ut === void 0 ? 1 : ut || 0, At = (I = (j = C.code) === null || j === void 0 ? void 0 : j.regExp) !== null && I !== void 0 ? I : E, ss = (m = C.uriResolver) !== null && m !== void 0 ? m : w.default;
      return {
        strictSchema: (A = (b = C.strictSchema) !== null && b !== void 0 ? b : qe) !== null && A !== void 0 ? A : !0,
        strictNumbers: (H = (G = C.strictNumbers) !== null && G !== void 0 ? G : qe) !== null && H !== void 0 ? H : !0,
        strictTypes: (Y = (Z = C.strictTypes) !== null && Z !== void 0 ? Z : qe) !== null && Y !== void 0 ? Y : "log",
        strictTuples: (O = (R = C.strictTuples) !== null && R !== void 0 ? R : qe) !== null && O !== void 0 ? O : "log",
        strictRequired: (M = (k = C.strictRequired) !== null && k !== void 0 ? k : qe) !== null && M !== void 0 ? M : !1,
        code: C.code ? { ...C.code, optimize: Tt, regExp: At } : { optimize: Tt, regExp: At },
        loopRequired: (K = C.loopRequired) !== null && K !== void 0 ? K : a,
        loopEnum: (J = C.loopEnum) !== null && J !== void 0 ? J : a,
        meta: (oe = C.meta) !== null && oe !== void 0 ? oe : !0,
        messages: ($e = C.messages) !== null && $e !== void 0 ? $e : !0,
        inlineRefs: (le = C.inlineRefs) !== null && le !== void 0 ? le : !0,
        schemaId: (de = C.schemaId) !== null && de !== void 0 ? de : "$id",
        addUsedSchema: (ie = C.addUsedSchema) !== null && ie !== void 0 ? ie : !0,
        validateSchema: (Ie = C.validateSchema) !== null && Ie !== void 0 ? Ie : !0,
        validateFormats: (me = C.validateFormats) !== null && me !== void 0 ? me : !0,
        unicodeRegExp: (it = C.unicodeRegExp) !== null && it !== void 0 ? it : !0,
        int32range: (ct = C.int32range) !== null && ct !== void 0 ? ct : !0,
        uriResolver: ss
      };
    }
    class _ {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...h(N) };
        const { es5: j, lines: I } = this.opts.code;
        this.scope = new o.ValueScope({ scope: {}, prefixes: g, es5: j, lines: I }), this.logger = U(N.logger);
        const m = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), v.call(this, d, N, "NOT SUPPORTED"), v.call(this, f, N, "DEPRECATED", "warn"), this._metaOpts = F.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && q.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), P.call(this), N.validateFormats = m;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: j, schemaId: I } = this.opts;
        let m = $;
        I === "id" && (m = { ...$ }, m.id = m.$id, delete m.$id), j && N && this.addMetaSchema(m, m[I], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[j] || N : void 0;
      }
      validate(N, j) {
        let I;
        if (typeof N == "string") {
          if (I = this.getSchema(N), !I)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          I = this.compile(N);
        const m = I(j);
        return "$async" in I || (this.errors = I.errors), m;
      }
      compile(N, j) {
        const I = this._addSchema(N, j);
        return I.validate || this._compileSchemaEnv(I);
      }
      compileAsync(N, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: I } = this.opts;
        return m.call(this, N, j);
        async function m(Y, R) {
          await b.call(this, Y.$schema);
          const O = this._addSchema(Y, R);
          return O.validate || A.call(this, O);
        }
        async function b(Y) {
          Y && !this.getSchema(Y) && await m.call(this, { $ref: Y }, !0);
        }
        async function A(Y) {
          try {
            return this._compileSchemaEnv(Y);
          } catch (R) {
            if (!(R instanceof l.default))
              throw R;
            return G.call(this, R), await H.call(this, R.missingSchema), A.call(this, Y);
          }
        }
        function G({ missingSchema: Y, missingRef: R }) {
          if (this.refs[Y])
            throw new Error(`AnySchema ${Y} is loaded but ${R} cannot be resolved`);
        }
        async function H(Y) {
          const R = await Z.call(this, Y);
          this.refs[Y] || await b.call(this, R.$schema), this.refs[Y] || this.addSchema(R, Y, j);
        }
        async function Z(Y) {
          const R = this._loading[Y];
          if (R)
            return R;
          try {
            return await (this._loading[Y] = I(Y));
          } finally {
            delete this._loading[Y];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, j, I, m = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const A of N)
            this.addSchema(A, void 0, I, m);
          return this;
        }
        let b;
        if (typeof N == "object") {
          const { schemaId: A } = this.opts;
          if (b = N[A], b !== void 0 && typeof b != "string")
            throw new Error(`schema ${A} must be string`);
        }
        return j = (0, u.normalizeId)(j || b), this._checkUnique(j), this.schemas[j] = this._addSchema(N, I, j, m, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, j, I = this.opts.validateSchema) {
        return this.addSchema(N, j, !0, I), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, j) {
        if (typeof N == "boolean")
          return !0;
        let I;
        if (I = N.$schema, I !== void 0 && typeof I != "string")
          throw new Error("$schema must be a string");
        if (I = I || this.opts.defaultMeta || this.defaultMeta(), !I)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const m = this.validate(I, N);
        if (!m && j) {
          const b = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(b);
          else
            throw new Error(b);
        }
        return m;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let j;
        for (; typeof (j = y.call(this, N)) == "string"; )
          N = j;
        if (j === void 0) {
          const { schemaId: I } = this.opts, m = new i.SchemaEnv({ schema: {}, schemaId: I });
          if (j = i.resolveSchema.call(this, m, N), !j)
            return;
          this.refs[N] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = y.call(this, N);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const j = N;
            this._cache.delete(j);
            let I = N[this.opts.schemaId];
            return I && (I = (0, u.normalizeId)(I), delete this.schemas[I], delete this.refs[I]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const j of N)
          this.addKeyword(j);
        return this;
      }
      addKeyword(N, j) {
        let I;
        if (typeof N == "string")
          I = N, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = I);
        else if (typeof N == "object" && j === void 0) {
          if (j = N, I = j.keyword, Array.isArray(I) && !I.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (L.call(this, I, j), !j)
          return (0, c.eachItem)(I, (b) => V.call(this, b)), this;
        W.call(this, j);
        const m = {
          ...j,
          type: (0, p.getJSONTypes)(j.type),
          schemaType: (0, p.getJSONTypes)(j.schemaType)
        };
        return (0, c.eachItem)(I, m.type.length === 0 ? (b) => V.call(this, b, m) : (b) => m.type.forEach((A) => V.call(this, b, m, A))), this;
      }
      getKeyword(N) {
        const j = this.RULES.all[N];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: j } = this;
        delete j.keywords[N], delete j.all[N];
        for (const I of j.rules) {
          const m = I.rules.findIndex((b) => b.keyword === N);
          m >= 0 && I.rules.splice(m, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[N] = j, this;
      }
      errorsText(N = this.errors, { separator: j = ", ", dataVar: I = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((m) => `${I}${m.instancePath} ${m.message}`).reduce((m, b) => m + j + b);
      }
      $dataMetaSchema(N, j) {
        const I = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const m of j) {
          const b = m.split("/").slice(1);
          let A = N;
          for (const G of b)
            A = A[G];
          for (const G in I) {
            const H = I[G];
            if (typeof H != "object")
              continue;
            const { $data: Z } = H.definition, Y = A[G];
            Z && Y && (A[G] = X(Y));
          }
        }
        return N;
      }
      _removeAllSchemas(N, j) {
        for (const I in N) {
          const m = N[I];
          (!j || j.test(I)) && (typeof m == "string" ? delete N[I] : m && !m.meta && (this._cache.delete(m.schema), delete N[I]));
        }
      }
      _addSchema(N, j, I, m = this.opts.validateSchema, b = this.opts.addUsedSchema) {
        let A;
        const { schemaId: G } = this.opts;
        if (typeof N == "object")
          A = N[G];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        I = (0, u.normalizeId)(A || I);
        const Z = u.getSchemaRefs.call(this, N, I);
        return H = new i.SchemaEnv({ schema: N, schemaId: G, meta: j, baseId: I, localRefs: Z }), this._cache.set(H.schema, H), b && !I.startsWith("#") && (I && this._checkUnique(I), this.refs[I] = H), m && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = j;
        }
      }
    }
    _.ValidationError = r.default, _.MissingRefError = l.default, e.default = _;
    function v(C, N, j, I = "error") {
      for (const m in C) {
        const b = m;
        b in N && this.logger[I](`${j}: option ${m}. ${C[b]}`);
      }
    }
    function y(C) {
      return C = (0, u.normalizeId)(C), this.schemas[C] || this.refs[C];
    }
    function P() {
      const C = this.opts.schemas;
      if (C)
        if (Array.isArray(C))
          this.addSchema(C);
        else
          for (const N in C)
            this.addSchema(C[N], N);
    }
    function T() {
      for (const C in this.opts.formats) {
        const N = this.opts.formats[C];
        N && this.addFormat(C, N);
      }
    }
    function q(C) {
      if (Array.isArray(C)) {
        this.addVocabulary(C);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in C) {
        const j = C[N];
        j.keyword || (j.keyword = N), this.addKeyword(j);
      }
    }
    function F() {
      const C = { ...this.opts };
      for (const N of S)
        delete C[N];
      return C;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(C) {
      if (C === !1)
        return D;
      if (C === void 0)
        return console;
      if (C.log && C.warn && C.error)
        return C;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function L(C, N) {
      const { RULES: j } = this;
      if ((0, c.eachItem)(C, (I) => {
        if (j.keywords[I])
          throw new Error(`Keyword ${I} is already defined`);
        if (!z.test(I))
          throw new Error(`Keyword ${I} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function V(C, N, j) {
      var I;
      const m = N == null ? void 0 : N.post;
      if (j && m)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: b } = this;
      let A = m ? b.post : b.rules.find(({ type: H }) => H === j);
      if (A || (A = { type: j, rules: [] }, b.rules.push(A)), b.keywords[C] = !0, !N)
        return;
      const G = {
        keyword: C,
        definition: {
          ...N,
          type: (0, p.getJSONTypes)(N.type),
          schemaType: (0, p.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? x.call(this, A, G, N.before) : A.rules.push(G), b.all[C] = G, (I = N.implements) === null || I === void 0 || I.forEach((H) => this.addKeyword(H));
    }
    function x(C, N, j) {
      const I = C.rules.findIndex((m) => m.keyword === j);
      I >= 0 ? C.rules.splice(I, 0, N) : (C.rules.push(N), this.logger.warn(`rule ${j} is not defined`));
    }
    function W(C) {
      let { metaSchema: N } = C;
      N !== void 0 && (C.$data && this.opts.$data && (N = X(N)), C.validateSchema = this.compile(N, !0));
    }
    const B = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function X(C) {
      return { anyOf: [C, B] };
    }
  }(us)), us;
}
var Yt = {}, Zt = {}, Qt = {}, Co;
function jd() {
  if (Co) return Qt;
  Co = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Qt.default = e, Qt;
}
var rt = {}, ko;
function Ta() {
  if (ko) return rt;
  ko = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.callRef = rt.getValidate = void 0;
  const e = Bn(), t = Fe(), s = te(), r = Le(), l = Wn(), n = ae(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(p) {
      const { gen: c, schema: $, it: w } = p, { baseId: E, schemaEnv: S, validateName: g, opts: d, self: f } = w, { root: a } = S;
      if (($ === "#" || $ === "#/") && E === a.baseId)
        return _();
      const h = l.resolveRef.call(f, a, E, $);
      if (h === void 0)
        throw new e.default(w.opts.uriResolver, E, $);
      if (h instanceof l.SchemaEnv)
        return v(h);
      return y(h);
      function _() {
        if (S === a)
          return u(p, g, S, S.$async);
        const P = c.scopeValue("root", { ref: a });
        return u(p, (0, s._)`${P}.validate`, a, a.$async);
      }
      function v(P) {
        const T = o(p, P);
        u(p, T, P, P.$async);
      }
      function y(P) {
        const T = c.scopeValue("schema", d.code.source === !0 ? { ref: P, code: (0, s.stringify)(P) } : { ref: P }), q = c.name("valid"), F = p.subschema({
          schema: P,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: $
        }, q);
        p.mergeEvaluated(F), p.ok(q);
      }
    }
  };
  function o(p, c) {
    const { gen: $ } = p;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  rt.getValidate = o;
  function u(p, c, $, w) {
    const { gen: E, it: S } = p, { allErrors: g, schemaEnv: d, opts: f } = S, a = f.passContext ? r.default.this : s.nil;
    w ? h() : _();
    function h() {
      if (!d.$async)
        throw new Error("async schema referenced by sync schema");
      const P = E.let("valid");
      E.try(() => {
        E.code((0, s._)`await ${(0, t.callValidateCode)(p, c, a)}`), y(c), g || E.assign(P, !0);
      }, (T) => {
        E.if((0, s._)`!(${T} instanceof ${S.ValidationError})`, () => E.throw(T)), v(T), g || E.assign(P, !1);
      }), p.ok(P);
    }
    function _() {
      p.result((0, t.callValidateCode)(p, c, a), () => y(c), () => v(c));
    }
    function v(P) {
      const T = (0, s._)`${P}.errors`;
      E.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), E.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function y(P) {
      var T;
      if (!S.opts.unevaluated)
        return;
      const q = (T = $ == null ? void 0 : $.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (S.props !== !0)
        if (q && !q.dynamicProps)
          q.props !== void 0 && (S.props = n.mergeEvaluated.props(E, q.props, S.props));
        else {
          const F = E.var("props", (0, s._)`${P}.evaluated.props`);
          S.props = n.mergeEvaluated.props(E, F, S.props, s.Name);
        }
      if (S.items !== !0)
        if (q && !q.dynamicItems)
          q.items !== void 0 && (S.items = n.mergeEvaluated.items(E, q.items, S.items));
        else {
          const F = E.var("items", (0, s._)`${P}.evaluated.items`);
          S.items = n.mergeEvaluated.items(E, F, S.items, s.Name);
        }
    }
  }
  return rt.callRef = u, rt.default = i, rt;
}
var qo;
function Cd() {
  if (qo) return Zt;
  qo = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = jd(), t = Ta(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Zt.default = s, Zt;
}
var er = {}, tr = {}, Do;
function kd() {
  if (Do) return tr;
  Do = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = te(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: o, schemaCode: u } = n;
      n.fail$data((0, e._)`${o} ${s[i].fail} ${u} || isNaN(${o})`);
    }
  };
  return tr.default = l, tr;
}
var rr = {}, Mo;
function qd() {
  if (Mo) return rr;
  Mo = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = te(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: o } = r, u = o.opts.multipleOfPrecision, p = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${p}) - ${p}) > 1e-${u}` : (0, e._)`${p} !== parseInt(${p})`;
      r.fail$data((0, e._)`(${i} === 0 || (${p} = ${n}/${i}, ${c}))`);
    }
  };
  return rr.default = s, rr;
}
var nr = {}, sr = {}, Lo;
function Dd() {
  if (Lo) return sr;
  Lo = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return sr.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', sr;
}
var Fo;
function Md() {
  if (Fo) return nr;
  Fo = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = te(), t = ae(), s = Dd(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const o = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${o} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: o, schemaCode: u, it: p } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = p.opts.unicode === !1 ? (0, e._)`${o}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${o})`;
      n.fail$data((0, e._)`${$} ${c} ${u}`);
    }
  };
  return nr.default = l, nr;
}
var ar = {}, Vo;
function Ld() {
  if (Vo) return ar;
  Vo = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = Fe(), t = te(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: o, schemaCode: u, it: p } = l, c = p.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, o);
      l.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return ar.default = r, ar;
}
var or = {}, Uo;
function Fd() {
  if (Uo) return or;
  Uo = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = te(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, o = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${o} ${i}`);
    }
  };
  return or.default = s, or;
}
var ir = {}, zo;
function Vd() {
  if (zo) return ir;
  zo = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = Fe(), t = te(), s = ae(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: o, schemaCode: u, data: p, $data: c, it: $ } = n, { opts: w } = $;
      if (!c && o.length === 0)
        return;
      const E = o.length >= w.loopRequired;
      if ($.allErrors ? S() : g(), w.strictRequired) {
        const a = n.parentSchema.properties, { definedProperties: h } = n.it;
        for (const _ of o)
          if ((a == null ? void 0 : a[_]) === void 0 && !h.has(_)) {
            const v = $.schemaEnv.baseId + $.errSchemaPath, y = `required property "${_}" is not defined at "${v}" (strictRequired)`;
            (0, s.checkStrictMode)($, y, $.opts.strictRequired);
          }
      }
      function S() {
        if (E || c)
          n.block$data(t.nil, d);
        else
          for (const a of o)
            (0, e.checkReportMissingProp)(n, a);
      }
      function g() {
        const a = i.let("missing");
        if (E || c) {
          const h = i.let("valid", !0);
          n.block$data(h, () => f(a, h)), n.ok(h);
        } else
          i.if((0, e.checkMissingProp)(n, o, a)), (0, e.reportMissingProp)(n, a), i.else();
      }
      function d() {
        i.forOf("prop", u, (a) => {
          n.setParams({ missingProperty: a }), i.if((0, e.noPropertyInData)(i, p, a, w.ownProperties), () => n.error());
        });
      }
      function f(a, h) {
        n.setParams({ missingProperty: a }), i.forOf(a, u, () => {
          i.assign(h, (0, e.propertyInData)(i, p, a, w.ownProperties)), i.if((0, t.not)(h), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return ir.default = l, ir;
}
var cr = {}, Go;
function Ud() {
  if (Go) return cr;
  Go = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = te(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, o = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${o} ${i}`);
    }
  };
  return cr.default = s, cr;
}
var ur = {}, lr = {}, Ko;
function Aa() {
  if (Ko) return lr;
  Ko = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = Gn();
  return e.code = 'require("ajv/dist/runtime/equal").default', lr.default = e, lr;
}
var Ho;
function zd() {
  if (Ho) return ur;
  Ho = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = Dn(), t = te(), s = ae(), r = Aa(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: o } }) => (0, t.str)`must NOT have duplicate items (items ## ${o} and ${i} are identical)`,
      params: ({ params: { i, j: o } }) => (0, t._)`{i: ${i}, j: ${o}}`
    },
    code(i) {
      const { gen: o, data: u, $data: p, schema: c, parentSchema: $, schemaCode: w, it: E } = i;
      if (!p && !c)
        return;
      const S = o.let("valid"), g = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(S, d, (0, t._)`${w} === false`), i.ok(S);
      function d() {
        const _ = o.let("i", (0, t._)`${u}.length`), v = o.let("j");
        i.setParams({ i: _, j: v }), o.assign(S, !0), o.if((0, t._)`${_} > 1`, () => (f() ? a : h)(_, v));
      }
      function f() {
        return g.length > 0 && !g.some((_) => _ === "object" || _ === "array");
      }
      function a(_, v) {
        const y = o.name("item"), P = (0, e.checkDataTypes)(g, y, E.opts.strictNumbers, e.DataType.Wrong), T = o.const("indices", (0, t._)`{}`);
        o.for((0, t._)`;${_}--;`, () => {
          o.let(y, (0, t._)`${u}[${_}]`), o.if(P, (0, t._)`continue`), g.length > 1 && o.if((0, t._)`typeof ${y} == "string"`, (0, t._)`${y} += "_"`), o.if((0, t._)`typeof ${T}[${y}] == "number"`, () => {
            o.assign(v, (0, t._)`${T}[${y}]`), i.error(), o.assign(S, !1).break();
          }).code((0, t._)`${T}[${y}] = ${_}`);
        });
      }
      function h(_, v) {
        const y = (0, s.useFunc)(o, r.default), P = o.name("outer");
        o.label(P).for((0, t._)`;${_}--;`, () => o.for((0, t._)`${v} = ${_}; ${v}--;`, () => o.if((0, t._)`${y}(${u}[${_}], ${u}[${v}])`, () => {
          i.error(), o.assign(S, !1).break(P);
        })));
      }
    }
  };
  return ur.default = n, ur;
}
var dr = {}, Bo;
function Gd() {
  if (Bo) return dr;
  Bo = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = te(), t = ae(), s = Aa(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: o, $data: u, schemaCode: p, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${o}, ${p})`) : n.fail((0, e._)`${c} !== ${o}`);
    }
  };
  return dr.default = l, dr;
}
var fr = {}, Wo;
function Kd() {
  if (Wo) return fr;
  Wo = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = te(), t = ae(), s = Aa(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: o, $data: u, schema: p, schemaCode: c, it: $ } = n;
      if (!u && p.length === 0)
        throw new Error("enum must have non-empty array");
      const w = p.length >= $.opts.loopEnum;
      let E;
      const S = () => E ?? (E = (0, t.useFunc)(i, s.default));
      let g;
      if (w || u)
        g = i.let("valid"), n.block$data(g, d);
      else {
        if (!Array.isArray(p))
          throw new Error("ajv implementation error");
        const a = i.const("vSchema", c);
        g = (0, e.or)(...p.map((h, _) => f(a, _)));
      }
      n.pass(g);
      function d() {
        i.assign(g, !1), i.forOf("v", c, (a) => i.if((0, e._)`${S()}(${o}, ${a})`, () => i.assign(g, !0).break()));
      }
      function f(a, h) {
        const _ = p[h];
        return typeof _ == "object" && _ !== null ? (0, e._)`${S()}(${o}, ${a}[${h}])` : (0, e._)`${o} === ${_}`;
      }
    }
  };
  return fr.default = l, fr;
}
var xo;
function Hd() {
  if (xo) return er;
  xo = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = kd(), t = qd(), s = Md(), r = Ld(), l = Fd(), n = Vd(), i = Ud(), o = zd(), u = Gd(), p = Kd(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    o.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    p.default
  ];
  return er.default = c, er;
}
var hr = {}, $t = {}, Jo;
function nl() {
  if (Jo) return $t;
  Jo = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.validateAdditionalItems = void 0;
  const e = te(), t = ae(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: o } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(o, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: o, schema: u, data: p, keyword: c, it: $ } = n;
    $.items = !0;
    const w = o.const("len", (0, e._)`${p}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${w} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)($, u)) {
      const S = o.var("valid", (0, e._)`${w} <= ${i.length}`);
      o.if((0, e.not)(S), () => E(S)), n.ok(S);
    }
    function E(S) {
      o.forRange("i", i.length, w, (g) => {
        n.subschema({ keyword: c, dataProp: g, dataPropType: t.Type.Num }, S), $.allErrors || o.if((0, e.not)(S), () => o.break());
      });
    }
  }
  return $t.validateAdditionalItems = l, $t.default = r, $t;
}
var mr = {}, gt = {}, Xo;
function sl() {
  if (Xo) return gt;
  Xo = 1, Object.defineProperty(gt, "__esModule", { value: !0 }), gt.validateTuple = void 0;
  const e = te(), t = ae(), s = Fe(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: o } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      o.items = !0, !(0, t.alwaysValidSchema)(o, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, o = n.schema) {
    const { gen: u, parentSchema: p, data: c, keyword: $, it: w } = n;
    g(p), w.opts.unevaluated && o.length && w.items !== !0 && (w.items = t.mergeEvaluated.items(u, o.length, w.items));
    const E = u.name("valid"), S = u.const("len", (0, e._)`${c}.length`);
    o.forEach((d, f) => {
      (0, t.alwaysValidSchema)(w, d) || (u.if((0, e._)`${S} > ${f}`, () => n.subschema({
        keyword: $,
        schemaProp: f,
        dataProp: f
      }, E)), n.ok(E));
    });
    function g(d) {
      const { opts: f, errSchemaPath: a } = w, h = o.length, _ = h === d.minItems && (h === d.maxItems || d[i] === !1);
      if (f.strictTuples && !_) {
        const v = `"${$}" is ${h}-tuple, but minItems or maxItems/${i} are not specified or different at path "${a}"`;
        (0, t.checkStrictMode)(w, v, f.strictTuples);
      }
    }
  }
  return gt.validateTuple = l, gt.default = r, gt;
}
var Yo;
function Bd() {
  if (Yo) return mr;
  Yo = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = sl(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return mr.default = t, mr;
}
var pr = {}, Zo;
function Wd() {
  if (Zo) return pr;
  Zo = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = te(), t = ae(), s = Fe(), r = nl(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: o, parentSchema: u, it: p } = i, { prefixItems: c } = u;
      p.items = !0, !(0, t.alwaysValidSchema)(p, o) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return pr.default = n, pr;
}
var yr = {}, Qo;
function xd() {
  if (Qo) return yr;
  Qo = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = te(), t = ae(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: o, data: u, it: p } = l;
      let c, $;
      const { minContains: w, maxContains: E } = o;
      p.opts.next ? (c = w === void 0 ? 1 : w, $ = E) : c = 1;
      const S = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(p, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(p, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(p, i)) {
        let h = (0, e._)`${S} >= ${c}`;
        $ !== void 0 && (h = (0, e._)`${h} && ${S} <= ${$}`), l.pass(h);
        return;
      }
      p.items = !0;
      const g = n.name("valid");
      $ === void 0 && c === 1 ? f(g, () => n.if(g, () => n.break())) : c === 0 ? (n.let(g, !0), $ !== void 0 && n.if((0, e._)`${u}.length > 0`, d)) : (n.let(g, !1), d()), l.result(g, () => l.reset());
      function d() {
        const h = n.name("_valid"), _ = n.let("count", 0);
        f(h, () => n.if(h, () => a(_)));
      }
      function f(h, _) {
        n.forRange("i", 0, S, (v) => {
          l.subschema({
            keyword: "contains",
            dataProp: v,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, h), _();
        });
      }
      function a(h) {
        n.code((0, e._)`${h}++`), $ === void 0 ? n.if((0, e._)`${h} >= ${c}`, () => n.assign(g, !0).break()) : (n.if((0, e._)`${h} > ${$}`, () => n.assign(g, !1).break()), c === 1 ? n.assign(g, !0) : n.if((0, e._)`${h} >= ${c}`, () => n.assign(g, !0)));
      }
    }
  };
  return yr.default = r, yr;
}
var vs = {}, ei;
function ja() {
  return ei || (ei = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = te(), s = ae(), r = Fe();
    e.error = {
      message: ({ params: { property: u, depsCount: p, deps: c } }) => {
        const $ = p === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: p, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${u},
    missingProperty: ${$},
    depsCount: ${p},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [p, c] = n(u);
        i(u, p), o(u, c);
      }
    };
    function n({ schema: u }) {
      const p = {}, c = {};
      for (const $ in u) {
        if ($ === "__proto__")
          continue;
        const w = Array.isArray(u[$]) ? p : c;
        w[$] = u[$];
      }
      return [p, c];
    }
    function i(u, p = u.schema) {
      const { gen: c, data: $, it: w } = u;
      if (Object.keys(p).length === 0)
        return;
      const E = c.let("missing");
      for (const S in p) {
        const g = p[S];
        if (g.length === 0)
          continue;
        const d = (0, r.propertyInData)(c, $, S, w.opts.ownProperties);
        u.setParams({
          property: S,
          depsCount: g.length,
          deps: g.join(", ")
        }), w.allErrors ? c.if(d, () => {
          for (const f of g)
            (0, r.checkReportMissingProp)(u, f);
        }) : (c.if((0, t._)`${d} && (${(0, r.checkMissingProp)(u, g, E)})`), (0, r.reportMissingProp)(u, E), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function o(u, p = u.schema) {
      const { gen: c, data: $, keyword: w, it: E } = u, S = c.name("valid");
      for (const g in p)
        (0, s.alwaysValidSchema)(E, p[g]) || (c.if(
          (0, r.propertyInData)(c, $, g, E.opts.ownProperties),
          () => {
            const d = u.subschema({ keyword: w, schemaProp: g }, S);
            u.mergeValidEvaluated(d, S);
          },
          () => c.var(S, !0)
          // TODO var
        ), u.ok(S));
    }
    e.validateSchemaDeps = o, e.default = l;
  }(vs)), vs;
}
var $r = {}, ti;
function Jd() {
  if (ti) return $r;
  ti = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const e = te(), t = ae(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: o, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const p = n.name("valid");
      n.forIn("key", o, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, p), n.if((0, e.not)(p), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(p);
    }
  };
  return $r.default = r, $r;
}
var gr = {}, ri;
function al() {
  if (ri) return gr;
  ri = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = Fe(), t = te(), s = Le(), r = ae(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: o, schema: u, parentSchema: p, data: c, errsCount: $, it: w } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: E, opts: S } = w;
      if (w.props = !0, S.removeAdditional !== "all" && (0, r.alwaysValidSchema)(w, u))
        return;
      const g = (0, e.allSchemaProperties)(p.properties), d = (0, e.allSchemaProperties)(p.patternProperties);
      f(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function f() {
        o.forIn("key", c, (y) => {
          !g.length && !d.length ? _(y) : o.if(a(y), () => _(y));
        });
      }
      function a(y) {
        let P;
        if (g.length > 8) {
          const T = (0, r.schemaRefOrVal)(w, p.properties, "properties");
          P = (0, e.isOwnProperty)(o, T, y);
        } else g.length ? P = (0, t.or)(...g.map((T) => (0, t._)`${y} === ${T}`)) : P = t.nil;
        return d.length && (P = (0, t.or)(P, ...d.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${y})`))), (0, t.not)(P);
      }
      function h(y) {
        o.code((0, t._)`delete ${c}[${y}]`);
      }
      function _(y) {
        if (S.removeAdditional === "all" || S.removeAdditional && u === !1) {
          h(y);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: y }), i.error(), E || o.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(w, u)) {
          const P = o.name("valid");
          S.removeAdditional === "failing" ? (v(y, P, !1), o.if((0, t.not)(P), () => {
            i.reset(), h(y);
          })) : (v(y, P), E || o.if((0, t.not)(P), () => o.break()));
        }
      }
      function v(y, P, T) {
        const q = {
          keyword: "additionalProperties",
          dataProp: y,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(q, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(q, P);
      }
    }
  };
  return gr.default = n, gr;
}
var vr = {}, ni;
function Xd() {
  if (ni) return vr;
  ni = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = Hn(), t = Fe(), s = ae(), r = al(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: o, parentSchema: u, data: p, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(o);
      for (const d of $)
        c.definedProperties.add(d);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const w = $.filter((d) => !(0, s.alwaysValidSchema)(c, o[d]));
      if (w.length === 0)
        return;
      const E = i.name("valid");
      for (const d of w)
        S(d) ? g(d) : (i.if((0, t.propertyInData)(i, p, d, c.opts.ownProperties)), g(d), c.allErrors || i.else().var(E, !0), i.endIf()), n.it.definedProperties.add(d), n.ok(E);
      function S(d) {
        return c.opts.useDefaults && !c.compositeRule && o[d].default !== void 0;
      }
      function g(d) {
        n.subschema({
          keyword: "properties",
          schemaProp: d,
          dataProp: d
        }, E);
      }
    }
  };
  return vr.default = l, vr;
}
var _r = {}, si;
function Yd() {
  if (si) return _r;
  si = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = Fe(), t = te(), s = ae(), r = ae(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: o, data: u, parentSchema: p, it: c } = n, { opts: $ } = c, w = (0, e.allSchemaProperties)(o), E = w.filter((_) => (0, s.alwaysValidSchema)(c, o[_]));
      if (w.length === 0 || E.length === w.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const S = $.strictSchema && !$.allowMatchingProperties && p.properties, g = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: d } = c;
      f();
      function f() {
        for (const _ of w)
          S && a(_), c.allErrors ? h(_) : (i.var(g, !0), h(_), i.if(g));
      }
      function a(_) {
        for (const v in S)
          new RegExp(_).test(v) && (0, s.checkStrictMode)(c, `property ${v} matches pattern ${_} (use allowMatchingProperties)`);
      }
      function h(_) {
        i.forIn("key", u, (v) => {
          i.if((0, t._)`${(0, e.usePattern)(n, _)}.test(${v})`, () => {
            const y = E.includes(_);
            y || n.subschema({
              keyword: "patternProperties",
              schemaProp: _,
              dataProp: v,
              dataPropType: r.Type.Str
            }, g), c.opts.unevaluated && d !== !0 ? i.assign((0, t._)`${d}[${v}]`, !0) : !y && !c.allErrors && i.if((0, t.not)(g), () => i.break());
          });
        });
      }
    }
  };
  return _r.default = l, _r;
}
var wr = {}, ai;
function Zd() {
  if (ai) return wr;
  ai = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = ae(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return wr.default = t, wr;
}
var Er = {}, oi;
function Qd() {
  if (oi) return Er;
  oi = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Fe().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Er.default = t, Er;
}
var br = {}, ii;
function ef() {
  if (ii) return br;
  ii = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = te(), t = ae(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: o, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && o.discriminator)
        return;
      const p = i, c = n.let("valid", !1), $ = n.let("passing", null), w = n.name("_valid");
      l.setParams({ passing: $ }), n.block(E), l.result(c, () => l.reset(), () => l.error(!0));
      function E() {
        p.forEach((S, g) => {
          let d;
          (0, t.alwaysValidSchema)(u, S) ? n.var(w, !0) : d = l.subschema({
            keyword: "oneOf",
            schemaProp: g,
            compositeRule: !0
          }, w), g > 0 && n.if((0, e._)`${w} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${g}]`).else(), n.if(w, () => {
            n.assign(c, !0), n.assign($, g), d && l.mergeEvaluated(d, e.Name);
          });
        });
      }
    }
  };
  return br.default = r, br;
}
var Sr = {}, ci;
function tf() {
  if (ci) return Sr;
  ci = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = ae(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((o, u) => {
        if ((0, e.alwaysValidSchema)(n, o))
          return;
        const p = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(p);
      });
    }
  };
  return Sr.default = t, Sr;
}
var Pr = {}, ui;
function rf() {
  if (ui) return Pr;
  ui = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const e = te(), t = ae(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: o, it: u } = n;
      o.then === void 0 && o.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const p = l(u, "then"), c = l(u, "else");
      if (!p && !c)
        return;
      const $ = i.let("valid", !0), w = i.name("_valid");
      if (E(), n.reset(), p && c) {
        const g = i.let("ifClause");
        n.setParams({ ifClause: g }), i.if(w, S("then", g), S("else", g));
      } else p ? i.if(w, S("then")) : i.if((0, e.not)(w), S("else"));
      n.pass($, () => n.error(!0));
      function E() {
        const g = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, w);
        n.mergeEvaluated(g);
      }
      function S(g, d) {
        return () => {
          const f = n.subschema({ keyword: g }, w);
          i.assign($, w), n.mergeValidEvaluated(f, $), d ? i.assign(d, (0, e._)`${g}`) : n.setParams({ ifClause: g });
        };
      }
    }
  };
  function l(n, i) {
    const o = n.schema[i];
    return o !== void 0 && !(0, t.alwaysValidSchema)(n, o);
  }
  return Pr.default = r, Pr;
}
var Rr = {}, li;
function nf() {
  if (li) return Rr;
  li = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const e = ae(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return Rr.default = t, Rr;
}
var di;
function sf() {
  if (di) return hr;
  di = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = nl(), t = Bd(), s = sl(), r = Wd(), l = xd(), n = ja(), i = Jd(), o = al(), u = Xd(), p = Yd(), c = Zd(), $ = Qd(), w = ef(), E = tf(), S = rf(), g = nf();
  function d(f = !1) {
    const a = [
      // any
      c.default,
      $.default,
      w.default,
      E.default,
      S.default,
      g.default,
      // object
      i.default,
      o.default,
      n.default,
      u.default,
      p.default
    ];
    return f ? a.push(t.default, r.default) : a.push(e.default, s.default), a.push(l.default), a;
  }
  return hr.default = d, hr;
}
var Nr = {}, vt = {}, fi;
function ol() {
  if (fi) return vt;
  fi = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.dynamicAnchor = void 0;
  const e = te(), t = Le(), s = Wn(), r = Ta(), l = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (o) => n(o, o.schema)
  };
  function n(o, u) {
    const { gen: p, it: c } = o;
    c.schemaEnv.root.dynamicAnchors[u] = !0;
    const $ = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, w = c.errSchemaPath === "#" ? c.validateName : i(o);
    p.if((0, e._)`!${$}`, () => p.assign($, w));
  }
  vt.dynamicAnchor = n;
  function i(o) {
    const { schemaEnv: u, schema: p, self: c } = o.it, { root: $, baseId: w, localRefs: E, meta: S } = u.root, { schemaId: g } = c.opts, d = new s.SchemaEnv({ schema: p, schemaId: g, root: $, baseId: w, localRefs: E, meta: S });
    return s.compileSchema.call(c, d), (0, r.getValidate)(o, d);
  }
  return vt.default = l, vt;
}
var _t = {}, hi;
function il() {
  if (hi) return _t;
  hi = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.dynamicRef = void 0;
  const e = te(), t = Le(), s = Ta(), r = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (n) => l(n, n.schema)
  };
  function l(n, i) {
    const { gen: o, keyword: u, it: p } = n;
    if (i[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const c = i.slice(1);
    if (p.allErrors)
      $();
    else {
      const E = o.let("valid", !1);
      $(E), n.ok(E);
    }
    function $(E) {
      if (p.schemaEnv.root.dynamicAnchors[c]) {
        const S = o.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(c)}`);
        o.if(S, w(S, E), w(p.validateName, E));
      } else
        w(p.validateName, E)();
    }
    function w(E, S) {
      return S ? () => o.block(() => {
        (0, s.callRef)(n, E), o.let(S, !0);
      }) : () => (0, s.callRef)(n, E);
    }
  }
  return _t.dynamicRef = l, _t.default = r, _t;
}
var Ir = {}, mi;
function af() {
  if (mi) return Ir;
  mi = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const e = ol(), t = ae(), s = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(r) {
      r.schema ? (0, e.dynamicAnchor)(r, "") : (0, t.checkStrictMode)(r.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Ir.default = s, Ir;
}
var Or = {}, pi;
function of() {
  if (pi) return Or;
  pi = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = il(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (s) => (0, e.dynamicRef)(s, s.schema)
  };
  return Or.default = t, Or;
}
var yi;
function cf() {
  if (yi) return Nr;
  yi = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const e = ol(), t = il(), s = af(), r = of(), l = [e.default, t.default, s.default, r.default];
  return Nr.default = l, Nr;
}
var Tr = {}, Ar = {}, $i;
function uf() {
  if ($i) return Ar;
  $i = 1, Object.defineProperty(Ar, "__esModule", { value: !0 });
  const e = ja(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (s) => (0, e.validatePropertyDeps)(s)
  };
  return Ar.default = t, Ar;
}
var jr = {}, gi;
function lf() {
  if (gi) return jr;
  gi = 1, Object.defineProperty(jr, "__esModule", { value: !0 });
  const e = ja(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (s) => (0, e.validateSchemaDeps)(s)
  };
  return jr.default = t, jr;
}
var Cr = {}, vi;
function df() {
  if (vi) return Cr;
  vi = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  const e = ae(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: s, parentSchema: r, it: l }) {
      r.contains === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "contains" is ignored`);
    }
  };
  return Cr.default = t, Cr;
}
var _i;
function ff() {
  if (_i) return Tr;
  _i = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = uf(), t = lf(), s = df(), r = [e.default, t.default, s.default];
  return Tr.default = r, Tr;
}
var kr = {}, qr = {}, wi;
function hf() {
  if (wi) return qr;
  wi = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const e = te(), t = ae(), s = Le(), l = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: n }) => (0, e._)`{unevaluatedProperty: ${n.unevaluatedProperty}}`
    },
    code(n) {
      const { gen: i, schema: o, data: u, errsCount: p, it: c } = n;
      if (!p)
        throw new Error("ajv implementation error");
      const { allErrors: $, props: w } = c;
      w instanceof e.Name ? i.if((0, e._)`${w} !== true`, () => i.forIn("key", u, (d) => i.if(S(w, d), () => E(d)))) : w !== !0 && i.forIn("key", u, (d) => w === void 0 ? E(d) : i.if(g(w, d), () => E(d))), c.props = !0, n.ok((0, e._)`${p} === ${s.default.errors}`);
      function E(d) {
        if (o === !1) {
          n.setParams({ unevaluatedProperty: d }), n.error(), $ || i.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(c, o)) {
          const f = i.name("valid");
          n.subschema({
            keyword: "unevaluatedProperties",
            dataProp: d,
            dataPropType: t.Type.Str
          }, f), $ || i.if((0, e.not)(f), () => i.break());
        }
      }
      function S(d, f) {
        return (0, e._)`!${d} || !${d}[${f}]`;
      }
      function g(d, f) {
        const a = [];
        for (const h in d)
          d[h] === !0 && a.push((0, e._)`${f} !== ${h}`);
        return (0, e.and)(...a);
      }
    }
  };
  return qr.default = l, qr;
}
var Dr = {}, Ei;
function mf() {
  if (Ei) return Dr;
  Ei = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const e = te(), t = ae(), r = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { gen: n, schema: i, data: o, it: u } = l, p = u.items || 0;
      if (p === !0)
        return;
      const c = n.const("len", (0, e._)`${o}.length`);
      if (i === !1)
        l.setParams({ len: p }), l.fail((0, e._)`${c} > ${p}`);
      else if (typeof i == "object" && !(0, t.alwaysValidSchema)(u, i)) {
        const w = n.var("valid", (0, e._)`${c} <= ${p}`);
        n.if((0, e.not)(w), () => $(w, p)), l.ok(w);
      }
      u.items = !0;
      function $(w, E) {
        n.forRange("i", E, c, (S) => {
          l.subschema({ keyword: "unevaluatedItems", dataProp: S, dataPropType: t.Type.Num }, w), u.allErrors || n.if((0, e.not)(w), () => n.break());
        });
      }
    }
  };
  return Dr.default = r, Dr;
}
var bi;
function pf() {
  if (bi) return kr;
  bi = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const e = hf(), t = mf(), s = [e.default, t.default];
  return kr.default = s, kr;
}
var Mr = {}, Lr = {}, Si;
function yf() {
  if (Si) return Lr;
  Si = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const e = te(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: o, schema: u, schemaCode: p, it: c } = r, { opts: $, errSchemaPath: w, schemaEnv: E, self: S } = c;
      if (!$.validateFormats)
        return;
      o ? g() : d();
      function g() {
        const f = n.scopeValue("formats", {
          ref: S.formats,
          code: $.code.formats
        }), a = n.const("fDef", (0, e._)`${f}[${p}]`), h = n.let("fType"), _ = n.let("format");
        n.if((0, e._)`typeof ${a} == "object" && !(${a} instanceof RegExp)`, () => n.assign(h, (0, e._)`${a}.type || "string"`).assign(_, (0, e._)`${a}.validate`), () => n.assign(h, (0, e._)`"string"`).assign(_, a)), r.fail$data((0, e.or)(v(), y()));
        function v() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${p} && !${_}`;
        }
        function y() {
          const P = E.$async ? (0, e._)`(${a}.async ? await ${_}(${i}) : ${_}(${i}))` : (0, e._)`${_}(${i})`, T = (0, e._)`(typeof ${_} == "function" ? ${P} : ${_}.test(${i}))`;
          return (0, e._)`${_} && ${_} !== true && ${h} === ${l} && !${T}`;
        }
      }
      function d() {
        const f = S.formats[u];
        if (!f) {
          v();
          return;
        }
        if (f === !0)
          return;
        const [a, h, _] = y(f);
        a === l && r.pass(P());
        function v() {
          if ($.strictSchema === !1) {
            S.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${w}"`;
          }
        }
        function y(T) {
          const q = T instanceof RegExp ? (0, e.regexpCode)(T) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(u)}` : void 0, F = n.scopeValue("formats", { key: u, ref: T, code: q });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${F}.validate`] : ["string", T, F];
        }
        function P() {
          if (typeof f == "object" && !(f instanceof RegExp) && f.async) {
            if (!E.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${_}(${i})`;
          }
          return typeof h == "function" ? (0, e._)`${_}(${i})` : (0, e._)`${_}.test(${i})`;
        }
      }
    }
  };
  return Lr.default = s, Lr;
}
var Pi;
function $f() {
  if (Pi) return Mr;
  Pi = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const t = [yf().default];
  return Mr.default = t, Mr;
}
var ft = {}, Ri;
function gf() {
  return Ri || (Ri = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.contentVocabulary = ft.metadataVocabulary = void 0, ft.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ft.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ft;
}
var Ni;
function vf() {
  if (Ni) return Yt;
  Ni = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = Cd(), t = Hd(), s = sf(), r = cf(), l = ff(), n = pf(), i = $f(), o = gf(), u = [
    r.default,
    e.default,
    t.default,
    (0, s.default)(!0),
    i.default,
    o.metadataVocabulary,
    o.contentVocabulary,
    l.default,
    n.default
  ];
  return Yt.default = u, Yt;
}
var Fr = {}, Lt = {}, Ii;
function _f() {
  if (Ii) return Lt;
  Ii = 1, Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.DiscrError = void 0;
  var e;
  return function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  }(e || (Lt.DiscrError = e = {})), Lt;
}
var Oi;
function wf() {
  if (Oi) return Fr;
  Oi = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const e = te(), t = _f(), s = Wn(), r = Bn(), l = ae(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: o, tagName: u } }) => o === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: o, tag: u, tagName: p } }) => (0, e._)`{error: ${o}, tag: ${p}, tagValue: ${u}}`
    },
    code(o) {
      const { gen: u, data: p, schema: c, parentSchema: $, it: w } = o, { oneOf: E } = $;
      if (!w.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const S = c.propertyName;
      if (typeof S != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!E)
        throw new Error("discriminator: requires oneOf keyword");
      const g = u.let("valid", !1), d = u.const("tag", (0, e._)`${p}${(0, e.getProperty)(S)}`);
      u.if((0, e._)`typeof ${d} == "string"`, () => f(), () => o.error(!1, { discrError: t.DiscrError.Tag, tag: d, tagName: S })), o.ok(g);
      function f() {
        const _ = h();
        u.if(!1);
        for (const v in _)
          u.elseIf((0, e._)`${d} === ${v}`), u.assign(g, a(_[v]));
        u.else(), o.error(!1, { discrError: t.DiscrError.Mapping, tag: d, tagName: S }), u.endIf();
      }
      function a(_) {
        const v = u.name("valid"), y = o.subschema({ keyword: "oneOf", schemaProp: _ }, v);
        return o.mergeEvaluated(y, e.Name), v;
      }
      function h() {
        var _;
        const v = {}, y = T($);
        let P = !0;
        for (let D = 0; D < E.length; D++) {
          let U = E[D];
          if (U != null && U.$ref && !(0, l.schemaHasRulesButRef)(U, w.self.RULES)) {
            const L = U.$ref;
            if (U = s.resolveRef.call(w.self, w.schemaEnv.root, w.baseId, L), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(w.opts.uriResolver, w.baseId, L);
          }
          const z = (_ = U == null ? void 0 : U.properties) === null || _ === void 0 ? void 0 : _[S];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${S}"`);
          P = P && (y || T(U)), q(z, D);
        }
        if (!P)
          throw new Error(`discriminator: "${S}" must be required`);
        return v;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(S);
        }
        function q(D, U) {
          if (D.const)
            F(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              F(z, U);
          else
            throw new Error(`discriminator: "properties/${S}" must have "const" or "enum"`);
        }
        function F(D, U) {
          if (typeof D != "string" || D in v)
            throw new Error(`discriminator: "${S}" values must be unique strings`);
          v[D] = U;
        }
      }
    }
  };
  return Fr.default = i, Fr;
}
var Vr = {};
const Ef = "https://json-schema.org/draft/2020-12/schema", bf = "https://json-schema.org/draft/2020-12/schema", Sf = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Pf = "meta", Rf = "Core and Validation specifications meta-schema", Nf = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], If = ["object", "boolean"], Of = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Tf = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Af = {
  $schema: Ef,
  $id: bf,
  $vocabulary: Sf,
  $dynamicAnchor: Pf,
  title: Rf,
  allOf: Nf,
  type: If,
  $comment: Of,
  properties: Tf
}, jf = "https://json-schema.org/draft/2020-12/schema", Cf = "https://json-schema.org/draft/2020-12/meta/applicator", kf = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, qf = "meta", Df = "Applicator vocabulary meta-schema", Mf = ["object", "boolean"], Lf = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Ff = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Vf = {
  $schema: jf,
  $id: Cf,
  $vocabulary: kf,
  $dynamicAnchor: qf,
  title: Df,
  type: Mf,
  properties: Lf,
  $defs: Ff
}, Uf = "https://json-schema.org/draft/2020-12/schema", zf = "https://json-schema.org/draft/2020-12/meta/unevaluated", Gf = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Kf = "meta", Hf = "Unevaluated applicator vocabulary meta-schema", Bf = ["object", "boolean"], Wf = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, xf = {
  $schema: Uf,
  $id: zf,
  $vocabulary: Gf,
  $dynamicAnchor: Kf,
  title: Hf,
  type: Bf,
  properties: Wf
}, Jf = "https://json-schema.org/draft/2020-12/schema", Xf = "https://json-schema.org/draft/2020-12/meta/content", Yf = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Zf = "meta", Qf = "Content vocabulary meta-schema", eh = ["object", "boolean"], th = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, rh = {
  $schema: Jf,
  $id: Xf,
  $vocabulary: Yf,
  $dynamicAnchor: Zf,
  title: Qf,
  type: eh,
  properties: th
}, nh = "https://json-schema.org/draft/2020-12/schema", sh = "https://json-schema.org/draft/2020-12/meta/core", ah = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, oh = "meta", ih = "Core vocabulary meta-schema", ch = ["object", "boolean"], uh = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, lh = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, dh = {
  $schema: nh,
  $id: sh,
  $vocabulary: ah,
  $dynamicAnchor: oh,
  title: ih,
  type: ch,
  properties: uh,
  $defs: lh
}, fh = "https://json-schema.org/draft/2020-12/schema", hh = "https://json-schema.org/draft/2020-12/meta/format-annotation", mh = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, ph = "meta", yh = "Format vocabulary meta-schema for annotation results", $h = ["object", "boolean"], gh = { format: { type: "string" } }, vh = {
  $schema: fh,
  $id: hh,
  $vocabulary: mh,
  $dynamicAnchor: ph,
  title: yh,
  type: $h,
  properties: gh
}, _h = "https://json-schema.org/draft/2020-12/schema", wh = "https://json-schema.org/draft/2020-12/meta/meta-data", Eh = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, bh = "meta", Sh = "Meta-data vocabulary meta-schema", Ph = ["object", "boolean"], Rh = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, Nh = {
  $schema: _h,
  $id: wh,
  $vocabulary: Eh,
  $dynamicAnchor: bh,
  title: Sh,
  type: Ph,
  properties: Rh
}, Ih = "https://json-schema.org/draft/2020-12/schema", Oh = "https://json-schema.org/draft/2020-12/meta/validation", Th = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, Ah = "meta", jh = "Validation vocabulary meta-schema", Ch = ["object", "boolean"], kh = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, qh = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Dh = {
  $schema: Ih,
  $id: Oh,
  $vocabulary: Th,
  $dynamicAnchor: Ah,
  title: jh,
  type: Ch,
  properties: kh,
  $defs: qh
};
var Ti;
function Mh() {
  if (Ti) return Vr;
  Ti = 1, Object.defineProperty(Vr, "__esModule", { value: !0 });
  const e = Af, t = Vf, s = xf, r = rh, l = dh, n = vh, i = Nh, o = Dh, u = ["/properties"];
  function p(c) {
    return [
      e,
      t,
      s,
      r,
      l,
      $(this, n),
      i,
      $(this, o)
    ].forEach((w) => this.addMetaSchema(w, void 0, !1)), this;
    function $(w, E) {
      return c ? w.$dataMetaSchema(E, u) : E;
    }
  }
  return Vr.default = p, Vr;
}
var Ai;
function Lh() {
  return Ai || (Ai = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const s = Ad(), r = vf(), l = wf(), n = Mh(), i = "https://json-schema.org/draft/2020-12/schema";
    class o extends s.default {
      constructor(E = {}) {
        super({
          ...E,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((E) => this.addVocabulary(E)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: E, meta: S } = this.opts;
        S && (n.default.call(this, E), this.refs["http://json-schema.org/schema"] = i);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
      }
    }
    t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
    var u = Hn();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var p = te();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return p._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return p.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return p.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return p.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return p.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return p.CodeGen;
    } });
    var c = Oa();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return c.default;
    } });
    var $ = Bn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return $.default;
    } });
  }(Bt, Bt.exports)), Bt.exports;
}
var Fh = Lh(), Ur = { exports: {} }, _s = {}, ji;
function Vh() {
  return ji || (ji = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(D, U) {
      return { validate: D, compare: U };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, i),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), p),
      "date-time": t(w(!0), E),
      "iso-time": t(u(), c),
      "iso-date-time": t(w(), S),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: f,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: F,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: h,
      // signed 32 bit integer
      int32: { type: "number", validate: y },
      // signed 64 bit integer
      int64: { type: "number", validate: P },
      // C-type float
      float: { type: "number", validate: T },
      // C-type double
      double: { type: "number", validate: T },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, p),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, E),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, S),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function s(D) {
      return D % 4 === 0 && (D % 100 !== 0 || D % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, l = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(D) {
      const U = r.exec(D);
      if (!U)
        return !1;
      const z = +U[1], L = +U[2], V = +U[3];
      return L >= 1 && L <= 12 && V >= 1 && V <= (L === 2 && s(z) ? 29 : l[L]);
    }
    function i(D, U) {
      if (D && U)
        return D > U ? 1 : D < U ? -1 : 0;
    }
    const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(D) {
      return function(z) {
        const L = o.exec(z);
        if (!L)
          return !1;
        const V = +L[1], x = +L[2], W = +L[3], B = L[4], X = L[5] === "-" ? -1 : 1, C = +(L[6] || 0), N = +(L[7] || 0);
        if (C > 23 || N > 59 || D && !B)
          return !1;
        if (V <= 23 && x <= 59 && W < 60)
          return !0;
        const j = x - N * X, I = V - C * X - (j < 0 ? 1 : 0);
        return (I === 23 || I === -1) && (j === 59 || j === -1) && W < 61;
      };
    }
    function p(D, U) {
      if (!(D && U))
        return;
      const z = (/* @__PURE__ */ new Date("2020-01-01T" + D)).valueOf(), L = (/* @__PURE__ */ new Date("2020-01-01T" + U)).valueOf();
      if (z && L)
        return z - L;
    }
    function c(D, U) {
      if (!(D && U))
        return;
      const z = o.exec(D), L = o.exec(U);
      if (z && L)
        return D = z[1] + z[2] + z[3], U = L[1] + L[2] + L[3], D > U ? 1 : D < U ? -1 : 0;
    }
    const $ = /t|\s/i;
    function w(D) {
      const U = u(D);
      return function(L) {
        const V = L.split($);
        return V.length === 2 && n(V[0]) && U(V[1]);
      };
    }
    function E(D, U) {
      if (!(D && U))
        return;
      const z = new Date(D).valueOf(), L = new Date(U).valueOf();
      if (z && L)
        return z - L;
    }
    function S(D, U) {
      if (!(D && U))
        return;
      const [z, L] = D.split($), [V, x] = U.split($), W = i(z, V);
      if (W !== void 0)
        return W || p(L, x);
    }
    const g = /\/|:/, d = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function f(D) {
      return g.test(D) && d.test(D);
    }
    const a = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function h(D) {
      return a.lastIndex = 0, a.test(D);
    }
    const _ = -2147483648, v = 2 ** 31 - 1;
    function y(D) {
      return Number.isInteger(D) && D <= v && D >= _;
    }
    function P(D) {
      return Number.isInteger(D);
    }
    function T() {
      return !0;
    }
    const q = /[^\\]\\Z/;
    function F(D) {
      if (q.test(D))
        return !1;
      try {
        return new RegExp(D), !0;
      } catch {
        return !1;
      }
    }
  }(_s)), _s;
}
var ws = {}, zr = { exports: {} }, Es = {}, We = {}, ht = {}, bs = {}, Ss = {}, Ps = {}, Ci;
function Mn() {
  return Ci || (Ci = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(a) {
        if (super(), !e.IDENTIFIER.test(a))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(a) {
        super(), this._items = typeof a == "string" ? [a] : a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const a = this._items[0];
        return a === "" || a === '""';
      }
      get str() {
        var a;
        return (a = this._str) !== null && a !== void 0 ? a : this._str = this._items.reduce((h, _) => `${h}${_}`, "");
      }
      get names() {
        var a;
        return (a = this._names) !== null && a !== void 0 ? a : this._names = this._items.reduce((h, _) => (_ instanceof s && (h[_.str] = (h[_.str] || 0) + 1), h), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function l(f, ...a) {
      const h = [f[0]];
      let _ = 0;
      for (; _ < a.length; )
        o(h, a[_]), h.push(f[++_]);
      return new r(h);
    }
    e._ = l;
    const n = new r("+");
    function i(f, ...a) {
      const h = [E(f[0])];
      let _ = 0;
      for (; _ < a.length; )
        h.push(n), o(h, a[_]), h.push(n, E(f[++_]));
      return u(h), new r(h);
    }
    e.str = i;
    function o(f, a) {
      a instanceof r ? f.push(...a._items) : a instanceof s ? f.push(a) : f.push($(a));
    }
    e.addCodeArg = o;
    function u(f) {
      let a = 1;
      for (; a < f.length - 1; ) {
        if (f[a] === n) {
          const h = p(f[a - 1], f[a + 1]);
          if (h !== void 0) {
            f.splice(a - 1, 3, h);
            continue;
          }
          f[a++] = "+";
        }
        a++;
      }
    }
    function p(f, a) {
      if (a === '""')
        return f;
      if (f === '""')
        return a;
      if (typeof f == "string")
        return a instanceof s || f[f.length - 1] !== '"' ? void 0 : typeof a != "string" ? `${f.slice(0, -1)}${a}"` : a[0] === '"' ? f.slice(0, -1) + a.slice(1) : void 0;
      if (typeof a == "string" && a[0] === '"' && !(f instanceof s))
        return `"${f}${a.slice(1)}`;
    }
    function c(f, a) {
      return a.emptyStr() ? f : f.emptyStr() ? a : i`${f}${a}`;
    }
    e.strConcat = c;
    function $(f) {
      return typeof f == "number" || typeof f == "boolean" || f === null ? f : E(Array.isArray(f) ? f.join(",") : f);
    }
    function w(f) {
      return new r(E(f));
    }
    e.stringify = w;
    function E(f) {
      return JSON.stringify(f).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = E;
    function S(f) {
      return typeof f == "string" && e.IDENTIFIER.test(f) ? new r(`.${f}`) : l`[${f}]`;
    }
    e.getProperty = S;
    function g(f) {
      if (typeof f == "string" && e.IDENTIFIER.test(f))
        return new r(`${f}`);
      throw new Error(`CodeGen: invalid export name: ${f}, use explicit $id name mapping`);
    }
    e.getEsmExportName = g;
    function d(f) {
      return new r(f.toString());
    }
    e.regexpCode = d;
  }(Ps)), Ps;
}
var Rs = {}, ki;
function qi() {
  return ki || (ki = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Mn();
    class s extends Error {
      constructor(p) {
        super(`CodeGen: "code" for ${p} not defined`), this.value = p.value;
      }
    }
    var r;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: p, parent: c } = {}) {
        this._names = {}, this._prefixes = p, this._parent = c;
      }
      toName(p) {
        return p instanceof t.Name ? p : this.name(p);
      }
      name(p) {
        return new t.Name(this._newName(p));
      }
      _newName(p) {
        const c = this._names[p] || this._nameGroup(p);
        return `${p}${c.index++}`;
      }
      _nameGroup(p) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(p) || this._prefixes && !this._prefixes.has(p))
          throw new Error(`CodeGen: prefix "${p}" is not allowed in this scope`);
        return this._names[p] = { prefix: p, index: 0 };
      }
    }
    e.Scope = l;
    class n extends t.Name {
      constructor(p, c) {
        super(c), this.prefix = p;
      }
      setValue(p, { property: c, itemIndex: $ }) {
        this.value = p, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class o extends l {
      constructor(p) {
        super(p), this._values = {}, this._scope = p.scope, this.opts = { ...p, _n: p.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(p) {
        return new n(p, this._newName(p));
      }
      value(p, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const w = this.toName(p), { prefix: E } = w, S = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let g = this._values[E];
        if (g) {
          const a = g.get(S);
          if (a)
            return a;
        } else
          g = this._values[E] = /* @__PURE__ */ new Map();
        g.set(S, w);
        const d = this._scope[E] || (this._scope[E] = []), f = d.length;
        return d[f] = c.ref, w.setValue(c, { property: E, itemIndex: f }), w;
      }
      getValue(p, c) {
        const $ = this._values[p];
        if ($)
          return $.get(c);
      }
      scopeRefs(p, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${p}${$.scopePath}`;
        });
      }
      scopeCode(p = this._values, c, $) {
        return this._reduceValues(p, (w) => {
          if (w.value === void 0)
            throw new Error(`CodeGen: name "${w}" has no value`);
          return w.value.code;
        }, c, $);
      }
      _reduceValues(p, c, $ = {}, w) {
        let E = t.nil;
        for (const S in p) {
          const g = p[S];
          if (!g)
            continue;
          const d = $[S] = $[S] || /* @__PURE__ */ new Map();
          g.forEach((f) => {
            if (d.has(f))
              return;
            d.set(f, r.Started);
            let a = c(f);
            if (a) {
              const h = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              E = (0, t._)`${E}${h} ${f} = ${a};${this.opts._n}`;
            } else if (a = w == null ? void 0 : w(f))
              E = (0, t._)`${E}${a}${this.opts._n}`;
            else
              throw new s(f);
            d.set(f, r.Completed);
          });
        }
        return E;
      }
    }
    e.ValueScope = o;
  }(Rs)), Rs;
}
var Di;
function se() {
  return Di || (Di = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Mn(), s = qi();
    var r = Mn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var l = qi();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(m, b) {
        return this;
      }
    }
    class i extends n {
      constructor(m, b, A) {
        super(), this.varKind = m, this.name = b, this.rhs = A;
      }
      render({ es5: m, _n: b }) {
        const A = m ? s.varKinds.var : this.varKind, G = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${A} ${this.name}${G};` + b;
      }
      optimizeNames(m, b) {
        if (m[this.name.str])
          return this.rhs && (this.rhs = L(this.rhs, m, b)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class o extends n {
      constructor(m, b, A) {
        super(), this.lhs = m, this.rhs = b, this.sideEffects = A;
      }
      render({ _n: m }) {
        return `${this.lhs} = ${this.rhs};` + m;
      }
      optimizeNames(m, b) {
        if (!(this.lhs instanceof t.Name && !m[this.lhs.str] && !this.sideEffects))
          return this.rhs = L(this.rhs, m, b), this;
      }
      get names() {
        const m = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(m, this.rhs);
      }
    }
    class u extends o {
      constructor(m, b, A, G) {
        super(m, A, G), this.op = b;
      }
      render({ _n: m }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + m;
      }
    }
    class p extends n {
      constructor(m) {
        super(), this.label = m, this.names = {};
      }
      render({ _n: m }) {
        return `${this.label}:` + m;
      }
    }
    class c extends n {
      constructor(m) {
        super(), this.label = m, this.names = {};
      }
      render({ _n: m }) {
        return `break${this.label ? ` ${this.label}` : ""};` + m;
      }
    }
    class $ extends n {
      constructor(m) {
        super(), this.error = m;
      }
      render({ _n: m }) {
        return `throw ${this.error};` + m;
      }
      get names() {
        return this.error.names;
      }
    }
    class w extends n {
      constructor(m) {
        super(), this.code = m;
      }
      render({ _n: m }) {
        return `${this.code};` + m;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(m, b) {
        return this.code = L(this.code, m, b), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class E extends n {
      constructor(m = []) {
        super(), this.nodes = m;
      }
      render(m) {
        return this.nodes.reduce((b, A) => b + A.render(m), "");
      }
      optimizeNodes() {
        const { nodes: m } = this;
        let b = m.length;
        for (; b--; ) {
          const A = m[b].optimizeNodes();
          Array.isArray(A) ? m.splice(b, 1, ...A) : A ? m[b] = A : m.splice(b, 1);
        }
        return m.length > 0 ? this : void 0;
      }
      optimizeNames(m, b) {
        const { nodes: A } = this;
        let G = A.length;
        for (; G--; ) {
          const H = A[G];
          H.optimizeNames(m, b) || (V(m, H.names), A.splice(G, 1));
        }
        return A.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((m, b) => U(m, b.names), {});
      }
    }
    class S extends E {
      render(m) {
        return "{" + m._n + super.render(m) + "}" + m._n;
      }
    }
    class g extends E {
    }
    class d extends S {
    }
    d.kind = "else";
    class f extends S {
      constructor(m, b) {
        super(b), this.condition = m;
      }
      render(m) {
        let b = `if(${this.condition})` + super.render(m);
        return this.else && (b += "else " + this.else.render(m)), b;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const m = this.condition;
        if (m === !0)
          return this.nodes;
        let b = this.else;
        if (b) {
          const A = b.optimizeNodes();
          b = this.else = Array.isArray(A) ? new d(A) : A;
        }
        if (b)
          return m === !1 ? b instanceof f ? b : b.nodes : this.nodes.length ? this : new f(x(m), b instanceof f ? [b] : b.nodes);
        if (!(m === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(m, b) {
        var A;
        if (this.else = (A = this.else) === null || A === void 0 ? void 0 : A.optimizeNames(m, b), !!(super.optimizeNames(m, b) || this.else))
          return this.condition = L(this.condition, m, b), this;
      }
      get names() {
        const m = super.names;
        return z(m, this.condition), this.else && U(m, this.else.names), m;
      }
    }
    f.kind = "if";
    class a extends S {
    }
    a.kind = "for";
    class h extends a {
      constructor(m) {
        super(), this.iteration = m;
      }
      render(m) {
        return `for(${this.iteration})` + super.render(m);
      }
      optimizeNames(m, b) {
        if (super.optimizeNames(m, b))
          return this.iteration = L(this.iteration, m, b), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class _ extends a {
      constructor(m, b, A, G) {
        super(), this.varKind = m, this.name = b, this.from = A, this.to = G;
      }
      render(m) {
        const b = m.es5 ? s.varKinds.var : this.varKind, { name: A, from: G, to: H } = this;
        return `for(${b} ${A}=${G}; ${A}<${H}; ${A}++)` + super.render(m);
      }
      get names() {
        const m = z(super.names, this.from);
        return z(m, this.to);
      }
    }
    class v extends a {
      constructor(m, b, A, G) {
        super(), this.loop = m, this.varKind = b, this.name = A, this.iterable = G;
      }
      render(m) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(m);
      }
      optimizeNames(m, b) {
        if (super.optimizeNames(m, b))
          return this.iterable = L(this.iterable, m, b), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class y extends S {
      constructor(m, b, A) {
        super(), this.name = m, this.args = b, this.async = A;
      }
      render(m) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(m);
      }
    }
    y.kind = "func";
    class P extends E {
      render(m) {
        return "return " + super.render(m);
      }
    }
    P.kind = "return";
    class T extends S {
      render(m) {
        let b = "try" + super.render(m);
        return this.catch && (b += this.catch.render(m)), this.finally && (b += this.finally.render(m)), b;
      }
      optimizeNodes() {
        var m, b;
        return super.optimizeNodes(), (m = this.catch) === null || m === void 0 || m.optimizeNodes(), (b = this.finally) === null || b === void 0 || b.optimizeNodes(), this;
      }
      optimizeNames(m, b) {
        var A, G;
        return super.optimizeNames(m, b), (A = this.catch) === null || A === void 0 || A.optimizeNames(m, b), (G = this.finally) === null || G === void 0 || G.optimizeNames(m, b), this;
      }
      get names() {
        const m = super.names;
        return this.catch && U(m, this.catch.names), this.finally && U(m, this.finally.names), m;
      }
    }
    class q extends S {
      constructor(m) {
        super(), this.error = m;
      }
      render(m) {
        return `catch(${this.error})` + super.render(m);
      }
    }
    q.kind = "catch";
    class F extends S {
      render(m) {
        return "finally" + super.render(m);
      }
    }
    F.kind = "finally";
    class D {
      constructor(m, b = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...b, _n: b.lines ? `
` : "" }, this._extScope = m, this._scope = new s.Scope({ parent: m }), this._nodes = [new g()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(m) {
        return this._scope.name(m);
      }
      // reserves unique name in the external scope
      scopeName(m) {
        return this._extScope.name(m);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(m, b) {
        const A = this._extScope.value(m, b);
        return (this._values[A.prefix] || (this._values[A.prefix] = /* @__PURE__ */ new Set())).add(A), A;
      }
      getScopeValue(m, b) {
        return this._extScope.getValue(m, b);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(m) {
        return this._extScope.scopeRefs(m, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(m, b, A, G) {
        const H = this._scope.toName(b);
        return A !== void 0 && G && (this._constants[H.str] = A), this._leafNode(new i(m, H, A)), H;
      }
      // `const` declaration (`var` in es5 mode)
      const(m, b, A) {
        return this._def(s.varKinds.const, m, b, A);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(m, b, A) {
        return this._def(s.varKinds.let, m, b, A);
      }
      // `var` declaration with optional assignment
      var(m, b, A) {
        return this._def(s.varKinds.var, m, b, A);
      }
      // assignment code
      assign(m, b, A) {
        return this._leafNode(new o(m, b, A));
      }
      // `+=` code
      add(m, b) {
        return this._leafNode(new u(m, e.operators.ADD, b));
      }
      // appends passed SafeExpr to code or executes Block
      code(m) {
        return typeof m == "function" ? m() : m !== t.nil && this._leafNode(new w(m)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...m) {
        const b = ["{"];
        for (const [A, G] of m)
          b.length > 1 && b.push(","), b.push(A), (A !== G || this.opts.es5) && (b.push(":"), (0, t.addCodeArg)(b, G));
        return b.push("}"), new t._Code(b);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(m, b, A) {
        if (this._blockNode(new f(m)), b && A)
          this.code(b).else().code(A).endIf();
        else if (b)
          this.code(b).endIf();
        else if (A)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(m) {
        return this._elseNode(new f(m));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new d());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(f, d);
      }
      _for(m, b) {
        return this._blockNode(m), b && this.code(b).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(m, b) {
        return this._for(new h(m), b);
      }
      // `for` statement for a range of values
      forRange(m, b, A, G, H = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(m);
        return this._for(new _(H, Z, b, A), () => G(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(m, b, A, G = s.varKinds.const) {
        const H = this._scope.toName(m);
        if (this.opts.es5) {
          const Z = b instanceof t.Name ? b : this.var("_arr", b);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Y) => {
            this.var(H, (0, t._)`${Z}[${Y}]`), A(H);
          });
        }
        return this._for(new v("of", G, H, b), () => A(H));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(m, b, A, G = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(m, (0, t._)`Object.keys(${b})`, A);
        const H = this._scope.toName(m);
        return this._for(new v("in", G, H, b), () => A(H));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(a);
      }
      // `label` statement
      label(m) {
        return this._leafNode(new p(m));
      }
      // `break` statement
      break(m) {
        return this._leafNode(new c(m));
      }
      // `return` statement
      return(m) {
        const b = new P();
        if (this._blockNode(b), this.code(m), b.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(P);
      }
      // `try` statement
      try(m, b, A) {
        if (!b && !A)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const G = new T();
        if (this._blockNode(G), this.code(m), b) {
          const H = this.name("e");
          this._currNode = G.catch = new q(H), b(H);
        }
        return A && (this._currNode = G.finally = new F(), this.code(A)), this._endBlockNode(q, F);
      }
      // `throw` statement
      throw(m) {
        return this._leafNode(new $(m));
      }
      // start self-balancing block
      block(m, b) {
        return this._blockStarts.push(this._nodes.length), m && this.code(m).endBlock(b), this;
      }
      // end the current self-balancing block
      endBlock(m) {
        const b = this._blockStarts.pop();
        if (b === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const A = this._nodes.length - b;
        if (A < 0 || m !== void 0 && A !== m)
          throw new Error(`CodeGen: wrong number of nodes: ${A} vs ${m} expected`);
        return this._nodes.length = b, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(m, b = t.nil, A, G) {
        return this._blockNode(new y(m, b, A)), G && this.code(G).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(y);
      }
      optimize(m = 1) {
        for (; m-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(m) {
        return this._currNode.nodes.push(m), this;
      }
      _blockNode(m) {
        this._currNode.nodes.push(m), this._nodes.push(m);
      }
      _endBlockNode(m, b) {
        const A = this._currNode;
        if (A instanceof m || b && A instanceof b)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${b ? `${m.kind}/${b.kind}` : m.kind}"`);
      }
      _elseNode(m) {
        const b = this._currNode;
        if (!(b instanceof f))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = b.else = m, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const m = this._nodes;
        return m[m.length - 1];
      }
      set _currNode(m) {
        const b = this._nodes;
        b[b.length - 1] = m;
      }
    }
    e.CodeGen = D;
    function U(I, m) {
      for (const b in m)
        I[b] = (I[b] || 0) + (m[b] || 0);
      return I;
    }
    function z(I, m) {
      return m instanceof t._CodeOrName ? U(I, m.names) : I;
    }
    function L(I, m, b) {
      if (I instanceof t.Name)
        return A(I);
      if (!G(I))
        return I;
      return new t._Code(I._items.reduce((H, Z) => (Z instanceof t.Name && (Z = A(Z)), Z instanceof t._Code ? H.push(...Z._items) : H.push(Z), H), []));
      function A(H) {
        const Z = b[H.str];
        return Z === void 0 || m[H.str] !== 1 ? H : (delete m[H.str], Z);
      }
      function G(H) {
        return H instanceof t._Code && H._items.some((Z) => Z instanceof t.Name && m[Z.str] === 1 && b[Z.str] !== void 0);
      }
    }
    function V(I, m) {
      for (const b in m)
        I[b] = (I[b] || 0) - (m[b] || 0);
    }
    function x(I) {
      return typeof I == "boolean" || typeof I == "number" || I === null ? !I : (0, t._)`!${j(I)}`;
    }
    e.not = x;
    const W = N(e.operators.AND);
    function B(...I) {
      return I.reduce(W);
    }
    e.and = B;
    const X = N(e.operators.OR);
    function C(...I) {
      return I.reduce(X);
    }
    e.or = C;
    function N(I) {
      return (m, b) => m === t.nil ? b : b === t.nil ? m : (0, t._)`${j(m)} ${I} ${j(b)}`;
    }
    function j(I) {
      return I instanceof t.Name ? I : (0, t._)`(${I})`;
    }
  }(Ss)), Ss;
}
var ne = {}, Mi;
function ce() {
  if (Mi) return ne;
  Mi = 1, Object.defineProperty(ne, "__esModule", { value: !0 }), ne.checkStrictMode = ne.getErrorPath = ne.Type = ne.useFunc = ne.setEvaluated = ne.evaluatedPropsToName = ne.mergeEvaluated = ne.eachItem = ne.unescapeJsonPointer = ne.escapeJsonPointer = ne.escapeFragment = ne.unescapeFragment = ne.schemaRefOrVal = ne.schemaHasRulesButRef = ne.schemaHasRules = ne.checkUnknownRules = ne.alwaysValidSchema = ne.toHash = void 0;
  const e = se(), t = Mn();
  function s(v) {
    const y = {};
    for (const P of v)
      y[P] = !0;
    return y;
  }
  ne.toHash = s;
  function r(v, y) {
    return typeof y == "boolean" ? y : Object.keys(y).length === 0 ? !0 : (l(v, y), !n(y, v.self.RULES.all));
  }
  ne.alwaysValidSchema = r;
  function l(v, y = v.schema) {
    const { opts: P, self: T } = v;
    if (!P.strictSchema || typeof y == "boolean")
      return;
    const q = T.RULES.keywords;
    for (const F in y)
      q[F] || _(v, `unknown keyword: "${F}"`);
  }
  ne.checkUnknownRules = l;
  function n(v, y) {
    if (typeof v == "boolean")
      return !v;
    for (const P in v)
      if (y[P])
        return !0;
    return !1;
  }
  ne.schemaHasRules = n;
  function i(v, y) {
    if (typeof v == "boolean")
      return !v;
    for (const P in v)
      if (P !== "$ref" && y.all[P])
        return !0;
    return !1;
  }
  ne.schemaHasRulesButRef = i;
  function o({ topSchemaRef: v, schemaPath: y }, P, T, q) {
    if (!q) {
      if (typeof P == "number" || typeof P == "boolean")
        return P;
      if (typeof P == "string")
        return (0, e._)`${P}`;
    }
    return (0, e._)`${v}${y}${(0, e.getProperty)(T)}`;
  }
  ne.schemaRefOrVal = o;
  function u(v) {
    return $(decodeURIComponent(v));
  }
  ne.unescapeFragment = u;
  function p(v) {
    return encodeURIComponent(c(v));
  }
  ne.escapeFragment = p;
  function c(v) {
    return typeof v == "number" ? `${v}` : v.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  ne.escapeJsonPointer = c;
  function $(v) {
    return v.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  ne.unescapeJsonPointer = $;
  function w(v, y) {
    if (Array.isArray(v))
      for (const P of v)
        y(P);
    else
      y(v);
  }
  ne.eachItem = w;
  function E({ mergeNames: v, mergeToName: y, mergeValues: P, resultToName: T }) {
    return (q, F, D, U) => {
      const z = D === void 0 ? F : D instanceof e.Name ? (F instanceof e.Name ? v(q, F, D) : y(q, F, D), D) : F instanceof e.Name ? (y(q, D, F), F) : P(F, D);
      return U === e.Name && !(z instanceof e.Name) ? T(q, z) : z;
    };
  }
  ne.mergeEvaluated = {
    props: E({
      mergeNames: (v, y, P) => v.if((0, e._)`${P} !== true && ${y} !== undefined`, () => {
        v.if((0, e._)`${y} === true`, () => v.assign(P, !0), () => v.assign(P, (0, e._)`${P} || {}`).code((0, e._)`Object.assign(${P}, ${y})`));
      }),
      mergeToName: (v, y, P) => v.if((0, e._)`${P} !== true`, () => {
        y === !0 ? v.assign(P, !0) : (v.assign(P, (0, e._)`${P} || {}`), g(v, P, y));
      }),
      mergeValues: (v, y) => v === !0 ? !0 : { ...v, ...y },
      resultToName: S
    }),
    items: E({
      mergeNames: (v, y, P) => v.if((0, e._)`${P} !== true && ${y} !== undefined`, () => v.assign(P, (0, e._)`${y} === true ? true : ${P} > ${y} ? ${P} : ${y}`)),
      mergeToName: (v, y, P) => v.if((0, e._)`${P} !== true`, () => v.assign(P, y === !0 ? !0 : (0, e._)`${P} > ${y} ? ${P} : ${y}`)),
      mergeValues: (v, y) => v === !0 ? !0 : Math.max(v, y),
      resultToName: (v, y) => v.var("items", y)
    })
  };
  function S(v, y) {
    if (y === !0)
      return v.var("props", !0);
    const P = v.var("props", (0, e._)`{}`);
    return y !== void 0 && g(v, P, y), P;
  }
  ne.evaluatedPropsToName = S;
  function g(v, y, P) {
    Object.keys(P).forEach((T) => v.assign((0, e._)`${y}${(0, e.getProperty)(T)}`, !0));
  }
  ne.setEvaluated = g;
  const d = {};
  function f(v, y) {
    return v.scopeValue("func", {
      ref: y,
      code: d[y.code] || (d[y.code] = new t._Code(y.code))
    });
  }
  ne.useFunc = f;
  var a;
  (function(v) {
    v[v.Num = 0] = "Num", v[v.Str = 1] = "Str";
  })(a || (ne.Type = a = {}));
  function h(v, y, P) {
    if (v instanceof e.Name) {
      const T = y === a.Num;
      return P ? T ? (0, e._)`"[" + ${v} + "]"` : (0, e._)`"['" + ${v} + "']"` : T ? (0, e._)`"/" + ${v}` : (0, e._)`"/" + ${v}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return P ? (0, e.getProperty)(v).toString() : "/" + c(v);
  }
  ne.getErrorPath = h;
  function _(v, y, P = v.opts.strictSchema) {
    if (P) {
      if (y = `strict mode: ${y}`, P === !0)
        throw new Error(y);
      v.self.logger.warn(y);
    }
  }
  return ne.checkStrictMode = _, ne;
}
var Gr = {}, Li;
function ot() {
  if (Li) return Gr;
  Li = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const e = se(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Gr.default = t, Gr;
}
var Fi;
function xn() {
  return Fi || (Fi = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = se(), s = ce(), r = ot();
    e.keywordError = {
      message: ({ keyword: d }) => (0, t.str)`must pass "${d}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: d, schemaType: f }) => f ? (0, t.str)`"${d}" keyword must be ${f} ($data)` : (0, t.str)`"${d}" keyword is invalid ($data)`
    };
    function l(d, f = e.keywordError, a, h) {
      const { it: _ } = d, { gen: v, compositeRule: y, allErrors: P } = _, T = $(d, f, a);
      h ?? (y || P) ? u(v, T) : p(_, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function n(d, f = e.keywordError, a) {
      const { it: h } = d, { gen: _, compositeRule: v, allErrors: y } = h, P = $(d, f, a);
      u(_, P), v || y || p(h, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(d, f) {
      d.assign(r.default.errors, f), d.if((0, t._)`${r.default.vErrors} !== null`, () => d.if(f, () => d.assign((0, t._)`${r.default.vErrors}.length`, f), () => d.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function o({ gen: d, keyword: f, schemaValue: a, data: h, errsCount: _, it: v }) {
      if (_ === void 0)
        throw new Error("ajv implementation error");
      const y = d.name("err");
      d.forRange("i", _, r.default.errors, (P) => {
        d.const(y, (0, t._)`${r.default.vErrors}[${P}]`), d.if((0, t._)`${y}.instancePath === undefined`, () => d.assign((0, t._)`${y}.instancePath`, (0, t.strConcat)(r.default.instancePath, v.errorPath))), d.assign((0, t._)`${y}.schemaPath`, (0, t.str)`${v.errSchemaPath}/${f}`), v.opts.verbose && (d.assign((0, t._)`${y}.schema`, a), d.assign((0, t._)`${y}.data`, h));
      });
    }
    e.extendErrors = o;
    function u(d, f) {
      const a = d.const("err", f);
      d.if((0, t._)`${r.default.vErrors} === null`, () => d.assign(r.default.vErrors, (0, t._)`[${a}]`), (0, t._)`${r.default.vErrors}.push(${a})`), d.code((0, t._)`${r.default.errors}++`);
    }
    function p(d, f) {
      const { gen: a, validateName: h, schemaEnv: _ } = d;
      _.$async ? a.throw((0, t._)`new ${d.ValidationError}(${f})`) : (a.assign((0, t._)`${h}.errors`, f), a.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(d, f, a) {
      const { createErrors: h } = d.it;
      return h === !1 ? (0, t._)`{}` : w(d, f, a);
    }
    function w(d, f, a = {}) {
      const { gen: h, it: _ } = d, v = [
        E(_, a),
        S(d, a)
      ];
      return g(d, f, v), h.object(...v);
    }
    function E({ errorPath: d }, { instancePath: f }) {
      const a = f ? (0, t.str)`${d}${(0, s.getErrorPath)(f, s.Type.Str)}` : d;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, a)];
    }
    function S({ keyword: d, it: { errSchemaPath: f } }, { schemaPath: a, parentSchema: h }) {
      let _ = h ? f : (0, t.str)`${f}/${d}`;
      return a && (_ = (0, t.str)`${_}${(0, s.getErrorPath)(a, s.Type.Str)}`), [c.schemaPath, _];
    }
    function g(d, { params: f, message: a }, h) {
      const { keyword: _, data: v, schemaValue: y, it: P } = d, { opts: T, propertyName: q, topSchemaRef: F, schemaPath: D } = P;
      h.push([c.keyword, _], [c.params, typeof f == "function" ? f(d) : f || (0, t._)`{}`]), T.messages && h.push([c.message, typeof a == "function" ? a(d) : a]), T.verbose && h.push([c.schema, y], [c.parentSchema, (0, t._)`${F}${D}`], [r.default.data, v]), q && h.push([c.propertyName, q]);
    }
  }(bs)), bs;
}
var Vi;
function Uh() {
  if (Vi) return ht;
  Vi = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.boolOrEmptySchema = ht.topBoolOrEmptySchema = void 0;
  const e = xn(), t = se(), s = ot(), r = {
    message: "boolean schema is false"
  };
  function l(o) {
    const { gen: u, schema: p, validateName: c } = o;
    p === !1 ? i(o, !1) : typeof p == "object" && p.$async === !0 ? u.return(s.default.data) : (u.assign((0, t._)`${c}.errors`, null), u.return(!0));
  }
  ht.topBoolOrEmptySchema = l;
  function n(o, u) {
    const { gen: p, schema: c } = o;
    c === !1 ? (p.var(u, !1), i(o)) : p.var(u, !0);
  }
  ht.boolOrEmptySchema = n;
  function i(o, u) {
    const { gen: p, data: c } = o, $ = {
      gen: p,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)($, r, void 0, u);
  }
  return ht;
}
var _e = {}, mt = {}, Ui;
function cl() {
  if (Ui) return mt;
  Ui = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.getRules = mt.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(l) {
    return typeof l == "string" && t.has(l);
  }
  mt.isJSONType = s;
  function r() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return mt.getRules = r, mt;
}
var xe = {}, zi;
function ul() {
  if (zi) return xe;
  zi = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.shouldUseRule = xe.shouldUseGroup = xe.schemaHasRulesForType = void 0;
  function e({ schema: r, self: l }, n) {
    const i = l.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  xe.schemaHasRulesForType = e;
  function t(r, l) {
    return l.rules.some((n) => s(r, n));
  }
  xe.shouldUseGroup = t;
  function s(r, l) {
    var n;
    return r[l.keyword] !== void 0 || ((n = l.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return xe.shouldUseRule = s, xe;
}
var Gi;
function Ln() {
  if (Gi) return _e;
  Gi = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
  const e = cl(), t = ul(), s = xn(), r = se(), l = ce();
  var n;
  (function(a) {
    a[a.Correct = 0] = "Correct", a[a.Wrong = 1] = "Wrong";
  })(n || (_e.DataType = n = {}));
  function i(a) {
    const h = o(a.type);
    if (h.includes("null")) {
      if (a.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!h.length && a.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      a.nullable === !0 && h.push("null");
    }
    return h;
  }
  _e.getSchemaTypes = i;
  function o(a) {
    const h = Array.isArray(a) ? a : a ? [a] : [];
    if (h.every(e.isJSONType))
      return h;
    throw new Error("type must be JSONType or JSONType[]: " + h.join(","));
  }
  _e.getJSONTypes = o;
  function u(a, h) {
    const { gen: _, data: v, opts: y } = a, P = c(h, y.coerceTypes), T = h.length > 0 && !(P.length === 0 && h.length === 1 && (0, t.schemaHasRulesForType)(a, h[0]));
    if (T) {
      const q = S(h, v, y.strictNumbers, n.Wrong);
      _.if(q, () => {
        P.length ? $(a, h, P) : d(a);
      });
    }
    return T;
  }
  _e.coerceAndCheckDataType = u;
  const p = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(a, h) {
    return h ? a.filter((_) => p.has(_) || h === "array" && _ === "array") : [];
  }
  function $(a, h, _) {
    const { gen: v, data: y, opts: P } = a, T = v.let("dataType", (0, r._)`typeof ${y}`), q = v.let("coerced", (0, r._)`undefined`);
    P.coerceTypes === "array" && v.if((0, r._)`${T} == 'object' && Array.isArray(${y}) && ${y}.length == 1`, () => v.assign(y, (0, r._)`${y}[0]`).assign(T, (0, r._)`typeof ${y}`).if(S(h, y, P.strictNumbers), () => v.assign(q, y))), v.if((0, r._)`${q} !== undefined`);
    for (const D of _)
      (p.has(D) || D === "array" && P.coerceTypes === "array") && F(D);
    v.else(), d(a), v.endIf(), v.if((0, r._)`${q} !== undefined`, () => {
      v.assign(y, q), w(a, q);
    });
    function F(D) {
      switch (D) {
        case "string":
          v.elseIf((0, r._)`${T} == "number" || ${T} == "boolean"`).assign(q, (0, r._)`"" + ${y}`).elseIf((0, r._)`${y} === null`).assign(q, (0, r._)`""`);
          return;
        case "number":
          v.elseIf((0, r._)`${T} == "boolean" || ${y} === null
              || (${T} == "string" && ${y} && ${y} == +${y})`).assign(q, (0, r._)`+${y}`);
          return;
        case "integer":
          v.elseIf((0, r._)`${T} === "boolean" || ${y} === null
              || (${T} === "string" && ${y} && ${y} == +${y} && !(${y} % 1))`).assign(q, (0, r._)`+${y}`);
          return;
        case "boolean":
          v.elseIf((0, r._)`${y} === "false" || ${y} === 0 || ${y} === null`).assign(q, !1).elseIf((0, r._)`${y} === "true" || ${y} === 1`).assign(q, !0);
          return;
        case "null":
          v.elseIf((0, r._)`${y} === "" || ${y} === 0 || ${y} === false`), v.assign(q, null);
          return;
        case "array":
          v.elseIf((0, r._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${y} === null`).assign(q, (0, r._)`[${y}]`);
      }
    }
  }
  function w({ gen: a, parentData: h, parentDataProperty: _ }, v) {
    a.if((0, r._)`${h} !== undefined`, () => a.assign((0, r._)`${h}[${_}]`, v));
  }
  function E(a, h, _, v = n.Correct) {
    const y = v === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let P;
    switch (a) {
      case "null":
        return (0, r._)`${h} ${y} null`;
      case "array":
        P = (0, r._)`Array.isArray(${h})`;
        break;
      case "object":
        P = (0, r._)`${h} && typeof ${h} == "object" && !Array.isArray(${h})`;
        break;
      case "integer":
        P = T((0, r._)`!(${h} % 1) && !isNaN(${h})`);
        break;
      case "number":
        P = T();
        break;
      default:
        return (0, r._)`typeof ${h} ${y} ${a}`;
    }
    return v === n.Correct ? P : (0, r.not)(P);
    function T(q = r.nil) {
      return (0, r.and)((0, r._)`typeof ${h} == "number"`, q, _ ? (0, r._)`isFinite(${h})` : r.nil);
    }
  }
  _e.checkDataType = E;
  function S(a, h, _, v) {
    if (a.length === 1)
      return E(a[0], h, _, v);
    let y;
    const P = (0, l.toHash)(a);
    if (P.array && P.object) {
      const T = (0, r._)`typeof ${h} != "object"`;
      y = P.null ? T : (0, r._)`!${h} || ${T}`, delete P.null, delete P.array, delete P.object;
    } else
      y = r.nil;
    P.number && delete P.integer;
    for (const T in P)
      y = (0, r.and)(y, E(T, h, _, v));
    return y;
  }
  _e.checkDataTypes = S;
  const g = {
    message: ({ schema: a }) => `must be ${a}`,
    params: ({ schema: a, schemaValue: h }) => typeof a == "string" ? (0, r._)`{type: ${a}}` : (0, r._)`{type: ${h}}`
  };
  function d(a) {
    const h = f(a);
    (0, s.reportError)(h, g);
  }
  _e.reportTypeError = d;
  function f(a) {
    const { gen: h, data: _, schema: v } = a, y = (0, l.schemaRefOrVal)(a, v, "type");
    return {
      gen: h,
      keyword: "type",
      data: _,
      schema: v.type,
      schemaCode: y,
      schemaValue: y,
      parentSchema: v,
      params: {},
      it: a
    };
  }
  return _e;
}
var Ft = {}, Ki;
function zh() {
  if (Ki) return Ft;
  Ki = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.assignDefaults = void 0;
  const e = se(), t = ce();
  function s(l, n) {
    const { properties: i, items: o } = l.schema;
    if (n === "object" && i)
      for (const u in i)
        r(l, u, i[u].default);
    else n === "array" && Array.isArray(o) && o.forEach((u, p) => r(l, p, u.default));
  }
  Ft.assignDefaults = s;
  function r(l, n, i) {
    const { gen: o, compositeRule: u, data: p, opts: c } = l;
    if (i === void 0)
      return;
    const $ = (0, e._)`${p}${(0, e.getProperty)(n)}`;
    if (u) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${$}`);
      return;
    }
    let w = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (w = (0, e._)`${w} || ${$} === null || ${$} === ""`), o.if(w, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return Ft;
}
var Me = {}, he = {}, Hi;
function Ve() {
  if (Hi) return he;
  Hi = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.validateUnion = he.validateArray = he.usePattern = he.callValidateCode = he.schemaProperties = he.allSchemaProperties = he.noPropertyInData = he.propertyInData = he.isOwnProperty = he.hasPropFunc = he.reportMissingProp = he.checkMissingProp = he.checkReportMissingProp = void 0;
  const e = se(), t = ce(), s = ot(), r = ce();
  function l(a, h) {
    const { gen: _, data: v, it: y } = a;
    _.if(c(_, v, h, y.opts.ownProperties), () => {
      a.setParams({ missingProperty: (0, e._)`${h}` }, !0), a.error();
    });
  }
  he.checkReportMissingProp = l;
  function n({ gen: a, data: h, it: { opts: _ } }, v, y) {
    return (0, e.or)(...v.map((P) => (0, e.and)(c(a, h, P, _.ownProperties), (0, e._)`${y} = ${P}`)));
  }
  he.checkMissingProp = n;
  function i(a, h) {
    a.setParams({ missingProperty: h }, !0), a.error();
  }
  he.reportMissingProp = i;
  function o(a) {
    return a.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  he.hasPropFunc = o;
  function u(a, h, _) {
    return (0, e._)`${o(a)}.call(${h}, ${_})`;
  }
  he.isOwnProperty = u;
  function p(a, h, _, v) {
    const y = (0, e._)`${h}${(0, e.getProperty)(_)} !== undefined`;
    return v ? (0, e._)`${y} && ${u(a, h, _)}` : y;
  }
  he.propertyInData = p;
  function c(a, h, _, v) {
    const y = (0, e._)`${h}${(0, e.getProperty)(_)} === undefined`;
    return v ? (0, e.or)(y, (0, e.not)(u(a, h, _))) : y;
  }
  he.noPropertyInData = c;
  function $(a) {
    return a ? Object.keys(a).filter((h) => h !== "__proto__") : [];
  }
  he.allSchemaProperties = $;
  function w(a, h) {
    return $(h).filter((_) => !(0, t.alwaysValidSchema)(a, h[_]));
  }
  he.schemaProperties = w;
  function E({ schemaCode: a, data: h, it: { gen: _, topSchemaRef: v, schemaPath: y, errorPath: P }, it: T }, q, F, D) {
    const U = D ? (0, e._)`${a}, ${h}, ${v}${y}` : h, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, P)],
      [s.default.parentData, T.parentData],
      [s.default.parentDataProperty, T.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    T.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const L = (0, e._)`${U}, ${_.object(...z)}`;
    return F !== e.nil ? (0, e._)`${q}.call(${F}, ${L})` : (0, e._)`${q}(${L})`;
  }
  he.callValidateCode = E;
  const S = (0, e._)`new RegExp`;
  function g({ gen: a, it: { opts: h } }, _) {
    const v = h.unicodeRegExp ? "u" : "", { regExp: y } = h.code, P = y(_, v);
    return a.scopeValue("pattern", {
      key: P.toString(),
      ref: P,
      code: (0, e._)`${y.code === "new RegExp" ? S : (0, r.useFunc)(a, y)}(${_}, ${v})`
    });
  }
  he.usePattern = g;
  function d(a) {
    const { gen: h, data: _, keyword: v, it: y } = a, P = h.name("valid");
    if (y.allErrors) {
      const q = h.let("valid", !0);
      return T(() => h.assign(q, !1)), q;
    }
    return h.var(P, !0), T(() => h.break()), P;
    function T(q) {
      const F = h.const("len", (0, e._)`${_}.length`);
      h.forRange("i", 0, F, (D) => {
        a.subschema({
          keyword: v,
          dataProp: D,
          dataPropType: t.Type.Num
        }, P), h.if((0, e.not)(P), q);
      });
    }
  }
  he.validateArray = d;
  function f(a) {
    const { gen: h, schema: _, keyword: v, it: y } = a;
    if (!Array.isArray(_))
      throw new Error("ajv implementation error");
    if (_.some((F) => (0, t.alwaysValidSchema)(y, F)) && !y.opts.unevaluated)
      return;
    const T = h.let("valid", !1), q = h.name("_valid");
    h.block(() => _.forEach((F, D) => {
      const U = a.subschema({
        keyword: v,
        schemaProp: D,
        compositeRule: !0
      }, q);
      h.assign(T, (0, e._)`${T} || ${q}`), a.mergeValidEvaluated(U, q) || h.if((0, e.not)(T));
    })), a.result(T, () => a.reset(), () => a.error(!0));
  }
  return he.validateUnion = f, he;
}
var Bi;
function Gh() {
  if (Bi) return Me;
  Bi = 1, Object.defineProperty(Me, "__esModule", { value: !0 }), Me.validateKeywordUsage = Me.validSchemaType = Me.funcKeywordCode = Me.macroKeywordCode = void 0;
  const e = se(), t = ot(), s = Ve(), r = xn();
  function l(w, E) {
    const { gen: S, keyword: g, schema: d, parentSchema: f, it: a } = w, h = E.macro.call(a.self, d, f, a), _ = p(S, g, h);
    a.opts.validateSchema !== !1 && a.self.validateSchema(h, !0);
    const v = S.name("valid");
    w.subschema({
      schema: h,
      schemaPath: e.nil,
      errSchemaPath: `${a.errSchemaPath}/${g}`,
      topSchemaRef: _,
      compositeRule: !0
    }, v), w.pass(v, () => w.error(!0));
  }
  Me.macroKeywordCode = l;
  function n(w, E) {
    var S;
    const { gen: g, keyword: d, schema: f, parentSchema: a, $data: h, it: _ } = w;
    u(_, E);
    const v = !h && E.compile ? E.compile.call(_.self, f, a, _) : E.validate, y = p(g, d, v), P = g.let("valid");
    w.block$data(P, T), w.ok((S = E.valid) !== null && S !== void 0 ? S : P);
    function T() {
      if (E.errors === !1)
        D(), E.modifying && i(w), U(() => w.error());
      else {
        const z = E.async ? q() : F();
        E.modifying && i(w), U(() => o(w, z));
      }
    }
    function q() {
      const z = g.let("ruleErrs", null);
      return g.try(() => D((0, e._)`await `), (L) => g.assign(P, !1).if((0, e._)`${L} instanceof ${_.ValidationError}`, () => g.assign(z, (0, e._)`${L}.errors`), () => g.throw(L))), z;
    }
    function F() {
      const z = (0, e._)`${y}.errors`;
      return g.assign(z, null), D(e.nil), z;
    }
    function D(z = E.async ? (0, e._)`await ` : e.nil) {
      const L = _.opts.passContext ? t.default.this : t.default.self, V = !("compile" in E && !h || E.schema === !1);
      g.assign(P, (0, e._)`${z}${(0, s.callValidateCode)(w, y, L, V)}`, E.modifying);
    }
    function U(z) {
      var L;
      g.if((0, e.not)((L = E.valid) !== null && L !== void 0 ? L : P), z);
    }
  }
  Me.funcKeywordCode = n;
  function i(w) {
    const { gen: E, data: S, it: g } = w;
    E.if(g.parentData, () => E.assign(S, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function o(w, E) {
    const { gen: S } = w;
    S.if((0, e._)`Array.isArray(${E})`, () => {
      S.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${E} : ${t.default.vErrors}.concat(${E})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(w);
    }, () => w.error());
  }
  function u({ schemaEnv: w }, E) {
    if (E.async && !w.$async)
      throw new Error("async keyword in sync schema");
  }
  function p(w, E, S) {
    if (S === void 0)
      throw new Error(`keyword "${E}" failed to compile`);
    return w.scopeValue("keyword", typeof S == "function" ? { ref: S } : { ref: S, code: (0, e.stringify)(S) });
  }
  function c(w, E, S = !1) {
    return !E.length || E.some((g) => g === "array" ? Array.isArray(w) : g === "object" ? w && typeof w == "object" && !Array.isArray(w) : typeof w == g || S && typeof w > "u");
  }
  Me.validSchemaType = c;
  function $({ schema: w, opts: E, self: S, errSchemaPath: g }, d, f) {
    if (Array.isArray(d.keyword) ? !d.keyword.includes(f) : d.keyword !== f)
      throw new Error("ajv implementation error");
    const a = d.dependencies;
    if (a != null && a.some((h) => !Object.prototype.hasOwnProperty.call(w, h)))
      throw new Error(`parent schema must have dependencies of ${f}: ${a.join(",")}`);
    if (d.validateSchema && !d.validateSchema(w[f])) {
      const _ = `keyword "${f}" value is invalid at path "${g}": ` + S.errorsText(d.validateSchema.errors);
      if (E.validateSchema === "log")
        S.logger.error(_);
      else
        throw new Error(_);
    }
  }
  return Me.validateKeywordUsage = $, Me;
}
var Je = {}, Wi;
function Kh() {
  if (Wi) return Je;
  Wi = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.extendSubschemaMode = Je.extendSubschemaData = Je.getSubschema = void 0;
  const e = se(), t = ce();
  function s(n, { keyword: i, schemaProp: o, schema: u, schemaPath: p, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const w = n.schema[i];
      return o === void 0 ? {
        schema: w,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: w[o],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (u !== void 0) {
      if (p === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: p,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Je.getSubschema = s;
  function r(n, i, { dataProp: o, dataPropType: u, data: p, dataTypes: c, propertyName: $ }) {
    if (p !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: w } = i;
    if (o !== void 0) {
      const { errorPath: S, dataPathArr: g, opts: d } = i, f = w.let("data", (0, e._)`${i.data}${(0, e.getProperty)(o)}`, !0);
      E(f), n.errorPath = (0, e.str)`${S}${(0, t.getErrorPath)(o, u, d.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${o}`, n.dataPathArr = [...g, n.parentDataProperty];
    }
    if (p !== void 0) {
      const S = p instanceof e.Name ? p : w.let("data", p, !0);
      E(S), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function E(S) {
      n.data = S, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, S];
    }
  }
  Je.extendSubschemaData = r;
  function l(n, { jtdDiscriminator: i, jtdMetadata: o, compositeRule: u, createErrors: p, allErrors: c }) {
    u !== void 0 && (n.compositeRule = u), p !== void 0 && (n.createErrors = p), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = o;
  }
  return Je.extendSubschemaMode = l, Je;
}
var Re = {}, Ns = { exports: {} }, xi;
function Hh() {
  if (xi) return Ns.exports;
  xi = 1;
  var e = Ns.exports = function(r, l, n) {
    typeof l == "function" && (n = l, l = {}), n = l.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, o = n.post || function() {
    };
    t(l, i, o, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, l, n, i, o, u, p, c, $, w) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, o, u, p, c, $, w);
      for (var E in i) {
        var S = i[E];
        if (Array.isArray(S)) {
          if (E in e.arrayKeywords)
            for (var g = 0; g < S.length; g++)
              t(r, l, n, S[g], o + "/" + E + "/" + g, u, o, E, i, g);
        } else if (E in e.propsKeywords) {
          if (S && typeof S == "object")
            for (var d in S)
              t(r, l, n, S[d], o + "/" + E + "/" + s(d), u, o, E, i, d);
        } else (E in e.keywords || r.allKeys && !(E in e.skipKeywords)) && t(r, l, n, S, o + "/" + E, u, o, E, i);
      }
      n(i, o, u, p, c, $, w);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Ns.exports;
}
var Ji;
function Jn() {
  if (Ji) return Re;
  Ji = 1, Object.defineProperty(Re, "__esModule", { value: !0 }), Re.getSchemaRefs = Re.resolveUrl = Re.normalizeId = Re._getFullPath = Re.getFullPath = Re.inlineRef = void 0;
  const e = ce(), t = Gn(), s = Hh(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function l(g, d = !0) {
    return typeof g == "boolean" ? !0 : d === !0 ? !i(g) : d ? o(g) <= d : !1;
  }
  Re.inlineRef = l;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(g) {
    for (const d in g) {
      if (n.has(d))
        return !0;
      const f = g[d];
      if (Array.isArray(f) && f.some(i) || typeof f == "object" && i(f))
        return !0;
    }
    return !1;
  }
  function o(g) {
    let d = 0;
    for (const f in g) {
      if (f === "$ref")
        return 1 / 0;
      if (d++, !r.has(f) && (typeof g[f] == "object" && (0, e.eachItem)(g[f], (a) => d += o(a)), d === 1 / 0))
        return 1 / 0;
    }
    return d;
  }
  function u(g, d = "", f) {
    f !== !1 && (d = $(d));
    const a = g.parse(d);
    return p(g, a);
  }
  Re.getFullPath = u;
  function p(g, d) {
    return g.serialize(d).split("#")[0] + "#";
  }
  Re._getFullPath = p;
  const c = /#\/?$/;
  function $(g) {
    return g ? g.replace(c, "") : "";
  }
  Re.normalizeId = $;
  function w(g, d, f) {
    return f = $(f), g.resolve(d, f);
  }
  Re.resolveUrl = w;
  const E = /^[a-z_][-a-z0-9._]*$/i;
  function S(g, d) {
    if (typeof g == "boolean")
      return {};
    const { schemaId: f, uriResolver: a } = this.opts, h = $(g[f] || d), _ = { "": h }, v = u(a, h, !1), y = {}, P = /* @__PURE__ */ new Set();
    return s(g, { allKeys: !0 }, (F, D, U, z) => {
      if (z === void 0)
        return;
      const L = v + D;
      let V = _[z];
      typeof F[f] == "string" && (V = x.call(this, F[f])), W.call(this, F.$anchor), W.call(this, F.$dynamicAnchor), _[D] = V;
      function x(B) {
        const X = this.opts.uriResolver.resolve;
        if (B = $(V ? X(V, B) : B), P.has(B))
          throw q(B);
        P.add(B);
        let C = this.refs[B];
        return typeof C == "string" && (C = this.refs[C]), typeof C == "object" ? T(F, C.schema, B) : B !== $(L) && (B[0] === "#" ? (T(F, y[B], B), y[B] = F) : this.refs[B] = L), B;
      }
      function W(B) {
        if (typeof B == "string") {
          if (!E.test(B))
            throw new Error(`invalid anchor "${B}"`);
          x.call(this, `#${B}`);
        }
      }
    }), y;
    function T(F, D, U) {
      if (D !== void 0 && !t(F, D))
        throw q(U);
    }
    function q(F) {
      return new Error(`reference "${F}" resolves to more than one schema`);
    }
  }
  return Re.getSchemaRefs = S, Re;
}
var Xi;
function Xn() {
  if (Xi) return We;
  Xi = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.getData = We.KeywordCxt = We.validateFunctionCode = void 0;
  const e = Uh(), t = Ln(), s = ul(), r = Ln(), l = zh(), n = Gh(), i = Kh(), o = se(), u = ot(), p = Jn(), c = ce(), $ = xn();
  function w(R) {
    if (v(R) && (P(R), _(R))) {
      d(R);
      return;
    }
    E(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  We.validateFunctionCode = w;
  function E({ gen: R, validateName: O, schema: k, schemaEnv: M, opts: K }, J) {
    K.code.es5 ? R.func(O, (0, o._)`${u.default.data}, ${u.default.valCxt}`, M.$async, () => {
      R.code((0, o._)`"use strict"; ${a(k, K)}`), g(R, K), R.code(J);
    }) : R.func(O, (0, o._)`${u.default.data}, ${S(K)}`, M.$async, () => R.code(a(k, K)).code(J));
  }
  function S(R) {
    return (0, o._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${R.dynamicRef ? (0, o._)`, ${u.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function g(R, O) {
    R.if(u.default.valCxt, () => {
      R.var(u.default.instancePath, (0, o._)`${u.default.valCxt}.${u.default.instancePath}`), R.var(u.default.parentData, (0, o._)`${u.default.valCxt}.${u.default.parentData}`), R.var(u.default.parentDataProperty, (0, o._)`${u.default.valCxt}.${u.default.parentDataProperty}`), R.var(u.default.rootData, (0, o._)`${u.default.valCxt}.${u.default.rootData}`), O.dynamicRef && R.var(u.default.dynamicAnchors, (0, o._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      R.var(u.default.instancePath, (0, o._)`""`), R.var(u.default.parentData, (0, o._)`undefined`), R.var(u.default.parentDataProperty, (0, o._)`undefined`), R.var(u.default.rootData, u.default.data), O.dynamicRef && R.var(u.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function d(R) {
    const { schema: O, opts: k, gen: M } = R;
    E(R, () => {
      k.$comment && O.$comment && z(R), F(R), M.let(u.default.vErrors, null), M.let(u.default.errors, 0), k.unevaluated && f(R), T(R), L(R);
    });
  }
  function f(R) {
    const { gen: O, validateName: k } = R;
    R.evaluated = O.const("evaluated", (0, o._)`${k}.evaluated`), O.if((0, o._)`${R.evaluated}.dynamicProps`, () => O.assign((0, o._)`${R.evaluated}.props`, (0, o._)`undefined`)), O.if((0, o._)`${R.evaluated}.dynamicItems`, () => O.assign((0, o._)`${R.evaluated}.items`, (0, o._)`undefined`));
  }
  function a(R, O) {
    const k = typeof R == "object" && R[O.schemaId];
    return k && (O.code.source || O.code.process) ? (0, o._)`/*# sourceURL=${k} */` : o.nil;
  }
  function h(R, O) {
    if (v(R) && (P(R), _(R))) {
      y(R, O);
      return;
    }
    (0, e.boolOrEmptySchema)(R, O);
  }
  function _({ schema: R, self: O }) {
    if (typeof R == "boolean")
      return !R;
    for (const k in R)
      if (O.RULES.all[k])
        return !0;
    return !1;
  }
  function v(R) {
    return typeof R.schema != "boolean";
  }
  function y(R, O) {
    const { schema: k, gen: M, opts: K } = R;
    K.$comment && k.$comment && z(R), D(R), U(R);
    const J = M.const("_errs", u.default.errors);
    T(R, J), M.var(O, (0, o._)`${J} === ${u.default.errors}`);
  }
  function P(R) {
    (0, c.checkUnknownRules)(R), q(R);
  }
  function T(R, O) {
    if (R.opts.jtd)
      return x(R, [], !1, O);
    const k = (0, t.getSchemaTypes)(R.schema), M = (0, t.coerceAndCheckDataType)(R, k);
    x(R, k, !M, O);
  }
  function q(R) {
    const { schema: O, errSchemaPath: k, opts: M, self: K } = R;
    O.$ref && M.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(O, K.RULES) && K.logger.warn(`$ref: keywords ignored in schema at path "${k}"`);
  }
  function F(R) {
    const { schema: O, opts: k } = R;
    O.default !== void 0 && k.useDefaults && k.strictSchema && (0, c.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function D(R) {
    const O = R.schema[R.opts.schemaId];
    O && (R.baseId = (0, p.resolveUrl)(R.opts.uriResolver, R.baseId, O));
  }
  function U(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: R, schemaEnv: O, schema: k, errSchemaPath: M, opts: K }) {
    const J = k.$comment;
    if (K.$comment === !0)
      R.code((0, o._)`${u.default.self}.logger.log(${J})`);
    else if (typeof K.$comment == "function") {
      const oe = (0, o.str)`${M}/$comment`, $e = R.scopeValue("root", { ref: O.root });
      R.code((0, o._)`${u.default.self}.opts.$comment(${J}, ${oe}, ${$e}.schema)`);
    }
  }
  function L(R) {
    const { gen: O, schemaEnv: k, validateName: M, ValidationError: K, opts: J } = R;
    k.$async ? O.if((0, o._)`${u.default.errors} === 0`, () => O.return(u.default.data), () => O.throw((0, o._)`new ${K}(${u.default.vErrors})`)) : (O.assign((0, o._)`${M}.errors`, u.default.vErrors), J.unevaluated && V(R), O.return((0, o._)`${u.default.errors} === 0`));
  }
  function V({ gen: R, evaluated: O, props: k, items: M }) {
    k instanceof o.Name && R.assign((0, o._)`${O}.props`, k), M instanceof o.Name && R.assign((0, o._)`${O}.items`, M);
  }
  function x(R, O, k, M) {
    const { gen: K, schema: J, data: oe, allErrors: $e, opts: le, self: de } = R, { RULES: ie } = de;
    if (J.$ref && (le.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(J, ie))) {
      K.block(() => G(R, "$ref", ie.all.$ref.definition));
      return;
    }
    le.jtd || B(R, O), K.block(() => {
      for (const me of ie.rules)
        Ie(me);
      Ie(ie.post);
    });
    function Ie(me) {
      (0, s.shouldUseGroup)(J, me) && (me.type ? (K.if((0, r.checkDataType)(me.type, oe, le.strictNumbers)), W(R, me), O.length === 1 && O[0] === me.type && k && (K.else(), (0, r.reportTypeError)(R)), K.endIf()) : W(R, me), $e || K.if((0, o._)`${u.default.errors} === ${M || 0}`));
    }
  }
  function W(R, O) {
    const { gen: k, schema: M, opts: { useDefaults: K } } = R;
    K && (0, l.assignDefaults)(R, O.type), k.block(() => {
      for (const J of O.rules)
        (0, s.shouldUseRule)(M, J) && G(R, J.keyword, J.definition, O.type);
    });
  }
  function B(R, O) {
    R.schemaEnv.meta || !R.opts.strictTypes || (X(R, O), R.opts.allowUnionTypes || C(R, O), N(R, R.dataTypes));
  }
  function X(R, O) {
    if (O.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = O;
        return;
      }
      O.forEach((k) => {
        I(R.dataTypes, k) || b(R, `type "${k}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), m(R, O);
    }
  }
  function C(R, O) {
    O.length > 1 && !(O.length === 2 && O.includes("null")) && b(R, "use allowUnionTypes to allow union type keyword");
  }
  function N(R, O) {
    const k = R.self.RULES.all;
    for (const M in k) {
      const K = k[M];
      if (typeof K == "object" && (0, s.shouldUseRule)(R.schema, K)) {
        const { type: J } = K.definition;
        J.length && !J.some((oe) => j(O, oe)) && b(R, `missing type "${J.join(",")}" for keyword "${M}"`);
      }
    }
  }
  function j(R, O) {
    return R.includes(O) || O === "number" && R.includes("integer");
  }
  function I(R, O) {
    return R.includes(O) || O === "integer" && R.includes("number");
  }
  function m(R, O) {
    const k = [];
    for (const M of R.dataTypes)
      I(O, M) ? k.push(M) : O.includes("integer") && M === "number" && k.push("integer");
    R.dataTypes = k;
  }
  function b(R, O) {
    const k = R.schemaEnv.baseId + R.errSchemaPath;
    O += ` at "${k}" (strictTypes)`, (0, c.checkStrictMode)(R, O, R.opts.strictTypes);
  }
  class A {
    constructor(O, k, M) {
      if ((0, n.validateKeywordUsage)(O, k, M), this.gen = O.gen, this.allErrors = O.allErrors, this.keyword = M, this.data = O.data, this.schema = O.schema[M], this.$data = k.$data && O.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(O, this.schema, M, this.$data), this.schemaType = k.schemaType, this.parentSchema = O.schema, this.params = {}, this.it = O, this.def = k, this.$data)
        this.schemaCode = O.gen.const("vSchema", Y(this.$data, O));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, k.schemaType, k.allowUndefined))
        throw new Error(`${M} value must be ${JSON.stringify(k.schemaType)}`);
      ("code" in k ? k.trackErrors : k.errors !== !1) && (this.errsCount = O.gen.const("_errs", u.default.errors));
    }
    result(O, k, M) {
      this.failResult((0, o.not)(O), k, M);
    }
    failResult(O, k, M) {
      this.gen.if(O), M ? M() : this.error(), k ? (this.gen.else(), k(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(O, k) {
      this.failResult((0, o.not)(O), void 0, k);
    }
    fail(O) {
      if (O === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(O), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(O) {
      if (!this.$data)
        return this.fail(O);
      const { schemaCode: k } = this;
      this.fail((0, o._)`${k} !== undefined && (${(0, o.or)(this.invalid$data(), O)})`);
    }
    error(O, k, M) {
      if (k) {
        this.setParams(k), this._error(O, M), this.setParams({});
        return;
      }
      this._error(O, M);
    }
    _error(O, k) {
      (O ? $.reportExtraError : $.reportError)(this, this.def.error, k);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(O) {
      this.allErrors || this.gen.if(O);
    }
    setParams(O, k) {
      k ? Object.assign(this.params, O) : this.params = O;
    }
    block$data(O, k, M = o.nil) {
      this.gen.block(() => {
        this.check$data(O, M), k();
      });
    }
    check$data(O = o.nil, k = o.nil) {
      if (!this.$data)
        return;
      const { gen: M, schemaCode: K, schemaType: J, def: oe } = this;
      M.if((0, o.or)((0, o._)`${K} === undefined`, k)), O !== o.nil && M.assign(O, !0), (J.length || oe.validateSchema) && (M.elseIf(this.invalid$data()), this.$dataError(), O !== o.nil && M.assign(O, !1)), M.else();
    }
    invalid$data() {
      const { gen: O, schemaCode: k, schemaType: M, def: K, it: J } = this;
      return (0, o.or)(oe(), $e());
      function oe() {
        if (M.length) {
          if (!(k instanceof o.Name))
            throw new Error("ajv implementation error");
          const le = Array.isArray(M) ? M : [M];
          return (0, o._)`${(0, r.checkDataTypes)(le, k, J.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function $e() {
        if (K.validateSchema) {
          const le = O.scopeValue("validate$data", { ref: K.validateSchema });
          return (0, o._)`!${le}(${k})`;
        }
        return o.nil;
      }
    }
    subschema(O, k) {
      const M = (0, i.getSubschema)(this.it, O);
      (0, i.extendSubschemaData)(M, this.it, O), (0, i.extendSubschemaMode)(M, O);
      const K = { ...this.it, ...M, items: void 0, props: void 0 };
      return h(K, k), K;
    }
    mergeEvaluated(O, k) {
      const { it: M, gen: K } = this;
      M.opts.unevaluated && (M.props !== !0 && O.props !== void 0 && (M.props = c.mergeEvaluated.props(K, O.props, M.props, k)), M.items !== !0 && O.items !== void 0 && (M.items = c.mergeEvaluated.items(K, O.items, M.items, k)));
    }
    mergeValidEvaluated(O, k) {
      const { it: M, gen: K } = this;
      if (M.opts.unevaluated && (M.props !== !0 || M.items !== !0))
        return K.if(k, () => this.mergeEvaluated(O, o.Name)), !0;
    }
  }
  We.KeywordCxt = A;
  function G(R, O, k, M) {
    const K = new A(R, k, O);
    "code" in k ? k.code(K, M) : K.$data && k.validate ? (0, n.funcKeywordCode)(K, k) : "macro" in k ? (0, n.macroKeywordCode)(K, k) : (k.compile || k.validate) && (0, n.funcKeywordCode)(K, k);
  }
  const H = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Y(R, { dataLevel: O, dataNames: k, dataPathArr: M }) {
    let K, J;
    if (R === "")
      return u.default.rootData;
    if (R[0] === "/") {
      if (!H.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      K = R, J = u.default.rootData;
    } else {
      const de = Z.exec(R);
      if (!de)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const ie = +de[1];
      if (K = de[2], K === "#") {
        if (ie >= O)
          throw new Error(le("property/index", ie));
        return M[O - ie];
      }
      if (ie > O)
        throw new Error(le("data", ie));
      if (J = k[O - ie], !K)
        return J;
    }
    let oe = J;
    const $e = K.split("/");
    for (const de of $e)
      de && (J = (0, o._)`${J}${(0, o.getProperty)((0, c.unescapeJsonPointer)(de))}`, oe = (0, o._)`${oe} && ${J}`);
    return oe;
    function le(de, ie) {
      return `Cannot access ${de} ${ie} levels up, current level is ${O}`;
    }
  }
  return We.getData = Y, We;
}
var Kr = {}, Yi;
function Ca() {
  if (Yi) return Kr;
  Yi = 1, Object.defineProperty(Kr, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return Kr.default = e, Kr;
}
var Hr = {}, Zi;
function Yn() {
  if (Zi) return Hr;
  Zi = 1, Object.defineProperty(Hr, "__esModule", { value: !0 });
  const e = Jn();
  class t extends Error {
    constructor(r, l, n, i) {
      super(i || `can't resolve reference ${n} from id ${l}`), this.missingRef = (0, e.resolveUrl)(r, l, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Hr.default = t, Hr;
}
var Ae = {}, Qi;
function ka() {
  if (Qi) return Ae;
  Qi = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.resolveSchema = Ae.getCompilingSchema = Ae.resolveRef = Ae.compileSchema = Ae.SchemaEnv = void 0;
  const e = se(), t = Ca(), s = ot(), r = Jn(), l = ce(), n = Xn();
  class i {
    constructor(f) {
      var a;
      this.refs = {}, this.dynamicAnchors = {};
      let h;
      typeof f.schema == "object" && (h = f.schema), this.schema = f.schema, this.schemaId = f.schemaId, this.root = f.root || this, this.baseId = (a = f.baseId) !== null && a !== void 0 ? a : (0, r.normalizeId)(h == null ? void 0 : h[f.schemaId || "$id"]), this.schemaPath = f.schemaPath, this.localRefs = f.localRefs, this.meta = f.meta, this.$async = h == null ? void 0 : h.$async, this.refs = {};
    }
  }
  Ae.SchemaEnv = i;
  function o(d) {
    const f = c.call(this, d);
    if (f)
      return f;
    const a = (0, r.getFullPath)(this.opts.uriResolver, d.root.baseId), { es5: h, lines: _ } = this.opts.code, { ownProperties: v } = this.opts, y = new e.CodeGen(this.scope, { es5: h, lines: _, ownProperties: v });
    let P;
    d.$async && (P = y.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = y.scopeName("validate");
    d.validateName = T;
    const q = {
      gen: y,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: y.scopeValue("schema", this.opts.code.source === !0 ? { ref: d.schema, code: (0, e.stringify)(d.schema) } : { ref: d.schema }),
      validateName: T,
      ValidationError: P,
      schema: d.schema,
      schemaEnv: d,
      rootId: a,
      baseId: d.baseId || a,
      schemaPath: e.nil,
      errSchemaPath: d.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let F;
    try {
      this._compilations.add(d), (0, n.validateFunctionCode)(q), y.optimize(this.opts.code.optimize);
      const D = y.toString();
      F = `${y.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (F = this.opts.code.process(F, d));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, F)(this, this.scope.get());
      if (this.scope.value(T, { ref: z }), z.errors = null, z.schema = d.schema, z.schemaEnv = d, d.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: T, validateCode: D, scopeValues: y._values }), this.opts.unevaluated) {
        const { props: L, items: V } = q;
        z.evaluated = {
          props: L instanceof e.Name ? void 0 : L,
          items: V instanceof e.Name ? void 0 : V,
          dynamicProps: L instanceof e.Name,
          dynamicItems: V instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return d.validate = z, d;
    } catch (D) {
      throw delete d.validate, delete d.validateName, F && this.logger.error("Error compiling schema, function code:", F), D;
    } finally {
      this._compilations.delete(d);
    }
  }
  Ae.compileSchema = o;
  function u(d, f, a) {
    var h;
    a = (0, r.resolveUrl)(this.opts.uriResolver, f, a);
    const _ = d.refs[a];
    if (_)
      return _;
    let v = w.call(this, d, a);
    if (v === void 0) {
      const y = (h = d.localRefs) === null || h === void 0 ? void 0 : h[a], { schemaId: P } = this.opts;
      y && (v = new i({ schema: y, schemaId: P, root: d, baseId: f }));
    }
    if (v !== void 0)
      return d.refs[a] = p.call(this, v);
  }
  Ae.resolveRef = u;
  function p(d) {
    return (0, r.inlineRef)(d.schema, this.opts.inlineRefs) ? d.schema : d.validate ? d : o.call(this, d);
  }
  function c(d) {
    for (const f of this._compilations)
      if ($(f, d))
        return f;
  }
  Ae.getCompilingSchema = c;
  function $(d, f) {
    return d.schema === f.schema && d.root === f.root && d.baseId === f.baseId;
  }
  function w(d, f) {
    let a;
    for (; typeof (a = this.refs[f]) == "string"; )
      f = a;
    return a || this.schemas[f] || E.call(this, d, f);
  }
  function E(d, f) {
    const a = this.opts.uriResolver.parse(f), h = (0, r._getFullPath)(this.opts.uriResolver, a);
    let _ = (0, r.getFullPath)(this.opts.uriResolver, d.baseId, void 0);
    if (Object.keys(d.schema).length > 0 && h === _)
      return g.call(this, a, d);
    const v = (0, r.normalizeId)(h), y = this.refs[v] || this.schemas[v];
    if (typeof y == "string") {
      const P = E.call(this, d, y);
      return typeof (P == null ? void 0 : P.schema) != "object" ? void 0 : g.call(this, a, P);
    }
    if (typeof (y == null ? void 0 : y.schema) == "object") {
      if (y.validate || o.call(this, y), v === (0, r.normalizeId)(f)) {
        const { schema: P } = y, { schemaId: T } = this.opts, q = P[T];
        return q && (_ = (0, r.resolveUrl)(this.opts.uriResolver, _, q)), new i({ schema: P, schemaId: T, root: d, baseId: _ });
      }
      return g.call(this, a, y);
    }
  }
  Ae.resolveSchema = E;
  const S = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function g(d, { baseId: f, schema: a, root: h }) {
    var _;
    if (((_ = d.fragment) === null || _ === void 0 ? void 0 : _[0]) !== "/")
      return;
    for (const P of d.fragment.slice(1).split("/")) {
      if (typeof a == "boolean")
        return;
      const T = a[(0, l.unescapeFragment)(P)];
      if (T === void 0)
        return;
      a = T;
      const q = typeof a == "object" && a[this.opts.schemaId];
      !S.has(P) && q && (f = (0, r.resolveUrl)(this.opts.uriResolver, f, q));
    }
    let v;
    if (typeof a != "boolean" && a.$ref && !(0, l.schemaHasRulesButRef)(a, this.RULES)) {
      const P = (0, r.resolveUrl)(this.opts.uriResolver, f, a.$ref);
      v = E.call(this, h, P);
    }
    const { schemaId: y } = this.opts;
    if (v = v || new i({ schema: a, schemaId: y, root: h, baseId: f }), v.schema !== v.root.schema)
      return v;
  }
  return Ae;
}
const Bh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Wh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", xh = "object", Jh = ["$data"], Xh = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Yh = !1, Zh = {
  $id: Bh,
  description: Wh,
  type: xh,
  required: Jh,
  properties: Xh,
  additionalProperties: Yh
};
var Br = {}, ec;
function Qh() {
  if (ec) return Br;
  ec = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const e = rl();
  return e.code = 'require("ajv/dist/runtime/uri").default', Br.default = e, Br;
}
var tc;
function em() {
  return tc || (tc = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Xn();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = se();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = Ca(), l = Yn(), n = cl(), i = ka(), o = se(), u = Jn(), p = Ln(), c = ce(), $ = Zh, w = Qh(), E = (C, N) => new RegExp(C, N);
    E.code = "new RegExp";
    const S = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), d = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, f = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, a = 200;
    function h(C) {
      var N, j, I, m, b, A, G, H, Z, Y, R, O, k, M, K, J, oe, $e, le, de, ie, Ie, me, it, ct;
      const qe = C.strict, ut = (N = C.code) === null || N === void 0 ? void 0 : N.optimize, Tt = ut === !0 || ut === void 0 ? 1 : ut || 0, At = (I = (j = C.code) === null || j === void 0 ? void 0 : j.regExp) !== null && I !== void 0 ? I : E, ss = (m = C.uriResolver) !== null && m !== void 0 ? m : w.default;
      return {
        strictSchema: (A = (b = C.strictSchema) !== null && b !== void 0 ? b : qe) !== null && A !== void 0 ? A : !0,
        strictNumbers: (H = (G = C.strictNumbers) !== null && G !== void 0 ? G : qe) !== null && H !== void 0 ? H : !0,
        strictTypes: (Y = (Z = C.strictTypes) !== null && Z !== void 0 ? Z : qe) !== null && Y !== void 0 ? Y : "log",
        strictTuples: (O = (R = C.strictTuples) !== null && R !== void 0 ? R : qe) !== null && O !== void 0 ? O : "log",
        strictRequired: (M = (k = C.strictRequired) !== null && k !== void 0 ? k : qe) !== null && M !== void 0 ? M : !1,
        code: C.code ? { ...C.code, optimize: Tt, regExp: At } : { optimize: Tt, regExp: At },
        loopRequired: (K = C.loopRequired) !== null && K !== void 0 ? K : a,
        loopEnum: (J = C.loopEnum) !== null && J !== void 0 ? J : a,
        meta: (oe = C.meta) !== null && oe !== void 0 ? oe : !0,
        messages: ($e = C.messages) !== null && $e !== void 0 ? $e : !0,
        inlineRefs: (le = C.inlineRefs) !== null && le !== void 0 ? le : !0,
        schemaId: (de = C.schemaId) !== null && de !== void 0 ? de : "$id",
        addUsedSchema: (ie = C.addUsedSchema) !== null && ie !== void 0 ? ie : !0,
        validateSchema: (Ie = C.validateSchema) !== null && Ie !== void 0 ? Ie : !0,
        validateFormats: (me = C.validateFormats) !== null && me !== void 0 ? me : !0,
        unicodeRegExp: (it = C.unicodeRegExp) !== null && it !== void 0 ? it : !0,
        int32range: (ct = C.int32range) !== null && ct !== void 0 ? ct : !0,
        uriResolver: ss
      };
    }
    class _ {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...h(N) };
        const { es5: j, lines: I } = this.opts.code;
        this.scope = new o.ValueScope({ scope: {}, prefixes: g, es5: j, lines: I }), this.logger = U(N.logger);
        const m = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), v.call(this, d, N, "NOT SUPPORTED"), v.call(this, f, N, "DEPRECATED", "warn"), this._metaOpts = F.call(this), N.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && q.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), P.call(this), N.validateFormats = m;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: j, schemaId: I } = this.opts;
        let m = $;
        I === "id" && (m = { ...$ }, m.id = m.$id, delete m.$id), j && N && this.addMetaSchema(m, m[I], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[j] || N : void 0;
      }
      validate(N, j) {
        let I;
        if (typeof N == "string") {
          if (I = this.getSchema(N), !I)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          I = this.compile(N);
        const m = I(j);
        return "$async" in I || (this.errors = I.errors), m;
      }
      compile(N, j) {
        const I = this._addSchema(N, j);
        return I.validate || this._compileSchemaEnv(I);
      }
      compileAsync(N, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: I } = this.opts;
        return m.call(this, N, j);
        async function m(Y, R) {
          await b.call(this, Y.$schema);
          const O = this._addSchema(Y, R);
          return O.validate || A.call(this, O);
        }
        async function b(Y) {
          Y && !this.getSchema(Y) && await m.call(this, { $ref: Y }, !0);
        }
        async function A(Y) {
          try {
            return this._compileSchemaEnv(Y);
          } catch (R) {
            if (!(R instanceof l.default))
              throw R;
            return G.call(this, R), await H.call(this, R.missingSchema), A.call(this, Y);
          }
        }
        function G({ missingSchema: Y, missingRef: R }) {
          if (this.refs[Y])
            throw new Error(`AnySchema ${Y} is loaded but ${R} cannot be resolved`);
        }
        async function H(Y) {
          const R = await Z.call(this, Y);
          this.refs[Y] || await b.call(this, R.$schema), this.refs[Y] || this.addSchema(R, Y, j);
        }
        async function Z(Y) {
          const R = this._loading[Y];
          if (R)
            return R;
          try {
            return await (this._loading[Y] = I(Y));
          } finally {
            delete this._loading[Y];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, j, I, m = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const A of N)
            this.addSchema(A, void 0, I, m);
          return this;
        }
        let b;
        if (typeof N == "object") {
          const { schemaId: A } = this.opts;
          if (b = N[A], b !== void 0 && typeof b != "string")
            throw new Error(`schema ${A} must be string`);
        }
        return j = (0, u.normalizeId)(j || b), this._checkUnique(j), this.schemas[j] = this._addSchema(N, I, j, m, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, j, I = this.opts.validateSchema) {
        return this.addSchema(N, j, !0, I), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, j) {
        if (typeof N == "boolean")
          return !0;
        let I;
        if (I = N.$schema, I !== void 0 && typeof I != "string")
          throw new Error("$schema must be a string");
        if (I = I || this.opts.defaultMeta || this.defaultMeta(), !I)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const m = this.validate(I, N);
        if (!m && j) {
          const b = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(b);
          else
            throw new Error(b);
        }
        return m;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let j;
        for (; typeof (j = y.call(this, N)) == "string"; )
          N = j;
        if (j === void 0) {
          const { schemaId: I } = this.opts, m = new i.SchemaEnv({ schema: {}, schemaId: I });
          if (j = i.resolveSchema.call(this, m, N), !j)
            return;
          this.refs[N] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = y.call(this, N);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const j = N;
            this._cache.delete(j);
            let I = N[this.opts.schemaId];
            return I && (I = (0, u.normalizeId)(I), delete this.schemas[I], delete this.refs[I]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const j of N)
          this.addKeyword(j);
        return this;
      }
      addKeyword(N, j) {
        let I;
        if (typeof N == "string")
          I = N, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = I);
        else if (typeof N == "object" && j === void 0) {
          if (j = N, I = j.keyword, Array.isArray(I) && !I.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (L.call(this, I, j), !j)
          return (0, c.eachItem)(I, (b) => V.call(this, b)), this;
        W.call(this, j);
        const m = {
          ...j,
          type: (0, p.getJSONTypes)(j.type),
          schemaType: (0, p.getJSONTypes)(j.schemaType)
        };
        return (0, c.eachItem)(I, m.type.length === 0 ? (b) => V.call(this, b, m) : (b) => m.type.forEach((A) => V.call(this, b, m, A))), this;
      }
      getKeyword(N) {
        const j = this.RULES.all[N];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: j } = this;
        delete j.keywords[N], delete j.all[N];
        for (const I of j.rules) {
          const m = I.rules.findIndex((b) => b.keyword === N);
          m >= 0 && I.rules.splice(m, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[N] = j, this;
      }
      errorsText(N = this.errors, { separator: j = ", ", dataVar: I = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((m) => `${I}${m.instancePath} ${m.message}`).reduce((m, b) => m + j + b);
      }
      $dataMetaSchema(N, j) {
        const I = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const m of j) {
          const b = m.split("/").slice(1);
          let A = N;
          for (const G of b)
            A = A[G];
          for (const G in I) {
            const H = I[G];
            if (typeof H != "object")
              continue;
            const { $data: Z } = H.definition, Y = A[G];
            Z && Y && (A[G] = X(Y));
          }
        }
        return N;
      }
      _removeAllSchemas(N, j) {
        for (const I in N) {
          const m = N[I];
          (!j || j.test(I)) && (typeof m == "string" ? delete N[I] : m && !m.meta && (this._cache.delete(m.schema), delete N[I]));
        }
      }
      _addSchema(N, j, I, m = this.opts.validateSchema, b = this.opts.addUsedSchema) {
        let A;
        const { schemaId: G } = this.opts;
        if (typeof N == "object")
          A = N[G];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let H = this._cache.get(N);
        if (H !== void 0)
          return H;
        I = (0, u.normalizeId)(A || I);
        const Z = u.getSchemaRefs.call(this, N, I);
        return H = new i.SchemaEnv({ schema: N, schemaId: G, meta: j, baseId: I, localRefs: Z }), this._cache.set(H.schema, H), b && !I.startsWith("#") && (I && this._checkUnique(I), this.refs[I] = H), m && this.validateSchema(N, !0), H;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = j;
        }
      }
    }
    _.ValidationError = r.default, _.MissingRefError = l.default, e.default = _;
    function v(C, N, j, I = "error") {
      for (const m in C) {
        const b = m;
        b in N && this.logger[I](`${j}: option ${m}. ${C[b]}`);
      }
    }
    function y(C) {
      return C = (0, u.normalizeId)(C), this.schemas[C] || this.refs[C];
    }
    function P() {
      const C = this.opts.schemas;
      if (C)
        if (Array.isArray(C))
          this.addSchema(C);
        else
          for (const N in C)
            this.addSchema(C[N], N);
    }
    function T() {
      for (const C in this.opts.formats) {
        const N = this.opts.formats[C];
        N && this.addFormat(C, N);
      }
    }
    function q(C) {
      if (Array.isArray(C)) {
        this.addVocabulary(C);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in C) {
        const j = C[N];
        j.keyword || (j.keyword = N), this.addKeyword(j);
      }
    }
    function F() {
      const C = { ...this.opts };
      for (const N of S)
        delete C[N];
      return C;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(C) {
      if (C === !1)
        return D;
      if (C === void 0)
        return console;
      if (C.log && C.warn && C.error)
        return C;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function L(C, N) {
      const { RULES: j } = this;
      if ((0, c.eachItem)(C, (I) => {
        if (j.keywords[I])
          throw new Error(`Keyword ${I} is already defined`);
        if (!z.test(I))
          throw new Error(`Keyword ${I} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function V(C, N, j) {
      var I;
      const m = N == null ? void 0 : N.post;
      if (j && m)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: b } = this;
      let A = m ? b.post : b.rules.find(({ type: H }) => H === j);
      if (A || (A = { type: j, rules: [] }, b.rules.push(A)), b.keywords[C] = !0, !N)
        return;
      const G = {
        keyword: C,
        definition: {
          ...N,
          type: (0, p.getJSONTypes)(N.type),
          schemaType: (0, p.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? x.call(this, A, G, N.before) : A.rules.push(G), b.all[C] = G, (I = N.implements) === null || I === void 0 || I.forEach((H) => this.addKeyword(H));
    }
    function x(C, N, j) {
      const I = C.rules.findIndex((m) => m.keyword === j);
      I >= 0 ? C.rules.splice(I, 0, N) : (C.rules.push(N), this.logger.warn(`rule ${j} is not defined`));
    }
    function W(C) {
      let { metaSchema: N } = C;
      N !== void 0 && (C.$data && this.opts.$data && (N = X(N)), C.validateSchema = this.compile(N, !0));
    }
    const B = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function X(C) {
      return { anyOf: [C, B] };
    }
  }(Es)), Es;
}
var Wr = {}, xr = {}, Jr = {}, rc;
function tm() {
  if (rc) return Jr;
  rc = 1, Object.defineProperty(Jr, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Jr.default = e, Jr;
}
var nt = {}, nc;
function rm() {
  if (nc) return nt;
  nc = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.callRef = nt.getValidate = void 0;
  const e = Yn(), t = Ve(), s = se(), r = ot(), l = ka(), n = ce(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(p) {
      const { gen: c, schema: $, it: w } = p, { baseId: E, schemaEnv: S, validateName: g, opts: d, self: f } = w, { root: a } = S;
      if (($ === "#" || $ === "#/") && E === a.baseId)
        return _();
      const h = l.resolveRef.call(f, a, E, $);
      if (h === void 0)
        throw new e.default(w.opts.uriResolver, E, $);
      if (h instanceof l.SchemaEnv)
        return v(h);
      return y(h);
      function _() {
        if (S === a)
          return u(p, g, S, S.$async);
        const P = c.scopeValue("root", { ref: a });
        return u(p, (0, s._)`${P}.validate`, a, a.$async);
      }
      function v(P) {
        const T = o(p, P);
        u(p, T, P, P.$async);
      }
      function y(P) {
        const T = c.scopeValue("schema", d.code.source === !0 ? { ref: P, code: (0, s.stringify)(P) } : { ref: P }), q = c.name("valid"), F = p.subschema({
          schema: P,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: T,
          errSchemaPath: $
        }, q);
        p.mergeEvaluated(F), p.ok(q);
      }
    }
  };
  function o(p, c) {
    const { gen: $ } = p;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  nt.getValidate = o;
  function u(p, c, $, w) {
    const { gen: E, it: S } = p, { allErrors: g, schemaEnv: d, opts: f } = S, a = f.passContext ? r.default.this : s.nil;
    w ? h() : _();
    function h() {
      if (!d.$async)
        throw new Error("async schema referenced by sync schema");
      const P = E.let("valid");
      E.try(() => {
        E.code((0, s._)`await ${(0, t.callValidateCode)(p, c, a)}`), y(c), g || E.assign(P, !0);
      }, (T) => {
        E.if((0, s._)`!(${T} instanceof ${S.ValidationError})`, () => E.throw(T)), v(T), g || E.assign(P, !1);
      }), p.ok(P);
    }
    function _() {
      p.result((0, t.callValidateCode)(p, c, a), () => y(c), () => v(c));
    }
    function v(P) {
      const T = (0, s._)`${P}.errors`;
      E.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${T} : ${r.default.vErrors}.concat(${T})`), E.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function y(P) {
      var T;
      if (!S.opts.unevaluated)
        return;
      const q = (T = $ == null ? void 0 : $.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (S.props !== !0)
        if (q && !q.dynamicProps)
          q.props !== void 0 && (S.props = n.mergeEvaluated.props(E, q.props, S.props));
        else {
          const F = E.var("props", (0, s._)`${P}.evaluated.props`);
          S.props = n.mergeEvaluated.props(E, F, S.props, s.Name);
        }
      if (S.items !== !0)
        if (q && !q.dynamicItems)
          q.items !== void 0 && (S.items = n.mergeEvaluated.items(E, q.items, S.items));
        else {
          const F = E.var("items", (0, s._)`${P}.evaluated.items`);
          S.items = n.mergeEvaluated.items(E, F, S.items, s.Name);
        }
    }
  }
  return nt.callRef = u, nt.default = i, nt;
}
var sc;
function nm() {
  if (sc) return xr;
  sc = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const e = tm(), t = rm(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return xr.default = s, xr;
}
var Xr = {}, Yr = {}, ac;
function sm() {
  if (ac) return Yr;
  ac = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const e = se(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: o, schemaCode: u } = n;
      n.fail$data((0, e._)`${o} ${s[i].fail} ${u} || isNaN(${o})`);
    }
  };
  return Yr.default = l, Yr;
}
var Zr = {}, oc;
function am() {
  if (oc) return Zr;
  oc = 1, Object.defineProperty(Zr, "__esModule", { value: !0 });
  const e = se(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: l, data: n, schemaCode: i, it: o } = r, u = o.opts.multipleOfPrecision, p = l.let("res"), c = u ? (0, e._)`Math.abs(Math.round(${p}) - ${p}) > 1e-${u}` : (0, e._)`${p} !== parseInt(${p})`;
      r.fail$data((0, e._)`(${i} === 0 || (${p} = ${n}/${i}, ${c}))`);
    }
  };
  return Zr.default = s, Zr;
}
var Qr = {}, en = {}, ic;
function om() {
  if (ic) return en;
  ic = 1, Object.defineProperty(en, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, l = 0, n;
    for (; l < s; )
      r++, n = t.charCodeAt(l++), n >= 55296 && n <= 56319 && l < s && (n = t.charCodeAt(l), (n & 64512) === 56320 && l++);
    return r;
  }
  return en.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', en;
}
var cc;
function im() {
  if (cc) return Qr;
  cc = 1, Object.defineProperty(Qr, "__esModule", { value: !0 });
  const e = se(), t = ce(), s = om(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const o = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${o} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: o, schemaCode: u, it: p } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = p.opts.unicode === !1 ? (0, e._)`${o}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${o})`;
      n.fail$data((0, e._)`${$} ${c} ${u}`);
    }
  };
  return Qr.default = l, Qr;
}
var tn = {}, uc;
function cm() {
  if (uc) return tn;
  uc = 1, Object.defineProperty(tn, "__esModule", { value: !0 });
  const e = Ve(), t = se(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: n, $data: i, schema: o, schemaCode: u, it: p } = l, c = p.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${u}, ${c}))` : (0, e.usePattern)(l, o);
      l.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return tn.default = r, tn;
}
var rn = {}, lc;
function um() {
  if (lc) return rn;
  lc = 1, Object.defineProperty(rn, "__esModule", { value: !0 });
  const e = se(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, o = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${o} ${i}`);
    }
  };
  return rn.default = s, rn;
}
var nn = {}, dc;
function lm() {
  if (dc) return nn;
  dc = 1, Object.defineProperty(nn, "__esModule", { value: !0 });
  const e = Ve(), t = se(), s = ce(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: o, schemaCode: u, data: p, $data: c, it: $ } = n, { opts: w } = $;
      if (!c && o.length === 0)
        return;
      const E = o.length >= w.loopRequired;
      if ($.allErrors ? S() : g(), w.strictRequired) {
        const a = n.parentSchema.properties, { definedProperties: h } = n.it;
        for (const _ of o)
          if ((a == null ? void 0 : a[_]) === void 0 && !h.has(_)) {
            const v = $.schemaEnv.baseId + $.errSchemaPath, y = `required property "${_}" is not defined at "${v}" (strictRequired)`;
            (0, s.checkStrictMode)($, y, $.opts.strictRequired);
          }
      }
      function S() {
        if (E || c)
          n.block$data(t.nil, d);
        else
          for (const a of o)
            (0, e.checkReportMissingProp)(n, a);
      }
      function g() {
        const a = i.let("missing");
        if (E || c) {
          const h = i.let("valid", !0);
          n.block$data(h, () => f(a, h)), n.ok(h);
        } else
          i.if((0, e.checkMissingProp)(n, o, a)), (0, e.reportMissingProp)(n, a), i.else();
      }
      function d() {
        i.forOf("prop", u, (a) => {
          n.setParams({ missingProperty: a }), i.if((0, e.noPropertyInData)(i, p, a, w.ownProperties), () => n.error());
        });
      }
      function f(a, h) {
        n.setParams({ missingProperty: a }), i.forOf(a, u, () => {
          i.assign(h, (0, e.propertyInData)(i, p, a, w.ownProperties)), i.if((0, t.not)(h), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return nn.default = l, nn;
}
var sn = {}, fc;
function dm() {
  if (fc) return sn;
  fc = 1, Object.defineProperty(sn, "__esModule", { value: !0 });
  const e = se(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: l }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${l} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: l, data: n, schemaCode: i } = r, o = l === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${o} ${i}`);
    }
  };
  return sn.default = s, sn;
}
var an = {}, on = {}, hc;
function qa() {
  if (hc) return on;
  hc = 1, Object.defineProperty(on, "__esModule", { value: !0 });
  const e = Gn();
  return e.code = 'require("ajv/dist/runtime/equal").default', on.default = e, on;
}
var mc;
function fm() {
  if (mc) return an;
  mc = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  const e = Ln(), t = se(), s = ce(), r = qa(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: o } }) => (0, t.str)`must NOT have duplicate items (items ## ${o} and ${i} are identical)`,
      params: ({ params: { i, j: o } }) => (0, t._)`{i: ${i}, j: ${o}}`
    },
    code(i) {
      const { gen: o, data: u, $data: p, schema: c, parentSchema: $, schemaCode: w, it: E } = i;
      if (!p && !c)
        return;
      const S = o.let("valid"), g = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(S, d, (0, t._)`${w} === false`), i.ok(S);
      function d() {
        const _ = o.let("i", (0, t._)`${u}.length`), v = o.let("j");
        i.setParams({ i: _, j: v }), o.assign(S, !0), o.if((0, t._)`${_} > 1`, () => (f() ? a : h)(_, v));
      }
      function f() {
        return g.length > 0 && !g.some((_) => _ === "object" || _ === "array");
      }
      function a(_, v) {
        const y = o.name("item"), P = (0, e.checkDataTypes)(g, y, E.opts.strictNumbers, e.DataType.Wrong), T = o.const("indices", (0, t._)`{}`);
        o.for((0, t._)`;${_}--;`, () => {
          o.let(y, (0, t._)`${u}[${_}]`), o.if(P, (0, t._)`continue`), g.length > 1 && o.if((0, t._)`typeof ${y} == "string"`, (0, t._)`${y} += "_"`), o.if((0, t._)`typeof ${T}[${y}] == "number"`, () => {
            o.assign(v, (0, t._)`${T}[${y}]`), i.error(), o.assign(S, !1).break();
          }).code((0, t._)`${T}[${y}] = ${_}`);
        });
      }
      function h(_, v) {
        const y = (0, s.useFunc)(o, r.default), P = o.name("outer");
        o.label(P).for((0, t._)`;${_}--;`, () => o.for((0, t._)`${v} = ${_}; ${v}--;`, () => o.if((0, t._)`${y}(${u}[${_}], ${u}[${v}])`, () => {
          i.error(), o.assign(S, !1).break(P);
        })));
      }
    }
  };
  return an.default = n, an;
}
var cn = {}, pc;
function hm() {
  if (pc) return cn;
  pc = 1, Object.defineProperty(cn, "__esModule", { value: !0 });
  const e = se(), t = ce(), s = qa(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: o, $data: u, schemaCode: p, schema: c } = n;
      u || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${o}, ${p})`) : n.fail((0, e._)`${c} !== ${o}`);
    }
  };
  return cn.default = l, cn;
}
var un = {}, yc;
function mm() {
  if (yc) return un;
  yc = 1, Object.defineProperty(un, "__esModule", { value: !0 });
  const e = se(), t = ce(), s = qa(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: o, $data: u, schema: p, schemaCode: c, it: $ } = n;
      if (!u && p.length === 0)
        throw new Error("enum must have non-empty array");
      const w = p.length >= $.opts.loopEnum;
      let E;
      const S = () => E ?? (E = (0, t.useFunc)(i, s.default));
      let g;
      if (w || u)
        g = i.let("valid"), n.block$data(g, d);
      else {
        if (!Array.isArray(p))
          throw new Error("ajv implementation error");
        const a = i.const("vSchema", c);
        g = (0, e.or)(...p.map((h, _) => f(a, _)));
      }
      n.pass(g);
      function d() {
        i.assign(g, !1), i.forOf("v", c, (a) => i.if((0, e._)`${S()}(${o}, ${a})`, () => i.assign(g, !0).break()));
      }
      function f(a, h) {
        const _ = p[h];
        return typeof _ == "object" && _ !== null ? (0, e._)`${S()}(${o}, ${a}[${h}])` : (0, e._)`${o} === ${_}`;
      }
    }
  };
  return un.default = l, un;
}
var $c;
function pm() {
  if ($c) return Xr;
  $c = 1, Object.defineProperty(Xr, "__esModule", { value: !0 });
  const e = sm(), t = am(), s = im(), r = cm(), l = um(), n = lm(), i = dm(), o = fm(), u = hm(), p = mm(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    l.default,
    n.default,
    // array
    i.default,
    o.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    p.default
  ];
  return Xr.default = c, Xr;
}
var ln = {}, wt = {}, gc;
function ll() {
  if (gc) return wt;
  gc = 1, Object.defineProperty(wt, "__esModule", { value: !0 }), wt.validateAdditionalItems = void 0;
  const e = se(), t = ce(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: o } = n, { items: u } = i;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(o, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(n, u);
    }
  };
  function l(n, i) {
    const { gen: o, schema: u, data: p, keyword: c, it: $ } = n;
    $.items = !0;
    const w = o.const("len", (0, e._)`${p}.length`);
    if (u === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${w} <= ${i.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)($, u)) {
      const S = o.var("valid", (0, e._)`${w} <= ${i.length}`);
      o.if((0, e.not)(S), () => E(S)), n.ok(S);
    }
    function E(S) {
      o.forRange("i", i.length, w, (g) => {
        n.subschema({ keyword: c, dataProp: g, dataPropType: t.Type.Num }, S), $.allErrors || o.if((0, e.not)(S), () => o.break());
      });
    }
  }
  return wt.validateAdditionalItems = l, wt.default = r, wt;
}
var dn = {}, Et = {}, vc;
function dl() {
  if (vc) return Et;
  vc = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.validateTuple = void 0;
  const e = se(), t = ce(), s = Ve(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: o } = n;
      if (Array.isArray(i))
        return l(n, "additionalItems", i);
      o.items = !0, !(0, t.alwaysValidSchema)(o, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function l(n, i, o = n.schema) {
    const { gen: u, parentSchema: p, data: c, keyword: $, it: w } = n;
    g(p), w.opts.unevaluated && o.length && w.items !== !0 && (w.items = t.mergeEvaluated.items(u, o.length, w.items));
    const E = u.name("valid"), S = u.const("len", (0, e._)`${c}.length`);
    o.forEach((d, f) => {
      (0, t.alwaysValidSchema)(w, d) || (u.if((0, e._)`${S} > ${f}`, () => n.subschema({
        keyword: $,
        schemaProp: f,
        dataProp: f
      }, E)), n.ok(E));
    });
    function g(d) {
      const { opts: f, errSchemaPath: a } = w, h = o.length, _ = h === d.minItems && (h === d.maxItems || d[i] === !1);
      if (f.strictTuples && !_) {
        const v = `"${$}" is ${h}-tuple, but minItems or maxItems/${i} are not specified or different at path "${a}"`;
        (0, t.checkStrictMode)(w, v, f.strictTuples);
      }
    }
  }
  return Et.validateTuple = l, Et.default = r, Et;
}
var _c;
function ym() {
  if (_c) return dn;
  _c = 1, Object.defineProperty(dn, "__esModule", { value: !0 });
  const e = dl(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return dn.default = t, dn;
}
var fn = {}, wc;
function $m() {
  if (wc) return fn;
  wc = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  const e = se(), t = ce(), s = Ve(), r = ll(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: o, parentSchema: u, it: p } = i, { prefixItems: c } = u;
      p.items = !0, !(0, t.alwaysValidSchema)(p, o) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return fn.default = n, fn;
}
var hn = {}, Ec;
function gm() {
  if (Ec) return hn;
  Ec = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  const e = se(), t = ce(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${n} valid item(s)`,
      params: ({ params: { min: l, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${n}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: o, data: u, it: p } = l;
      let c, $;
      const { minContains: w, maxContains: E } = o;
      p.opts.next ? (c = w === void 0 ? 1 : w, $ = E) : c = 1;
      const S = n.const("len", (0, e._)`${u}.length`);
      if (l.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(p, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(p, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(p, i)) {
        let h = (0, e._)`${S} >= ${c}`;
        $ !== void 0 && (h = (0, e._)`${h} && ${S} <= ${$}`), l.pass(h);
        return;
      }
      p.items = !0;
      const g = n.name("valid");
      $ === void 0 && c === 1 ? f(g, () => n.if(g, () => n.break())) : c === 0 ? (n.let(g, !0), $ !== void 0 && n.if((0, e._)`${u}.length > 0`, d)) : (n.let(g, !1), d()), l.result(g, () => l.reset());
      function d() {
        const h = n.name("_valid"), _ = n.let("count", 0);
        f(h, () => n.if(h, () => a(_)));
      }
      function f(h, _) {
        n.forRange("i", 0, S, (v) => {
          l.subschema({
            keyword: "contains",
            dataProp: v,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, h), _();
        });
      }
      function a(h) {
        n.code((0, e._)`${h}++`), $ === void 0 ? n.if((0, e._)`${h} >= ${c}`, () => n.assign(g, !0).break()) : (n.if((0, e._)`${h} > ${$}`, () => n.assign(g, !1).break()), c === 1 ? n.assign(g, !0) : n.if((0, e._)`${h} >= ${c}`, () => n.assign(g, !0)));
      }
    }
  };
  return hn.default = r, hn;
}
var Is = {}, bc;
function vm() {
  return bc || (bc = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = se(), s = ce(), r = Ve();
    e.error = {
      message: ({ params: { property: u, depsCount: p, deps: c } }) => {
        const $ = p === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: p, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${u},
    missingProperty: ${$},
    depsCount: ${p},
    deps: ${c}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [p, c] = n(u);
        i(u, p), o(u, c);
      }
    };
    function n({ schema: u }) {
      const p = {}, c = {};
      for (const $ in u) {
        if ($ === "__proto__")
          continue;
        const w = Array.isArray(u[$]) ? p : c;
        w[$] = u[$];
      }
      return [p, c];
    }
    function i(u, p = u.schema) {
      const { gen: c, data: $, it: w } = u;
      if (Object.keys(p).length === 0)
        return;
      const E = c.let("missing");
      for (const S in p) {
        const g = p[S];
        if (g.length === 0)
          continue;
        const d = (0, r.propertyInData)(c, $, S, w.opts.ownProperties);
        u.setParams({
          property: S,
          depsCount: g.length,
          deps: g.join(", ")
        }), w.allErrors ? c.if(d, () => {
          for (const f of g)
            (0, r.checkReportMissingProp)(u, f);
        }) : (c.if((0, t._)`${d} && (${(0, r.checkMissingProp)(u, g, E)})`), (0, r.reportMissingProp)(u, E), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function o(u, p = u.schema) {
      const { gen: c, data: $, keyword: w, it: E } = u, S = c.name("valid");
      for (const g in p)
        (0, s.alwaysValidSchema)(E, p[g]) || (c.if(
          (0, r.propertyInData)(c, $, g, E.opts.ownProperties),
          () => {
            const d = u.subschema({ keyword: w, schemaProp: g }, S);
            u.mergeValidEvaluated(d, S);
          },
          () => c.var(S, !0)
          // TODO var
        ), u.ok(S));
    }
    e.validateSchemaDeps = o, e.default = l;
  }(Is)), Is;
}
var mn = {}, Sc;
function _m() {
  if (Sc) return mn;
  Sc = 1, Object.defineProperty(mn, "__esModule", { value: !0 });
  const e = se(), t = ce(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: n, schema: i, data: o, it: u } = l;
      if ((0, t.alwaysValidSchema)(u, i))
        return;
      const p = n.name("valid");
      n.forIn("key", o, (c) => {
        l.setParams({ propertyName: c }), l.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, p), n.if((0, e.not)(p), () => {
          l.error(!0), u.allErrors || n.break();
        });
      }), l.ok(p);
    }
  };
  return mn.default = r, mn;
}
var pn = {}, Pc;
function fl() {
  if (Pc) return pn;
  Pc = 1, Object.defineProperty(pn, "__esModule", { value: !0 });
  const e = Ve(), t = se(), s = ot(), r = ce(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: o, schema: u, parentSchema: p, data: c, errsCount: $, it: w } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: E, opts: S } = w;
      if (w.props = !0, S.removeAdditional !== "all" && (0, r.alwaysValidSchema)(w, u))
        return;
      const g = (0, e.allSchemaProperties)(p.properties), d = (0, e.allSchemaProperties)(p.patternProperties);
      f(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function f() {
        o.forIn("key", c, (y) => {
          !g.length && !d.length ? _(y) : o.if(a(y), () => _(y));
        });
      }
      function a(y) {
        let P;
        if (g.length > 8) {
          const T = (0, r.schemaRefOrVal)(w, p.properties, "properties");
          P = (0, e.isOwnProperty)(o, T, y);
        } else g.length ? P = (0, t.or)(...g.map((T) => (0, t._)`${y} === ${T}`)) : P = t.nil;
        return d.length && (P = (0, t.or)(P, ...d.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${y})`))), (0, t.not)(P);
      }
      function h(y) {
        o.code((0, t._)`delete ${c}[${y}]`);
      }
      function _(y) {
        if (S.removeAdditional === "all" || S.removeAdditional && u === !1) {
          h(y);
          return;
        }
        if (u === !1) {
          i.setParams({ additionalProperty: y }), i.error(), E || o.break();
          return;
        }
        if (typeof u == "object" && !(0, r.alwaysValidSchema)(w, u)) {
          const P = o.name("valid");
          S.removeAdditional === "failing" ? (v(y, P, !1), o.if((0, t.not)(P), () => {
            i.reset(), h(y);
          })) : (v(y, P), E || o.if((0, t.not)(P), () => o.break()));
        }
      }
      function v(y, P, T) {
        const q = {
          keyword: "additionalProperties",
          dataProp: y,
          dataPropType: r.Type.Str
        };
        T === !1 && Object.assign(q, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(q, P);
      }
    }
  };
  return pn.default = n, pn;
}
var yn = {}, Rc;
function wm() {
  if (Rc) return yn;
  Rc = 1, Object.defineProperty(yn, "__esModule", { value: !0 });
  const e = Xn(), t = Ve(), s = ce(), r = fl(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: o, parentSchema: u, data: p, it: c } = n;
      c.opts.removeAdditional === "all" && u.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(o);
      for (const d of $)
        c.definedProperties.add(d);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const w = $.filter((d) => !(0, s.alwaysValidSchema)(c, o[d]));
      if (w.length === 0)
        return;
      const E = i.name("valid");
      for (const d of w)
        S(d) ? g(d) : (i.if((0, t.propertyInData)(i, p, d, c.opts.ownProperties)), g(d), c.allErrors || i.else().var(E, !0), i.endIf()), n.it.definedProperties.add(d), n.ok(E);
      function S(d) {
        return c.opts.useDefaults && !c.compositeRule && o[d].default !== void 0;
      }
      function g(d) {
        n.subschema({
          keyword: "properties",
          schemaProp: d,
          dataProp: d
        }, E);
      }
    }
  };
  return yn.default = l, yn;
}
var $n = {}, Nc;
function Em() {
  if (Nc) return $n;
  Nc = 1, Object.defineProperty($n, "__esModule", { value: !0 });
  const e = Ve(), t = se(), s = ce(), r = ce(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: o, data: u, parentSchema: p, it: c } = n, { opts: $ } = c, w = (0, e.allSchemaProperties)(o), E = w.filter((_) => (0, s.alwaysValidSchema)(c, o[_]));
      if (w.length === 0 || E.length === w.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const S = $.strictSchema && !$.allowMatchingProperties && p.properties, g = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: d } = c;
      f();
      function f() {
        for (const _ of w)
          S && a(_), c.allErrors ? h(_) : (i.var(g, !0), h(_), i.if(g));
      }
      function a(_) {
        for (const v in S)
          new RegExp(_).test(v) && (0, s.checkStrictMode)(c, `property ${v} matches pattern ${_} (use allowMatchingProperties)`);
      }
      function h(_) {
        i.forIn("key", u, (v) => {
          i.if((0, t._)`${(0, e.usePattern)(n, _)}.test(${v})`, () => {
            const y = E.includes(_);
            y || n.subschema({
              keyword: "patternProperties",
              schemaProp: _,
              dataProp: v,
              dataPropType: r.Type.Str
            }, g), c.opts.unevaluated && d !== !0 ? i.assign((0, t._)`${d}[${v}]`, !0) : !y && !c.allErrors && i.if((0, t.not)(g), () => i.break());
          });
        });
      }
    }
  };
  return $n.default = l, $n;
}
var gn = {}, Ic;
function bm() {
  if (Ic) return gn;
  Ic = 1, Object.defineProperty(gn, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, l)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return gn.default = t, gn;
}
var vn = {}, Oc;
function Sm() {
  if (Oc) return vn;
  Oc = 1, Object.defineProperty(vn, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Ve().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return vn.default = t, vn;
}
var _n = {}, Tc;
function Pm() {
  if (Tc) return _n;
  Tc = 1, Object.defineProperty(_n, "__esModule", { value: !0 });
  const e = se(), t = ce(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: n, schema: i, parentSchema: o, it: u } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && o.discriminator)
        return;
      const p = i, c = n.let("valid", !1), $ = n.let("passing", null), w = n.name("_valid");
      l.setParams({ passing: $ }), n.block(E), l.result(c, () => l.reset(), () => l.error(!0));
      function E() {
        p.forEach((S, g) => {
          let d;
          (0, t.alwaysValidSchema)(u, S) ? n.var(w, !0) : d = l.subschema({
            keyword: "oneOf",
            schemaProp: g,
            compositeRule: !0
          }, w), g > 0 && n.if((0, e._)`${w} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${g}]`).else(), n.if(w, () => {
            n.assign(c, !0), n.assign($, g), d && l.mergeEvaluated(d, e.Name);
          });
        });
      }
    }
  };
  return _n.default = r, _n;
}
var wn = {}, Ac;
function Rm() {
  if (Ac) return wn;
  Ac = 1, Object.defineProperty(wn, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: l, it: n } = s;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      l.forEach((o, u) => {
        if ((0, e.alwaysValidSchema)(n, o))
          return;
        const p = s.subschema({ keyword: "allOf", schemaProp: u }, i);
        s.ok(i), s.mergeEvaluated(p);
      });
    }
  };
  return wn.default = t, wn;
}
var En = {}, jc;
function Nm() {
  if (jc) return En;
  jc = 1, Object.defineProperty(En, "__esModule", { value: !0 });
  const e = se(), t = ce(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: o, it: u } = n;
      o.then === void 0 && o.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const p = l(u, "then"), c = l(u, "else");
      if (!p && !c)
        return;
      const $ = i.let("valid", !0), w = i.name("_valid");
      if (E(), n.reset(), p && c) {
        const g = i.let("ifClause");
        n.setParams({ ifClause: g }), i.if(w, S("then", g), S("else", g));
      } else p ? i.if(w, S("then")) : i.if((0, e.not)(w), S("else"));
      n.pass($, () => n.error(!0));
      function E() {
        const g = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, w);
        n.mergeEvaluated(g);
      }
      function S(g, d) {
        return () => {
          const f = n.subschema({ keyword: g }, w);
          i.assign($, w), n.mergeValidEvaluated(f, $), d ? i.assign(d, (0, e._)`${g}`) : n.setParams({ ifClause: g });
        };
      }
    }
  };
  function l(n, i) {
    const o = n.schema[i];
    return o !== void 0 && !(0, t.alwaysValidSchema)(n, o);
  }
  return En.default = r, En;
}
var bn = {}, Cc;
function Im() {
  if (Cc) return bn;
  Cc = 1, Object.defineProperty(bn, "__esModule", { value: !0 });
  const e = ce(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: l }) {
      r.if === void 0 && (0, e.checkStrictMode)(l, `"${s}" without "if" is ignored`);
    }
  };
  return bn.default = t, bn;
}
var kc;
function Om() {
  if (kc) return ln;
  kc = 1, Object.defineProperty(ln, "__esModule", { value: !0 });
  const e = ll(), t = ym(), s = dl(), r = $m(), l = gm(), n = vm(), i = _m(), o = fl(), u = wm(), p = Em(), c = bm(), $ = Sm(), w = Pm(), E = Rm(), S = Nm(), g = Im();
  function d(f = !1) {
    const a = [
      // any
      c.default,
      $.default,
      w.default,
      E.default,
      S.default,
      g.default,
      // object
      i.default,
      o.default,
      n.default,
      u.default,
      p.default
    ];
    return f ? a.push(t.default, r.default) : a.push(e.default, s.default), a.push(l.default), a;
  }
  return ln.default = d, ln;
}
var Sn = {}, Pn = {}, qc;
function Tm() {
  if (qc) return Pn;
  qc = 1, Object.defineProperty(Pn, "__esModule", { value: !0 });
  const e = se(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, l) {
      const { gen: n, data: i, $data: o, schema: u, schemaCode: p, it: c } = r, { opts: $, errSchemaPath: w, schemaEnv: E, self: S } = c;
      if (!$.validateFormats)
        return;
      o ? g() : d();
      function g() {
        const f = n.scopeValue("formats", {
          ref: S.formats,
          code: $.code.formats
        }), a = n.const("fDef", (0, e._)`${f}[${p}]`), h = n.let("fType"), _ = n.let("format");
        n.if((0, e._)`typeof ${a} == "object" && !(${a} instanceof RegExp)`, () => n.assign(h, (0, e._)`${a}.type || "string"`).assign(_, (0, e._)`${a}.validate`), () => n.assign(h, (0, e._)`"string"`).assign(_, a)), r.fail$data((0, e.or)(v(), y()));
        function v() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${p} && !${_}`;
        }
        function y() {
          const P = E.$async ? (0, e._)`(${a}.async ? await ${_}(${i}) : ${_}(${i}))` : (0, e._)`${_}(${i})`, T = (0, e._)`(typeof ${_} == "function" ? ${P} : ${_}.test(${i}))`;
          return (0, e._)`${_} && ${_} !== true && ${h} === ${l} && !${T}`;
        }
      }
      function d() {
        const f = S.formats[u];
        if (!f) {
          v();
          return;
        }
        if (f === !0)
          return;
        const [a, h, _] = y(f);
        a === l && r.pass(P());
        function v() {
          if ($.strictSchema === !1) {
            S.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${u}" ignored in schema at path "${w}"`;
          }
        }
        function y(T) {
          const q = T instanceof RegExp ? (0, e.regexpCode)(T) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(u)}` : void 0, F = n.scopeValue("formats", { key: u, ref: T, code: q });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${F}.validate`] : ["string", T, F];
        }
        function P() {
          if (typeof f == "object" && !(f instanceof RegExp) && f.async) {
            if (!E.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${_}(${i})`;
          }
          return typeof h == "function" ? (0, e._)`${_}(${i})` : (0, e._)`${_}.test(${i})`;
        }
      }
    }
  };
  return Pn.default = s, Pn;
}
var Dc;
function Am() {
  if (Dc) return Sn;
  Dc = 1, Object.defineProperty(Sn, "__esModule", { value: !0 });
  const t = [Tm().default];
  return Sn.default = t, Sn;
}
var pt = {}, Mc;
function jm() {
  return Mc || (Mc = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.contentVocabulary = pt.metadataVocabulary = void 0, pt.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], pt.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), pt;
}
var Lc;
function Cm() {
  if (Lc) return Wr;
  Lc = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const e = nm(), t = pm(), s = Om(), r = Am(), l = jm(), n = [
    e.default,
    t.default,
    (0, s.default)(),
    r.default,
    l.metadataVocabulary,
    l.contentVocabulary
  ];
  return Wr.default = n, Wr;
}
var Rn = {}, Vt = {}, Fc;
function km() {
  if (Fc) return Vt;
  Fc = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.DiscrError = void 0;
  var e;
  return function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  }(e || (Vt.DiscrError = e = {})), Vt;
}
var Vc;
function qm() {
  if (Vc) return Rn;
  Vc = 1, Object.defineProperty(Rn, "__esModule", { value: !0 });
  const e = se(), t = km(), s = ka(), r = Yn(), l = ce(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: o, tagName: u } }) => o === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: o, tag: u, tagName: p } }) => (0, e._)`{error: ${o}, tag: ${p}, tagValue: ${u}}`
    },
    code(o) {
      const { gen: u, data: p, schema: c, parentSchema: $, it: w } = o, { oneOf: E } = $;
      if (!w.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const S = c.propertyName;
      if (typeof S != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!E)
        throw new Error("discriminator: requires oneOf keyword");
      const g = u.let("valid", !1), d = u.const("tag", (0, e._)`${p}${(0, e.getProperty)(S)}`);
      u.if((0, e._)`typeof ${d} == "string"`, () => f(), () => o.error(!1, { discrError: t.DiscrError.Tag, tag: d, tagName: S })), o.ok(g);
      function f() {
        const _ = h();
        u.if(!1);
        for (const v in _)
          u.elseIf((0, e._)`${d} === ${v}`), u.assign(g, a(_[v]));
        u.else(), o.error(!1, { discrError: t.DiscrError.Mapping, tag: d, tagName: S }), u.endIf();
      }
      function a(_) {
        const v = u.name("valid"), y = o.subschema({ keyword: "oneOf", schemaProp: _ }, v);
        return o.mergeEvaluated(y, e.Name), v;
      }
      function h() {
        var _;
        const v = {}, y = T($);
        let P = !0;
        for (let D = 0; D < E.length; D++) {
          let U = E[D];
          if (U != null && U.$ref && !(0, l.schemaHasRulesButRef)(U, w.self.RULES)) {
            const L = U.$ref;
            if (U = s.resolveRef.call(w.self, w.schemaEnv.root, w.baseId, L), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(w.opts.uriResolver, w.baseId, L);
          }
          const z = (_ = U == null ? void 0 : U.properties) === null || _ === void 0 ? void 0 : _[S];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${S}"`);
          P = P && (y || T(U)), q(z, D);
        }
        if (!P)
          throw new Error(`discriminator: "${S}" must be required`);
        return v;
        function T({ required: D }) {
          return Array.isArray(D) && D.includes(S);
        }
        function q(D, U) {
          if (D.const)
            F(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              F(z, U);
          else
            throw new Error(`discriminator: "properties/${S}" must have "const" or "enum"`);
        }
        function F(D, U) {
          if (typeof D != "string" || D in v)
            throw new Error(`discriminator: "${S}" values must be unique strings`);
          v[D] = U;
        }
      }
    }
  };
  return Rn.default = i, Rn;
}
const Dm = "http://json-schema.org/draft-07/schema#", Mm = "http://json-schema.org/draft-07/schema#", Lm = "Core schema meta-schema", Fm = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Vm = ["object", "boolean"], Um = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, zm = {
  $schema: Dm,
  $id: Mm,
  title: Lm,
  definitions: Fm,
  type: Vm,
  properties: Um,
  default: !0
};
var Uc;
function Gm() {
  return Uc || (Uc = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const s = em(), r = Cm(), l = qm(), n = zm, i = ["/properties"], o = "http://json-schema.org/draft-07/schema";
    class u extends s.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((S) => this.addVocabulary(S)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const S = this.opts.$data ? this.$dataMetaSchema(n, i) : n;
        this.addMetaSchema(S, o, !1), this.refs["http://json-schema.org/schema"] = o;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var p = Xn();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return p.KeywordCxt;
    } });
    var c = se();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return c._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return c.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return c.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return c.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return c.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return c.CodeGen;
    } });
    var $ = Ca();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return $.default;
    } });
    var w = Yn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return w.default;
    } });
  }(zr, zr.exports)), zr.exports;
}
var zc;
function Km() {
  return zc || (zc = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = Gm(), s = se(), r = s.operators, l = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: o, schemaCode: u }) => (0, s.str)`should be ${l[o].okStr} ${u}`,
      params: ({ keyword: o, schemaCode: u }) => (0, s._)`{comparison: ${l[o].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(l),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(o) {
        const { gen: u, data: p, schemaCode: c, keyword: $, it: w } = o, { opts: E, self: S } = w;
        if (!E.validateFormats)
          return;
        const g = new t.KeywordCxt(w, S.RULES.all.format.definition, "format");
        g.$data ? d() : f();
        function d() {
          const h = u.scopeValue("formats", {
            ref: S.formats,
            code: E.code.formats
          }), _ = u.const("fmt", (0, s._)`${h}[${g.schemaCode}]`);
          o.fail$data((0, s.or)((0, s._)`typeof ${_} != "object"`, (0, s._)`${_} instanceof RegExp`, (0, s._)`typeof ${_}.compare != "function"`, a(_)));
        }
        function f() {
          const h = g.schema, _ = S.formats[h];
          if (!_ || _ === !0)
            return;
          if (typeof _ != "object" || _ instanceof RegExp || typeof _.compare != "function")
            throw new Error(`"${$}": format "${h}" does not define "compare" function`);
          const v = u.scopeValue("formats", {
            key: h,
            ref: _,
            code: E.code.formats ? (0, s._)`${E.code.formats}${(0, s.getProperty)(h)}` : void 0
          });
          o.fail$data(a(v));
        }
        function a(h) {
          return (0, s._)`${h}.compare(${p}, ${c}) ${l[$].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const i = (o) => (o.addKeyword(e.formatLimitDefinition), o);
    e.default = i;
  }(ws)), ws;
}
var Gc;
function Hm() {
  return Gc || (Gc = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const s = Vh(), r = Km(), l = se(), n = new l.Name("fullFormats"), i = new l.Name("fastFormats"), o = (p, c = { keywords: !0 }) => {
      if (Array.isArray(c))
        return u(p, c, s.fullFormats, n), p;
      const [$, w] = c.mode === "fast" ? [s.fastFormats, i] : [s.fullFormats, n], E = c.formats || s.formatNames;
      return u(p, E, $, w), c.keywords && (0, r.default)(p), p;
    };
    o.get = (p, c = "full") => {
      const w = (c === "fast" ? s.fastFormats : s.fullFormats)[p];
      if (!w)
        throw new Error(`Unknown format "${p}"`);
      return w;
    };
    function u(p, c, $, w) {
      var E, S;
      (E = (S = p.opts.code).formats) !== null && E !== void 0 || (S.formats = (0, l._)`require("ajv-formats/dist/formats").${w}`);
      for (const g of c)
        p.addFormat(g, $[g]);
    }
    e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  }(Ur, Ur.exports)), Ur.exports;
}
var Bm = Hm();
const Wm = /* @__PURE__ */ Qu(Bm), xm = (e, t, s, r) => {
  if (s === "length" || s === "prototype" || s === "arguments" || s === "caller")
    return;
  const l = Object.getOwnPropertyDescriptor(e, s), n = Object.getOwnPropertyDescriptor(t, s);
  !Jm(l, n) && r || Object.defineProperty(e, s, n);
}, Jm = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Xm = (e, t) => {
  const s = Object.getPrototypeOf(t);
  s !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, s);
}, Ym = (e, t) => `/* Wrapped ${e}*/
${t}`, Zm = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Qm = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), ep = (e, t, s) => {
  const r = s === "" ? "" : `with ${s.trim()}() `, l = Ym.bind(null, r, t.toString());
  Object.defineProperty(l, "name", Qm);
  const { writable: n, enumerable: i, configurable: o } = Zm;
  Object.defineProperty(e, "toString", { value: l, writable: n, enumerable: i, configurable: o });
};
function tp(e, t, { ignoreNonConfigurable: s = !1 } = {}) {
  const { name: r } = e;
  for (const l of Reflect.ownKeys(t))
    xm(e, t, l, s);
  return Xm(e, t), ep(e, t, r), e;
}
const Kc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: s = 0,
    maxWait: r = Number.POSITIVE_INFINITY,
    before: l = !1,
    after: n = !0
  } = t;
  if (s < 0 || r < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!l && !n)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, o, u;
  const p = function(...c) {
    const $ = this, w = () => {
      i = void 0, o && (clearTimeout(o), o = void 0), n && (u = e.apply($, c));
    }, E = () => {
      o = void 0, i && (clearTimeout(i), i = void 0), n && (u = e.apply($, c));
    }, S = l && !i;
    return clearTimeout(i), i = setTimeout(w, s), r > 0 && r !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(E, r)), S && (u = e.apply($, c)), u;
  };
  return tp(p, e), p.cancel = () => {
    i && (clearTimeout(i), i = void 0), o && (clearTimeout(o), o = void 0);
  }, p;
};
var Nn = { exports: {} }, Os, Hc;
function Zn() {
  if (Hc) return Os;
  Hc = 1;
  const e = "2.0.0", t = 256, s = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, l = t - 6;
  return Os = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: s,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Os;
}
var Ts, Bc;
function Qn() {
  return Bc || (Bc = 1, Ts = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Ts;
}
var Wc;
function Ht() {
  return Wc || (Wc = 1, function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: s,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: l
    } = Zn(), n = Qn();
    t = e.exports = {};
    const i = t.re = [], o = t.safeRe = [], u = t.src = [], p = t.safeSrc = [], c = t.t = {};
    let $ = 0;
    const w = "[a-zA-Z0-9-]", E = [
      ["\\s", 1],
      ["\\d", l],
      [w, r]
    ], S = (d) => {
      for (const [f, a] of E)
        d = d.split(`${f}*`).join(`${f}{0,${a}}`).split(`${f}+`).join(`${f}{1,${a}}`);
      return d;
    }, g = (d, f, a) => {
      const h = S(f), _ = $++;
      n(d, _, f), c[d] = _, u[_] = f, p[_] = h, i[_] = new RegExp(f, a ? "g" : void 0), o[_] = new RegExp(h, a ? "g" : void 0);
    };
    g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${w}*`), g("MAINVERSION", `(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${u[c.NUMERICIDENTIFIER]}|${u[c.NONNUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${u[c.NUMERICIDENTIFIERLOOSE]}|${u[c.NONNUMERICIDENTIFIER]})`), g("PRERELEASE", `(?:-(${u[c.PRERELEASEIDENTIFIER]}(?:\\.${u[c.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${u[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[c.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${w}+`), g("BUILD", `(?:\\+(${u[c.BUILDIDENTIFIER]}(?:\\.${u[c.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${u[c.MAINVERSION]}${u[c.PRERELEASE]}?${u[c.BUILD]}?`), g("FULL", `^${u[c.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${u[c.MAINVERSIONLOOSE]}${u[c.PRERELEASELOOSE]}?${u[c.BUILD]}?`), g("LOOSE", `^${u[c.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${u[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${u[c.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:${u[c.PRERELEASE]})?${u[c.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:${u[c.PRERELEASELOOSE]})?${u[c.BUILD]}?)?)?`), g("XRANGE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${s}})(?:\\.(\\d{1,${s}}))?(?:\\.(\\d{1,${s}}))?`), g("COERCE", `${u[c.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", u[c.COERCEPLAIN] + `(?:${u[c.PRERELEASE]})?(?:${u[c.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", u[c.COERCE], !0), g("COERCERTLFULL", u[c.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${u[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${u[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${u[c.LONECARET]}${u[c.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${u[c.LONECARET]}${u[c.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${u[c.GTLT]}\\s*(${u[c.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]}|${u[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${u[c.XRANGEPLAIN]})\\s+-\\s+(${u[c.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${u[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[c.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(Nn, Nn.exports)), Nn.exports;
}
var As, xc;
function Da() {
  if (xc) return As;
  xc = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return As = (r) => r ? typeof r != "object" ? e : r : t, As;
}
var js, Jc;
function hl() {
  if (Jc) return js;
  Jc = 1;
  const e = /^[0-9]+$/, t = (r, l) => {
    const n = e.test(r), i = e.test(l);
    return n && i && (r = +r, l = +l), r === l ? 0 : n && !i ? -1 : i && !n ? 1 : r < l ? -1 : 1;
  };
  return js = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, l) => t(l, r)
  }, js;
}
var Cs, Xc;
function Ne() {
  if (Xc) return Cs;
  Xc = 1;
  const e = Qn(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: s } = Zn(), { safeRe: r, safeSrc: l, t: n } = Ht(), i = Da(), { compareIdentifiers: o } = hl();
  class u {
    constructor(c, $) {
      if ($ = i($), c instanceof u) {
        if (c.loose === !!$.loose && c.includePrerelease === !!$.includePrerelease)
          return c;
        c = c.version;
      } else if (typeof c != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof c}".`);
      if (c.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", c, $), this.options = $, this.loose = !!$.loose, this.includePrerelease = !!$.includePrerelease;
      const w = c.trim().match($.loose ? r[n.LOOSE] : r[n.FULL]);
      if (!w)
        throw new TypeError(`Invalid Version: ${c}`);
      if (this.raw = c, this.major = +w[1], this.minor = +w[2], this.patch = +w[3], this.major > s || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > s || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > s || this.patch < 0)
        throw new TypeError("Invalid patch version");
      w[4] ? this.prerelease = w[4].split(".").map((E) => {
        if (/^[0-9]+$/.test(E)) {
          const S = +E;
          if (S >= 0 && S < s)
            return S;
        }
        return E;
      }) : this.prerelease = [], this.build = w[5] ? w[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(c) {
      if (e("SemVer.compare", this.version, this.options, c), !(c instanceof u)) {
        if (typeof c == "string" && c === this.version)
          return 0;
        c = new u(c, this.options);
      }
      return c.version === this.version ? 0 : this.compareMain(c) || this.comparePre(c);
    }
    compareMain(c) {
      return c instanceof u || (c = new u(c, this.options)), o(this.major, c.major) || o(this.minor, c.minor) || o(this.patch, c.patch);
    }
    comparePre(c) {
      if (c instanceof u || (c = new u(c, this.options)), this.prerelease.length && !c.prerelease.length)
        return -1;
      if (!this.prerelease.length && c.prerelease.length)
        return 1;
      if (!this.prerelease.length && !c.prerelease.length)
        return 0;
      let $ = 0;
      do {
        const w = this.prerelease[$], E = c.prerelease[$];
        if (e("prerelease compare", $, w, E), w === void 0 && E === void 0)
          return 0;
        if (E === void 0)
          return 1;
        if (w === void 0)
          return -1;
        if (w === E)
          continue;
        return o(w, E);
      } while (++$);
    }
    compareBuild(c) {
      c instanceof u || (c = new u(c, this.options));
      let $ = 0;
      do {
        const w = this.build[$], E = c.build[$];
        if (e("build compare", $, w, E), w === void 0 && E === void 0)
          return 0;
        if (E === void 0)
          return 1;
        if (w === void 0)
          return -1;
        if (w === E)
          continue;
        return o(w, E);
      } while (++$);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(c, $, w) {
      if (c.startsWith("pre")) {
        if (!$ && w === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if ($) {
          const E = new RegExp(`^${this.options.loose ? l[n.PRERELEASELOOSE] : l[n.PRERELEASE]}$`), S = `-${$}`.match(E);
          if (!S || S[1] !== $)
            throw new Error(`invalid identifier: ${$}`);
        }
      }
      switch (c) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", $, w);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", $, w);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", $, w), this.inc("pre", $, w);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", $, w), this.inc("pre", $, w);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const E = Number(w) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [E];
          else {
            let S = this.prerelease.length;
            for (; --S >= 0; )
              typeof this.prerelease[S] == "number" && (this.prerelease[S]++, S = -2);
            if (S === -1) {
              if ($ === this.prerelease.join(".") && w === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(E);
            }
          }
          if ($) {
            let S = [$, E];
            w === !1 && (S = [$]), o(this.prerelease[0], $) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = S) : this.prerelease = S;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${c}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Cs = u, Cs;
}
var ks, Yc;
function Ot() {
  if (Yc) return ks;
  Yc = 1;
  const e = Ne();
  return ks = (s, r, l = !1) => {
    if (s instanceof e)
      return s;
    try {
      return new e(s, r);
    } catch (n) {
      if (!l)
        return null;
      throw n;
    }
  }, ks;
}
var qs, Zc;
function rp() {
  if (Zc) return qs;
  Zc = 1;
  const e = Ot();
  return qs = (s, r) => {
    const l = e(s, r);
    return l ? l.version : null;
  }, qs;
}
var Ds, Qc;
function np() {
  if (Qc) return Ds;
  Qc = 1;
  const e = Ot();
  return Ds = (s, r) => {
    const l = e(s.trim().replace(/^[=v]+/, ""), r);
    return l ? l.version : null;
  }, Ds;
}
var Ms, eu;
function sp() {
  if (eu) return Ms;
  eu = 1;
  const e = Ne();
  return Ms = (s, r, l, n, i) => {
    typeof l == "string" && (i = n, n = l, l = void 0);
    try {
      return new e(
        s instanceof e ? s.version : s,
        l
      ).inc(r, n, i).version;
    } catch {
      return null;
    }
  }, Ms;
}
var Ls, tu;
function ap() {
  if (tu) return Ls;
  tu = 1;
  const e = Ot();
  return Ls = (s, r) => {
    const l = e(s, null, !0), n = e(r, null, !0), i = l.compare(n);
    if (i === 0)
      return null;
    const o = i > 0, u = o ? l : n, p = o ? n : l, c = !!u.prerelease.length;
    if (!!p.prerelease.length && !c) {
      if (!p.patch && !p.minor)
        return "major";
      if (p.compareMain(u) === 0)
        return p.minor && !p.patch ? "minor" : "patch";
    }
    const w = c ? "pre" : "";
    return l.major !== n.major ? w + "major" : l.minor !== n.minor ? w + "minor" : l.patch !== n.patch ? w + "patch" : "prerelease";
  }, Ls;
}
var Fs, ru;
function op() {
  if (ru) return Fs;
  ru = 1;
  const e = Ne();
  return Fs = (s, r) => new e(s, r).major, Fs;
}
var Vs, nu;
function ip() {
  if (nu) return Vs;
  nu = 1;
  const e = Ne();
  return Vs = (s, r) => new e(s, r).minor, Vs;
}
var Us, su;
function cp() {
  if (su) return Us;
  su = 1;
  const e = Ne();
  return Us = (s, r) => new e(s, r).patch, Us;
}
var zs, au;
function up() {
  if (au) return zs;
  au = 1;
  const e = Ot();
  return zs = (s, r) => {
    const l = e(s, r);
    return l && l.prerelease.length ? l.prerelease : null;
  }, zs;
}
var Gs, ou;
function Ue() {
  if (ou) return Gs;
  ou = 1;
  const e = Ne();
  return Gs = (s, r, l) => new e(s, l).compare(new e(r, l)), Gs;
}
var Ks, iu;
function lp() {
  if (iu) return Ks;
  iu = 1;
  const e = Ue();
  return Ks = (s, r, l) => e(r, s, l), Ks;
}
var Hs, cu;
function dp() {
  if (cu) return Hs;
  cu = 1;
  const e = Ue();
  return Hs = (s, r) => e(s, r, !0), Hs;
}
var Bs, uu;
function Ma() {
  if (uu) return Bs;
  uu = 1;
  const e = Ne();
  return Bs = (s, r, l) => {
    const n = new e(s, l), i = new e(r, l);
    return n.compare(i) || n.compareBuild(i);
  }, Bs;
}
var Ws, lu;
function fp() {
  if (lu) return Ws;
  lu = 1;
  const e = Ma();
  return Ws = (s, r) => s.sort((l, n) => e(l, n, r)), Ws;
}
var xs, du;
function hp() {
  if (du) return xs;
  du = 1;
  const e = Ma();
  return xs = (s, r) => s.sort((l, n) => e(n, l, r)), xs;
}
var Js, fu;
function es() {
  if (fu) return Js;
  fu = 1;
  const e = Ue();
  return Js = (s, r, l) => e(s, r, l) > 0, Js;
}
var Xs, hu;
function La() {
  if (hu) return Xs;
  hu = 1;
  const e = Ue();
  return Xs = (s, r, l) => e(s, r, l) < 0, Xs;
}
var Ys, mu;
function ml() {
  if (mu) return Ys;
  mu = 1;
  const e = Ue();
  return Ys = (s, r, l) => e(s, r, l) === 0, Ys;
}
var Zs, pu;
function pl() {
  if (pu) return Zs;
  pu = 1;
  const e = Ue();
  return Zs = (s, r, l) => e(s, r, l) !== 0, Zs;
}
var Qs, yu;
function Fa() {
  if (yu) return Qs;
  yu = 1;
  const e = Ue();
  return Qs = (s, r, l) => e(s, r, l) >= 0, Qs;
}
var ea, $u;
function Va() {
  if ($u) return ea;
  $u = 1;
  const e = Ue();
  return ea = (s, r, l) => e(s, r, l) <= 0, ea;
}
var ta, gu;
function yl() {
  if (gu) return ta;
  gu = 1;
  const e = ml(), t = pl(), s = es(), r = Fa(), l = La(), n = Va();
  return ta = (o, u, p, c) => {
    switch (u) {
      case "===":
        return typeof o == "object" && (o = o.version), typeof p == "object" && (p = p.version), o === p;
      case "!==":
        return typeof o == "object" && (o = o.version), typeof p == "object" && (p = p.version), o !== p;
      case "":
      case "=":
      case "==":
        return e(o, p, c);
      case "!=":
        return t(o, p, c);
      case ">":
        return s(o, p, c);
      case ">=":
        return r(o, p, c);
      case "<":
        return l(o, p, c);
      case "<=":
        return n(o, p, c);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, ta;
}
var ra, vu;
function mp() {
  if (vu) return ra;
  vu = 1;
  const e = Ne(), t = Ot(), { safeRe: s, t: r } = Ht();
  return ra = (n, i) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    i = i || {};
    let o = null;
    if (!i.rtl)
      o = n.match(i.includePrerelease ? s[r.COERCEFULL] : s[r.COERCE]);
    else {
      const E = i.includePrerelease ? s[r.COERCERTLFULL] : s[r.COERCERTL];
      let S;
      for (; (S = E.exec(n)) && (!o || o.index + o[0].length !== n.length); )
        (!o || S.index + S[0].length !== o.index + o[0].length) && (o = S), E.lastIndex = S.index + S[1].length + S[2].length;
      E.lastIndex = -1;
    }
    if (o === null)
      return null;
    const u = o[2], p = o[3] || "0", c = o[4] || "0", $ = i.includePrerelease && o[5] ? `-${o[5]}` : "", w = i.includePrerelease && o[6] ? `+${o[6]}` : "";
    return t(`${u}.${p}.${c}${$}${w}`, i);
  }, ra;
}
var na, _u;
function pp() {
  if (_u) return na;
  _u = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(s) {
      const r = this.map.get(s);
      if (r !== void 0)
        return this.map.delete(s), this.map.set(s, r), r;
    }
    delete(s) {
      return this.map.delete(s);
    }
    set(s, r) {
      if (!this.delete(s) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(s, r);
      }
      return this;
    }
  }
  return na = e, na;
}
var sa, wu;
function ze() {
  if (wu) return sa;
  wu = 1;
  const e = /\s+/g;
  class t {
    constructor(V, x) {
      if (x = l(x), V instanceof t)
        return V.loose === !!x.loose && V.includePrerelease === !!x.includePrerelease ? V : new t(V.raw, x);
      if (V instanceof n)
        return this.raw = V.value, this.set = [[V]], this.formatted = void 0, this;
      if (this.options = x, this.loose = !!x.loose, this.includePrerelease = !!x.includePrerelease, this.raw = V.trim().replace(e, " "), this.set = this.raw.split("||").map((W) => this.parseRange(W.trim())).filter((W) => W.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const W = this.set[0];
        if (this.set = this.set.filter((B) => !g(B[0])), this.set.length === 0)
          this.set = [W];
        else if (this.set.length > 1) {
          for (const B of this.set)
            if (B.length === 1 && d(B[0])) {
              this.set = [B];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let V = 0; V < this.set.length; V++) {
          V > 0 && (this.formatted += "||");
          const x = this.set[V];
          for (let W = 0; W < x.length; W++)
            W > 0 && (this.formatted += " "), this.formatted += x[W].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(V) {
      const W = ((this.options.includePrerelease && E) | (this.options.loose && S)) + ":" + V, B = r.get(W);
      if (B)
        return B;
      const X = this.options.loose, C = X ? u[p.HYPHENRANGELOOSE] : u[p.HYPHENRANGE];
      V = V.replace(C, U(this.options.includePrerelease)), i("hyphen replace", V), V = V.replace(u[p.COMPARATORTRIM], c), i("comparator trim", V), V = V.replace(u[p.TILDETRIM], $), i("tilde trim", V), V = V.replace(u[p.CARETTRIM], w), i("caret trim", V);
      let N = V.split(" ").map((b) => a(b, this.options)).join(" ").split(/\s+/).map((b) => D(b, this.options));
      X && (N = N.filter((b) => (i("loose invalid filter", b, this.options), !!b.match(u[p.COMPARATORLOOSE])))), i("range list", N);
      const j = /* @__PURE__ */ new Map(), I = N.map((b) => new n(b, this.options));
      for (const b of I) {
        if (g(b))
          return [b];
        j.set(b.value, b);
      }
      j.size > 1 && j.has("") && j.delete("");
      const m = [...j.values()];
      return r.set(W, m), m;
    }
    intersects(V, x) {
      if (!(V instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((W) => f(W, x) && V.set.some((B) => f(B, x) && W.every((X) => B.every((C) => X.intersects(C, x)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(V) {
      if (!V)
        return !1;
      if (typeof V == "string")
        try {
          V = new o(V, this.options);
        } catch {
          return !1;
        }
      for (let x = 0; x < this.set.length; x++)
        if (z(this.set[x], V, this.options))
          return !0;
      return !1;
    }
  }
  sa = t;
  const s = pp(), r = new s(), l = Da(), n = ts(), i = Qn(), o = Ne(), {
    safeRe: u,
    t: p,
    comparatorTrimReplace: c,
    tildeTrimReplace: $,
    caretTrimReplace: w
  } = Ht(), { FLAG_INCLUDE_PRERELEASE: E, FLAG_LOOSE: S } = Zn(), g = (L) => L.value === "<0.0.0-0", d = (L) => L.value === "", f = (L, V) => {
    let x = !0;
    const W = L.slice();
    let B = W.pop();
    for (; x && W.length; )
      x = W.every((X) => B.intersects(X, V)), B = W.pop();
    return x;
  }, a = (L, V) => (i("comp", L, V), L = y(L, V), i("caret", L), L = _(L, V), i("tildes", L), L = T(L, V), i("xrange", L), L = F(L, V), i("stars", L), L), h = (L) => !L || L.toLowerCase() === "x" || L === "*", _ = (L, V) => L.trim().split(/\s+/).map((x) => v(x, V)).join(" "), v = (L, V) => {
    const x = V.loose ? u[p.TILDELOOSE] : u[p.TILDE];
    return L.replace(x, (W, B, X, C, N) => {
      i("tilde", L, W, B, X, C, N);
      let j;
      return h(B) ? j = "" : h(X) ? j = `>=${B}.0.0 <${+B + 1}.0.0-0` : h(C) ? j = `>=${B}.${X}.0 <${B}.${+X + 1}.0-0` : N ? (i("replaceTilde pr", N), j = `>=${B}.${X}.${C}-${N} <${B}.${+X + 1}.0-0`) : j = `>=${B}.${X}.${C} <${B}.${+X + 1}.0-0`, i("tilde return", j), j;
    });
  }, y = (L, V) => L.trim().split(/\s+/).map((x) => P(x, V)).join(" "), P = (L, V) => {
    i("caret", L, V);
    const x = V.loose ? u[p.CARETLOOSE] : u[p.CARET], W = V.includePrerelease ? "-0" : "";
    return L.replace(x, (B, X, C, N, j) => {
      i("caret", L, B, X, C, N, j);
      let I;
      return h(X) ? I = "" : h(C) ? I = `>=${X}.0.0${W} <${+X + 1}.0.0-0` : h(N) ? X === "0" ? I = `>=${X}.${C}.0${W} <${X}.${+C + 1}.0-0` : I = `>=${X}.${C}.0${W} <${+X + 1}.0.0-0` : j ? (i("replaceCaret pr", j), X === "0" ? C === "0" ? I = `>=${X}.${C}.${N}-${j} <${X}.${C}.${+N + 1}-0` : I = `>=${X}.${C}.${N}-${j} <${X}.${+C + 1}.0-0` : I = `>=${X}.${C}.${N}-${j} <${+X + 1}.0.0-0`) : (i("no pr"), X === "0" ? C === "0" ? I = `>=${X}.${C}.${N}${W} <${X}.${C}.${+N + 1}-0` : I = `>=${X}.${C}.${N}${W} <${X}.${+C + 1}.0-0` : I = `>=${X}.${C}.${N} <${+X + 1}.0.0-0`), i("caret return", I), I;
    });
  }, T = (L, V) => (i("replaceXRanges", L, V), L.split(/\s+/).map((x) => q(x, V)).join(" ")), q = (L, V) => {
    L = L.trim();
    const x = V.loose ? u[p.XRANGELOOSE] : u[p.XRANGE];
    return L.replace(x, (W, B, X, C, N, j) => {
      i("xRange", L, W, B, X, C, N, j);
      const I = h(X), m = I || h(C), b = m || h(N), A = b;
      return B === "=" && A && (B = ""), j = V.includePrerelease ? "-0" : "", I ? B === ">" || B === "<" ? W = "<0.0.0-0" : W = "*" : B && A ? (m && (C = 0), N = 0, B === ">" ? (B = ">=", m ? (X = +X + 1, C = 0, N = 0) : (C = +C + 1, N = 0)) : B === "<=" && (B = "<", m ? X = +X + 1 : C = +C + 1), B === "<" && (j = "-0"), W = `${B + X}.${C}.${N}${j}`) : m ? W = `>=${X}.0.0${j} <${+X + 1}.0.0-0` : b && (W = `>=${X}.${C}.0${j} <${X}.${+C + 1}.0-0`), i("xRange return", W), W;
    });
  }, F = (L, V) => (i("replaceStars", L, V), L.trim().replace(u[p.STAR], "")), D = (L, V) => (i("replaceGTE0", L, V), L.trim().replace(u[V.includePrerelease ? p.GTE0PRE : p.GTE0], "")), U = (L) => (V, x, W, B, X, C, N, j, I, m, b, A) => (h(W) ? x = "" : h(B) ? x = `>=${W}.0.0${L ? "-0" : ""}` : h(X) ? x = `>=${W}.${B}.0${L ? "-0" : ""}` : C ? x = `>=${x}` : x = `>=${x}${L ? "-0" : ""}`, h(I) ? j = "" : h(m) ? j = `<${+I + 1}.0.0-0` : h(b) ? j = `<${I}.${+m + 1}.0-0` : A ? j = `<=${I}.${m}.${b}-${A}` : L ? j = `<${I}.${m}.${+b + 1}-0` : j = `<=${j}`, `${x} ${j}`.trim()), z = (L, V, x) => {
    for (let W = 0; W < L.length; W++)
      if (!L[W].test(V))
        return !1;
    if (V.prerelease.length && !x.includePrerelease) {
      for (let W = 0; W < L.length; W++)
        if (i(L[W].semver), L[W].semver !== n.ANY && L[W].semver.prerelease.length > 0) {
          const B = L[W].semver;
          if (B.major === V.major && B.minor === V.minor && B.patch === V.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return sa;
}
var aa, Eu;
function ts() {
  if (Eu) return aa;
  Eu = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, $) {
      if ($ = s($), c instanceof t) {
        if (c.loose === !!$.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, $), this.options = $, this.loose = !!$.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const $ = this.options.loose ? r[l.COMPARATORLOOSE] : r[l.COMPARATOR], w = c.match($);
      if (!w)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = w[1] !== void 0 ? w[1] : "", this.operator === "=" && (this.operator = ""), w[2] ? this.semver = new o(w[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new o(c, this.options);
        } catch {
          return !1;
        }
      return n(c, this.operator, this.semver, this.options);
    }
    intersects(c, $) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(c.value, $).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new u(this.value, $).test(c.semver) : ($ = s($), $.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !$.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || n(this.semver, "<", c.semver, $) && this.operator.startsWith(">") && c.operator.startsWith("<") || n(this.semver, ">", c.semver, $) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  aa = t;
  const s = Da(), { safeRe: r, t: l } = Ht(), n = yl(), i = Qn(), o = Ne(), u = ze();
  return aa;
}
var oa, bu;
function rs() {
  if (bu) return oa;
  bu = 1;
  const e = ze();
  return oa = (s, r, l) => {
    try {
      r = new e(r, l);
    } catch {
      return !1;
    }
    return r.test(s);
  }, oa;
}
var ia, Su;
function yp() {
  if (Su) return ia;
  Su = 1;
  const e = ze();
  return ia = (s, r) => new e(s, r).set.map((l) => l.map((n) => n.value).join(" ").trim().split(" ")), ia;
}
var ca, Pu;
function $p() {
  if (Pu) return ca;
  Pu = 1;
  const e = Ne(), t = ze();
  return ca = (r, l, n) => {
    let i = null, o = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((p) => {
      u.test(p) && (!i || o.compare(p) === -1) && (i = p, o = new e(i, n));
    }), i;
  }, ca;
}
var ua, Ru;
function gp() {
  if (Ru) return ua;
  Ru = 1;
  const e = Ne(), t = ze();
  return ua = (r, l, n) => {
    let i = null, o = null, u = null;
    try {
      u = new t(l, n);
    } catch {
      return null;
    }
    return r.forEach((p) => {
      u.test(p) && (!i || o.compare(p) === 1) && (i = p, o = new e(i, n));
    }), i;
  }, ua;
}
var la, Nu;
function vp() {
  if (Nu) return la;
  Nu = 1;
  const e = Ne(), t = ze(), s = es();
  return la = (l, n) => {
    l = new t(l, n);
    let i = new e("0.0.0");
    if (l.test(i) || (i = new e("0.0.0-0"), l.test(i)))
      return i;
    i = null;
    for (let o = 0; o < l.set.length; ++o) {
      const u = l.set[o];
      let p = null;
      u.forEach((c) => {
        const $ = new e(c.semver.version);
        switch (c.operator) {
          case ">":
            $.prerelease.length === 0 ? $.patch++ : $.prerelease.push(0), $.raw = $.format();
          /* fallthrough */
          case "":
          case ">=":
            (!p || s($, p)) && (p = $);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${c.operator}`);
        }
      }), p && (!i || s(i, p)) && (i = p);
    }
    return i && l.test(i) ? i : null;
  }, la;
}
var da, Iu;
function _p() {
  if (Iu) return da;
  Iu = 1;
  const e = ze();
  return da = (s, r) => {
    try {
      return new e(s, r).range || "*";
    } catch {
      return null;
    }
  }, da;
}
var fa, Ou;
function Ua() {
  if (Ou) return fa;
  Ou = 1;
  const e = Ne(), t = ts(), { ANY: s } = t, r = ze(), l = rs(), n = es(), i = La(), o = Va(), u = Fa();
  return fa = (c, $, w, E) => {
    c = new e(c, E), $ = new r($, E);
    let S, g, d, f, a;
    switch (w) {
      case ">":
        S = n, g = o, d = i, f = ">", a = ">=";
        break;
      case "<":
        S = i, g = u, d = n, f = "<", a = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(c, $, E))
      return !1;
    for (let h = 0; h < $.set.length; ++h) {
      const _ = $.set[h];
      let v = null, y = null;
      if (_.forEach((P) => {
        P.semver === s && (P = new t(">=0.0.0")), v = v || P, y = y || P, S(P.semver, v.semver, E) ? v = P : d(P.semver, y.semver, E) && (y = P);
      }), v.operator === f || v.operator === a || (!y.operator || y.operator === f) && g(c, y.semver))
        return !1;
      if (y.operator === a && d(c, y.semver))
        return !1;
    }
    return !0;
  }, fa;
}
var ha, Tu;
function wp() {
  if (Tu) return ha;
  Tu = 1;
  const e = Ua();
  return ha = (s, r, l) => e(s, r, ">", l), ha;
}
var ma, Au;
function Ep() {
  if (Au) return ma;
  Au = 1;
  const e = Ua();
  return ma = (s, r, l) => e(s, r, "<", l), ma;
}
var pa, ju;
function bp() {
  if (ju) return pa;
  ju = 1;
  const e = ze();
  return pa = (s, r, l) => (s = new e(s, l), r = new e(r, l), s.intersects(r, l)), pa;
}
var ya, Cu;
function Sp() {
  if (Cu) return ya;
  Cu = 1;
  const e = rs(), t = Ue();
  return ya = (s, r, l) => {
    const n = [];
    let i = null, o = null;
    const u = s.sort((w, E) => t(w, E, l));
    for (const w of u)
      e(w, r, l) ? (o = w, i || (i = w)) : (o && n.push([i, o]), o = null, i = null);
    i && n.push([i, null]);
    const p = [];
    for (const [w, E] of n)
      w === E ? p.push(w) : !E && w === u[0] ? p.push("*") : E ? w === u[0] ? p.push(`<=${E}`) : p.push(`${w} - ${E}`) : p.push(`>=${w}`);
    const c = p.join(" || "), $ = typeof r.raw == "string" ? r.raw : String(r);
    return c.length < $.length ? c : r;
  }, ya;
}
var $a, ku;
function Pp() {
  if (ku) return $a;
  ku = 1;
  const e = ze(), t = ts(), { ANY: s } = t, r = rs(), l = Ue(), n = ($, w, E = {}) => {
    if ($ === w)
      return !0;
    $ = new e($, E), w = new e(w, E);
    let S = !1;
    e: for (const g of $.set) {
      for (const d of w.set) {
        const f = u(g, d, E);
        if (S = S || f !== null, f)
          continue e;
      }
      if (S)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], o = [new t(">=0.0.0")], u = ($, w, E) => {
    if ($ === w)
      return !0;
    if ($.length === 1 && $[0].semver === s) {
      if (w.length === 1 && w[0].semver === s)
        return !0;
      E.includePrerelease ? $ = i : $ = o;
    }
    if (w.length === 1 && w[0].semver === s) {
      if (E.includePrerelease)
        return !0;
      w = o;
    }
    const S = /* @__PURE__ */ new Set();
    let g, d;
    for (const T of $)
      T.operator === ">" || T.operator === ">=" ? g = p(g, T, E) : T.operator === "<" || T.operator === "<=" ? d = c(d, T, E) : S.add(T.semver);
    if (S.size > 1)
      return null;
    let f;
    if (g && d) {
      if (f = l(g.semver, d.semver, E), f > 0)
        return null;
      if (f === 0 && (g.operator !== ">=" || d.operator !== "<="))
        return null;
    }
    for (const T of S) {
      if (g && !r(T, String(g), E) || d && !r(T, String(d), E))
        return null;
      for (const q of w)
        if (!r(T, String(q), E))
          return !1;
      return !0;
    }
    let a, h, _, v, y = d && !E.includePrerelease && d.semver.prerelease.length ? d.semver : !1, P = g && !E.includePrerelease && g.semver.prerelease.length ? g.semver : !1;
    y && y.prerelease.length === 1 && d.operator === "<" && y.prerelease[0] === 0 && (y = !1);
    for (const T of w) {
      if (v = v || T.operator === ">" || T.operator === ">=", _ = _ || T.operator === "<" || T.operator === "<=", g) {
        if (P && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === P.major && T.semver.minor === P.minor && T.semver.patch === P.patch && (P = !1), T.operator === ">" || T.operator === ">=") {
          if (a = p(g, T, E), a === T && a !== g)
            return !1;
        } else if (g.operator === ">=" && !r(g.semver, String(T), E))
          return !1;
      }
      if (d) {
        if (y && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === y.major && T.semver.minor === y.minor && T.semver.patch === y.patch && (y = !1), T.operator === "<" || T.operator === "<=") {
          if (h = c(d, T, E), h === T && h !== d)
            return !1;
        } else if (d.operator === "<=" && !r(d.semver, String(T), E))
          return !1;
      }
      if (!T.operator && (d || g) && f !== 0)
        return !1;
    }
    return !(g && _ && !d && f !== 0 || d && v && !g && f !== 0 || P || y);
  }, p = ($, w, E) => {
    if (!$)
      return w;
    const S = l($.semver, w.semver, E);
    return S > 0 ? $ : S < 0 || w.operator === ">" && $.operator === ">=" ? w : $;
  }, c = ($, w, E) => {
    if (!$)
      return w;
    const S = l($.semver, w.semver, E);
    return S < 0 ? $ : S > 0 || w.operator === "<" && $.operator === "<=" ? w : $;
  };
  return $a = n, $a;
}
var ga, qu;
function Rp() {
  if (qu) return ga;
  qu = 1;
  const e = Ht(), t = Zn(), s = Ne(), r = hl(), l = Ot(), n = rp(), i = np(), o = sp(), u = ap(), p = op(), c = ip(), $ = cp(), w = up(), E = Ue(), S = lp(), g = dp(), d = Ma(), f = fp(), a = hp(), h = es(), _ = La(), v = ml(), y = pl(), P = Fa(), T = Va(), q = yl(), F = mp(), D = ts(), U = ze(), z = rs(), L = yp(), V = $p(), x = gp(), W = vp(), B = _p(), X = Ua(), C = wp(), N = Ep(), j = bp(), I = Sp(), m = Pp();
  return ga = {
    parse: l,
    valid: n,
    clean: i,
    inc: o,
    diff: u,
    major: p,
    minor: c,
    patch: $,
    prerelease: w,
    compare: E,
    rcompare: S,
    compareLoose: g,
    compareBuild: d,
    sort: f,
    rsort: a,
    gt: h,
    lt: _,
    eq: v,
    neq: y,
    gte: P,
    lte: T,
    cmp: q,
    coerce: F,
    Comparator: D,
    Range: U,
    satisfies: z,
    toComparators: L,
    maxSatisfying: V,
    minSatisfying: x,
    minVersion: W,
    validRange: B,
    outside: X,
    gtr: C,
    ltr: N,
    intersects: j,
    simplifyRange: I,
    subset: m,
    SemVer: s,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, ga;
}
var Np = Rp();
const bt = /* @__PURE__ */ Qu(Np), Ip = Object.prototype.toString, Op = "[object Uint8Array]", Tp = "[object ArrayBuffer]";
function $l(e, t, s) {
  return e ? e.constructor === t ? !0 : Ip.call(e) === s : !1;
}
function gl(e) {
  return $l(e, Uint8Array, Op);
}
function Ap(e) {
  return $l(e, ArrayBuffer, Tp);
}
function jp(e) {
  return gl(e) || Ap(e);
}
function Cp(e) {
  if (!gl(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function kp(e) {
  if (!jp(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Du(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((l, n) => l + n.length, 0));
  const s = new Uint8Array(t);
  let r = 0;
  for (const l of e)
    Cp(l), s.set(l, r), r += l.length;
  return s;
}
const In = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Mu(e, t = "utf8") {
  return kp(e), In[t] ?? (In[t] = new globalThis.TextDecoder(t)), In[t].decode(e);
}
function qp(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Dp = new globalThis.TextEncoder();
function va(e) {
  return qp(e), Dp.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Mp = Wm.default, Lu = "aes-256-cbc", St = () => /* @__PURE__ */ Object.create(null), Lp = (e) => e != null, Fp = (e, t) => {
  const s = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), r = typeof t;
  if (s.has(r))
    throw new TypeError(`Setting a value of type \`${r}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, jn = "__internal__", _a = `${jn}.migrations.version`;
var at, Ye, Ce, Ze;
class Vp {
  constructor(t = {}) {
    jt(this, "path");
    jt(this, "events");
    Ct(this, at);
    Ct(this, Ye);
    Ct(this, Ce);
    Ct(this, Ze, {});
    jt(this, "_deserialize", (t) => JSON.parse(t));
    jt(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const s = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!s.cwd) {
      if (!s.projectName)
        throw new Error("Please specify the `projectName` option.");
      s.cwd = Zl(s.projectName, { suffix: s.projectSuffix }).config;
    }
    if (kt(this, Ce, s), s.schema ?? s.ajvOptions ?? s.rootSchema) {
      if (s.schema && typeof s.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const i = new Fh.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...s.ajvOptions
      });
      Mp(i);
      const o = {
        ...s.rootSchema,
        type: "object",
        properties: s.schema
      };
      kt(this, at, i.compile(o));
      for (const [u, p] of Object.entries(s.schema ?? {}))
        p != null && p.default && (pe(this, Ze)[u] = p.default);
    }
    s.defaults && kt(this, Ze, {
      ...pe(this, Ze),
      ...s.defaults
    }), s.serialize && (this._serialize = s.serialize), s.deserialize && (this._deserialize = s.deserialize), this.events = new EventTarget(), kt(this, Ye, s.encryptionKey);
    const r = s.fileExtension ? `.${s.fileExtension}` : "";
    this.path = Q.resolve(s.cwd, `${s.configName ?? "config"}${r}`);
    const l = this.store, n = Object.assign(St(), s.defaults, l);
    if (s.migrations) {
      if (!s.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(s.migrations, s.projectVersion, s.beforeEachMigration);
    }
    this._validate(n);
    try {
      Pl.deepEqual(l, n);
    } catch {
      this.store = n;
    }
    s.watch && this._watch();
  }
  get(t, s) {
    if (pe(this, Ce).accessPropertiesByDotNotation)
      return this._get(t, s);
    const { store: r } = this;
    return t in r ? r[t] : s;
  }
  set(t, s) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && s === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${jn} key, as it's used to manage this module internal operations.`);
    const { store: r } = this, l = (n, i) => {
      Fp(n, i), pe(this, Ce).accessPropertiesByDotNotation ? eo(r, n, i) : r[n] = i;
    };
    if (typeof t == "object") {
      const n = t;
      for (const [i, o] of Object.entries(n))
        l(i, o);
    } else
      l(t, s);
    this.store = r;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(t) {
    return pe(this, Ce).accessPropertiesByDotNotation ? xl(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const s of t)
      Lp(pe(this, Ze)[s]) && this.set(s, pe(this, Ze)[s]);
  }
  delete(t) {
    const { store: s } = this;
    pe(this, Ce).accessPropertiesByDotNotation ? Wl(s, t) : delete s[t], this.store = s;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = St();
    for (const t of Object.keys(pe(this, Ze)))
      this.reset(t);
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key to watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(t, s) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof s != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof s}`);
    return this._handleChange(() => this.get(t), s);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const t = ee.readFileSync(this.path, pe(this, Ye) ? null : "utf8"), s = this._encryptData(t), r = this._deserialize(s);
      return this._validate(r), Object.assign(St(), r);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), St();
      if (pe(this, Ce).clearInvalidConfig && t.name === "SyntaxError")
        return St();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, s] of Object.entries(this.store))
      yield [t, s];
  }
  _encryptData(t) {
    if (!pe(this, Ye))
      return typeof t == "string" ? t : Mu(t);
    try {
      const s = t.slice(0, 16), r = qt.pbkdf2Sync(pe(this, Ye), s.toString(), 1e4, 32, "sha512"), l = qt.createDecipheriv(Lu, r, s), n = t.slice(17), i = typeof n == "string" ? va(n) : n;
      return Mu(Du([l.update(i), l.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, s) {
    let r = t();
    const l = () => {
      const n = r, i = t();
      Sl(i, n) || (r = i, s.call(this, i, n));
    };
    return this.events.addEventListener("change", l), () => {
      this.events.removeEventListener("change", l);
    };
  }
  _validate(t) {
    if (!pe(this, at) || pe(this, at).call(this, t) || !pe(this, at).errors)
      return;
    const r = pe(this, at).errors.map(({ instancePath: l, message: n = "" }) => `\`${l.slice(1)}\` ${n}`);
    throw new Error("Config schema violation: " + r.join("; "));
  }
  _ensureDirectory() {
    ee.mkdirSync(Q.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let s = this._serialize(t);
    if (pe(this, Ye)) {
      const r = qt.randomBytes(16), l = qt.pbkdf2Sync(pe(this, Ye), r.toString(), 1e4, 32, "sha512"), n = qt.createCipheriv(Lu, l, r);
      s = Du([r, va(":"), n.update(va(s)), n.final()]);
    }
    if (ue.env.SNAP)
      ee.writeFileSync(this.path, s, { mode: pe(this, Ce).configFileMode });
    else
      try {
        Zu(this.path, s, { mode: pe(this, Ce).configFileMode });
      } catch (r) {
        if ((r == null ? void 0 : r.code) === "EXDEV") {
          ee.writeFileSync(this.path, s, { mode: pe(this, Ce).configFileMode });
          return;
        }
        throw r;
      }
  }
  _watch() {
    this._ensureDirectory(), ee.existsSync(this.path) || this._write(St()), ue.platform === "win32" ? ee.watch(this.path, { persistent: !1 }, Kc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ee.watchFile(this.path, { persistent: !1 }, Kc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, s, r) {
    let l = this._get(_a, "0.0.0");
    const n = Object.keys(t).filter((o) => this._shouldPerformMigration(o, l, s));
    let i = { ...this.store };
    for (const o of n)
      try {
        r && r(this, {
          fromVersion: l,
          toVersion: o,
          finalVersion: s,
          versions: n
        });
        const u = t[o];
        u == null || u(this), this._set(_a, o), l = o, i = { ...this.store };
      } catch (u) {
        throw this.store = i, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(l) || !bt.eq(l, s)) && this._set(_a, s);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === jn ? !0 : typeof t != "string" ? !1 : pe(this, Ce).accessPropertiesByDotNotation ? !!t.startsWith(`${jn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return bt.clean(t) === null;
  }
  _shouldPerformMigration(t, s, r) {
    return this._isVersionInRangeFormat(t) ? s !== "0.0.0" && bt.satisfies(s, t) ? !1 : bt.satisfies(r, t) : !(bt.lte(t, s) || bt.gt(t, r));
  }
  _get(t, s) {
    return Bl(this.store, t, s);
  }
  _set(t, s) {
    const { store: r } = this;
    eo(r, t, s), this.store = r;
  }
}
at = new WeakMap(), Ye = new WeakMap(), Ce = new WeakMap(), Ze = new WeakMap();
const { app: Cn, ipcMain: Sa, shell: Up } = Bu;
let Fu = !1;
const Vu = () => {
  if (!Sa || !Cn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Cn.getPath("userData"),
    appVersion: Cn.getVersion()
  };
  return Fu || (Sa.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Fu = !0), e;
};
class zp extends Vp {
  constructor(t) {
    let s, r;
    if (ue.type === "renderer") {
      const l = Bu.ipcRenderer.sendSync("electron-store-get-data");
      if (!l)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: s, appVersion: r } = l);
    } else Sa && Cn && ({ defaultCwd: s, appVersion: r } = Vu());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = r), t.cwd ? t.cwd = Q.isAbsolute(t.cwd) ? t.cwd : Q.join(s, t.cwd) : t.cwd = s, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Vu();
  }
  async openInEditor() {
    const t = await Up.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Gp = {
  defaultBrowserPath: {
    type: ["string", "null"],
    // Use 'as const' for stricter type inference
    default: null
  },
  defaultBrowserName: {
    type: ["string", "null"],
    default: null
  },
  rules: {
    type: "array",
    default: [],
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        pattern: { type: "string" },
        patternType: { type: "string", enum: ["domain", "startsWith", "includes", "regex"] },
        browserPath: { type: "string" },
        browserName: { type: "string" },
        isEnabled: { type: "boolean" }
      },
      required: ["id", "pattern", "patternType", "browserPath", "browserName", "isEnabled"]
    }
  }
}, Kp = new zp({ schema: Gp, watch: !0 }), ke = Kp;
async function Hp(e) {
  try {
    const t = await Ee.getFileIcon(e, { size: "normal" });
    if (t.isEmpty()) {
      console.warn(`Could not get non-empty icon for ${e}`);
      return;
    }
    return t.toDataURL();
  } catch (t) {
    console.error(`Error getting file icon for ${e}:`, t);
    return;
  }
}
async function Bp() {
  console.log("Detecting browsers with icons...");
  let e = [];
  process.platform === "darwin" ? e = Wp() : process.platform === "win32" ? e = xp() : (console.warn("Browser detection not fully implemented for this platform."), e = Jp());
  const t = [];
  for (const s of e) {
    const r = await Hp(s.path);
    t.push({ ...s, iconDataUrl: r });
  }
  return console.log(`Detected ${t.length} browsers (with icon fetch attempt).`), t;
}
function Wp() {
  const e = [], t = [
    "com.google.Chrome",
    "com.google.Chrome.canary",
    "org.mozilla.firefox",
    "com.apple.Safari",
    "com.microsoft.edgemac",
    "com.operasoftware.Opera",
    "com.brave.Browser",
    "com.vivaldi.Vivaldi"
  ];
  for (const s of t)
    try {
      const r = `mdfind "kMDItemCFBundleIdentifier == '${s}'"`, n = Ut(r, { encoding: "utf8", stdio: "pipe" }).split(`
`).filter((i) => i.endsWith(".app"));
      if (n.length > 0) {
        const i = n[0], u = `/usr/libexec/PlistBuddy -c "Print CFBundleExecutable" "${Q.join(i, "Contents", "Info.plist")}"`, p = Ut(u, { encoding: "utf8", stdio: "pipe" }).trim(), c = Q.join(i, "Contents", "MacOS", p);
        if (ee.existsSync(c)) {
          const $ = Q.basename(i, ".app");
          e.push({ name: $, path: c }), console.log(`Found macOS browser: ${$} at ${c}`);
        }
      }
    } catch {
    }
  return e;
}
function xp() {
  var i;
  const e = [], t = [
    "HKEY_CURRENT_USER\\Software\\Clients\\StartMenuInternet",
    "HKEY_LOCAL_MACHINE\\Software\\Clients\\StartMenuInternet"
  ], s = [
    // Chrome
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    { path: process.env["ProgramFiles(x86)"] ? Q.join(process.env["ProgramFiles(x86)"], "Google\\Chrome\\Application\\chrome.exe") : null, nameHint: "Google Chrome" },
    // Firefox
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    { path: process.env["ProgramFiles(x86)"] ? Q.join(process.env["ProgramFiles(x86)"], "Mozilla Firefox\\firefox.exe") : null, nameHint: "Mozilla Firefox" },
    // Edge
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    { path: process.env["ProgramFiles(x86)"] ? Q.join(process.env["ProgramFiles(x86)"], "Microsoft\\Edge\\Application\\msedge.exe") : null, nameHint: "Microsoft Edge" },
    // Opera (Add opera.exe check in AppData)
    { path: process.env.LOCALAPPDATA ? Q.join(process.env.LOCALAPPDATA, "Programs\\Opera\\opera.exe") : null, nameHint: "Opera" },
    { path: process.env.LOCALAPPDATA ? Q.join(process.env.LOCALAPPDATA, "Programs\\Opera\\launcher.exe") : null, nameHint: "Opera" },
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "Opera\\launcher.exe") : null, nameHint: "Opera" },
    // Brave
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    { path: process.env["ProgramFiles(x86)"] ? Q.join(process.env["ProgramFiles(x86)"], "BraveSoftware\\Brave-Browser\\Application\\brave.exe") : null, nameHint: "Brave Browser" },
    // Vivaldi
    { path: process.env.LOCALAPPDATA ? Q.join(process.env.LOCALAPPDATA, "Vivaldi\\Application\\vivaldi.exe") : null, nameHint: "Vivaldi" },
    // Internet Explorer
    { path: process.env.ProgramFiles ? Q.join(process.env.ProgramFiles, "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" },
    { path: process.env["ProgramFiles(x86)"] ? Q.join(process.env["ProgramFiles(x86)"], "Internet Explorer\\iexplore.exe") : null, nameHint: "Internet Explorer" }
  ].filter((o) => o.path !== null), r = /* @__PURE__ */ new Set();
  for (const o of s) {
    const u = o.path;
    if (ee.existsSync(u) && !r.has(u)) {
      Q.basename(Q.dirname(u));
      const p = Q.basename(Q.dirname(Q.dirname(u)));
      let c = o.nameHint || (p !== "Application" && p !== "Default" ? p : Q.basename(u, ".exe"));
      c = c.replace(/\.exe$/i, ""), console.log(`[Detector] Common Path Found: Path=${u}, Derived Name=${c}`), e.push({ name: c, path: u }), r.add(u);
    }
  }
  for (const o of t)
    try {
      const u = `reg query "${o}" /s`, c = Ut(u, { encoding: "utf8", stdio: "pipe", maxBuffer: 1024 * 1024 * 5 }).split(`\r
`);
      let $ = "";
      for (const w of c)
        if (w.startsWith("HKEY_"))
          $ = w.trim();
        else if (w.includes("(Default)") && w.includes(".exe")) {
          const E = w.match(/REG_SZ\s+(.*\.exe)/), S = (i = E == null ? void 0 : E[1]) == null ? void 0 : i.trim();
          if (S && ee.existsSync(S) && !r.has(S)) {
            const g = $.split("\\");
            let d = g[g.length - 1] || Q.basename(S, ".exe");
            d = d.replace(/\s+Stable$/i, "").replace(/\s+Beta$/i, "").replace(/\s+Canary$/i, "").replace(/\s+Developer Edition$/i, ""), console.log(`[Detector] Registry Found: Path=${S}, Derived Name=${d}`), e.push({ name: d, path: S }), r.add(S);
          }
        }
    } catch (u) {
      console.warn(`Could not query Windows registry key ${o}:`, u);
    }
  const l = [], n = /* @__PURE__ */ new Set();
  for (const o of e)
    n.has(o.path) || (l.push(o), n.add(o.path));
  return l;
}
function Jp() {
  const e = [], t = ["google-chrome", "google-chrome-stable", "firefox", "microsoft-edge", "brave-browser", "opera", "vivaldi-stable"];
  for (const s of t)
    try {
      const r = Ut(`which ${s}`, { encoding: "utf8", stdio: "pipe" }).trim();
      if (r && ee.existsSync(r)) {
        const l = s.replace("-stable", "").replace("-browser", "");
        e.push({ name: l, path: r }), console.log(`Found Linux browser: ${l} at ${r}`);
      }
    } catch {
    }
  return e;
}
const ns = ["http", "https"], Uu = "BrowserLinkURLHandler", Pt = "BrowserLink", Xp = "Link_routing_utility", zu = "BrowserLinkDev";
let zt = [];
function Yp(e) {
  const t = ke.get("rules", []), s = e.toLowerCase();
  if (console.log(`Finding rule match for: ${e} among ${t.length} rules.`), zt.length === 0)
    return console.warn("Attempted to find matching browser before browser detection finished."), null;
  for (const r of t)
    if (r.isEnabled)
      try {
        let l = !1;
        const n = r.pattern.toLowerCase();
        switch (r.patternType) {
          case "domain": {
            const i = s.match(/^https?:\/\/([^\/]+)/), o = i == null ? void 0 : i[1];
            o && (l = o.includes(n) || n.includes(o));
            break;
          }
          case "startsWith":
            l = s.startsWith(n);
            break;
          case "includes":
            l = s.includes(n);
            break;
          case "regex": {
            l = new RegExp(r.pattern, "i").test(e);
            break;
          }
        }
        if (l)
          return console.log(`Rule matched: ID ${r.id} (${r.patternType}: ${r.pattern}) -> ${r.browserName}`), zt.some((i) => i.path === r.browserPath) ? { path: r.browserPath, name: r.browserName } : (console.warn(`Browser path for matched rule ${r.id} (${r.browserPath}) no longer exists or wasn't detected. Falling back.`), null);
      } catch (l) {
        console.error(`Error processing rule ${r.id} (${r.patternType}: ${r.pattern}) with URL ${e}:`, l);
      }
  return console.log("No matching rule found."), null;
}
async function za(e) {
  console.log(`Handling URL: ${e}`);
  const t = Yp(e), s = ke.get("defaultBrowserPath"), r = ke.get("defaultBrowserName"), l = (t == null ? void 0 : t.path) || s, n = (t == null ? void 0 : t.name) || r;
  if (l) {
    const i = n || Q.basename(l).replace(".exe", "");
    console.log(`Opening URL [${e}] in browser [${i}] (${l})`);
    try {
      await Kl(e, { app: { name: l }, wait: !1 }), Ha.isSupported() ? new Ha({
        title: `${Pt} Rule Matched`,
        // Use app name from config
        //body: `Opened in ${displayName}`,
        // Optional: Add URL to body or use subtitle if needed, keep it concise
        body: `Opened ${e} in ${i}`,
        silent: !0
        // Don't play sound
      }).show() : console.log("Notifications not supported on this system.");
    } catch (o) {
      console.error(`Error opening URL ${e} in ${i} (${l}):`, o);
      const u = o instanceof Error ? o.message : "Unknown error";
      Ba.showErrorBox("Error Opening URL", `Could not open the URL ${e} in the selected browser (${i}).

Error: ${u}`);
    }
  } else
    console.warn("No target browser path (rule or default) found for URL:", e), Ba.showErrorBox("Cannot Open URL", `No matching rule found and no default browser configured in Browser Link.
Please configure a default browser in the settings.`);
}
async function Zp() {
  try {
    zt = await Bp(), console.log("Browser detection with icons complete.");
  } catch (e) {
    console.error("Browser detection failed:", e), zt = [];
  }
}
function Qp() {
  return zt;
}
const ey = Fn(import.meta.url);
Q.dirname(ey);
let je = null;
function vl(e, t) {
  if (je) {
    console.warn("Attempted to create main window when one already exists."), je.focus();
    return;
  }
  je = new Wu({
    width: 900,
    height: 900,
    show: !1,
    webPreferences: {
      preload: e,
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), console.log("[Window Process] Using Preload Path:", e), t.startsWith("http") ? (console.log(`[Window Process - Dev] Loading URL: ${t}`), je.loadURL(t), je.webContents.openDevTools()) : (console.log(`[Window Process - Packaged] Loading File: ${t}`), je.loadFile(t)), je.once("ready-to-show", () => {
    je == null || je.show();
  }), je.on("closed", () => {
    je = null;
  });
}
function ty() {
  return je;
}
const ry = Fn(import.meta.url), Gu = Q.dirname(ry);
function ny() {
  if (process.platform !== "darwin") {
    const e = process.argv.find((t) => ns.some((s) => t.startsWith(`${s}://`)));
    e && console.log("Initial URL from argv:", e);
  }
}
function sy() {
  Ee.requestSingleInstanceLock() ? Ee.on("second-instance", async (t, s, r) => {
    console.log("Second instance detected.");
    const l = s.pop();
    if (l && ns.some((n) => l.startsWith(`${n}://`))) {
      console.log("Handling URL from second instance:", l);
      try {
        await za(l);
      } catch (n) {
        console.error("Error handling URL from second instance:", n instanceof Error ? n.message : n);
      }
    } else {
      const n = ty();
      n && (n.isMinimized() && n.restore(), n.focus());
    }
  }) : (console.log("Another instance is running. Quitting this instance."), Ee.quit());
}
function ay() {
  ny(), Ee.on("activate", () => {
    if (Wu.getAllWindows().length === 0) {
      const e = Q.join(Gu, "../preload.js"), t = Ee.isPackaged ? Q.join(Gu, "../../dist/renderer/index.html") : "http://localhost:3000";
      vl(e, t);
    }
  }), Ee.on("open-url", (e, t) => {
    e.preventDefault(), console.log("URL from open-url event:", t), za(t).catch((s) => console.error("Error handling open-url event:", s instanceof Error ? s.message : s));
  }), Ee.on("window-all-closed", () => {
    process.platform !== "darwin" && Ee.quit();
  });
}
function oy() {
  const e = [
    ...process.platform === "darwin" ? [{
      label: Ee.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    }] : [],
    {
      label: "File",
      submenu: [
        process.platform === "darwin" ? { role: "close" } : { role: "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...process.platform === "darwin" ? [
          { role: "pasteAndMatchStyle" },
          { role: "delete" },
          { role: "selectAll" },
          { type: "separator" },
          {
            label: "Speech",
            submenu: [
              { role: "startSpeaking" },
              { role: "stopSpeaking" }
            ]
          }
        ] : [
          { role: "delete" },
          { type: "separator" },
          { role: "selectAll" }
        ]
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...process.platform === "darwin" ? [
          { type: "separator" },
          { role: "front" },
          { type: "separator" },
          { role: "window" }
        ] : [
          { role: "close" }
        ]
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More (GitHub)",
          click: async () => {
            await xu.openExternal("https://github.com/your-repo-here");
          }
        }
      ]
    }
  ], t = Wa.buildFromTemplate(e);
  Wa.setApplicationMenu(t);
}
async function iy() {
  if (process.platform !== "win32")
    return { success: !0 };
  console.log("Registering application capabilities via reg.exe...");
  try {
    const t = Ee.getPath("exe").replace(/\\/g, "\\"), s = `${t},0`, r = `HKCU\\Software\\${zu}\\${Pt}\\Capabilities`, l = `${r}\\URLAssociations`, n = `HKCU\\Software\\Classes\\${Uu}`, i = `${n}\\shell\\open\\command`, o = `${n}\\DefaultIcon`, p = [
      // Create Capabilities key and values
      `reg add "${r}" /v ApplicationName /t REG_SZ /d "${Pt}" /f`,
      `reg add "${r}" /v ApplicationDescription /t REG_SZ /d "${Xp}" /f`,
      `reg add "${r}" /v ApplicationIcon /t REG_SZ /d "${s}" /f`,
      // Create URLAssociations subkey
      `reg add "${l}" /f`,
      // Add protocol associations
      ...ns.map(
        (c) => `reg add "${l}" /v ${c} /t REG_SZ /d "${Uu}" /f`
      ),
      // Register application entry
      `reg add "HKCU\\Software\\RegisteredApplications" /v "${Pt}" /t REG_SZ /d "Software\\${zu}\\${Pt}\\Capabilities" /f`,
      // Create Class key and values
      `reg add "${n}" /ve /t REG_SZ /d "${Pt} URL Handler" /f`,
      // Create DefaultIcon subkey and set value
      `reg add "${o}" /ve /t REG_SZ /d "${s}" /f`,
      // Create command subkey and set value
      `reg add "${i}" /ve /t REG_SZ /d ""${t}" "%1"" /f`
    ];
    for (const c of p)
      console.log(`Executing: ${c}`), Ut(c);
    return console.log("Successfully executed registry commands."), { success: !0 };
  } catch (e) {
    return console.error("Error executing registry commands:", e), { success: !1, error: e instanceof Error ? e.message : "Unknown error executing reg.exe" };
  }
}
async function cy() {
  console.log("Starting registration process...");
  let e = !0, t = !1, s = !1, r = !0;
  const l = [];
  if (process.platform === "win32") {
    const i = await iy();
    i.success ? l.push("Application capabilities registered successfully.") : (l.push(`Failed to register application capabilities: ${i.error || "Unknown error"}.`), e = !1);
  }
  for (const i of ns) {
    let o = !1;
    try {
      o = Ee.isDefaultProtocolClient(i);
    } catch (u) {
      console.warn(`Could not check default status for ${i}:`, u), o = !1;
    }
    if (o)
      console.log(`Already default for ${i}.`), l.push(`Already the default handler for ${i}.`);
    else {
      r = !1, console.log(`Attempting to set as default for ${i}...`), t = !0;
      let u = !1;
      try {
        u = Ee.setAsDefaultProtocolClient(i), console.log(`Electron setAsDefaultProtocolClient attempt for ${i} returned: ${u}`);
        let p = !1;
        try {
          p = Ee.isDefaultProtocolClient(i), console.log(`Verification check: Is now default for ${i}? ${p}`);
        } catch (c) {
          console.warn(`Could not verify default status for ${i} after setting attempt:`, c);
        }
        u && p ? l.push(`Successfully set as default handler for ${i}.`) : (e = !1, s = !0, l.push(`Failed to set/verify as default for ${i}. Admin rights or manual setting via Windows Settings likely required.`));
      } catch (p) {
        console.error(`Error during setAsDefaultProtocolClient for ${i}:`, p), e = !1, s = !0, l.push(`Error setting default for ${i}: ${p instanceof Error ? p.message : "Unknown error"}. Admin rights might be needed.`);
      }
    }
  }
  let n = l.join(" ");
  return r && e ? n = "Browser Link is already the default handler and capabilities seem registered." : t && e ? n = "Registration attempt succeeded. Please verify in Windows Settings if needed." : !e && s ? n = "Registration attempt failed, likely due to permissions. Please try running as administrator, or set manually via Windows Settings." : e ? e && !t && (n = "Already default and capabilities registered. No changes made.") : n = "Registration process completed with errors. Check logs and try setting manually via Windows Settings.", console.log("Registration process finished. Result:", {
    success: e,
    requiresAdmin: s && !e,
    // More precise check
    alreadyRegistered: r,
    message: n
  }), {
    success: e,
    requiresAdmin: s && !e,
    alreadyRegistered: r,
    message: n
  };
}
const we = [];
for (let e = 0; e < 256; ++e)
  we.push((e + 256).toString(16).slice(1));
function uy(e, t = 0) {
  return (we[e[t + 0]] + we[e[t + 1]] + we[e[t + 2]] + we[e[t + 3]] + "-" + we[e[t + 4]] + we[e[t + 5]] + "-" + we[e[t + 6]] + we[e[t + 7]] + "-" + we[e[t + 8]] + we[e[t + 9]] + "-" + we[e[t + 10]] + we[e[t + 11]] + we[e[t + 12]] + we[e[t + 13]] + we[e[t + 14]] + we[e[t + 15]]).toLowerCase();
}
const kn = new Uint8Array(256);
let On = kn.length;
function ly() {
  return On > kn.length - 16 && (Rl(kn), On = 0), kn.slice(On, On += 16);
}
const Ku = { randomUUID: Nl };
function dy(e, t, s) {
  var l;
  if (Ku.randomUUID && !e)
    return Ku.randomUUID();
  e = e || {};
  const r = e.random ?? ((l = e.rng) == null ? void 0 : l.call(e)) ?? ly();
  if (r.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, uy(r);
}
function fy() {
  Xe.handle("add-rule", (e, t) => {
    const s = { ...t, id: dy(), isEnabled: t.isEnabled ?? !0 }, r = ke.get("rules", []);
    return ke.set("rules", [...r, s]), console.log("IPC: Added rule:", s), s;
  }), Xe.handle("update-rule", (e, t) => {
    const s = ke.get("rules", []), r = s.findIndex((l) => l.id === t.id);
    return r !== -1 ? (s[r] = t, ke.set("rules", s), console.log("IPC: Updated rule:", t), { success: !0 }) : (console.warn("IPC: Update rule failed - Rule not found:", t.id), { success: !1, error: "Rule not found" });
  }), Xe.handle("delete-rule", (e, t) => {
    const s = ke.get("rules", []), r = s.filter((l) => l.id !== t);
    return r.length !== s.length ? (ke.set("rules", r), console.log("IPC: Deleted rule:", t), { success: !0 }) : (console.warn("IPC: Delete rule failed - Rule not found:", t), { success: !1, error: "Rule not found" });
  });
}
function hy() {
  console.log("Registering IPC handlers..."), Xe.handle("get-settings", () => (console.log("IPC: get-settings"), ke.store)), Xe.handle("set-settings", (e, t) => {
    console.log("IPC: set-settings", t);
    try {
      return ke.set(t), { success: !0 };
    } catch (s) {
      return console.error("Error setting settings via IPC:", s), { success: !1, error: s instanceof Error ? s.message : "Unknown error" };
    }
  }), Xe.handle("get-available-browsers", () => (console.log("IPC: get-available-browsers"), Qp())), Xe.handle("set-default-browser", (e, t) => (console.log("IPC: set-default-browser", (t == null ? void 0 : t.name) ?? "None"), ke.set({
    defaultBrowserPath: (t == null ? void 0 : t.path) ?? null,
    defaultBrowserName: (t == null ? void 0 : t.name) ?? null
  }), { success: !0 })), fy(), Xe.handle("register-as-default-handler", async () => {
    console.log("IPC: register-as-default-handler");
    const e = await cy();
    return console.log("IPC: Registration attempt result:", e), e;
  }), Xe.handle("open-default-apps-settings", async () => {
    console.log("IPC: open-default-apps-settings");
    try {
      return await xu.openExternal("ms-settings:defaultapps"), console.log("Successfully requested opening ms-settings:defaultapps"), { success: !0 };
    } catch (e) {
      return console.error("Error opening default apps settings:", e), { success: !1, error: e instanceof Error ? e.message : "Unknown error" };
    }
  }), console.log("IPC handlers registered.");
}
const my = Fn(import.meta.url), Hu = Q.dirname(my);
if (process.platform !== "darwin") {
  const e = process.argv.find((t) => t.startsWith("http://") || t.startsWith("https://"));
  e && console.log("App likely launched by URL argument:", e);
}
sy();
Ee.whenReady().then(async () => {
  console.log("App is ready."), await Zp();
  const e = process.argv.find((r) => r.startsWith("http://") || r.startsWith("https://"));
  if (e) {
    console.log("Handling startup URL immediately:", e), await za(e), setTimeout(() => Ee.quit(), 500);
    return;
  }
  console.log("App launched normally, creating UI."), oy();
  const t = Q.join(Hu, "preload.js"), s = Ee.isPackaged ? Q.join(Hu, "../dist/renderer/index.html") : "http://localhost:3000";
  vl(t, s), ay(), hy(), console.log("Main process UI initialization complete.");
});
console.log("Main process script started.");
