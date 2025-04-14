import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import type { Rule, DetectedBrowser } from '../../../types/index.js';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Switch } from '../ui/switch.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog.js";
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";

interface RulesTabProps {
  rules: Rule[];
  availableBrowsers: DetectedBrowser[];
  onDataRefresh: () => Promise<void>;
}

interface RuleFormProps {
  initialRule?: Rule | null;
  availableBrowsers: DetectedBrowser[];
  onSave: (rule: Omit<Rule, 'id'> | Rule) => Promise<boolean>;
  onCancel: () => void;
}

// Define match type options for mapping
const matchTypeOptions: { value: Rule['patternType']; label: string }[] = [
    { value: 'includes', label: 'URL Includes' },
    { value: 'startsWith', label: 'URL Starts With' },
    { value: 'domain', label: 'Domain Is' },
    { value: 'regex', label: 'Regex' },
];

// --- Rule Form Component (inside Dialog) ---
const RuleForm: React.FC<RuleFormProps> = ({ initialRule, availableBrowsers, onSave, onCancel }) => {
    const [pattern, setPattern] = useState(initialRule?.pattern || '');
    const [patternType, setPatternType] = useState<Rule['patternType']>(initialRule?.patternType || 'includes');
    const [browserPath, setBrowserPath] = useState(initialRule?.browserPath || '');
    const [isEnabled, setIsEnabled] = useState(initialRule?.isEnabled ?? true);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when initialRule changes (when dialog opens for edit/add)
    useEffect(() => {
        setPattern(initialRule?.pattern || '');
        setPatternType(initialRule?.patternType || 'includes');
        setBrowserPath(initialRule?.browserPath || '');
        setIsEnabled(initialRule?.isEnabled ?? true);
        setIsSaving(false); // Reset saving state
    }, [initialRule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pattern || !browserPath) {
            toast.error("Pattern and Browser selection are required.");
            return;
        }
        const selectedBrowser = availableBrowsers.find(b => b.path === browserPath);
        if (!selectedBrowser) {
             toast.error("Selected browser not found.");
            return;
        }

        setIsSaving(true);
        const ruleData = {
            pattern,
            patternType,
            browserPath,
            browserName: selectedBrowser.name,
            isEnabled
        };

        const success = initialRule
            ? await onSave({ ...ruleData, id: initialRule.id })
            : await onSave(ruleData);

        setIsSaving(false);
        if (success) {
            // Dialog close handled by parent
        } else {
            // Error toast is shown by the parent's handler
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pattern Type Buttons (using individual Buttons) */}
            <div>
                <Label className="mb-2 block">Match Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                    {matchTypeOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            variant={patternType === option.value ? "default" : "outline"}
                            onClick={() => setPatternType(option.value)}
                            className="whitespace-normal px-3 py-1.5"
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>
            {/* Pattern Input */}
            <div>
                <Label htmlFor="rule-pattern" className="mb-2 block">Pattern</Label>
                <Input
                    id="rule-pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder={patternType === 'domain' ? 'example.com' : patternType === 'startsWith' ? 'https://mail.google.com' : patternType === 'regex' ? '^https?:\/\/([^\/]+\.)?github\.com' : 'keyword'}
                    required
                />
                 <p className="mt-1 text-xs text-muted-foreground">
                    {patternType === 'domain' && 'Enter the full domain (e.g., google.com, sub.domain.co.uk).'}
                    {patternType === 'startsWith' && 'Enter the full prefix the URL should start with (e.g., https://docs.google.com/).'}
                    {patternType === 'includes' && 'Enter text that should appear anywhere in the URL.'}
                    {patternType === 'regex' && 'Enter a valid JS Regex (case-insensitive flag `i` added automatically by backend).'}
                 </p>
            </div>
             {/* Browser Select */}
             <div>
                <Label htmlFor="rule-browserPath" className="mb-2 block">Open With</Label>
                 <Select value={browserPath} onValueChange={setBrowserPath} required>
                    <SelectTrigger id="rule-browserPath">
                        <SelectValue placeholder="Select a Browser">
                            {browserPath ? availableBrowsers.find(b => b.path === browserPath)?.name : 'Select a Browser'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {availableBrowsers.map(browser => (
                            <Tooltip key={browser.path} delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <SelectItem value={browser.path}>
                                        {browser.name}
                                    </SelectItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    <p className="text-xs">{browser.path}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                         {availableBrowsers.length === 0 && <SelectItem value="" disabled>No browsers detected</SelectItem>}
                    </SelectContent>
                </Select>
            </div>
            {/* Is Enabled Switch */}
            <div className="flex items-center space-x-2 pt-2">
                 <Switch
                    id="rule-isEnabled"
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                />
                <Label htmlFor="rule-isEnabled">Enable this rule</Label>
            </div>
            {/* Form Actions */}
            <DialogFooter className="pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                 </DialogClose>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : (initialRule ? 'Save Changes' : 'Add Rule')}
                </Button>
            </DialogFooter>
        </form>
    );
};

// --- Rules Tab Component ---
export function RulesTab({ rules, availableBrowsers, onDataRefresh }: RulesTabProps) {
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<Rule | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleApiAction = useCallback(async <T extends (...args: any[]) => Promise<any>>(
    action: T,
    ...args: Parameters<T>
  ): Promise<boolean> => {
    try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const result = await action(...(args as any[])); // Keep explicit 'as any[]' for now

        let success = false;
        let message = 'Action completed.';
        let errorMsg: string | undefined = undefined;

        if (typeof result === 'object' && result !== null && 'success' in result && typeof result.success === 'boolean') {
            success = result.success;
            message = (result as { message?: string }).message || (success ? 'Action successful!' : 'Action failed.');
            errorMsg = (result as { error?: string }).error;
        } else if (typeof result === 'object' && result !== null && 'id' in result && typeof (result as { id: unknown }).id === 'string') {
            success = true;
            message = 'Rule saved successfully!';
        } else {
            console.warn("Unexpected API response structure:", result);
            success = false;
            message = 'Action completed with unexpected result.';
        }

        if (success) {
            toast.success(message);
            await onDataRefresh();
        } else {
            throw new Error(errorMsg || message || 'An API error occurred.');
        }
        return success;
    } catch (err) {
        console.error('API Action Error:', err);
        const description = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast.error('API Error', { description: description });
        return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDataRefresh]);

  const handleSaveRule = useCallback(async (ruleData: Omit<Rule, 'id'> | Rule): Promise<boolean> => {
      const action = 'id' in ruleData ? window.electronApi.updateRule : window.electronApi.addRule;
      const success = await handleApiAction(action, ruleData); // Removed 'as any' here as function accepts it
      if (success) {
          setIsRuleDialogOpen(false);
          setRuleToEdit(null);
      }
      return success;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleApiAction]);

  const handleDeleteRule = useCallback(async (ruleId: string) => {
    await handleApiAction(window.electronApi.deleteRule, ruleId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleApiAction]);

  const handleToggleRule = useCallback(async (rule: Rule) => {
      const updatedRule = { ...rule, isEnabled: !rule.isEnabled };
      await handleApiAction(window.electronApi.updateRule, updatedRule);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleApiAction]);

  const openAddRuleDialog = () => {
    setRuleToEdit(null);
    setIsRuleDialogOpen(true);
  };

  const openEditRuleDialog = (rule: Rule) => {
    setRuleToEdit(rule);
    setIsRuleDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>URL Routing Rules</CardTitle>
                <CardDescription>Manage rules to open specific URLs in designated browsers.</CardDescription>
            </div>
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openAddRuleDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Rule
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{ruleToEdit ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
                        <DialogDescription>
                            {ruleToEdit ? 'Modify the details for this rule.' : 'Define a pattern and select a browser to handle matching URLs.'}
                        </DialogDescription>
                    </DialogHeader>
                    <RuleForm
                        initialRule={ruleToEdit}
                        availableBrowsers={availableBrowsers}
                        onSave={handleSaveRule}
                        onCancel={() => setIsRuleDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules && rules.length > 0 ? (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between space-x-4 rounded-lg border p-4 ${!rule.isEnabled ? 'opacity-60 bg-muted/50' : ''}`}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {rule.pattern}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">({rule.patternType})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                    &rarr; 
                      {(() => {
                        const browser = availableBrowsers.find(b => b.path === rule.browserPath);
                        return browser?.iconDataUrl ? (
                          <img
                            src={browser.iconDataUrl}
                            alt={`${browser.name} icon`}
                            className="inline-block w-4 h-4 mr-1 ml-1 align-middle"
                          />
                        ) : null;
                      })()}
                       {rule.browserName || 'Unknown Browser'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={() => handleToggleRule(rule)}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-red-500"
                        aria-label={rule.isEnabled ? 'Disable rule' : 'Enable rule'}
                      />
                    <Tooltip>
                       <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEditRuleDialog(rule)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Rule</p>
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                         <TooltipContent>
                            <p>Delete Rule</p>
                        </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed p-8 text-center">
                <Globe className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  No rules added yet.
                </p>
                <p className="text-xs text-muted-foreground">
                    Click "Add New Rule" to get started.
                 </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 