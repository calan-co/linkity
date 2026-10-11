'use strict';

// src/syntaxes/index.ts
var PATH_FEATURES = ["anchor", "query", "path-extension", "path-containers"];
function spanFrom(match) {
  return { raw: match[0], span: { start: match.index, end: match.index + match[0].length } };
}
function parseQuery(input) {
  if (!input) return void 0;
  const query = {};
  for (const part of input.split("&").filter(Boolean)) {
    const [rawKey, rawValue] = part.split("=");
    if (!rawKey) continue;
    const key = decodeURIComponent(rawKey);
    const value = rawValue === void 0 ? true : decodeURIComponent(rawValue);
    const existing = query[key];
    if (existing === void 0) query[key] = value;
    else query[key] = Array.isArray(existing) ? [...existing, String(value)] : [String(existing), String(value)];
  }
  return Object.keys(query).length ? query : void 0;
}
function renderQuery(query) {
  if (!query) return "";
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    } else if (value === true) parts.push(encodeURIComponent(key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}
function parsePath(rawPath) {
  if (!rawPath) return void 0;
  const absolute = rawPath.startsWith("/");
  const separator = rawPath.includes("\\") ? "\\" : "/";
  const parts = rawPath.split(/[\\/]/).filter(Boolean);
  const file = parts.pop();
  if (!file) return { absolute, separator };
  const dot = file.lastIndexOf(".");
  const hasExtension = dot > 0 && dot < file.length - 1;
  return {
    ...parts.length ? { containers: parts } : {},
    resource: hasExtension ? file.slice(0, dot) : file,
    ...hasExtension ? { extension: file.slice(dot + 1) } : {},
    separator,
    absolute
  };
}
function renderPath(path) {
  if (!path) return "";
  const separator = path.separator ?? "/";
  const parts = [...path.containers ?? []];
  const resource = `${path.resource ?? ""}${path.extension ? `.${path.extension}` : ""}`;
  if (resource) parts.push(resource);
  return `${path.absolute ? separator : ""}${parts.join(separator)}`;
}
function parseTarget(raw) {
  const url = raw.match(/^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]*)(.*)$/);
  const scheme = url?.[1];
  const authority = url?.[2];
  let rest = url ? url[3] ?? "" : raw;
  let anchor;
  let block;
  const hashIndex = rest.indexOf("#");
  if (hashIndex >= 0) {
    const fragment = rest.slice(hashIndex + 1);
    rest = rest.slice(0, hashIndex);
    if (fragment.startsWith("^")) block = fragment.slice(1);
    else anchor = fragment || void 0;
  }
  let query;
  const queryIndex = rest.indexOf("?");
  if (queryIndex >= 0) {
    query = parseQuery(rest.slice(queryIndex + 1));
    rest = rest.slice(0, queryIndex);
  }
  return {
    ...scheme ? { scheme } : {},
    ...authority ? { authority } : {},
    ...parsePath(rest) ? { path: parsePath(rest) } : {},
    ...anchor ? { anchor } : {},
    ...block ? { block } : {},
    ...query ? { query } : {}
  };
}
function renderTarget(ast) {
  const prefix = ast.scheme ? `${ast.scheme}://${ast.authority ?? ""}` : "";
  const fragment = ast.block ? `#^${ast.block}` : ast.anchor ? `#${ast.anchor}` : "";
  return `${prefix}${renderPath(ast.path)}${renderQuery(ast.query)}${fragment}`;
}
function renderSupportedTarget(ast, syntax) {
  return renderTarget({
    ...ast,
    anchor: syntax.supports.includes("anchor") ? ast.anchor : void 0,
    block: syntax.supports.includes("block") ? ast.block : void 0,
    query: syntax.supports.includes("query") ? ast.query : void 0,
    path: ast.path ? {
      ...ast.path,
      containers: syntax.supports.includes("path-containers") ? ast.path.containers : void 0,
      extension: syntax.supports.includes("path-extension") ? ast.path.extension : void 0
    } : void 0
  });
}
function requiredFeatures(ast) {
  const features = /* @__PURE__ */ new Set();
  if (ast.label) features.add("alias");
  if (ast.anchor) features.add("anchor");
  if (ast.block) features.add("block");
  if (ast.embed) features.add("embed");
  if (ast.query) features.add("query");
  if (ast.path?.extension) features.add("path-extension");
  if (ast.path?.containers?.length) features.add("path-containers");
  return [...features];
}
function diagnosticsFor(ast, syntax, context) {
  const level = context?.lossy === "warn" ? "warning" : "error";
  return requiredFeatures(ast).filter((feature) => !syntax.supports.includes(feature)).map((feature) => ({ level, feature, message: `Syntax ${syntax.id} cannot render feature ${feature}` }));
}
function result(syntax, ast, value, context) {
  const diagnostics = diagnosticsFor(ast, syntax, context);
  if (diagnostics.some((d) => d.level === "error")) return { diagnostics };
  return { value, diagnostics };
}
function normalizedName(value) {
  return value.toLowerCase().replace(/\.md$/i, "").replace(/[\s_-]+/g, "");
}
function pathWithoutExtension(path) {
  return path.replace(/\.md$/i, "");
}
function basename(path) {
  return pathWithoutExtension(path).split(/[\/]/).filter(Boolean).pop() ?? pathWithoutExtension(path);
}
function splitFragment(raw) {
  const index = raw.indexOf("#");
  if (index < 0) return { path: raw, fragment: "" };
  return { path: raw.slice(0, index), fragment: raw.slice(index) };
}
function dirname(path) {
  return path.split(/[\/]/).slice(0, -1).join("/");
}
function entryMatches(entry, target) {
  const targetNoExt = pathWithoutExtension(target);
  const pathNoExt = pathWithoutExtension(entry.path);
  if (pathNoExt.toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (basename(entry.path).toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (normalizedName(basename(entry.path)) === normalizedName(target)) return true;
  if (entry.title && normalizedName(entry.title) === normalizedName(target)) return true;
  return entry.aliases?.some((alias) => normalizedName(alias) === normalizedName(target)) ?? false;
}
function sourceRelativeMatch(files, target, sourcePath) {
  if (!sourcePath || target.includes("/") || target.includes("\\")) return void 0;
  const base = dirname(sourcePath);
  if (!base) return void 0;
  const wanted = `${base}/${pathWithoutExtension(target)}`.toLowerCase();
  return files.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === wanted);
}
function resolved(raw, context) {
  const { path, fragment } = splitFragment(raw);
  const custom = context?.fileIndex?.resolvePath?.(path, context.sourcePath);
  if (custom) return `${custom}${fragment}`;
  const files = context?.fileIndex?.files ?? [];
  const match = sourceRelativeMatch(files, path, context?.sourcePath) ?? files.find((entry) => entryMatches(entry, path));
  return match ? `${match.path}${fragment}` : raw;
}
function exactEntryForResolvedTarget(target, context) {
  const { path } = splitFragment(target);
  const pathNoExt = pathWithoutExtension(path).toLowerCase();
  return context?.fileIndex?.files?.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === pathNoExt);
}
function validateResolvedFragment(ast, entry) {
  if (!entry) return;
  if (ast.anchor && entry.headings && !entry.headings.includes(ast.anchor)) {
    throw new Error(`Heading ${ast.anchor} not found in ${entry.path}`);
  }
  if (ast.block && entry.blocks && !entry.blocks.includes(ast.block)) {
    throw new Error(`Block ${ast.block} not found in ${entry.path}`);
  }
}
var obsidianSyntax = {
  id: "obsidian",
  supports: ["alias", "anchor", "block", "embed", "query", "path-extension", "path-containers"],
  match(input, options) {
    const startIndex = options?.startIndex ?? 0;
    const match = /!{0,1}\[\[[^\]]+\]\]/g.exec(input.slice(startIndex));
    if (!match) return null;
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input, context) {
    const match = input.match(/^(!)?\[\[([^|\]]+)(?:\|([^\]]*))?\]\]$/);
    if (!match?.[2]) throw new Error(`Invalid obsidian link: ${input}`);
    const target = resolved(match[2], context);
    const ast = {
      raw: input,
      ...parseTarget(target),
      ...match[3] !== void 0 ? { label: { raw: match[3], semantic: "literal" } } : {},
      ...match[1] ? { embed: true } : {},
      provenance: { syntax: this.id, rule: "wikilink" }
    };
    validateResolvedFragment(ast, exactEntryForResolvedTarget(target, context));
    return ast;
  },
  render(ast, context) {
    const value = `${ast.embed ? "!" : ""}[[${renderTarget(ast)}${ast.label ? `|${ast.label.raw}` : ""}]]`;
    return result(this, ast, value, context);
  }
};
var wikilinkSyntax = { ...obsidianSyntax, id: "wikilink" };
var gfmSyntax = {
  id: "gfm",
  supports: ["alias", "anchor", "query", "path-extension", "path-containers"],
  match(input, options) {
    const startIndex = options?.startIndex ?? 0;
    const match = /\[[^\]]+\]\([^)]+\)/g.exec(input.slice(startIndex));
    if (!match) return null;
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input) {
    const match = input.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match?.[1] || !match[2]) throw new Error(`Invalid gfm link: ${input}`);
    return {
      raw: input,
      ...parseTarget(match[2]),
      label: { raw: match[1], semantic: "literal" },
      provenance: { syntax: "gfm", rule: "inline-link" }
    };
  },
  render(ast, context) {
    const target = renderSupportedTarget(ast, this);
    const label = ast.label?.raw ?? ast.path?.resource ?? target;
    return result(this, ast, `[${label}](${target})`, context);
  }
};
var urlSyntax = {
  id: "url",
  supports: PATH_FEATURES,
  match(input, options) {
    const startIndex = options?.startIndex ?? 0;
    const match = /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s)\]]+/g.exec(input.slice(startIndex));
    if (!match) return null;
    match[0] = match[0].replace(/[.,!?;:]+$/, "");
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input) {
    return { raw: input, ...parseTarget(input), provenance: { syntax: "url", rule: "bare" } };
  },
  render(ast, context) {
    return result(this, ast, renderSupportedTarget(ast, this), context);
  }
};
function parseLink(input, syntax, context) {
  return syntax.parse(input, context);
}
function renderLink(ast, syntax, context) {
  return syntax.render(ast, context);
}
function createSyntaxRegistry(initial = []) {
  const byId = /* @__PURE__ */ new Map();
  const registry = {
    register(syntax) {
      if (!syntax.id) throw new Error("Syntax id is required");
      if (byId.has(syntax.id)) throw new Error(`Syntax ${syntax.id} is already registered`);
      byId.set(syntax.id, syntax);
    },
    get(id) {
      return byId.get(id);
    },
    list() {
      return [...byId.values()];
    }
  };
  for (const syntax of initial) registry.register(syntax);
  return registry;
}
var defaultRegistry = createSyntaxRegistry([gfmSyntax, obsidianSyntax, urlSyntax, wikilinkSyntax]);
function registerSyntax(syntax) {
  defaultRegistry.register(syntax);
}
function getSyntax(id) {
  return defaultRegistry.get(id);
}
function syntaxes() {
  return defaultRegistry.list();
}

