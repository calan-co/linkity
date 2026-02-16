import { parseWikilink, LinkNode } from 'linkity';

export interface ParsedLink {
  value: string;
  alias?: string;
  anchor?: string;
  start: number;
  end: number;
}

export class LinkityAdapter {
  /**
   * Parse all wikilinks from markdown text
   */
  parseDocument(text: string): LinkNode[] {
    return parseWikilink(text);
  }
  
  /**
   * Extract structured information from LinkNode
   */
  extractInfo(node: LinkNode): ParsedLink {
    const { value, alias, position } = node;
    
    // Check if value contains anchor
    const anchorMatch = value.match(/^([^#]+)(?:#(.+))?$/);
    const target = anchorMatch ? anchorMatch[1] : value;
    const anchor = anchorMatch && anchorMatch[2] ? anchorMatch[2] : undefined;
    
    return {
      value: target,
      alias,
      anchor,
      start: position!.start,
      end: position!.end
    };
  }
  
  /**
   * Extract all parsed links with positions
   */
  extractAll(text: string): ParsedLink[] {
    const nodes = this.parseDocument(text);
    return nodes.map(node => this.extractInfo(node));
  }
  
  /**
   * Check if text position is within a wikilink
   */
  findLinkAtPosition(text: string, offset: number): ParsedLink | null {
    const links = this.extractAll(text);
    return links.find(link => offset >= link.start && offset <= link.end) || null;
  }
}
