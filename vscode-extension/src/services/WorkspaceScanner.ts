import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigManager } from '../utils/ConfigManager';
import { minimatch } from 'minimatch';

export class WorkspaceScanner {
  private fileIndex: Map<string, vscode.Uri[]> = new Map();
  private allFiles: vscode.Uri[] = [];
  private watcher: vscode.FileSystemWatcher | null = null;
  
  constructor(private config: ConfigManager) {}
  
  async scanWorkspace(): Promise<void> {
    const startTime = Date.now();
    this.fileIndex.clear();
    this.allFiles = [];
    
    // Find all markdown files
    const files = await vscode.workspace.findFiles(
      '**/*.md',
      this.getExcludeGlob()
    );
    
    for (const uri of files) {
      this.indexFile(uri);
    }
    
    // Setup file watcher
    this.setupWatcher();
    
    const elapsed = Date.now() - startTime;
    console.log(`Scanned ${files.length} files in ${elapsed}ms`);
  }
  
  private indexFile(uri: vscode.Uri): void {
    const basename = path.basename(uri.fsPath, '.md');
    const existing = this.fileIndex.get(basename) || [];
    existing.push(uri);
    this.fileIndex.set(basename, existing);
    this.allFiles.push(uri);
  }
  
  private removeFile(uri: vscode.Uri): void {
    const basename = path.basename(uri.fsPath, '.md');
    const existing = this.fileIndex.get(basename) || [];
    const filtered = existing.filter(u => u.toString() !== uri.toString());
    
    if (filtered.length === 0) {
      this.fileIndex.delete(basename);
    } else {
      this.fileIndex.set(basename, filtered);
    }
    
    this.allFiles = this.allFiles.filter(u => u.toString() !== uri.toString());
  }
  
  private setupWatcher(): void {
    if (this.watcher) {
      this.watcher.dispose();
    }
    
    this.watcher = vscode.workspace.createFileSystemWatcher('**/*.md');
    
    this.watcher.onDidCreate(uri => {
      if (!this.shouldExclude(uri)) {
        this.indexFile(uri);
      }
    });
    
    this.watcher.onDidDelete(uri => {
      this.removeFile(uri);
    });
    
    this.watcher.onDidChange(uri => {
      // File content changed, but path didn't - no need to re-index
      // We'll handle this in the backlinks index
    });
  }
  
  private getExcludeGlob(): string {
    const patterns = this.config.getExcludePatterns();
    return `{${patterns.join(',')}}`;
  }
  
  private shouldExclude(uri: vscode.Uri): boolean {
    const patterns = this.config.getExcludePatterns();
    const relativePath = vscode.workspace.asRelativePath(uri);
    
    return patterns.some(pattern => minimatch(relativePath, pattern));
  }
  
  getFilesMatching(basename: string): vscode.Uri[] {
    return this.fileIndex.get(basename) || [];
  }
  
  getAllFiles(): vscode.Uri[] {
    return this.allFiles;
  }
  
  isAmbiguous(basename: string): boolean {
    const files = this.getFilesMatching(basename);
    return files.length > 1;
  }
  
  getFileCount(): number {
    return this.allFiles.length;
  }
  
  dispose(): void {
    if (this.watcher) {
      this.watcher.dispose();
    }
  }
}
