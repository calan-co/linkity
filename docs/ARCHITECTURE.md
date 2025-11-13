---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
title: MVP Scoping & Strategic Direction
classification:
  diataxis: explanation
status: draft
---

## MVP Scoping Decision: Simple Parser vs AST

**Linkity** is intentionally scoped as a simple, link-centric parser for its MVP. Rather than building a full document AST, Linkity extracts links (Markdown, wikilink, raw URL) into a normalized array of link records, optionally enriched with context metadata (e.g., position, inHeading, inCode).

### Rationale

- **Performance:** Fast, low-overhead extraction for batch and streaming use cases.
- **Simplicity:** Easier maintenance, minimal spec drift, and clear contract for consumers.
- **Extensibility:** Output is a stable TypeScript interface (`LinkNode`), easily consumed by other tools or pipelines.
- **Integration:** Designed to plug into existing ASTs (remark, micromark, etc.) if needed, without duplicating document structure.

### When to Reconsider AST

- If advanced transforms, context-sensitive rewrites, or round-trip fidelity become core requirements.
- If plugin/visitor APIs or IDE integrations demand hierarchical document modeling.

## Future-Proofing

- Output includes optional context fields (e.g., `inHeading`, `headingLevel`, `inCode`).
- Experimental hooks (e.g., `visitLinks`) may be added for traversal or transformation.
- Internal AST layering is deferred until clear demand emerges, with public contract stability prioritized.

### Visitor API: `visitLinks`

Linkity provides a visitor function, `visitLinks`, for extensible traversal or transformation of link records. This enables consumers to process, filter, or transform links with minimal coupling, and prepares for future migration to an AST or IR model if needed.

**Usage Example:**

```ts
import { visitLinks } from "linkity/utils";

const results = visitLinks(links, (link, idx, arr) => {
  // Example: collect all URLs
  return link.url;
});
```

See code comments in `src/utils/index.ts` for further details.

## Suggested Output Contract

```ts
interface LinkNode {
  raw: string;
  url: string;
  text?: string;
  type: "markdown" | "wikilink" | "url";
  start?: number;
  end?: number;
  context?: {
    inCode?: boolean;
    inHeading?: boolean;
    headingLevel?: number;
    inline?: boolean;
  };
}
```

## Summary

Linkity’s MVP is a focused, high-performance link parser. AST expansion is reserved for future needs, ensuring rapid iteration and low maintenance while keeping the door open for richer document modeling if required.

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
