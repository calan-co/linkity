import type { Ast } from "../types/index.js";
import { obsidianSyntax } from "../syntaxes/index.js";

export function parseWikilink(text: string): Ast[] {
  const results: Ast[] = [];
  let index = 0;
  while (index < text.length) {
    const match = obsidianSyntax.match(text, { startIndex: index });
    if (!match) break;
    results.push({ ...obsidianSyntax.parse(match.raw), span: match.span });
    index = match.span.end;
  }
  return results;
}
