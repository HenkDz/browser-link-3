# Browser Link - Smart Browser Chooser

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/HenkDz/browser-link-3) <!-- Placeholder -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Placeholder -->

**Tired of manually switching browsers for different websites or tasks? Browser Link intercepts web links and intelligently routes them to the right browser based on your custom rules.**

## The Problem

Many of us use multiple web browsers for various reasons:
*   Work vs. Personal browsing
*   Specific web apps that work better in certain browsers
*   Development and testing across different rendering engines
*   Keeping specific accounts or sessions isolated

Manually copying and pasting links or constantly changing your default browser is tedious and inefficient.

## The Solution

Browser Link acts as your system's default HTTP/HTTPS handler. When you click a link:
1.  Browser Link intercepts the URL.
2.  It checks your configured rules (e.g., "Open `*.workdomain.com` in Chrome", "Open `trello.com` in Firefox").
3.  It launches the designated browser with the URL.
4.  If no rule matches, it can open the URL in a default browser of your choice.

## Features

*   **Automatic Browser Detection:** Detects installed browsers on your system.
*   **Rule-Based Routing:** Define flexible rules based on URL patterns (domains, keywords, etc.) to choose the right browser.
*   **Simple UI:** An easy-to-use interface (built with Electron and a web frontend) to manage your browsers and routing rules.
*   **Set as Default Handler:** Registers itself to handle `http://` and `https://` links system-wide (requires appropriate permissions).
*   **Single Instance:** Ensures only one instance runs, handling subsequent link clicks gracefully.
*   **Cross-Platform (Goal):** Built with Electron, aiming for compatibility with Windows, macOS, and Linux.

## How it Works

1.  **Installation & Setup:** Install the application and grant it permission to be the default handler for web links.
2.  **Configuration:** Use the app's UI to view detected browsers and create your routing rules.
3.  **Click a Link:** Click any `http://` or `https://` link in any application.
4.  **Interception:** Browser Link intercepts the request before your standard default browser does.
5.  **Rule Matching:** It evaluates your rules against the clicked URL.
6.  **Launch:** It launches the specified browser (based on the matching rule or the default fallback) with the URL.

## Installation

*(Instructions to be added once packaging/distribution is set up. Likely involves downloading a release from GitHub.)*

## Development

To run or contribute to Browser Link locally:

**Prerequisites:**
*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

**Steps:**
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HenkDz/browser-link-3.git # Replace with actual repo URL
    cd browser-link-3
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the development server:**
    *(This command might vary based on your `package.json` scripts)*
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This should typically start the Vite/React frontend dev server and the Electron main process concurrently.

4.  **Build the application:**
    *(This command might vary based on your `package.json` scripts)*
    ```bash
    npm run build
    # or
    yarn build
    ```
    This will compile the frontend and package the Electron application for your current platform.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
*(Add more specific contribution guidelines if desired)*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. *(Ensure you add a LICENSE file)* 