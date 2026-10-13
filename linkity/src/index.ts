// linkity/src/index.ts
// Linkity: Unified link format AST library
// Supports: Obsidian wikilink ([[Page]]), GFM [text](url), raw URLs, and extensible schemes

// Re-export types
export type { LinkType, LinkNode, LinkityParseOptions } from "./types/index.js";

// Re-export parsers
export {
  parseWikilink,
  parseMarkdownLink,
  parseRawUrl,
} from "./parsers/index.js";

// Re-export utilities
export { detectLinkType } from "./utils/index.js";

// Main API
import type { LinkNode, LinkityParseOptions } from "./types/index.js";
import { parseWikilink } from "./parsers/wikilink.js";
import { parseMarkdownLink } from "./parsers/markdown.js";
import { parseRawUrl } from "./parsers/url.js";

// Helper: return ranges outside fenced code blocks ```...```
function getNonCodeRanges(text: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const fenceRe = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(text)) !== null) {
    const fenceStart = m.index;
    const fenceEnd = m.index + m[0].length;
    if (lastIndex < fenceStart) {
      ranges.push({ start: lastIndex, end: fenceStart });
    }
    lastIndex = fenceEnd;
  }
  if (lastIndex < text.length) {
    ranges.push({ start: lastIndex, end: text.length });
  }
  // If no fences found, one full-range segment is returned implicitly
  if (ranges.length === 0 && text.length > 0) {
    ranges.push({ start: 0, end: text.length });
  }
  return ranges;
}

/**
 * Parses input text and returns an array of LinkNode ASTs for all detected links.
 * Supports wikilinks ([[Page]]), markdown links [text](url), and raw URLs.
 * @param text Input string
 * @param options Parsing options
 */
export function parseLinks(
  text: string,
  options?: LinkityParseOptions
): LinkNode[] {
  const {
    enableWikilink = true,
    enableMarkdown = true,
    enableUrl = true,
  } = options || {};

  const results: LinkNode[] = [];

  // Ignore links inside fenced code blocks by parsing only non-code ranges
  const ranges = getNonCodeRanges(text);
  for (const { start, end } of ranges) {
    if (start >= end) continue;
    const slice = text.slice(start, end);
    if (enableWikilink) {
      const nodes = parseWikilink(slice).map((n) =>
        n.position
          ? {
              ...n,
              position: {
                start: n.position.start + start,
                end: n.position.end + start,
              },
            }
          : n
      );
      results.push(...nodes);
    }
    if (enableMarkdown) {
      const nodes = parseMarkdownLink(slice).map((n) =>
        n.position
          ? {
              ...n,
              position: {
                start: n.position.start + start,
                end: n.position.end + start,
              },
            }
          : n
      );
      results.push(...nodes);
    }
    if (enableUrl) {
      const nodes = parseRawUrl(slice, options?.customSchemes).map((n) =>
        n.position
          ? {
              ...n,
              position: {
                start: n.position.start + start,
                end: n.position.end + start,
              },
            }
          : n
      );
      results.push(...nodes);
    }
  }

  return results;
}
