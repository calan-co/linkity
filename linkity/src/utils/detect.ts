// linkity/src/utils/detect.ts
// Link type detection utilities

import { parseMarkdownLink, parseWikilink } from "../parsers/index.js";
import { parse as parseUrlSyntax } from "../parsers/url.generated.js";
import type { LinkType } from "../types/index.js";

type Positioned = { alias?: string; position?: { start: number; end: number } };
type ParsedUrlSyntax = { scheme?: string; value?: string; position?: { start: number; end: number } };

function spansWholeInput(node: Positioned, input: string, inclusiveEnd: boolean): boolean {
  if (node.position?.start !== 0) return false;
  return node.position.end === (inclusiveEnd ? input.length - 1 : input.length);
}

function parseWholeUrl(str: string): ParsedUrlSyntax | null {
  try {
    const node = parseUrlSyntax(str) as ParsedUrlSyntax;
    return spansWholeInput(node, str, false) ? node : null;
  } catch {
    return null;
  }
}

/**
 * Utility to detect link type from a string
 */
export function detectLinkType(str: string): LinkType | null {
  if (parseWikilink(str).some((node) => spansWholeInput(node, str, Boolean(node.alias)))) return "wikilink";
  if (parseMarkdownLink(str).some((node) => spansWholeInput(node, str, true))) return "markdown";

  const urlNode = parseWholeUrl(str);
  if (!urlNode?.scheme) return null;
  const scheme = urlNode.scheme.toLowerCase();
  return scheme === "http" || scheme === "https" ? "url" : "custom";
}
