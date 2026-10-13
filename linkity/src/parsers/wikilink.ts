// linkity/src/parsers/wikilink.ts
// Wikilink parser ([[Page]], [[Page#Fragment]], or [[Page|Alias]])

import type { LinkNode } from "../types/index.js";
import { parse } from "./wikilink.generated.js";

export function parseWikilink(text: string): LinkNode[] {
  return parse(text) as LinkNode[];
}
