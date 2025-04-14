import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Settings, Rule, DetectedBrowser, ElectronApi } from '../types/index.js'; // Adjusted path
import { Layout } from './components/Layout.js'; // Use alias
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.js'; // Use alias
import { RulesTab } from './components/tabs/RulesTab.js'; // Use alias
import { BrowsersTab } from './components/tabs/BrowsersTab.js'; // Use alias
import { SettingsTab } from './components/tabs/SettingsTab.js'; // Use alias
import { toast } from 'sonner';
import { Button } from './components/ui/button.js';
import { Globe } from 'lucide-react';

// --- Global Type Augmentation for Electron API ---
declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}

// Placeholder components - Replace with actual implementations
const RulesList: React.FC<{ rules: Rule[], availableBrowsers: DetectedBrowser[], onUpdate: () => void }> = ({ rules, availableBrowsers, onUpdate }) => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-4">
    <h2 className="text-lg font-semibold mb-2">Rules ({rules.length})</h2>
    {/* TODO: Implement rule adding/editing/deleting UI */} 
    <pre className="text-xs overflow-auto max-h-60 bg-gray-100 dark:bg-gray-700 p-2 rounded">{JSON.stringify(rules, null, 2)}</pre>
     <button 
        type="button"
        onClick={onUpdate} 
        className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
     >
         Refresh (Debug)
     </button>
  </div>
);

const SettingsView: React.FC<{ settings: Settings | null, availableBrowsers: DetectedBrowser[], onUpdate: () => void }> = ({ settings, availableBrowsers, onUpdate }) => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
    <h2 className="text-lg font-semibold mb-2">Settings</h2>
    {/* TODO: Implement default browser selection UI */}
    <p className="text-sm">Default Browser: {settings?.defaultBrowserName || 'Not Set'} ({settings?.defaultBrowserPath || 'N/A'})</p>
    <p className="text-sm">Available Browsers: {availableBrowsers.map(b => b.name).join(', ')}</p>
    <button 
        type="button"
        onClick={onUpdate} 
        className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
     >
         Refresh (Debug)
     </button>
  </div>
);

// --- Helper Components ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

