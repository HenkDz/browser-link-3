import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as electronPlugin from 'vite-plugin-electron';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { Plugin } from 'vite';

interface ElectronOnStartOptions {
  reload: () => void;
}

// Access the default export from the namespace, with a type guard
const electron = typeof electronPlugin === 'function' 
    ? electronPlugin 
    : (electronPlugin as { default?: unknown }).default ?? electronPlugin;

// Add a check to ensure electron is callable, provide fallback if not
const electronCallable = typeof electron === 'function' ? electron : () => [];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    electronCallable([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options: ElectronOnStartOptions) {
          options.reload();
        },
      },
      {
        entry: 'electron/browser-detector.ts',
      },
    ]) as Plugin[],
  ],
  // Optional: Configure base path if not serving from root
  // base: '/',
  // Optional: Configure server port
  server: {
    port: 3000, // Default Vite port
    strictPort: true, // Exit if port is already in use
  },
  build: {
    // Output directory relative to project root
    outDir: 'dist/renderer',
    emptyOutDir: true,
    // Optional: Tell Vite that the Electron plugin handles the main/preload build
    // rollupOptions: {
    //   external: ['electron'], 
    // },
  },
}); 