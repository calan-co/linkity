type LegacyLinkType = "wikilink" | "markdown" | "url" | "custom";
type Feature = "alias" | "anchor" | "block" | "embed" | "query" | "path-extension" | "path-containers";
interface Span {
    start: number;
    end: number;
}
interface Provenance {
    syntax: string;
    rule?: string;
}
interface PathAst {
    containers?: string[];
    resource?: string;
    extension?: string;
    separator?: string;
    absolute?: boolean;
}
interface Ast {
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
    embed?: boolean;
    provenance?: Provenance;
}
interface Match {
    raw: string;
    span: Span;
}
interface Diagnostic {
    level: "warning" | "error";
    feature?: Feature;
    message: string;
}
interface FileIndexEntry {
    path: string;
    title?: string;
    aliases?: string[];
    headings?: string[];
    blocks?: string[];
}
interface FileIndex {
    files?: FileIndexEntry[];
    resolvePath?: (target: string, sourcePath?: string) => string | undefined;
}
interface ParseContext {
    sourcePath?: string;
    fileIndex?: FileIndex;
}
interface RenderContext {
    lossy?: "error" | "warn";
}
interface RenderResult {
    value?: string;
    diagnostics: Diagnostic[];
}
interface MatchOptions {
    startIndex?: number;
}
interface ParseOptions {
    enableWikilink?: boolean;
    enableMarkdown?: boolean;
    enableUrl?: boolean;
    customSchemes?: string[];
}
interface Syntax {
    id: string;
    supports: Feature[];
    match(input: string, options?: MatchOptions): Match | null;
    parse(input: string, context?: ParseContext): Ast;
    render(ast: Ast, context?: RenderContext): RenderResult;
}
/** @deprecated use Ast */
type LinkNode = Ast;
/** @deprecated use LegacyLinkType only for old parser switches */
type LinkType = LegacyLinkType;
/** @deprecated use ParseOptions */
type LinkityParseOptions = ParseOptions;

declare function parseWikilink(text: string): Ast[];

declare function parseMarkdownLink(text: string): Ast[];

declare function parseRawUrl(text: string, customSchemes?: string[]): Ast[];

/**
 * Utility to detect link type from a string
 */
declare function detectLinkType(_str: string): LinkType | null;

declare function visitLinks<T = void>(links: Ast[], visitor: (link: Ast, index: number, array: Ast[]) => T): T[] | void;

declare const obsidianSyntax: Syntax;
declare const wikilinkSyntax: Syntax;
declare const gfmSyntax: Syntax;
declare const urlSyntax: Syntax;
declare function parseLink(input: string, syntax: Syntax, context?: ParseContext): Ast;
declare function renderLink(ast: Ast, syntax: Syntax, context?: RenderContext): RenderResult;
interface SyntaxRegistry {
    register(syntax: Syntax): void;
    get(id: string): Syntax | undefined;
    list(): Syntax[];
}
declare function createSyntaxRegistry(initial?: Syntax[]): SyntaxRegistry;
declare function registerSyntax(syntax: Syntax): void;
declare function getSyntax(id: string): Syntax | undefined;
declare function syntaxes(): Syntax[];

declare function parseLinks(text: string, options?: ParseOptions): Ast[];

export { type Ast, type Diagnostic, type Feature, type FileIndex, type LinkNode, type LinkType, type LinkityParseOptions, type Match, type MatchOptions, type ParseContext, type ParseOptions, type PathAst, type Provenance, type RenderContext, type RenderResult, type Span, type Syntax, createSyntaxRegistry, detectLinkType, getSyntax, gfmSyntax, obsidianSyntax, parseLink, parseLinks, parseMarkdownLink, parseRawUrl, parseWikilink, registerSyntax, renderLink, syntaxes, urlSyntax, visitLinks, wikilinkSyntax };