interface RuleFormProps {
    initialRule?: Rule | null;
    availableBrowsers: DetectedBrowser[];
    onSave: (rule: Omit<Rule, 'id'> | Rule) => void;
    onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ initialRule, availableBrowsers, onSave, onCancel }) => {
    const [pattern, setPattern] = useState(initialRule?.pattern || '');
    const [patternType, setPatternType] = useState<Rule['patternType']>(initialRule?.patternType || 'includes');
    const [browserPath, setBrowserPath] = useState(initialRule?.browserPath || '');
    const [isEnabled, setIsEnabled] = useState(initialRule?.isEnabled ?? true); // Default to true for new rules

    useEffect(() => {
        // Reset form if initialRule changes (e.g., opening modal for edit)
        setPattern(initialRule?.pattern || '');
        setPatternType(initialRule?.patternType || 'includes');
        setBrowserPath(initialRule?.browserPath || '');
        setIsEnabled(initialRule?.isEnabled ?? true);
    }, [initialRule]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pattern || !browserPath) {
            alert('Pattern and Browser selection are required.');
            return;
        }
        const selectedBrowser = availableBrowsers.find(b => b.path === browserPath);
        if (!selectedBrowser) {
            alert('Selected browser not found.'); // Should not happen with dropdown
            return;
        }
        const ruleData = {
            pattern,
            patternType,
            browserPath,
            browserName: selectedBrowser.name,
            isEnabled
        };

        if (initialRule) {
            onSave({ ...ruleData, id: initialRule.id }); // Pass existing ID for update
        } else {
            onSave(ruleData); // Pass data without ID for creation
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="patternType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                <select
                    id="patternType"
                    value={patternType}
                    onChange={(e) => setPatternType(e.target.value as Rule['patternType'])}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="includes">URL Includes</option>
                    <option value="startsWith">URL Starts With</option>
                    <option value="domain">Domain Is</option>
                    <option value="regex">Regular Expression</option>
                </select>
            </div>
            <div>
                <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pattern</label>
                <input
                    type="text"
                    id="pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder={patternType === 'domain' ? 'example.com' : patternType === 'startsWith' ? 'https://mail.google.com' : patternType === 'regex' ? '^https?:\/\/([^\/]+\.)?github\.com' : 'keyword'}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {patternType === 'domain' && 'Enter the full domain (e.g., google.com, sub.domain.co.uk).'}
                    {patternType === 'startsWith' && 'Enter the full prefix the URL should start with (e.g., https://docs.google.com/).'}
                    {patternType === 'includes' && 'Enter text that should appear anywhere in the URL.'}
                    {patternType === 'regex' && 'Enter a valid JavaScript Regular Expression (case-insensitive flag `i` is added automatically).'}
                 </p>
            </div>
             <div>
                <label htmlFor="browserPath" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Open With</label>
                <select
                    id="browserPath"
                    value={browserPath}
                    onChange={(e) => setBrowserPath(e.target.value)}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select a Browser</option>
                    {availableBrowsers.map(browser => (
                        <option key={browser.path} value={browser.path}>
                            {browser.name} ({browser.path})
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center">
                 <input
                    id="isEnabled"
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Enable this rule
                </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {initialRule ? 'Save Changes' : 'Add Rule'}
                </button>
            </div>
        </form>
    );
};

interface RuleRowProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (rule: Rule) => void;
}

const RuleRow: React.FC<RuleRowProps> = ({ rule, onEdit, onDelete, onToggle }) => {
  return (
    <tr className={`border-b border-gray-200 dark:border-gray-700 ${!rule.isEnabled ? 'opacity-60 bg-gray-100 dark:bg-gray-750' : 'bg-white dark:bg-gray-800'}`}>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-800 dark:text-gray-200">{rule.pattern}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-500">({rule.patternType})</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{rule.browserName}</td>
      <td className="px-4 py-3 text-sm">
        <button
          type="button"
          onClick={() => onToggle({ ...rule, isEnabled: !rule.isEnabled })}
          className={`px-2 py-1 text-xs font-medium rounded-full ${rule.isEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}
        >
          {rule.isEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        <button
          type="button"
          onClick={() => onEdit(rule)}
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(rule.id)}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

// --- Main App Component ---
function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [availableBrowsers, setAvailableBrowsers] = useState<DetectedBrowser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('rules');

  // --- Data Loading --- 
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('App: Fetching data...');
      // Use Promise.allSettled to handle potential errors individually
      const results = await Promise.allSettled([
        window.electronApi.getSettings(),
        window.electronApi.getAvailableBrowsers()
      ]);

      let fetchedSettings: Settings | null = null;
      let fetchedBrowsers: DetectedBrowser[] = [];
      let fetchError: string | null = null;

      if (results[0].status === 'fulfilled') {
          fetchedSettings = results[0].value;
          console.log('App: Fetched settings:', fetchedSettings);
      } else {
          console.error('App: Error fetching settings:', results[0].reason);
          fetchError = `Failed to load settings: ${results[0].reason?.message || 'Unknown error'}`;
      }

      if (results[1].status === 'fulfilled') {
          fetchedBrowsers = results[1].value || [];
          
      } else {
          console.error('App: Error fetching browsers:', results[1].reason);
          const browserError = `Failed to load browsers: ${results[1].reason?.message || 'Unknown error'}`;
          fetchError = fetchError ? `${fetchError}; ${browserError}` : browserError;
          fetchedBrowsers = []; // Ensure it's an empty array on error
      }

      setSettings(fetchedSettings);
      setAvailableBrowsers(fetchedBrowsers);
      setError(fetchError);
      if(fetchError) {
          toast.error(fetchError); // Show toast for loading errors
      }

    } catch (err: unknown) {
      // Catch unexpected errors during the process
      console.error('App: Unexpected error loading data:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to load configuration: ${message}`);
      toast.error(`Failed to load configuration: ${message}`);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Rendering ---
  return (
    <Layout>
      {loading && (
        <div className="flex justify-center items-center pt-10">
           <p className="text-lg text-muted-foreground">Loading configuration...</p>
           {/* TODO: Add a spinner component */}
        </div>
      )}

      {/* Show tabs only when settings are loaded (even if browsers failed) */}
      {!loading && settings && (
           <Tabs
             value={activeTab}
             onValueChange={setActiveTab}
             defaultValue="rules"
             className="w-full"
           >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="browsers">Browsers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="rules">
                  <RulesTab
                      rules={settings.rules || []}
                      availableBrowsers={availableBrowsers}
                      onDataRefresh={loadData}
                  />
              </TabsContent>
              <TabsContent value="browsers">
                  <BrowsersTab
                      settings={settings}
                      availableBrowsers={availableBrowsers}
                      onDataRefresh={loadData}
                  />
              </TabsContent>
              <TabsContent value="settings">
                  <SettingsTab
                      settings={settings}
                      onDataRefresh={loadData}
                  />
              </TabsContent>
            </Tabs>
      )}

       {/* Show general error message if loading finished but settings are null */}
      {!loading && !settings && (
           <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
                <Globe className="h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-medium text-destructive">
                    Failed to load essential settings.
                </p>
                <p className="text-sm text-muted-foreground">
                   {error || "Could not retrieve configuration. Please check logs or restart the application."}
                </p>
                <Button onClick={() => loadData(true)} variant="outline" className="mt-4">
                    Retry Loading
                </Button>
            </div>
      )}

    </Layout>
  );
}

export default App; 