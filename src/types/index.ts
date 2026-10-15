export type LegacyLinkType = "wikilink" | "markdown" | "url" | "custom";
export type Feature =
  | "alias"
  | "title"
  | "reference"
  | "anchor"
  | "block"
  | "embed"
  | "query"
  | "path-extension"
  | "path-containers";

export interface Span {
  start: number;
  end: number;
}

export interface Provenance {
  syntax: string;
  rule?: string;
}

export interface PathAst {
  containers?: string[];
  resource?: string;
  extension?: string;
  separator?: string;
  absolute?: boolean;
}

export interface Ast {
  raw?: string;
  span?: Span;
  scheme?: string;
  authority?: string;
  path?: PathAst;
  anchor?: string;
  block?: string;
  query?: Record<string, string | string[] | true>;
  label?: {
    raw: string;
    semantic?: "literal" | "implicit" | "empty";
  };
  title?: string;
  reference?: {
    label: string;
    style: "full" | "collapsed" | "shortcut";
  };
  embed?: boolean;
  provenance?: Provenance;
}

export interface Match {
  raw: string;
  span: Span;
}

export interface Diagnostic {
  level: "warning" | "error";
  feature?: Feature;
  message: string;
}

export interface FileIndexEntry {
  path: string;
  title?: string;
  aliases?: string[];
  headings?: string[];
  blocks?: string[];
}

export interface FileIndex {
  files?: FileIndexEntry[];
  resolvePath?: (target: string, sourcePath?: string) => string | undefined;
}

export interface ReferenceDefinition {
  destination: string;
  title?: string;
}

export interface ParseContext {
  sourcePath?: string;
  fileIndex?: FileIndex;
  /** CommonMark reference definitions, keyed by their source label. */
  referenceDefinitions?: Record<string, ReferenceDefinition>;
}

export interface RenderContext {
  lossy?: "error" | "warn";
}

export interface RenderResult {
  value?: string;
  diagnostics: Diagnostic[];
}

export interface MatchOptions {
  startIndex?: number;
}

export interface ParseOptions {
  enableWikilink?: boolean;
  referenceDefinitions?: Record<string, ReferenceDefinition>;
  enableMarkdown?: boolean;
  enableUrl?: boolean;
  customSchemes?: string[];
}

export interface Syntax {
  id: string;
  supports: Feature[];
  match(input: string, options?: MatchOptions): Match | null;
  parse(input: string, context?: ParseContext): Ast;
  render(ast: Ast, context?: RenderContext): RenderResult;
}

/** @deprecated use Ast */
export type LinkNode = Ast;
/** @deprecated use LegacyLinkType only for old parser switches */
export type LinkType = LegacyLinkType;
/** @deprecated use ParseOptions */
export type LinkityParseOptions = ParseOptions;
