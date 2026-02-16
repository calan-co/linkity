// linkity/src/parsers/markdown.ts
// Markdown link parser ([text](url))

import type { LinkNode } from "../types/index.js";

export function parseMarkdownLink(_text: string): LinkNode[] {
  // Match all [text](url) links, including those preceded by a backslash
  const text = _text;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const results: LinkNode[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [full, value, url] = match;
    if (typeof value === "string" && typeof url === "string") {
      results.push({
        type: "markdown",
        value,
        url,
        position: {
          start: match.index,
          end: match.index + full.length - 1,
        },
      });
    }
  }
  return results;
}
