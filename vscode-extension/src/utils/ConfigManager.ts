import * as vscode from 'vscode';

export class ConfigManager {
  private readonly configSection = 'linkity';
  
  get<T>(key: string, defaultValue: T): T {
    return vscode.workspace.getConfiguration(this.configSection).get<T>(key, defaultValue);
  }
  
  isEnabled(): boolean {
    return this.get<boolean>('enabled', true);
  }
  
  getRootFolder(): string {
    return this.get<string>('rootFolder', './');
  }
  
  getLinkResolution(): 'firstMatch' | 'mostSpecific' | 'interactive' {
    return this.get<'firstMatch' | 'mostSpecific' | 'interactive'>('linkResolution', 'mostSpecific');
  }
  
  getAutoGenerateReferences(): boolean {
    return this.get<boolean>('autoGenerateReferences', false);
  }
  
  getReferenceFormat(): 'markdown' | 'inline' {
    return this.get<'markdown' | 'inline'>('referenceFormat', 'markdown');
  }
  
  getEnableBacklinks(): boolean {
    return this.get<boolean>('enableBacklinks', true);
  }
  
  getEnableGraph(): boolean {
    return this.get<boolean>('enableGraph', true);
  }
  
  getExcludePatterns(): string[] {
    return this.get<string[]>('excludePatterns', ['node_modules', '.git', 'dist']);
  }
  
  getValidationSeverity(): 'error' | 'warning' | 'info' | 'hint' {
    return this.get<'error' | 'warning' | 'info' | 'hint'>('validationSeverity', 'warning');
  }
  
  onDidChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.configSection)) {
        callback();
      }
    });
  }
}
