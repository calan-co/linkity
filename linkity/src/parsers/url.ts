// linkity/src/parsers/url.ts
// Raw URL and configured custom scheme parser

import type { LinkNode } from "../types/index.js";
import { parse } from "./url.generated.js";

const defaultSchemes = ["http", "https"];
const urlCandidatePattern = /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+/g;

type ParsedUrlNode = Omit<LinkNode, "type"> & { scheme?: string };

export function parseRawUrl(text: string, customSchemes: string[] = []): LinkNode[] {
  const allSchemes = new Set([...defaultSchemes, ...customSchemes]);
  const results: LinkNode[] = [];
  let match: RegExpExecArray | null;

  while ((match = urlCandidatePattern.exec(text)) !== null) {
    const candidate = match[0];
    const parsed = parse(candidate) as ParsedUrlNode;
    if (typeof parsed.scheme !== "string" || !allSchemes.has(parsed.scheme)) continue;
    const { scheme, position, ...node } = parsed;
    results.push({
      ...node,
      type: defaultSchemes.includes(scheme) ? "url" : "custom",
      position: position
        ? { start: match.index + position.start, end: match.index + position.end }
        : undefined,
    });
  }

  return results;
}
