import { parseWikilink, LinkNode } from 'linkity';

export interface ParsedLink {
  value: string;
  alias?: string;
  anchor?: string;
  start: number;
  end: number;
}

interface ResolveOptions<TUri> {
  sourceFileUri?: TUri;
  strategy?: string;
}

interface SyncResolver<TUri> {
  resolve(target: string, options?: ResolveOptions<TUri>): TUri | null;
}

interface AsyncAnchorResolver<TUri> {
  resolveWithAnchorAsync(
    target: string,
    anchor: string | undefined,
    options?: ResolveOptions<TUri>
  ): Promise<{ uri: TUri | null; anchor?: string }>;
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
    const { value, alias, fragment, position } = node;
    
    // Prefer the structured fragment field from Linkity. Keep the legacy
    // value-splitting fallback for older Linkity parser outputs.
    const anchorMatch = value.match(/^([^#]+)(?:#(.+))?$/);
    const target = fragment ? value : anchorMatch ? anchorMatch[1] : value;
    const anchor = fragment ?? (anchorMatch && anchorMatch[2] ? anchorMatch[2] : undefined);
    
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

  resolveLink<TUri>(
    link: ParsedLink,
    resolver: SyncResolver<TUri>,
    options: ResolveOptions<TUri> = {}
  ): TUri | null {
    if (!link.value && link.anchor && options.sourceFileUri) {
      return options.sourceFileUri;
    }
    return resolver.resolve(link.value, options);
  }

  async resolveLinkWithAnchor<TUri>(
    link: ParsedLink,
    resolver: AsyncAnchorResolver<TUri>,
    options: ResolveOptions<TUri> = {}
  ): Promise<{ uri: TUri | null; anchor?: string }> {
    if (!link.value && link.anchor && options.sourceFileUri) {
      return { uri: options.sourceFileUri, anchor: link.anchor };
    }
    return resolver.resolveWithAnchorAsync(link.value, link.anchor, options);
  }
}
