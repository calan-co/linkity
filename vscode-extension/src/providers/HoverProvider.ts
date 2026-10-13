import * as vscode from 'vscode';
import * as path from 'path';
import { FilenameResolver } from '../services/FilenameResolver';
import { ConfigManager } from '../utils/ConfigManager';
import { LinkityAdapter } from '../core/LinkityAdapter';

export class WikilinkHoverProvider implements vscode.HoverProvider {
  private adapter = new LinkityAdapter();
  
  constructor(
    private resolver: FilenameResolver,
    private config: ConfigManager
  ) {}
  
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | null> {
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
    const strategy = this.config.getLinkResolution();
    const resolvedStrategy = strategy === 'interactive' ? 'mostSpecific' : strategy;
    const uri = this.adapter.resolveLink(link, this.resolver, {
      sourceFileUri: document.uri,
      strategy: resolvedStrategy
    });
    
    if (!uri) {
      return new vscode.Hover(
        new vscode.MarkdownString(`⚠️ **File not found:** \`${link.value}.md\``)
      );
    }
    
    // Read target file preview
    const preview = await this.getFilePreview(uri);
    
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${path.basename(uri.fsPath)}**\n\n`);
    markdown.appendMarkdown(`📁 \`${vscode.workspace.asRelativePath(uri)}\`\n\n`);
    
    if (link.anchor) {
      markdown.appendMarkdown(`🔗 Anchor: \`#${link.anchor}\`\n\n`);
    }
    
    if (preview) {
      markdown.appendMarkdown('---\n\n');
      markdown.appendMarkdown(preview);
    }
    
    return new vscode.Hover(markdown);
  }
  
  private async getFilePreview(uri: vscode.Uri, maxLength: number = 200): Promise<string | null> {
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(content).toString('utf-8');
      
      // Remove frontmatter
      const withoutFrontmatter = text.replace(/^---\n[\s\S]*?\n---\n/, '');
      
      // Get first paragraph
      const lines = withoutFrontmatter.split('\n').filter(line => line.trim().length > 0);
      const preview = lines.slice(0, 3).join('\n').slice(0, maxLength);
      
      return preview + (preview.length === maxLength ? '...' : '');
    } catch (error) {
      return null;
    }
  }
}
