// linkity/src/parsers/wikilink.ts
// Wikilink parser ([[Page]] or [[Page|Alias]])

import type { LinkNode } from "../types/index.js";

export function parseWikilink(_text: string): LinkNode[] {
  const text = _text;
  //^\[\[(?<name>[^\]\|\r\n]+?)(?:\|(?<title>[^\]\|\r\n]+?))?\]\](?<agglu>[^\p{P}\s]*)$
  // TODO: thoroughly test optimized greedy version
  //^\[\[(?<name>[^\]\|\r\n]+)(?:\|(?<title>[^\]\|\r\n]+))?\]\](?<agglu>[^\p{P}\s]*)$
  // Match [[...]] even if preceded by a backslash
  const regex = /\\?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const results: LinkNode[] = [];
  let match;
  while ((match = regex.exec(_text)) !== null) {
    // match[0] may include a leading backslash
    const full = match[0];
    const value = match[1];
    const alias = match[2];
    if (typeof value === "string") {
      results.push({
        type: "wikilink",
        value,
        ...(alias ? { alias } : {}),
        position: {
          start: match.index,
          end: alias
            ? match.index + full.length - 1
            : match.index + full.length,
        },
      });
    }
  }
  return results;
}
