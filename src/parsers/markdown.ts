import type { Ast } from "../types/index.js";
import { gfmSyntax } from "../syntaxes/index.js";

export function parseMarkdownLink(text: string): Ast[] {
  const results: Ast[] = [];
  let index = 0;
  while (index < text.length) {
    const match = gfmSyntax.match(text, { startIndex: index });
    if (!match) break;
    results.push({ ...gfmSyntax.parse(match.raw), span: match.span });
    index = match.span.end;
  }
  return results;
}
