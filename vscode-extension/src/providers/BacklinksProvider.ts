import * as vscode from 'vscode';
import * as path from 'path';
import { BacklinksIndex, BacklinkEntry } from '../services/BacklinksIndex';

class BacklinkItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly uri?: vscode.Uri,
    public readonly children?: BacklinkItem[]
  ) {
    super(label, collapsibleState);
    
    if (uri) {
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [uri]
      };
      this.resourceUri = uri;
      this.tooltip = vscode.workspace.asRelativePath(uri);
    }
  }
}

export class BacklinksTreeDataProvider implements vscode.TreeDataProvider<BacklinkItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<BacklinkItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  constructor(private backlinksIndex: BacklinksIndex) {
    // Listen to index changes
    backlinksIndex.onDidChangeIndex(() => {
      this.refresh();
    });
  }
  
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  getTreeItem(element: BacklinkItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(element?: BacklinkItem): BacklinkItem[] {
    if (element) {
      return element.children || [];
    }
    
    // Root level - get backlinks for active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
      return [new BacklinkItem('No active markdown file', vscode.TreeItemCollapsibleState.None)];
    }
    
    const incoming = this.backlinksIndex.getIncomingLinks(editor.document.uri);
    const outgoing = this.backlinksIndex.getOutgoingLinks(editor.document.uri);
    
    if (incoming.length === 0 && outgoing.length === 0) {
      return [new BacklinkItem('No backlinks', vscode.TreeItemCollapsibleState.None)];
    }
    
    const incomingItem = this.createSection('Incoming Links', incoming);
    const outgoingItem = this.createSection('Outgoing Links', outgoing);
    
    return [incomingItem, outgoingItem];
  }
  
  private createSection(label: string, entries: BacklinkEntry[]): BacklinkItem {
    if (entries.length === 0) {
      return new BacklinkItem(
        `${label} (0)`,
        vscode.TreeItemCollapsibleState.None
      );
    }
    
    const children = entries.map(entry => {
      const uri = label.startsWith('Incoming') ? entry.sourceUri : entry.targetUri;
      const basename = path.basename(uri.fsPath);
      const text = entry.anchor ? `${basename}#${entry.anchor}` : basename;
      
      return new BacklinkItem(
        text,
        vscode.TreeItemCollapsibleState.None,
        uri
      );
    });
    
    return new BacklinkItem(
      `${label} (${entries.length})`,
      vscode.TreeItemCollapsibleState.Expanded,
      undefined,
      children
    );
  }
}
