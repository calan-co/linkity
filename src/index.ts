export type {
  Ast,
  Diagnostic,
  Feature,
  FileIndex,
  LinkityParseOptions,
  LinkNode,
  LinkType,
  Match,
  MatchOptions,
  ParseContext,
  ReferenceDefinition,
  ParseOptions,
  PathAst,
  Provenance,
  RenderContext,
  RenderResult,
  Span,
  Syntax,
} from "./types/index.js";

export { parseMarkdownLink, parseRawUrl, parseWikilink } from "./parsers/index.js";
export { detectLinkType, visitLinks } from "./utils/index.js";
export {
  commonmarkSyntax,
  createSyntaxRegistry,
  getSyntax,
  gfmSyntax,
  obsidianSyntax,
  parseLink,
  registerSyntax,
  renderLink,
  syntaxes,
  urlSyntax,
  wikilinkSyntax,
} from "./syntaxes/index.js";

import type { Ast, ParseOptions } from "./types/index.js";
import { parseMarkdownLink } from "./parsers/markdown.js";
import { parseRawUrl } from "./parsers/url.js";
import { parseWikilink } from "./parsers/wikilink.js";

function getNonCodeRanges(text: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const fenceRe = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let foundFence = false;
  while ((m = fenceRe.exec(text)) !== null) {
    foundFence = true;
    if (lastIndex < m.index) ranges.push({ start: lastIndex, end: m.index });
    lastIndex = m.index + m[0].length;
  }
  if (!foundFence) return text.length > 0 ? [{ start: 0, end: text.length }] : [];
  if (lastIndex < text.length) ranges.push({ start: lastIndex, end: text.length });
  return ranges;
}

export function parseLinks(text: string, options?: ParseOptions): Ast[] {
  const { enableWikilink = true, enableMarkdown = true, enableUrl = true } = options || {};
  const results: Ast[] = [];
  for (const { start, end } of getNonCodeRanges(text)) {
    if (start >= end) continue;
    const slice = text.slice(start, end);
    const offset = (node: Ast): Ast =>
      node.span ? { ...node, span: { start: node.span.start + start, end: node.span.end + start } } : node;
    const rangeLinks: Ast[] = [];
    if (enableWikilink) rangeLinks.push(...parseWikilink(slice));
    if (enableMarkdown) rangeLinks.push(...parseMarkdownLink(slice, { referenceDefinitions: options?.referenceDefinitions }));
    if (enableUrl) {
      const occupied = rangeLinks.flatMap((link) => (link.span ? [link.span] : []));
      rangeLinks.push(
        ...parseRawUrl(slice, options?.customSchemes).filter(
          (link) => !link.span || !occupied.some((span) => link.span!.start >= span.start && link.span!.end <= span.end)
        )
      );
    }
    results.push(...rangeLinks.map(offset));
  }
  return results;
}
