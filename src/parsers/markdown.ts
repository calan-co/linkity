import type { Ast, ParseContext } from "../types/index.js";
import { gfmSyntax } from "../syntaxes/index.js";

export function parseMarkdownLink(text: string, context?: ParseContext): Ast[] {
  const results: Ast[] = [];
  let index = 0;
  while (index < text.length) {
    const match = gfmSyntax.match(text, { startIndex: index });
    if (!match) break;
    // parseLinks historically owns only bracket Markdown links; URL scanning stays urlSyntax.
    if (!match.raw.startsWith("[")) {
      index = match.span.end;
      continue;
    }
    try {
      results.push({ ...gfmSyntax.parse(match.raw, context), span: match.span });
      index = match.span.end;
    } catch {
      // A bare bracket sequence is a reference only if its definition is in context.
      index = match.span.start + 1;
    }
  }
  return results;
}
