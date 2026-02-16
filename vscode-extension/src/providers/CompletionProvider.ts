import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceScanner } from '../services/WorkspaceScanner';
import { ConfigManager } from '../utils/ConfigManager';

export class WikilinkCompletionProvider implements vscode.CompletionItemProvider {
  constructor(
    private scanner: WorkspaceScanner,
    private config: ConfigManager
  ) {}
  
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[]> {
    if (document.languageId !== 'markdown') {
      return [];
    }
    
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    
    // Trigger only after [[
    if (!linePrefix.endsWith('[[')) {
      return [];
    }
    
    const files = this.scanner.getAllFiles();
    const items: vscode.CompletionItem[] = [];
    
    for (const uri of files) {
      const basename = path.basename(uri.fsPath, '.md');
      const relativePath = vscode.workspace.asRelativePath(uri);
      
      const item = new vscode.CompletionItem(basename, vscode.CompletionItemKind.File);
      item.insertText = basename;
      item.detail = relativePath;
      item.documentation = new vscode.MarkdownString(`Link to \`${relativePath}\``);
      
      // Add sortText to prioritize closer files
      const sourceDir = path.dirname(document.uri.fsPath);
      const targetDir = path.dirname(uri.fsPath);
      const depth = path.relative(sourceDir, targetDir).split(path.sep).length;
      item.sortText = `${depth.toString().padStart(3, '0')}_${basename}`;
      
      items.push(item);
    }
    
    return items;
  }
}
