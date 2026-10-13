// linkity/src/utils/detect.ts
// Link type detection utilities

import { parseMarkdownLink, parseWikilink } from "../parsers/index.js";
import { parse as parseUrlSyntax } from "../parsers/url.generated.js";
import type { LinkType } from "../types/index.js";

type ParsedUrlSyntax = { scheme?: string; value?: string; position?: { start: number; end: number } };

function spansWholeInput(node: { position?: { start: number; end: number } }, input: string): boolean {
  return (
    node.position?.start === 0 &&
    (node.position.end === input.length || node.position.end === input.length - 1)
  );
}

/**
 * Utility to detect link type from a string
 */
export function detectLinkType(str: string): LinkType | null {
  if (parseWikilink(str).some((node) => spansWholeInput(node, str))) return "wikilink";
  if (parseMarkdownLink(str).some((node) => spansWholeInput(node, str))) return "markdown";

  const urlNode = (parseUrlSyntax(str) as ParsedUrlSyntax[]).find((node) =>
    spansWholeInput(node, str),
  );
  if (!urlNode?.scheme) return null;
  return urlNode.scheme === "http" || urlNode.scheme === "https" ? "url" : "custom";
}
