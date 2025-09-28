## Browser Link Knowledge Pack
- **Purpose:** Electron desktop app that registers as the OS default HTTP/HTTPS handler, then forwards URLs to the correct installed browser based on saved rules.
- **Processes:** Electron main process handles detection, routing, registry integration; React/Tailwind renderer (`src/`) provides management UI via IPC calls.

## Runtime Flow
- **Entry:** `electron/main.ts` acquires the single-instance lock, calls `updateAvailableBrowsers()` before creating windows, and short-circuits to `handleUrl()` when launched with a URL argument.
- **URL dispatch:** `handleUrl()` in `electron/app/browsers.ts` reads rules from `typedStore`, matches the first enabled rule, and launches the browser via `open`. Falls back to the default browser configured in settings.
- **Second launches:** `electron/app/lifecycle.ts` listens for `second-instance`/`open-url` events, forwarding URLs without creating duplicate windows.

## Persistence & Types
- **Store:** `electron/app/settings.ts` wraps `electron-store` with a schema. When adding settings, update the schema defaults and `types/Settings`.
- **Shared contracts:** `types/index.ts` houses `Rule`, `Settings`, and `ElectronApi`. Keep types, preload implementation, and renderer usage in sync.

## IPC Surface
- **Registration:** `registerIpcHandlers()` in `electron/app/ipc.ts` wires settings, browser detection, rules, and default-handler calls.
- **Exposure:** `electron/preload.ts` implements the `ElectronApi` defined in `types/index.ts` and exposes it via `contextBridge`. New IPC endpoints require edits in all three spots.
- **Rules:** `electron/app/rules.ts` adds UUIDs, updates, and deletes rules; renderer tabs call these helpers and refresh via `onDataRefresh`.

## Browser Detection & Default Handler
- **Detection:** `electron/browser-detector.ts` checks common paths/registry (Windows) or platform-specific queries, then enriches each entry with a base64 icon using `app.getFileIcon`.
- **Registration:** `electron/app/registry.ts` executes Windows `reg.exe` commands using constants from `electron/app/config.ts`, then calls `app.setAsDefaultProtocolClient`. Expect permission prompts and surface errors through IPC.

## Renderer Patterns
- **Stack:** React + Tailwind + Radix-based UI primitives under `src/components/ui`. Components live in `.tsx` files but are imported with `.js` extensions because `tsconfig` uses `module: NodeNext` under `"type": "module"`; follow this convention for new imports.
- **Data flow:** `src/App.tsx` coordinates tabs (`RulesTab`, `BrowsersTab`, `SettingsTab`) that all call `window.electronApi.*` methods and then trigger `onDataRefresh()` to keep settings in sync.
- **Feedback:** Use `sonner` toasts for success/error messaging; existing mutations assume toasts on success and failure handlers.

## Tooling & Scripts
- **Install:** `bun install`.
- **Dev loop:** `bun run dev` (Vite dev server + `vite-plugin-electron` rebuilds main/preload entries).
- **Build:** `bun run build` outputs renderer to `dist/renderer` and main/preload bundles to `dist-electron/`.
- **Package:** `bun run package` runs the build then `electron-builder`; `bun run release` publishes installers.
- **Lint:** `bun run lint` uses ESLint with TypeScript support.

## Conventions & Tips
- **Window management:** Always go through `createWindow()` in `electron/app/window.ts`; the helper handles preload wiring and devtools.
- **Rule engine:** `handleUrl()` expects `availableBrowsers` to be primed via `updateAvailableBrowsers()`; refresh detection when introducing new OS checks.
- **Settings:** Add new toggles by updating `typedStore` schema defaults, the `Settings` interface, IPC handlers (`set-settings`), and renderer toggles.
- **Protocols:** `PROTOCOLS_TO_HANDLE` in `electron/app/config.ts` lists handled schemes; extend it before registering new protocols.
- **Icons:** `BrowserIconDisplay` takes the `iconDataUrl` provided by detection; degrade gracefully if the icon lookup fails.
