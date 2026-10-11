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

const PATH_FEATURES: Feature[] = ["anchor", "query", "path-extension", "path-containers"];

function spanFrom(match: RegExpExecArray): Match {
  return { raw: match[0], span: { start: match.index, end: match.index + match[0].length } };
}

function parseQuery(input: string): Ast["query"] | undefined {
  if (!input) return undefined;
  const query: NonNullable<Ast["query"]> = {};
  for (const part of input.split("&").filter(Boolean)) {
    const [rawKey, rawValue] = part.split("=");
    if (!rawKey) continue;
    const key = decodeURIComponent(rawKey);
    const value = rawValue === undefined ? true : decodeURIComponent(rawValue);
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
  const url = raw.match(/^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]*)(.*)$/);
  const scheme = url?.[1];
  const authority = url?.[2];
  let rest = url ? url[3] ?? "" : raw;

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
  const prefix = ast.scheme ? `${ast.scheme}://${ast.authority ?? ""}` : "";
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

export const obsidianSyntax: Syntax = {
  id: "obsidian",
  supports: ["alias", "anchor", "block", "embed", "query", "path-extension", "path-containers"],
  match(input: string, options?: MatchOptions) {
    const startIndex = options?.startIndex ?? 0;
    const match = /!{0,1}\[\[[^\]]+\]\]/g.exec(input.slice(startIndex));
    if (!match) return null;
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input: string, context?: ParseContext) {
    const match = input.match(/^(!)?\[\[([^|\]]+)(?:\|([^\]]*))?\]\]$/);
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

export const gfmSyntax: Syntax = {
  id: "gfm",
  supports: ["alias", "anchor", "query", "path-extension", "path-containers"],
  match(input: string, options?: MatchOptions) {
    const startIndex = options?.startIndex ?? 0;
    const match = /\[[^\]]+\]\([^)]+\)/g.exec(input.slice(startIndex));
    if (!match) return null;
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input: string) {
    const match = input.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match?.[1] || !match[2]) throw new Error(`Invalid gfm link: ${input}`);
    return {
      raw: input,
      ...parseTarget(match[2]),
      label: { raw: match[1], semantic: "literal" },
      provenance: { syntax: "gfm", rule: "inline-link" },
    };
  },
  render(ast: Ast, context?: RenderContext) {
    const target = renderSupportedTarget(ast, this);
    const label = ast.label?.raw ?? ast.path?.resource ?? target;
    return result(this, ast, `[${label}](${target})`, context);
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

const defaultRegistry = createSyntaxRegistry([gfmSyntax, obsidianSyntax, urlSyntax, wikilinkSyntax]);

export function registerSyntax(syntax: Syntax): void {
  defaultRegistry.register(syntax);
}

export function getSyntax(id: string): Syntax | undefined {
  return defaultRegistry.get(id);
}

export function syntaxes(): Syntax[] {
  return defaultRegistry.list();
}
