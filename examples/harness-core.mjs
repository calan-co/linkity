import {
  commonmarkSyntax,
  createSyntaxRegistry,
  gfmSyntax,
  obsidianSyntax,
  urlSyntax,
  wikilinkSyntax,
} from "../dist/index.mjs";

export const PEG_KEYWORDS = ["match", "render"];
export const PEG_COMPONENTS = ["target", "label"];
export const AVAILABLE_FEATURES = ["alias", "anchor", "block", "embed", "query", "path-extension", "path-containers"];

const PEG_PRESETS = {
  commonmark: 'match "[" label "](" target ")"\nrender "[" label "](" target ")"',
  gfm: 'match "[" label "](" target ")"\nrender "[" label "](" target ")"',
  obsidian: 'match embed? "[[" target ("|" label)? "]]"\nrender embed? "[[" target ("|" label)? "]]"',
  wikilink: 'match embed? "[[" target ("|" label)? "]]"\nrender embed? "[[" target ("|" label)? "]]"',
  url: 'match target\nrender target',
  anchor: 'match "<a href=\\\"" target "\\\">" label "</a>"\nrender "<a href=\\\"" target "\\\">" label "</a>"',
};

function gfmHref(value) {
  const href = value?.match(/^\[[^\]]*\]\((.*)\)$/)?.[1] ?? "";
  return href.startsWith("<") && href.endsWith(">") ? href.slice(1, -1) : href;
}

function pegLines(source) {
  const lines = Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...rest] = line.split(/\s+/);
        return [name, rest.join(" ")];
      })
  );
  if (!lines.match) throw new Error('PEG requires a "match" line');
  if (!lines.render) throw new Error('PEG requires a "render" line');
  return lines;
}

function parsePeg(expression) {
  let index = 0;

  function skipSpace() {
    while (/\s/.test(expression[index] ?? "")) index++;
  }

  function sequence(stop = "") {
    const nodes = [];
    while (index < expression.length) {
      skipSpace();
      if (stop && expression[index] === stop) break;
      if (expression[index] === '"') {
        index++;
        let value = "";
        while (index < expression.length && expression[index] !== '"') {
          value += expression[index] === "\\" ? expression[++index] ?? "" : expression[index];
          index++;
        }
        if (expression[index++] !== '"') throw new Error("Unterminated PEG literal");
        nodes.push({ type: "literal", value });
      } else if (expression[index] === "(") {
        index++;
        const children = sequence(")");
        if (expression[index++] !== ")") throw new Error("Unterminated PEG group");
        const optional = expression[index] === "?";
        if (optional) index++;
        nodes.push({ type: "group", children, optional });
      } else {
        const match = expression.slice(index).match(/^[A-Za-z][A-Za-z0-9_.-]*/);
        if (!match) throw new Error(`Invalid PEG token near ${expression.slice(index)}`);
        index += match[0].length;
        const optional = expression[index] === "?";
        if (optional) index++;
        nodes.push({ type: "component", value: match[0], optional });
      }
    }
    return nodes;
  }

  const nodes = sequence();
  skipSpace();
  if (index !== expression.length) throw new Error(`Invalid PEG near ${expression.slice(index)}`);
  return nodes;
}

function componentPattern(component) {
  if (component === "embed") return "!";
  if (component === "target") return "[^|\\]]+?";
  if (component === "label") return "[^\\]]+?";
  return "[\\s\\S]+?";
}

function nodesToRegex(nodes) {
  return nodes
    .map((node) => {
      if (node.type === "literal") return node.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (node.type === "component") {
        const capture = `(?<${node.value}>${componentPattern(node.value)})`;
        return node.optional ? `${capture}?` : capture;
      }
      const group = `(?:${nodesToRegex(node.children)})`;
      return node.optional ? `${group}?` : group;
    })
    .join("");
}

