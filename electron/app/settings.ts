// electron/app/settings.ts
// Initializes and exports the electron-store instance. 
import ElectronStore from 'electron-store';
import type { Settings } from '../../types/index.js'; // Adjusted path

// Define the schema object. Type will be inferred by ElectronStore constructor.
const schemaDefinition = {
  defaultBrowserPath: {
    type: ['string', 'null'] as const, // Use 'as const' for stricter type inference
    default: null
  },
  defaultBrowserName: {
    type: ['string', 'null'] as const,
    default: null
  },
  rules: {
    type: 'array' as const,
    default: [],
    items: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' as const },
        pattern: { type: 'string' as const },
        patternType: { type: 'string' as const, enum: ['domain', 'startsWith', 'includes', 'regex'] as const },
        browserPath: { type: 'string' as const },
        browserName: { type: 'string' as const },
        isEnabled: { type: 'boolean' as const }
      },
      required: ['id', 'pattern', 'patternType', 'browserPath', 'browserName', 'isEnabled'] as const
    }
  }
};

// Pass the schema object, let the constructor handle typing
const store = new ElectronStore<Settings>({ schema: schemaDefinition, watch: true });

// Store instance should now be correctly typed as ElectronStore<Settings>
const typedStore = store;

// Export the typed store instance for use in other modules
export { typedStore }; 