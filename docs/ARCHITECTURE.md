---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
type: document
subtype: architecture
title: MVP Scoping & Strategic Direction
classification:
  diataxis: explanation
status: draft
---

## MVP Scoping Decision: Link AST, Not Document AST

**Linkity** is scoped as a universal single-link parser and renderer. It parses one concrete link string into a canonical link-scoped `Ast`, then renders that AST into registered `Syntax` dialects.

Linkity does not parse full documents. Consumers own document parsing, graph state, file loading, and persistence.

### Rationale

- **Performance:** Cheap syntax `match()` rules let consumers find candidate spans without Linkity owning document parsing.
- **Simplicity:** Linkity models link semantics only, avoiding Markdown/HTML/YAML parser coupling.
- **Extensibility:** New dialects register `Syntax` implementations with `match`, `parse`, `render`, and `supports`.
- **Transforms:** Syntax-to-syntax transforms flow through canonical `Ast` with explicit lossy-render diagnostics.

### When to Reconsider Document AST

Only if Linkity itself must model non-link document structure such as paragraphs, headings, lists, or code blocks.

## Link-scoped AST and Syntax Dialects

Linkity parses individual link strings into a canonical link-scoped `Ast` and renders that AST into registered `Syntax` dialects. It does not parse full documents or own repository traversal. Consumers use syntax `match()` spans with their own document parsers, graph indexes, and file-system context.

Each `Syntax` provides:

- `match()` for cheap candidate detection
- `parse()` for concrete syntax to canonical `Ast`
- `render()` for canonical `Ast` to concrete syntax
- `supports` for feature-based loss diagnostics

Lossy rendering defaults to errors. Callers may opt into warnings.

## Semantify Scope Reconciliation

Linkity's MVP reference normalization is the canonical link-scoped `Ast` plus registered `Syntax` dialects. Semantify is deferred from the runtime path until it provides concrete value beyond this parser/printer model.

Linkity owns:

- single-link concrete syntax parsing
- canonical `Ast` fields and provenance
- syntax feature support and lossy render diagnostics
- single-link rendering to target syntaxes

Linkity does not own governance policy, lifecycle rules, repository traversal, CI gate outcomes, or graph persistence.

## Product Role Contract

Linkity owns universal single-link parsing and rendering:

- concrete link syntax parsing through `Syntax.parse()`
- cheap candidate detection through `Syntax.match()`
- canonical link-scoped `Ast` fields and provenance
- feature support declarations and lossy render diagnostics
- rendering one canonical link AST into a target syntax

Linkity does not own schema policy, work-item lifecycle policy, repository traversal, graph persistence, document parsing, or CI gate outcomes. Consumers such as Doc-Vader provide artifact indexes, lifecycle state, file loading, and policy decisions through adapters and caller-provided context.

## Ecosystem Use Cases and Boundaries

### Automatic link updates

External graph or repository tools own rename/move detection, affected-document discovery, file loading, and persistence. Linkity owns only the single-link operation: parse the existing link into `Ast`, update the relevant AST fields supplied by the caller, and render the new link with the target `Syntax`.

### Dynamic title resolution

External resolvers own current target-title lookup and invalidation. Linkity can represent label semantics on `Ast.label`, but it does not monitor target documents or decide when displayed text changes.

### Document-wide syntax transformation

External document parsers own full-document syntax, ignored regions, and span replacement. They may use `Syntax.match()` for cheap link candidates, then call `Syntax.parse()` and `Syntax.render()` per single link. Lossy projections remain explicit diagnostics from Linkity.

These boundaries keep Linkity independent from Markdown, HTML, YAML, repository, and graph implementations.

## Future-Proofing

- Context-dependent parsing receives caller-provided `ParseContext` such as `sourcePath` and `fileIndex`.
- Dynamic title resolution and automatic link updates are enabled by `Ast` semantics but owned by external graph/index tools.
- Full document AST layering is deferred unless Linkity must model non-link document structure.

## Suggested Output Contract

```ts
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

## Summary

Linkity’s MVP is a link-scoped AST parser/printer with syntax dialects and explicit lossy-render diagnostics.

See the [[mvp-scope-context|original analysis]] for options considered and details on how this decision was made.

## Tokenizer/Lexer Decision

Linkity uses a bespoke tokenizer/lexer for link extraction, rather than relying on third-party libraries. This decision is core to the project's technical direction and is documented here for future reference.

### Existing Libraries Considered

- **moo**: Flexible lexer, but adds runtime dependency and is not ESM-first.
- **chevrotain**: Powerful, but large and designed for complex grammars; not ideal for minimal, tree-shakeable libraries.
- **micromark**: Excellent for full Markdown parsing, but heavy for simple link extraction and introduces plugin complexity.
- **marked**: Popular Markdown parser, but not suitable for strict TypeScript or zero-dependency requirements.

### Rationale for Bespoke Solution

- **Zero runtime dependencies**: Ensures minimal bundle size and no external code at runtime.
- **ESM-first and strict TypeScript**: Guarantees compatibility with modern build tools and type safety.
- **Tree-shaking**: Custom code allows aggressive dead code elimination.
- **Syntax control**: Enables precise handling of link syntaxes (wikilink, Markdown, raw URL) without over-parsing or spec drift.

### Triggers for Reevaluation

- If Linkity needs to support full Markdown parsing (block/inline, nested constructs)
- If a plugin ecosystem or extensible grammars become required
- If integration with external ASTs or document models becomes a core use case

### References