// src/parsers/wikilink.ts
function parseWikilink(text) {
  const results = [];
  let index = 0;
  while (index < text.length) {
    const match = obsidianSyntax.match(text, { startIndex: index });
    if (!match) break;
    results.push({ ...obsidianSyntax.parse(match.raw), span: match.span });
    index = match.span.end;
  }
  return results;
}

// src/parsers/markdown.ts
function parseMarkdownLink(text) {
  const results = [];
  let index = 0;
  while (index < text.length) {
    const match = gfmSyntax.match(text, { startIndex: index });
    if (!match) break;
    results.push({ ...gfmSyntax.parse(match.raw), span: match.span });
    index = match.span.end;
  }
  return results;
}

// src/parsers/url.ts
function parseRawUrl(text, customSchemes = []) {
  const results = [];
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

// src/utils/detect.ts
function detectLinkType(_str) {
  const str = _str;
  if (/^\[\[[^\]|]+(\|[^\]]+)?\]\]$/.test(str)) return "wikilink";
  if (/^\[[^\]]+\]\([^\)]+\)$/.test(str)) return "markdown";
  if (/^https?:\/\/.+/.test(str)) return "url";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/.test(str)) return "custom";
  return null;
}

// src/utils/index.ts
function visitLinks(links, visitor) {
  if (!Array.isArray(links)) return;
  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!link) continue;
    const res = visitor(link, i, links);
    if (typeof res !== "undefined") results.push(res);
  }
  return results.length ? results : void 0;
}

