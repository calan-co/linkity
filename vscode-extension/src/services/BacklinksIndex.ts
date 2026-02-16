import * as vscode from 'vscode';
import { WorkspaceScanner } from './WorkspaceScanner';
import { FilenameResolver } from './FilenameResolver';
import { LinkityAdapter } from '../core/LinkityAdapter';

export interface BacklinkEntry {
  sourceUri: vscode.Uri;
  targetUri: vscode.Uri;
  linkText: string;
  anchor?: string;
  position: vscode.Position;
}

export class BacklinksIndex {
  private index: Map<string, BacklinkEntry[]> = new Map();
  private adapter = new LinkityAdapter();
  private _onDidChangeIndex = new vscode.EventEmitter<void>();
  readonly onDidChangeIndex = this._onDidChangeIndex.event;
  
  constructor(
    private scanner: WorkspaceScanner,
    private resolver: FilenameResolver
  ) {}
  
  async buildIndex(): Promise<void> {
    const startTime = Date.now();
    this.index.clear();
    
    const files = this.scanner.getAllFiles();
    
    for (const sourceUri of files) {
      await this.indexFile(sourceUri);
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`Built backlinks index for ${files.length} files in ${elapsed}ms`);
    
    this._onDidChangeIndex.fire();
  }
  
  private async indexFile(sourceUri: vscode.Uri): Promise<void> {
    try {
      const content = await vscode.workspace.fs.readFile(sourceUri);
      const text = Buffer.from(content).toString('utf-8');
      
      const links = this.adapter.extractAll(text);
      
      for (const link of links) {
        const targetUri = this.resolver.resolve(link.value, {
          sourceFileUri: sourceUri
        });
        
        if (targetUri) {
          const entry: BacklinkEntry = {
            sourceUri,
            targetUri,
            linkText: link.alias || link.value,
            anchor: link.anchor,
            position: new vscode.Position(0, 0) // TODO: Calculate actual position
          };
          
          this.addLink(entry);
        }
      }
    } catch (error) {
      console.error(`Error indexing file ${sourceUri.fsPath}:`, error);
    }
  }
  
  addLink(entry: BacklinkEntry): void {
    const key = entry.targetUri.toString();
    const existing = this.index.get(key) || [];
    existing.push(entry);
    this.index.set(key, existing);
  }
  
  removeLinksForFile(uri: vscode.Uri): void {
    const key = uri.toString();
    this.index.delete(key);
    
    // Also remove as source from other entries
    for (const [targetKey, entries] of this.index.entries()) {
      const filtered = entries.filter(e => e.sourceUri.toString() !== uri.toString());
      if (filtered.length === 0) {
        this.index.delete(targetKey);
      } else {
        this.index.set(targetKey, filtered);
      }
    }
    
    this._onDidChangeIndex.fire();
  }
  
  getIncomingLinks(targetUri: vscode.Uri): BacklinkEntry[] {
    const key = targetUri.toString();
    return this.index.get(key) || [];
  }
  
  getOutgoingLinks(sourceUri: vscode.Uri): BacklinkEntry[] {
    const outgoing: BacklinkEntry[] = [];
    
    for (const entries of this.index.values()) {
      for (const entry of entries) {
        if (entry.sourceUri.toString() === sourceUri.toString()) {
          outgoing.push(entry);
        }
      }
    }
    
    return outgoing;
  }
  
  getTotalLinkCount(): number {
    let count = 0;
    for (const entries of this.index.values()) {
      count += entries.length;
    }
    return count;
  }
}
