import type {
  Ast,
  Diagnostic,
  Feature,
  Match,
  MatchOptions,
  FileIndexEntry,
  ParseContext,
  RenderContext,
  RenderResult,
  Syntax,
} from "../types/index.js";
import { parse as parseLinkGrammar } from "./generated/link-parser.js";

const PATH_FEATURES: Feature[] = ["anchor", "query", "path-extension", "path-containers"];

function spanFrom(match: RegExpExecArray): Match {
  return { raw: match[0], span: { start: match.index, end: match.index + match[0].length } };
}

function parseQuery(input: string): Ast["query"] | undefined {
  if (!input) return undefined;
  const decode = (value: string): string => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const query: NonNullable<Ast["query"]> = {};
  for (const part of input.split("&").filter(Boolean)) {
    const separator = part.indexOf("=");
    const rawKey = separator < 0 ? part : part.slice(0, separator);
    const rawValue = separator < 0 ? undefined : part.slice(separator + 1);
    if (!rawKey) continue;
    const key = decode(rawKey);
    const value = rawValue === undefined ? true : decode(rawValue);
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else query[key] = Array.isArray(existing) ? [...existing, String(value)] : [String(existing), String(value)];
  }
  return Object.keys(query).length ? query : undefined;
}

function renderQuery(query: Ast["query"]): string {
  if (!query) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    } else if (value === true) parts.push(encodeURIComponent(key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

function parsePath(rawPath: string): Ast["path"] | undefined {
  if (!rawPath) return undefined;
  const absolute = rawPath.startsWith("/");
  const separator = rawPath.includes("\\") ? "\\" : "/";
  const parts = rawPath.split(/[\\/]/).filter(Boolean);
  const file = parts.pop();
  if (!file) return { absolute, separator };
  const dot = file.lastIndexOf(".");
  const hasExtension = dot > 0 && dot < file.length - 1;
  return {
    ...(parts.length ? { containers: parts } : {}),
    resource: hasExtension ? file.slice(0, dot) : file,
    ...(hasExtension ? { extension: file.slice(dot + 1) } : {}),
    separator,
    absolute,
  };
}

function renderPath(path: Ast["path"]): string {
  if (!path) return "";
  const separator = path.separator ?? "/";
  const parts = [...(path.containers ?? [])];
  const resource = `${path.resource ?? ""}${path.extension ? `.${path.extension}` : ""}`;
  if (resource) parts.push(resource);
  return `${path.absolute ? separator : ""}${parts.join(separator)}`;
}

function parseTarget(raw: string): Omit<Ast, "raw" | "label" | "provenance" | "embed"> {
  const url = raw.match(/^([A-Za-z][A-Za-z0-9+.-]*):(\/\/([^/?#]*))?(.*)$/);
  const scheme = url?.[1];
  const authority = url?.[3];
  let rest = url ? url[4] ?? "" : raw;

  let anchor: string | undefined;
  let block: string | undefined;
  const hashIndex = rest.indexOf("#");
  if (hashIndex >= 0) {
    const fragment = rest.slice(hashIndex + 1);
    rest = rest.slice(0, hashIndex);
    if (fragment.startsWith("^")) block = fragment.slice(1);
    else anchor = fragment || undefined;
  }

  let query: Ast["query"];
  const queryIndex = rest.indexOf("?");
  if (queryIndex >= 0) {
    query = parseQuery(rest.slice(queryIndex + 1));
    rest = rest.slice(0, queryIndex);
  }

  return {
    ...(scheme ? { scheme } : {}),
    ...(authority ? { authority } : {}),
    ...(parsePath(rest) ? { path: parsePath(rest) } : {}),
    ...(anchor ? { anchor } : {}),
    ...(block ? { block } : {}),
    ...(query ? { query } : {}),
  };
}

function renderTarget(ast: Ast): string {
  const prefix = ast.scheme ? (ast.authority ? `${ast.scheme}://${ast.authority}` : `${ast.scheme}:`) : "";
  const fragment = ast.block ? `#^${ast.block}` : ast.anchor ? `#${ast.anchor}` : "";
  return `${prefix}${renderPath(ast.path)}${renderQuery(ast.query)}${fragment}`;
}

function renderSupportedTarget(ast: Ast, syntax: Syntax): string {
  return renderTarget({
    ...ast,
    anchor: syntax.supports.includes("anchor") ? ast.anchor : undefined,
    block: syntax.supports.includes("block") ? ast.block : undefined,
    query: syntax.supports.includes("query") ? ast.query : undefined,
    path: ast.path
      ? {
          ...ast.path,
          containers: syntax.supports.includes("path-containers") ? ast.path.containers : undefined,
          extension: syntax.supports.includes("path-extension") ? ast.path.extension : undefined,
        }
      : undefined,
  });
}

function requiredFeatures(ast: Ast): Feature[] {
  const features = new Set<Feature>();
  if (ast.label) features.add("alias");
  if (ast.title) features.add("title");
  if (ast.reference) features.add("reference");
  if (ast.anchor) features.add("anchor");
  if (ast.block) features.add("block");
  if (ast.embed) features.add("embed");
  if (ast.query) features.add("query");
  if (ast.path?.extension) features.add("path-extension");
  if (ast.path?.containers?.length) features.add("path-containers");
  return [...features];
}

function diagnosticsFor(ast: Ast, syntax: Syntax, context?: RenderContext): Diagnostic[] {
  const level = context?.lossy === "warn" ? "warning" : "error";
  return requiredFeatures(ast)
    .filter((feature) => !syntax.supports.includes(feature))
    .map((feature) => ({ level, feature, message: `Syntax ${syntax.id} cannot render feature ${feature}` }));
}

function result(syntax: Syntax, ast: Ast, value: string, context?: RenderContext): RenderResult {
  const diagnostics = diagnosticsFor(ast, syntax, context);
  if (diagnostics.some((d) => d.level === "error")) return { diagnostics };
  return { value, diagnostics };
}

function normalizedName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[\s_-]+/g, "");
}

function pathWithoutExtension(path: string): string {
  return path.replace(/\.md$/i, "");
}

function basename(path: string): string {
  return pathWithoutExtension(path).split(/[\/]/).filter(Boolean).pop() ?? pathWithoutExtension(path);
}

function splitFragment(raw: string): { path: string; fragment: string } {
  const index = raw.indexOf("#");
  if (index < 0) return { path: raw, fragment: "" };
  return { path: raw.slice(0, index), fragment: raw.slice(index) };
}

function dirname(path: string): string {
  return path.split(/[\/]/).slice(0, -1).join("/");
}

function entryMatches(entry: FileIndexEntry, target: string): boolean {
  const targetNoExt = pathWithoutExtension(target);
  const pathNoExt = pathWithoutExtension(entry.path);
  if (pathNoExt.toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (basename(entry.path).toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (normalizedName(basename(entry.path)) === normalizedName(target)) return true;
  if (entry.title && normalizedName(entry.title) === normalizedName(target)) return true;
  return entry.aliases?.some((alias) => normalizedName(alias) === normalizedName(target)) ?? false;
}

function sourceRelativeMatch(files: FileIndexEntry[], target: string, sourcePath?: string): FileIndexEntry | undefined {
  if (!sourcePath || target.includes("/") || target.includes("\\")) return undefined;
  const base = dirname(sourcePath);
  if (!base) return undefined;
  const wanted = `${base}/${pathWithoutExtension(target)}`.toLowerCase();
  return files.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === wanted);
}

function resolved(raw: string, context?: ParseContext): string {
  const { path, fragment } = splitFragment(raw);
  const custom = context?.fileIndex?.resolvePath?.(path, context.sourcePath);
  if (custom) return `${custom}${fragment}`;

  const files = context?.fileIndex?.files ?? [];
  const match = sourceRelativeMatch(files, path, context?.sourcePath) ?? files.find((entry) => entryMatches(entry, path));
  return match ? `${match.path}${fragment}` : raw;
}

function exactEntryForResolvedTarget(target: string, context?: ParseContext): FileIndexEntry | undefined {
  const { path } = splitFragment(target);
  const pathNoExt = pathWithoutExtension(path).toLowerCase();
  return context?.fileIndex?.files?.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === pathNoExt);
}

function validateResolvedFragment(ast: Ast, entry: FileIndexEntry | undefined): void {
  if (!entry) return;
  if (ast.anchor && entry.headings && !entry.headings.includes(ast.anchor)) {
    throw new Error(`Heading ${ast.anchor} not found in ${entry.path}`);
  }
  if (ast.block && entry.blocks && !entry.blocks.includes(ast.block)) {
    throw new Error(`Block ${ast.block} not found in ${entry.path}`);
  }
}

const WIKILINK = /^(!)?\[\[([^|\[\]]+)(?:\|([^\]]*))?\]\]$/;

function findWikilink(input: string, startIndex = 0): Match | null {
  const candidate = /!?\[\[[^\[\]]+\]\]/g;
  candidate.lastIndex = startIndex;
  let match: RegExpExecArray | null;
  while ((match = candidate.exec(input)) !== null) {
    const before = input[match.index - 1];
    const after = input[match.index + match[0].length];
    if (before !== "[" && before !== "!" && after !== "]") return spanFrom(match);
  }
  return null;
}

export const obsidianSyntax: Syntax = {
  id: "obsidian",
  supports: ["alias", "anchor", "block", "embed", "path-extension", "path-containers"],
  match(input: string, options?: MatchOptions) {
    return findWikilink(input, options?.startIndex);
  },
  parse(input: string, context?: ParseContext) {
    const match = input.match(WIKILINK);
    if (!match?.[2]) throw new Error(`Invalid obsidian link: ${input}`);
    const target = resolved(match[2], context);
    const ast: Ast = {
      raw: input,
      ...parseTarget(target),
      ...(match[3] !== undefined ? { label: { raw: match[3], semantic: "literal" } as const } : {}),
      ...(match[1] ? { embed: true } : {}),
      provenance: { syntax: this.id, rule: "wikilink" },
    };
    validateResolvedFragment(ast, exactEntryForResolvedTarget(target, context));
    return ast;
  },
  render(ast: Ast, context?: RenderContext) {
    const value = `${ast.embed ? "!" : ""}[[${renderTarget(ast)}${ast.label ? `|${ast.label.raw}` : ""}]]`;
    return result(this, ast, value, context);
  },
};

export const wikilinkSyntax: Syntax = { ...obsidianSyntax, id: "wikilink" };

type GrammarToken = {
  kind: "inline-link" | "full-reference-link" | "collapsed-reference-link" | "shortcut-reference-link" | "autolink" | "extended-autolink";
  label: string;
  destination?: string;
  title?: string;
  reference?: string;
};

type GrammarParser = (input: string) => GrammarToken;

const parseCommonmarkGrammar: GrammarParser = (input) => parseLinkGrammar(input, { startRule: "CommonMarkLink" }) as GrammarToken;
const parseGfmGrammar: GrammarParser = (input) => parseLinkGrammar(input, { startRule: "GfmLink" }) as GrammarToken;

function normalizeReferenceLabel(label: string): string {
  return label.trim().replace(/[\t\n ]+/g, " ").toLowerCase();
}

function referenceDefinition(label: string, context?: ParseContext) {
  const expected = normalizeReferenceLabel(label);
  return Object.entries(context?.referenceDefinitions ?? {}).find(([key]) => normalizeReferenceLabel(key) === expected)?.[1];
}

function candidateEnd(input: string, start: number): number | undefined {
  if (input[start] === "<") {
    const close = input.indexOf(">", start + 1);
    return close < 0 ? undefined : close + 1;
  }
  if (input[start] !== "[") return undefined;
  let close = -1;
  let labelDepth = 0;
  for (let index = start + 1; index < input.length; index++) {
    const char = input[index];
    if (char === "\\") { index++; continue; }
    if (char === "[") labelDepth++;
    else if (char === "]") {
      if (labelDepth === 0) { close = index; break; }
      labelDepth--;
    }
  }
  if (close < 0) return undefined;
  if (input[close + 1] === "[") {
    const referenceEnd = input.indexOf("]", close + 2);
    return referenceEnd < 0 ? undefined : referenceEnd + 1;
  }
  if (input[close + 1] !== "(") return close + 1;

  let depth = 0;
  let angleDestination = false;
  for (let index = close + 2; index < input.length; index++) {
    const char = input[index];
    if (char === "\\") {
      index++;
      continue;
    }
    if (char === "<") angleDestination = true;
    if (char === ">") angleDestination = false;
    if (angleDestination) continue;
    if (char === "(") depth++;
    if (char === ")") {
      if (depth === 0) return index + 1;
      depth--;
    }
  }
  return undefined;
}

function gfmBareCandidates(input: string, startIndex: number): Array<{ start: number; end: number }> {
  const candidates: Array<{ start: number; end: number }> = [];
  const expression = /https?:\/\/[^\s<]+|www\.[^\s<]+|[A-Za-z0-9._+-]+@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/g;
  expression.lastIndex = startIndex;
  let match: RegExpExecArray | null;
  while ((match = expression.exec(input)) !== null) {
    let raw = match[0];
    raw = raw.replace(/[?!.,:*_~]+$/, "");
    let opens = 0;
    let closes = 0;
    for (const char of raw) {
      if (char === "(") opens++;
      if (char === ")") closes++;
    }
    while (raw.endsWith(")") && closes > opens) {
      raw = raw.slice(0, -1);
      closes--;
    }
    if (raw) candidates.push({ start: match.index, end: match.index + raw.length });
  }
  return candidates;
}

function findGrammarMatch(input: string, parser: GrammarParser, startIndex = 0, includeGfmExtensions = false): Match | null {
  const candidates = gfmBareCandidates(input, startIndex);
  for (let start = startIndex; start < input.length; start++) {
    const end = candidateEnd(input, start);
    if (end) candidates.push({ start, end });
  }

  candidates.sort((left, right) => left.start - right.start || right.end - left.end);
  for (const candidate of candidates) {
    try {
      const raw = input.slice(candidate.start, candidate.end);
      const token = parser(raw);
      if (!includeGfmExtensions && token.kind === "extended-autolink") continue;
      const before = input[candidate.start - 1];
      const isWebAutolink = token.kind === "extended-autolink" && !token.destination?.startsWith("mailto:");
      if (isWebAutolink && before && !/[\s*_~(]/.test(before)) continue;
      return { raw, span: candidate };
    } catch {
      // The grammar decides validity after a linear candidate scan.
    }
  }
  return null;
}

function parseWithGrammar(input: string, id: "commonmark" | "gfm", parser: GrammarParser, context?: ParseContext): Ast {
  let token: GrammarToken;
  try {
    token = parser(input);
  } catch {
    throw new Error(`Invalid ${id} link: ${input}`);
  }

  const definition = token.reference ? referenceDefinition(token.reference, context) : undefined;
  if (token.reference && !definition) throw new Error(`Unknown CommonMark reference: ${token.reference}`);
  const destination = token.destination ?? definition?.destination;
  if (destination === undefined) throw new Error(`Invalid ${id} link: ${input}`);
  const referenceStyle = token.kind.replace("-reference-link", "") as "full" | "collapsed" | "shortcut";

  return {
    raw: input,
    ...parseTarget(destination),
    label: { raw: token.label, semantic: token.label ? "literal" : "empty" },
    ...(token.title ?? definition?.title ? { title: token.title ?? definition?.title } : {}),
    ...(token.reference ? { reference: { label: token.reference, style: referenceStyle } } : {}),
    provenance: { syntax: id, rule: token.kind },
  };
}

function renderMarkdown(ast: Ast, syntax: Syntax, context?: RenderContext): RenderResult {
  const target = renderSupportedTarget(ast, syntax);
  const label = ast.label?.raw ?? target;
  if (ast.reference) {
    const suffix = ast.reference.style === "shortcut" ? "" : ast.reference.style === "collapsed" ? "[]" : `[${ast.reference.label}]`;
    return result(syntax, ast, `[${label}]${suffix}`, context);
  }
  if (ast.provenance?.rule === "autolink") return result(syntax, ast, `<${ast.label?.raw ?? target}>`, context);
  if (ast.provenance?.rule === "extended-autolink") return result(syntax, ast, ast.label?.raw ?? target, context);
  const title = ast.title ? ` "${ast.title.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : "";
  const destination = /[\s()<>]/.test(target) ? `<${target}>` : target;
  return result(syntax, ast, `[${label}](${destination}${title})`, context);
}

export const commonmarkSyntax: Syntax = {
  id: "commonmark",
  supports: ["alias", "title", "reference", "anchor", "query", "path-extension", "path-containers"],
  match(input: string, options?: MatchOptions) {
    return findGrammarMatch(input, parseCommonmarkGrammar, options?.startIndex);
  },
  parse(input: string, context?: ParseContext) {
    return parseWithGrammar(input, "commonmark", parseCommonmarkGrammar, context);
  },
  render(ast: Ast, context?: RenderContext) {
    return renderMarkdown(ast, this, context);
  },
};

export const gfmSyntax: Syntax = {
  ...commonmarkSyntax,
  id: "gfm",
  match(input: string, options?: MatchOptions) {
    return findGrammarMatch(input, parseGfmGrammar, options?.startIndex, true);
  },
  parse(input: string, context?: ParseContext) {
    return parseWithGrammar(input, "gfm", parseGfmGrammar, context);
  },
};

export const urlSyntax: Syntax = {
  id: "url",
  supports: PATH_FEATURES,
  match(input: string, options?: MatchOptions) {
    const startIndex = options?.startIndex ?? 0;
    const match = /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s)\]]+/g.exec(input.slice(startIndex));
    if (!match) return null;
    match[0] = match[0].replace(/[.,!?;:]+$/, "");
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input: string) {
    return { raw: input, ...parseTarget(input), provenance: { syntax: "url", rule: "bare" } };
  },
  render(ast: Ast, context?: RenderContext) {
    return result(this, ast, renderSupportedTarget(ast, this), context);
  },
};

export function parseLink(input: string, syntax: Syntax, context?: ParseContext): Ast {
  return syntax.parse(input, context);
}

export function renderLink(ast: Ast, syntax: Syntax, context?: RenderContext): RenderResult {
  return syntax.render(ast, context);
}

export interface SyntaxRegistry {
  register(syntax: Syntax): void;
  get(id: string): Syntax | undefined;
  list(): Syntax[];
}

export function createSyntaxRegistry(initial: Syntax[] = []): SyntaxRegistry {
  const byId = new Map<string, Syntax>();
  const registry: SyntaxRegistry = {
    register(syntax: Syntax) {
      if (!syntax.id) throw new Error("Syntax id is required");
      if (byId.has(syntax.id)) throw new Error(`Syntax ${syntax.id} is already registered`);
      byId.set(syntax.id, syntax);
    },
    get(id: string) {
      return byId.get(id);
    },
    list() {
      return [...byId.values()];
    },
  };
  for (const syntax of initial) registry.register(syntax);
  return registry;
}

const defaultRegistry = createSyntaxRegistry([commonmarkSyntax, gfmSyntax, obsidianSyntax, urlSyntax, wikilinkSyntax]);

export function registerSyntax(syntax: Syntax): void {
  defaultRegistry.register(syntax);
}

export function getSyntax(id: string): Syntax | undefined {
  return defaultRegistry.get(id);
}

export function syntaxes(): Syntax[] {
  return defaultRegistry.list();
}
