import * as vscode from 'vscode';
import { FilenameResolver } from '../services/FilenameResolver';
import { ConfigManager } from '../utils/ConfigManager';
import { LinkityAdapter } from '../core/LinkityAdapter';

export class WikilinkDefinitionProvider implements vscode.DefinitionProvider {
  private adapter = new LinkityAdapter();
  
  constructor(
    private resolver: FilenameResolver,
    private config: ConfigManager
  ) {}
  
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Definition | null> {
    if (document.languageId !== 'markdown') {
      return null;
    }
    
    const text = document.getText();
    const offset = document.offsetAt(position);
    
    // Find wikilink at cursor position
    const link = this.adapter.findLinkAtPosition(text, offset);
    if (!link) {
      return null;
    }
    
    // Resolve the link
    const result = await this.resolver.resolveWithAnchorAsync(link.value, link.anchor, {
      sourceFileUri: document.uri,
      strategy: this.config.getLinkResolution()
    });
    
    if (!result.uri) {
      return null;
    }
    
    // If anchor is present, try to find the heading
    if (result.anchor) {
      const targetPosition = await this.findHeading(result.uri, result.anchor);
      if (targetPosition) {
        return new vscode.Location(result.uri, targetPosition);
      }
    }
    
    // Return location at start of file
    return new vscode.Location(result.uri, new vscode.Position(0, 0));
  }
  
  private async findHeading(uri: vscode.Uri, anchor: string): Promise<vscode.Position | null> {
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(content).toString('utf-8');
      const lines = text.split('\n');
      
      // Normalize anchor (lowercase, replace spaces with dashes)
      const normalizedAnchor = anchor.toLowerCase().replace(/\s+/g, '-');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const headingMatch = line.match(/^#+\s+(.+)$/);
        
        if (headingMatch) {
          const headingText = headingMatch[1];
          const normalizedHeading = headingText.toLowerCase().replace(/\s+/g, '-');
          
          if (normalizedHeading === normalizedAnchor) {
            return new vscode.Position(i, 0);
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
