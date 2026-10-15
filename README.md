# Linkity

Universal single-link parser and renderer for Node.js and browsers (ESM-first).

## Features

- 🔗 **Syntax Profiles**: Parse and render individual links through registered syntaxes
- 🧠 **Canonical Link AST**: Convert concrete link syntax to a link-scoped `Ast`
- 🔁 **Transforms**: Render one parsed link into another compatible syntax
- ⚠️ **Loss Diagnostics**: Error by default when a target syntax cannot represent an AST feature
- 🎯 **Type-Safe**: Full TypeScript support with type definitions
- 🌍 **Universal**: Works in Node.js and browsers
- 🎨 **ESM-First**: Modern ES modules with CJS fallback
- 🪶 **Lightweight**: Zero dependencies, tree-shakeable

## Installation

```bash
pnpm add linkity
```

## Quick Start

### Node.js (ESM)

```typescript
import { gfmSyntax, obsidianSyntax } from "linkity";

const ast = obsidianSyntax.parse("[[docs/Page.md|Page]]");
const rendered = gfmSyntax.render(ast);
console.log(rendered.value); // [Page](docs/Page.md)
```

### Node.js (CommonJS)

```javascript
const { gfmSyntax, obsidianSyntax } = require("linkity");

const ast = obsidianSyntax.parse("[[docs/Page.md|Page]]");
const rendered = gfmSyntax.render(ast);
console.log(rendered.value); // [Page](docs/Page.md)
```

### Browser (ESM)

```html
<script type="module">
  import { parseLinks } from "./node_modules/linkity/dist/index.browser.mjs";

  const links = parseLinks(document.body.textContent);
  console.log(links);
</script>
```

## API

### `Syntax`

A syntax is a dialect bundle for one concrete link notation. It must cheaply `match()` candidate spans, `parse()` one link string into canonical `Ast`, and `render()` an `Ast` back to that syntax. Linkity does not parse whole documents; consumers provide document spans and graph/file context.

```typescript
interface Syntax {
  id: string;
  supports: Feature[];
  match(input: string): Match | null;
  parse(input: string, context?: ParseContext): Ast;
  render(ast: Ast, context?: RenderContext): RenderResult;
}
```

Built-ins include `gfmSyntax`, `obsidianSyntax`, `wikilinkSyntax`, and `urlSyntax`.

### Obsidian resolver context

`obsidianSyntax.parse()` can resolve relative wikilinks when callers provide a file index:

```typescript
const ast = obsidianSyntax.parse("[[README#Intro]]", {
  fileIndex: {
    files: [{ path: "docs/README.md", title: "Read Me", aliases: ["Start Here"] }],
  },
});
```

Resolution is deterministic and context-only: Linkity never scans the filesystem or creates missing files.

### Syntax registry

Use the registry for extension syntaxes:

```typescript
import { createSyntaxRegistry, gfmSyntax } from "linkity";

const registry = createSyntaxRegistry([gfmSyntax]);
registry.register(mySyntax);
const syntax = registry.get("my-syntax");
```

The package-level registry starts with built-ins and can be extended with `registerSyntax()`.

### `parseLinks(text: string, options?: ParseOptions): Ast[]`

Convenience wrapper for existing whole-string extraction. The primitive API is still one-link `Syntax.parse()` / `Syntax.render()`.

### `detectLinkType(str: string): LinkType | null`

Detects the link type from a string.

**Returns:** `"wikilink" | "markdown" | "url" | "custom" | null`

### Types

```typescript
interface Ast {
  raw?: string;
  span?: Span;
  scheme?: string;
  authority?: string;
  path?: { containers?: string[]; resource?: string; extension?: string; separator?: string; absolute?: boolean };
  anchor?: string;
  block?: string;
  query?: Record<string, string | string[] | true>;
  label?: { raw: string; semantic?: "literal" | "implicit" | "empty" };
  embed?: boolean;
  provenance?: Provenance;
}
```

## Product Role Contract

Linkity owns universal single-link parsing and rendering:

- concrete link syntax parsing through `Syntax.parse()`
- cheap candidate detection through `Syntax.match()`
- canonical link-scoped `Ast` fields and provenance
- feature support declarations and lossy render diagnostics
- rendering one canonical link AST into a target syntax

Linkity does not own schema policy, work-item lifecycle policy, repository traversal, graph persistence, document parsing, or CI gate outcomes. Consumers such as Doc-Vader provide artifact indexes, lifecycle state, file loading, and policy decisions through adapters and caller-provided context.

## Ecosystem Boundaries

Linkity enables graph and document tooling, but does not own their state:

- **Automatic link updates:** a graph/index tool detects target renames or moves, then asks Linkity to parse and render each affected single link.
- **Dynamic title resolution:** a resolver supplies current target titles; Linkity preserves label semantics but does not watch files or titles.
- **Document-wide transforms:** a document parser finds candidate spans with `Syntax.match()`; Linkity parses and renders each matched link string.

Linkity does not load files, persist edits, maintain a link graph, or traverse repositories.

## Examples

See the `examples/` directory for more usage examples:

- `basic-usage.mjs` - Node.js example
- `browser-usage.html` - Browser example
- `harness.html` - Development harness for syntax validation, translation, and custom profile testing

## Migration Notes

The canonical public model is now `Ast`. Legacy names remain as deprecated aliases for compatibility:

- `LinkNode` -> `Ast`
- `LinkityParseOptions` -> `ParseOptions`

Prefer canonical AST fields such as `scheme`, `authority`, `path`, `anchor`, `query`, `label`, and `provenance`. Do not treat `url` as a canonical AST property; URL-like links are represented as one syntax projection over the same AST.

`parseLinks()` remains a compatibility convenience for scanning strings. New syntax transforms should use `Syntax.match()`, `Syntax.parse()`, and `Syntax.render()` per single link.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Project Structure

```text
linkity/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types/             # TypeScript type definitions
│   ├── parsers/           # Link parsers (wikilink, markdown, url)
│   └── utils/             # Utility functions
├── test/                  # Test files
├── examples/              # Usage examples
├── docs/                  # Documentation
└── dist/                  # Build output (generated)
```

## License

MIT © [Your Name]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
