/**
 * Wikilink Tokenizer for Linkity
 * Supports variant configuration (Obsidian, Foam, Wikimedia, GFM, etc.)
 * Handles features: aliasing, anchor, embedding, images
 * ESM-first, zero dependencies, strict TypeScript
 *
 * Usage:
 *   tokenizeWikilink(text, options)
 *
 * Options:
 *   variant: 'obsidian' | 'foam' | 'wikimedia' | 'gfm' | ...
 *   features: { alias?: boolean, anchor?: boolean, embed?: boolean, image?: boolean }
 */

// import type { LinkNode } from '../types/index.js';

export interface WikilinkTokenizerOptions {
  variant?: "obsidian" | "foam" | "wikimedia" | "gfm";
  features?: {
    alias?: boolean;
    anchor?: boolean;
    embed?: boolean;
    image?: boolean;
  };
}

export interface WikilinkToken {
  type: "wikilink";
  value: string;
  alias?: string;
  anchor?: string;
  embed?: boolean;
  image?: boolean;
  position: { start: number; end: number };
}

export function tokenizeWikilink(
  text: string,
  options: WikilinkTokenizerOptions = {}
): WikilinkToken[] {
  // Minimal implementation: supports [[Page]], [[Page|Alias]], [[Page#Anchor]], ![[Embed]], [[Image.png]]
  // Variant-specific logic can be extended here
  const { variant, features } = options;
  // Example: use variant/features for future logic (currently unused)
  void variant;
  void features;
  const tokens: WikilinkToken[] = [];
  const re = /(!)?\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const [full, embed, pageRaw, anchor, alias] = match;
    const page = pageRaw ?? "";
    const image = page.match(/\.(png|jpg|jpeg|gif|svg)$/i) !== null;
    tokens.push({
      type: "wikilink",
      value: page,
      alias,
      anchor,
      embed: !!embed,
      image,
      position: { start: match.index, end: match.index + full.length },
    });
  }
  return tokens;
}
