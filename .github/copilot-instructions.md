## Copilot Instructions for browser-link-3

**Project Goal:**
Create a robust desktop application using Electron that functions as the system's default browser. Its primary purpose is **not** to render web pages, but to intercept URL requests from the operating system and route them to different installed web browsers based on user-defined rules. If no rule matches, the URL should be opened in a user-specified default browser.

**Core Requirements:**
- **Act as Default Browser:** The application must be able to register itself as the default HTTP/HTTPS handler with the operating system.
- **Intercept URLs:** Capture all URL open requests directed to it by the OS.
- **Rule Engine:** Implement logic to match intercepted URLs against a list of user-defined rules (e.g., based on domain, path patterns).
- **Browser Detection & Launching:** Detect installed browsers on the user's system and launch the target browser with the intercepted URL. The `open` npm package is a likely candidate for launching.
- **Rule Management:** Provide a mechanism (likely a simple UI) for users to create, edit, delete, and enable/disable routing rules.
- **Settings:** Allow users to configure the application, including selecting the fallback default browser.
- **Persistence:** Store rules and settings persistently, likely using `electron-store`.

**Suggested Tech Stack (Flexible):**
- **Electron:** Essential for desktop integration, OS-level interactions (like setting default browser), and running the core logic.
- **TypeScript:** Recommended for type safety in both main and potential renderer processes.
- **Persistence:** `electron-store` or similar for saving rules/settings.
- **UI Framework (Optional):** React, Vue, Svelte, or even plain HTML/CSS/JS could be used for the rule management interface if needed. Tailwind CSS could be used for styling.
- **State Management (If UI is complex):** Zustand, Redux, etc., might be useful depending on the UI choice.

**Conceptual Structure:**
- **Main Process (Electron):** This is critical. It will handle:
    - Application lifecycle.
    - Registering as the default browser.
    - Intercepting URL arguments passed by the OS upon launch.
    - Loading rules and settings from storage.
    - Implementing the rule matching logic.
    - Detecting and launching target browsers.
    - IPC communication if a separate renderer process is used for UI.
- **Renderer Process (Optional UI):** If a dedicated UI for managing rules/settings is built:
    - Display current rules and settings.
    - Provide forms/controls for editing.
    - Communicate with the main process via IPC (exposed via a `preload.ts` script) to load/save data.

**Key Development Considerations:**
- **OS Integration:** Research and implement the correct methods for registering as the default browser on different operating systems (Windows, macOS, Linux). This is non-trivial.
- **URL Argument Handling:** Ensure the application correctly parses the URL passed as a command-line argument when launched by the OS.
- **Rule Matching Logic:** Design a flexible and efficient pattern-matching system for the rules.
- **Error Handling:** Gracefully handle cases where a target browser isn't found or fails to launch.
- **Security:** Use `contextBridge` in `preload.ts` if IPC is needed for a UI, following Electron security best practices.

**Focus Areas:**
1.  Reliable OS default browser registration and URL interception.
2.  Efficient rule matching and browser launching logic within the Electron main process.
3.  Persistent storage of rules and settings.
4.  A clear (even if basic) way for users to manage rules.
