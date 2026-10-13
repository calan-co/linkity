// linkity/src/parsers/markdown.ts
// Markdown link parser ([text](url))

import type { LinkNode } from "../types/index.js";
import { parse } from "./markdown.generated.js";

export function parseMarkdownLink(text: string): LinkNode[] {
  return parse(text) as LinkNode[];
}
