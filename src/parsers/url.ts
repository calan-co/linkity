import type { Ast } from "../types/index.js";
import { urlSyntax } from "../syntaxes/index.js";

export function parseRawUrl(text: string, customSchemes: string[] = []): Ast[] {
  const results: Ast[] = [];
  let index = 0;
  while (index < text.length) {
    const match = urlSyntax.match(text, { startIndex: index });
    if (!match) break;
    const ast = urlSyntax.parse(match.raw);
    if (["http", "https", ...customSchemes].includes(ast.scheme ?? "")) {
      results.push({ ...ast, span: match.span });
    }
    index = match.span.end;
  }
  return results;
}
