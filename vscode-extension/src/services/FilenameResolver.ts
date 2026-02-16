import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceScanner } from './WorkspaceScanner';
import { ConfigManager } from '../utils/ConfigManager';

export interface ResolveOptions {
  sourceFileUri?: vscode.Uri;
  strategy?: 'firstMatch' | 'mostSpecific' | 'interactive';
}

export class FilenameResolver {
  constructor(
    private scanner: WorkspaceScanner,
    private config: ConfigManager
  ) {}
  
  /**
   * Resolve a wikilink target to an absolute file URI (async version with interactive picker support)
   */
  async resolveAsync(target: string, options: ResolveOptions = {}): Promise<vscode.Uri | null> {
    // Remove .md extension if present for consistent matching
    const basename = target.endsWith('.md') ? target.slice(0, -3) : target;
    
    const matches = this.scanner.getFilesMatching(basename);
    
    if (matches.length === 0) {
      return null;
    }
    
    if (matches.length === 1) {
      return matches[0];
    }
    
    // Multiple matches - use resolution strategy
    const strategy = options.strategy || this.config.getLinkResolution();
    
    switch (strategy) {
      case 'firstMatch':
        return matches[0];
      
      case 'mostSpecific':
        return this.resolveMostSpecific(matches, options.sourceFileUri);
      
      case 'interactive':
        // Show interactive picker for ambiguous matches
        return await this.showInteractivePicker(matches, options.sourceFileUri);
      
      default:
        return matches[0];
    }
  }
  
  /**
   * Show an interactive picker for ambiguous wikilink targets
   */
  private async showInteractivePicker(
    matches: vscode.Uri[],
    sourceUri?: vscode.Uri
  ): Promise<vscode.Uri | null> {
    // Create quick pick items with display labels and descriptions
    const items = matches.map(uri => {
      const relativePath = sourceUri 
        ? path.relative(path.dirname(sourceUri.fsPath), uri.fsPath)
        : uri.fsPath;
      
      return {
        label: path.basename(uri.fsPath),
        description: relativePath,
        uri
      };
    });
    
    // Show quick pick dialog
    const selected = await vscode.window.showQuickPick(items, {
      title: `Multiple files found for wikilink`,
      placeHolder: 'Select the target file',
      matchOnDescription: true
    });
    
    return selected?.uri || null;
  }
  
  /**
   * Resolve a wikilink target to an absolute file URI (sync version - falls back to mostSpecific for ambiguous)
   */
  resolve(target: string, options: ResolveOptions = {}): vscode.Uri | null {
    // Remove .md extension if present for consistent matching
    const basename = target.endsWith('.md') ? target.slice(0, -3) : target;
    
    const matches = this.scanner.getFilesMatching(basename);
    
    if (matches.length === 0) {
      return null;
    }
    
    if (matches.length === 1) {
      return matches[0];
    }
    
    // Multiple matches - use resolution strategy
    const strategy = options.strategy || this.config.getLinkResolution();
    
    switch (strategy) {
      case 'firstMatch':
        return matches[0];
      
      case 'mostSpecific':
        return this.resolveMostSpecific(matches, options.sourceFileUri);
      
      case 'interactive':
        // Interactive picker for ambiguous matches
        // When multiple files match a link, show window.showQuickPick() UI
        // For now, falls back to mostSpecific strategy
        // TODO: Implement window.showQuickPick() UI for user selection
        // See: work-item-08-feature-enhancements.md for implementation
        return this.resolveMostSpecific(matches, options.sourceFileUri);
      
      default:
        return matches[0];
    }
  }
  
  /**
   * Choose the file with the shortest relative path from source
   */
  private resolveMostSpecific(
    matches: vscode.Uri[],
    sourceUri?: vscode.Uri
  ): vscode.Uri {
    if (!sourceUri) {
      // No source context - choose file with shortest absolute path
      return matches.reduce((shortest, current) => 
        current.fsPath.length < shortest.fsPath.length ? current : shortest
      );
    }
    
    const sourceDir = path.dirname(sourceUri.fsPath);
    
    // Find file with shortest relative path from source
    let bestMatch = matches[0];
    let shortestPath = path.relative(sourceDir, bestMatch.fsPath);
    
    for (let i = 1; i < matches.length; i++) {
      const relativePath = path.relative(sourceDir, matches[i].fsPath);
      if (relativePath.length < shortestPath.length) {
        bestMatch = matches[i];
        shortestPath = relativePath;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Resolve with anchor support
   */
  resolveWithAnchor(target: string, anchor: string | undefined, options: ResolveOptions = {}): {
    uri: vscode.Uri | null;
    anchor?: string;
  } {
    const uri = this.resolve(target, options);
    return { uri, anchor };
  }

  /**
   * Resolve with anchor support (async version with interactive picker)
   */
  async resolveWithAnchorAsync(
    target: string,
    anchor: string | undefined,
    options: ResolveOptions = {}
  ): Promise<{ uri: vscode.Uri | null; anchor?: string }> {
    const uri = await this.resolveAsync(target, options);
    return { uri, anchor };
  }
  
  /**
   * Suggest similar files for typo correction
   */
  suggestSimilar(target: string, maxResults: number = 5): vscode.Uri[] {
    const allFiles = this.scanner.getAllFiles();
    const targetLower = target.toLowerCase();
    
    // Simple similarity: files containing the target substring
    const similar = allFiles
      .filter(uri => {
        const basename = path.basename(uri.fsPath, '.md').toLowerCase();
        return basename.includes(targetLower) || this.levenshtein(basename, targetLower) <= 3;
      })
      .slice(0, maxResults);
    
    return similar;
  }
  
  /**
   * Simple Levenshtein distance for typo detection
   */
  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
}
