Development Plan & Progress:
[x] Phase 1: Project Setup
    [x] Initialize npm & package.json
    [x] Install core dependencies (electron, typescript, electron-store, open)
    [x] Install dev dependencies (@types/node, @types/electron, ts-node, electron-builder, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint)
    [x] Configure tsconfig.json for the main process
    [x] Create basic directory structure (electron/, types/)
    [x] Create .gitignore
    [x] Create .eslintrc.json
    [x] Add basic package.json scripts (start, build, lint)
[ ] Phase 2: Electron Main Process Basics
    [ ] Create electron/main.ts
    [ ] Implement basic app lifecycle (app.whenReady, app.on('window-all-closed'), quit handlers)
    [ ] Create a minimal, hidden BrowserWindow (useful for background tasks and potential future UI)
[ ] Phase 3: Default Browser Registration & URL Interception
    [ ] Implement app.setAsDefaultProtocolClient for http and https
    [ ] Handle app.on('open-url') (macOS and when app is running)
    [ ] Handle process.argv for initial launch URL (Windows/Linux)
    [ ] Consolidate URL handling logic
[ ] Phase 4: Browser Detection
    [ ] Create electron/browser-detector.ts
    [ ] Implement browser detection logic (OS-specific stubs, starting with common paths)
[ ] Phase 5: Rule Engine & Storage
    [ ] Define types (Rule, Settings, DetectedBrowser) in types/index.ts
    [ ] Integrate electron-store in electron/storage.ts (or main.ts) for rules/settings
    [ ] Implement rule matching logic in electron/router.ts (or main.ts)
[ ] Phase 6: URL Launching
    [ ] Integrate open package in the routing logic
    [ ] Implement launching logic based on matched rule or default browser setting
[ ] Phase 7: Basic UI for Management (Optional - Deferred)
We can add this later if needed. For now, focus on the core routing.
[ ] Phase 8: Refinement & Packaging
    [ ] Add basic application menu (needed for standard actions like Quit)
    [ ] Improve error handling and add basic logging
    [ ] Configure electron-builder in package.json or electron-builder.yml
    [ ] Test thoroughly on target OS(es)