// src/index.ts
function getNonCodeRanges(text) {
  const ranges = [];
  const fenceRe = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let m;
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
function parseLinks(text, options) {
  const { enableWikilink = true, enableMarkdown = true, enableUrl = true } = options || {};
  const results = [];
  for (const { start, end } of getNonCodeRanges(text)) {
    if (start >= end) continue;
    const slice = text.slice(start, end);
    const offset = (node) => node.span ? { ...node, span: { start: node.span.start + start, end: node.span.end + start } } : node;
    const rangeLinks = [];
    if (enableWikilink) rangeLinks.push(...parseWikilink(slice));
    if (enableMarkdown) rangeLinks.push(...parseMarkdownLink(slice));
    if (enableUrl) {
      const occupied = rangeLinks.flatMap((link) => link.span ? [link.span] : []);
      rangeLinks.push(
        ...parseRawUrl(slice, options?.customSchemes).filter(
          (link) => !link.span || !occupied.some((span) => link.span.start >= span.start && link.span.end <= span.end)
        )
      );
    }
    results.push(...rangeLinks.map(offset));
  }
  return results;
}

exports.createSyntaxRegistry = createSyntaxRegistry;
exports.detectLinkType = detectLinkType;
exports.getSyntax = getSyntax;
exports.gfmSyntax = gfmSyntax;
exports.obsidianSyntax = obsidianSyntax;
exports.parseLink = parseLink;
exports.parseLinks = parseLinks;
exports.parseMarkdownLink = parseMarkdownLink;
exports.parseRawUrl = parseRawUrl;
exports.parseWikilink = parseWikilink;
exports.registerSyntax = registerSyntax;
exports.renderLink = renderLink;
exports.syntaxes = syntaxes;
exports.urlSyntax = urlSyntax;
exports.visitLinks = visitLinks;
exports.wikilinkSyntax = wikilinkSyntax;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map