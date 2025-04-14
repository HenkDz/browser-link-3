// electron/app/rules.ts
// Manages rule-specific logic and IPC handlers.
import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import type { Rule } from '../../types/index.js'; // Adjusted path (Removed Omit)
import { typedStore } from './settings.js'; // Import store

/**
 * Registers IPC handlers related to rule management.
 */
function registerRuleHandlers(): void {
  ipcMain.handle('add-rule', (event, rule: Rule) => {
    const newRule: Rule = { ...rule, id: uuidv4(), isEnabled: rule.isEnabled ?? true };
    const rules = typedStore.get('rules', []);
    typedStore.set('rules', [...rules, newRule]);
    console.log('IPC: Added rule:', newRule);
    return newRule;
  });

  ipcMain.handle('update-rule', (event, ruleToUpdate: Rule) => {
    const rules = typedStore.get('rules', []);
    const index = rules.findIndex(r => r.id === ruleToUpdate.id);
    if (index !== -1) {
      rules[index] = ruleToUpdate;
      typedStore.set('rules', rules);
      console.log('IPC: Updated rule:', ruleToUpdate);
      return { success: true };
    }
    console.warn('IPC: Update rule failed - Rule not found:', ruleToUpdate.id);
    return { success: false, error: 'Rule not found' };
  });

  ipcMain.handle('delete-rule', (event, ruleId: string) => {
    const rules = typedStore.get('rules', []);
    const newRules = rules.filter(r => r.id !== ruleId);
    if (newRules.length !== rules.length) {
      typedStore.set('rules', newRules);
      console.log('IPC: Deleted rule:', ruleId);
      return { success: true };
    }
    console.warn('IPC: Delete rule failed - Rule not found:', ruleId);
    return { success: false, error: 'Rule not found' };
  });
}

export { registerRuleHandlers }; 