function componentValue(component, ast, captures = {}) {
  if (component === "embed") return ast.embed ? "!" : "";
  if (component === "target") return captures.target ?? gfmHref(gfmSyntax.render(ast, { lossy: "warn" }).value);
  if (component === "label") return captures.label ?? ast.label?.raw ?? "";
  return captures[component] ?? "";
}

function renderNodes(nodes, ast, captures = {}) {
  return nodes
    .map((node) => {
      if (node.type === "literal") return node.value;
      if (node.type === "component") return componentValue(node.value, ast, captures);
      const rendered = renderNodes(node.children, ast, captures);
      return node.optional && !rendered.replace(/[^!A-Za-z0-9]/g, "") ? "" : rendered;
    })
    .join("");
}

function astFromCaptures(input, id, captures) {
  const target = captures.target ?? captures.href;
  const label = captures.label ?? captures.text;
  if (target) {
    const destination = /[\s()<>]/.test(target) ? `<${target}>` : target;
    const ast = { ...gfmSyntax.parse(`[${label ?? target}](${destination})`), raw: input, provenance: { syntax: id, rule: "peg" } };
    if (!label) delete ast.label;
    if (captures.embed) ast.embed = true;
    return ast;
  }
  return { raw: input, label: label ? { raw: label, semantic: "literal" } : undefined, provenance: { syntax: id, rule: "peg" } };
}

export function compilePegSyntax({ id, supports = [], pegSource }) {
  if (!id) throw new Error("Custom syntax id is required");
  const lines = pegLines(pegSource);
  const matchNodes = parsePeg(lines.match);
  const renderNodesList = parsePeg(lines.render);
  const matcher = new RegExp(nodesToRegex(matchNodes));
  return {
    id,
    supports,
    pegSource,
    match(input, options = {}) {
      const offset = options.startIndex ?? 0;
      const match = input.slice(offset).match(matcher);
      if (!match) return null;
      const start = offset + match.index;
      return { raw: match[0], span: { start, end: start + match[0].length } };
    },
    parse(input) {
      const match = input.match(new RegExp(`^${matcher.source}$`));
      if (!match) throw new Error(`Invalid ${id} link: ${input}`);
      return astFromCaptures(input, id, match.groups ?? {});
    },
    render(ast) {
      return { value: renderNodes(renderNodesList, ast), diagnostics: [] };
    },
  };
}

export const anchorSyntax = compilePegSyntax({
  id: "anchor",
  supports: ["alias", "anchor", "query", "path-extension", "path-containers"],
  pegSource: PEG_PRESETS.anchor,
});

export const builtInSyntaxes = [commonmarkSyntax, gfmSyntax, obsidianSyntax, wikilinkSyntax, urlSyntax, anchorSyntax];
export const syntaxesById = Object.fromEntries(builtInSyntaxes.map((syntax) => [syntax.id, syntax]));

export function validateLink(input, syntax, context) {
  try {
    const match = syntax.match(input);
    if (!match) return { ok: false, error: `Input does not match ${syntax.id} syntax` };
    const ast = syntax.parse(match.raw, context);
    const rendered = syntax.render(ast, { lossy: "warn" });
    return {
      ok: !rendered.diagnostics.some((diagnostic) => diagnostic.level === "error"),
      match,
      ast,
      rendered: rendered.value,
      diagnostics: rendered.diagnostics,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export function convertLink(input, fromSyntax, toSyntax, context) {
  const ast = fromSyntax.parse(input, context);
  return toSyntax.render(ast, { lossy: "warn" });
}

export function createCustomSyntax(profile) {
  return compilePegSyntax(profile);
}

export function syntaxToSource(syntax) {
  if (!syntax) throw new Error("Syntax is required");
  return {
    id: syntax.id,
    supports: syntax.supports ?? [],
    pegSource: syntax.pegSource ?? PEG_PRESETS[syntax.id] ?? 'match target\nrender target',
  };
}

export function createHarnessRegistry(extraSyntaxes = []) {
  const registry = createSyntaxRegistry(builtInSyntaxes);
  for (const syntax of extraSyntaxes) registry.register(syntax);
  return registry;
}
