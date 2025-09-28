# Development Plan & Progress

[x] Phase 1: Project Setup
    [x] Initialize npm & package.json
    [x] Install core dependencies (electron, typescript, electron-store, open)
    [x] Install dev dependencies (@types/node, @types/electron, ts-node, electron-builder, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint)
    [x] Configure tsconfig.json for the main process
    [x] Create basic directory structure (electron/, types/)
    [x] Create .gitignore
    [x] Create .eslintrc.json
    [x] Add basic package.json scripts (start, build, lint)
[x] Phase 2: Electron Main Process Basics
    [x] Create electron/main.ts
    [x] Implement basic app lifecycle (app.whenReady, app.on('window-all-closed'), quit handlers)
    [x] Create a minimal, hidden BrowserWindow (useful for background tasks and potential future UI)
[x] Phase 3: Default Browser Registration & URL Interception
    [x] Implement app.setAsDefaultProtocolClient for http and https
    [x] Handle app.on('open-url') (macOS and when app is running)
    [x] Handle process.argv for initial launch URL (Windows/Linux)
    [x] Consolidate URL handling logic
[x] Phase 4: Browser Detection
    [x] Create electron/browser-detector.ts
    [x] Implement browser detection logic (OS-specific stubs, starting with common paths)
[x] Phase 5: Rule Engine & Storage
    [x] Define types (Rule, Settings, DetectedBrowser) in types/index.ts
    [x] Integrate electron-store in electron/storage.ts (or main.ts) for rules/settings
    [x] Implement rule matching logic in electron/router.ts (or main.ts)
[x] Phase 6: URL Launching
    [x] Integrate open package in the routing logic
    [x] Implement launching logic based on matched rule or default browser setting
[x] Phase 7: Basic UI for Management (Optional - Deferred)
We can add this later if needed. For now, focus on the core routing.
[x] Phase 8: Refinement & Packaging
    [x] Add basic application menu (needed for standard actions like Quit)
    [x] Improve error handling and add basic logging
    [x] Configure electron-builder in package.json or electron-builder.yml
    [x] Test thoroughly on target OS(es)
