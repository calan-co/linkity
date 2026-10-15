// linkity/src/types/index.ts
// Type definitions for Linkity

/**
 * Supported link types in Linkity.
 */
export type LinkType = "wikilink" | "markdown" | "url" | "custom";

/**
 * Represents a parsed link and its metadata.
 *
 * Extensible for future context fields (e.g., inCode, inHeading, headingLevel, inline).
 * All fields except `type` and `value` are optional for compatibility with current and future parsers.
 *
 * Example usage:
 *   {
 *     type: "markdown",
 *     value: "[Link](https://example.com)",
 *     url: "https://example.com",
 *     position: { start: 10, end: 32 },
 *     context: { inHeading: true, headingLevel: 2 }
 *   }
 */
export interface LinkNode {
  /** Link type (wikilink, markdown, url, custom) */
  type: LinkType;
  /** Raw link text as found in source */
  value: string;
  /** Optional alias or display text */
  alias?: string;
  /** Optional fragment/anchor target */
  fragment?: string;
  /** Parsed URL (if available) */
  url?: string;
  /** Character offsets in original string */
  position?: {
    start: number;
    end: number;
  };
  /** Arbitrary parser-specific data */
  data?: Record<string, any>;
  /**
   * Optional context metadata for richer link info.
   * - inCode: true if link is inside a code block/span
   * - inHeading: true if link is inside a heading
   * - headingLevel: heading level (if inHeading)
   * - inline: true if link is inline (not block)
   */
  context?: {
    inCode?: boolean;
    inHeading?: boolean;
    headingLevel?: number;
    inline?: boolean;
    [key: string]: any;
  };
}

export interface LinkityParseOptions {
  enableWikilink?: boolean;
  enableMarkdown?: boolean;
  enableUrl?: boolean;
  customSchemes?: string[];
}

/** Canonical single-link syntax model. Kept separate from legacy LinkNode. */
export type Feature = "alias" | "title" | "reference" | "anchor" | "block" | "embed" | "query" | "path-extension" | "path-containers";
export interface Span { start: number; end: number; }
export interface Provenance { syntax: string; rule?: string; }
export interface PathAst { containers?: string[]; resource?: string; extension?: string; separator?: string; absolute?: boolean; }
export interface Ast { raw?: string; span?: Span; scheme?: string; authority?: string; path?: PathAst; anchor?: string; block?: string; query?: Record<string, string | string[] | true>; label?: { raw: string; semantic?: "literal" | "implicit" | "empty" }; title?: string; reference?: { label: string; style: "full" | "collapsed" | "shortcut" }; embed?: boolean; provenance?: Provenance; }
export interface Match { raw: string; span: Span; }
export interface Diagnostic { level: "warning" | "error"; feature?: Feature; message: string; }
export interface FileIndexEntry { path: string; title?: string; aliases?: string[]; headings?: string[]; blocks?: string[]; }
export interface FileIndex { files?: FileIndexEntry[]; resolvePath?: (target: string, sourcePath?: string) => string | undefined; }
export interface ReferenceDefinition { destination: string; title?: string; }
export interface ParseContext { sourcePath?: string; fileIndex?: FileIndex; referenceDefinitions?: Record<string, ReferenceDefinition>; }
export interface RenderContext { lossy?: "error" | "warn"; }
export interface RenderResult { value?: string; diagnostics: Diagnostic[]; }
export interface MatchOptions { startIndex?: number; }
export interface Syntax { id: string; supports: Feature[]; match(input: string, options?: MatchOptions): Match | null; parse(input: string, context?: ParseContext): Ast; render(ast: Ast, context?: RenderContext): RenderResult; }
