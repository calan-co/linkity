import * as vscode from 'vscode';
import { FilenameResolver } from '../services/FilenameResolver';
import { ConfigManager } from '../utils/ConfigManager';
import { LinkityAdapter } from '../core/LinkityAdapter';

export class WikilinkDocumentLinkProvider implements vscode.DocumentLinkProvider {
  private adapter = new LinkityAdapter();
  
  constructor(
    private resolver: FilenameResolver,
    private config: ConfigManager
  ) {}
  
  provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
    if (document.languageId !== 'markdown') {
      return [];
    }
    
    const text = document.getText();
    const links: vscode.DocumentLink[] = [];
    
    // Skip code blocks
    const nonCodeRanges = this.getNonCodeRanges(text);
    
    // Parse wikilinks
    const parsedLinks = this.adapter.extractAll(text);
    
    for (const link of parsedLinks) {
      // Check if link is in code block
      if (!this.isInNonCodeRange(link.start, nonCodeRanges)) {
        continue;
      }
      
      const strategy = this.config.getLinkResolution();
      const resolvedStrategy = strategy === 'interactive' ? 'mostSpecific' : strategy;
      const uri = this.resolver.resolve(link.value, {
        sourceFileUri: document.uri,
        strategy: resolvedStrategy
      });
      
      if (uri) {
        const range = new vscode.Range(
          document.positionAt(link.start),
          document.positionAt(link.end)
        );
        
        // Add anchor if present
        const targetUri = link.anchor 
          ? vscode.Uri.parse(`${uri.toString()}#${link.anchor}`)
          : uri;
        
        links.push(new vscode.DocumentLink(range, targetUri));
      }
    }
    
    return links;
  }
  
  private getNonCodeRanges(text: string): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    const fenceRe = /```[\s\S]*?```/g;
    const inlineCodeRe = /`[^`]+`/g;
    
    let lastIndex = 0;
    const codeSections: Array<{ start: number; end: number }> = [];
    
    // Find fenced code blocks
    let match;
    while ((match = fenceRe.exec(text)) !== null) {
      codeSections.push({ start: match.index, end: match.index + match[0].length });
    }
    
    // Find inline code
    while ((match = inlineCodeRe.exec(text)) !== null) {
      codeSections.push({ start: match.index, end: match.index + match[0].length });
    }
    
    // Sort code sections
    codeSections.sort((a, b) => a.start - b.start);
    
    // Build non-code ranges
    for (const section of codeSections) {
      if (lastIndex < section.start) {
        ranges.push({ start: lastIndex, end: section.start });
      }
      lastIndex = section.end;
    }
    
    if (lastIndex < text.length) {
      ranges.push({ start: lastIndex, end: text.length });
    }
    
    return ranges.length > 0 ? ranges : [{ start: 0, end: text.length }];
  }
  
  private isInNonCodeRange(offset: number, ranges: Array<{ start: number; end: number }>): boolean {
    return ranges.some(r => offset >= r.start && offset < r.end);
  }
}
