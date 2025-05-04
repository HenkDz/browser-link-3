// electron/app/menu.ts
// Contains the logic for building the application menu.
import { app, Menu, shell } from 'electron';

/**
 * Creates and sets the application menu.
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...((process.platform === 'darwin') ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        (process.platform === 'darwin') ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' as const },
          { role: 'front' as const },
          { type: 'separator' as const },
          { role: 'window' as const }
        ] : [
          { role: 'close' as const }
        ])
      ]
    },
    {
      role: 'help' as const,
      submenu: [
        {
          label: 'Learn More (GitHub)',
          click: async () => {
            // TODO: Update this link to the actual repository URL
            await shell.openExternal('https://github.com/HenkDz/browser-link-3');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

export { createMenu }; 