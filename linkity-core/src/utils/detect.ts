// linkity/src/utils/detect.ts
// Link type detection utilities

import type { LinkType } from "../types/index.js";

/**
 * Utility to detect link type from a string
 */
export function detectLinkType(_str: string): LinkType | null {
  const str = _str;
  // Wikilink: [[Page]] or [[Page|Alias]]
  if (/^\[\[[^\]|]+(\|[^\]]+)?\]\]$/.test(str)) return "wikilink";
  // Markdown: [text](url)
  if (/^\[[^\]]+\]\([^\)]+\)$/.test(str)) return "markdown";
  // URL: http(s)://...
  if (/^https?:\/\/.+/.test(str)) return "url";
  // Custom scheme: e.g. foo://bar
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/.test(str)) return "custom";
  return null;
}
