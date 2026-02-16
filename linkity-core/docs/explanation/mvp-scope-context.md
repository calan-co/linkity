## What “simple parser” vs “AST” really means here

- Simple parser: You ingest text (Markdown, wiki syntax, raw URL strings) and output a flat (or lightly nested) list of link records: url, label/text, type, position (optional), maybe flags (external/internal).
- AST: You build a tree representing the entire document (or at least all syntactic constructs relevant to links). Links become nodes inside higher‑level structures (paragraphs, lists, headings, etc.). Traversal enables richer transforms, analysis, and round‑tripping (possibly with formatting preservation).

## When a simple parser is enough

Choose (or keep) the simple approach if your near‑term goals are:

- Pure extraction: Collect all links for indexing, validation, or reporting.
- Lightweight transforms: Rewriting href targets without needing surrounding structural context.
- Performance sensitivity: You want minimal overhead and fast streaming or batch processing over many files.
- Low coupling: Consumers already have their own Markdown/Wiki AST and just need links—your output plugs in easily.
- Maintenance focus: You avoid chasing full spec parity (Markdown has many edge cases).

## When an AST (or partial AST) starts paying off

Consider an AST if you need:

- Contextual decisions: E.g., treat links in headings differently; ignore links in code blocks or blockquotes with specific attributes.
- Advanced rewriting: Change link text based on surrounding semantics (pluralization, heading level, list nesting).
- Positionally accurate edits: You want to re‑emit source with precise modifications while preserving untouched formatting.
- Plugin ecosystem: Let third parties register visitors to transform or annotate nodes (a mini unified/remark-like pipeline).
- Multi-syntax unification: Normalize Markdown, wiki syntax, and raw text into one canonical node model for cross-format processing.
- Rich diagnostics: Emit warnings/errors tied to structural parent nodes (e.g., “link inside deprecated container”).
- Incremental or IDE integration: AST enables caching subtrees and fine-grained updates.

## Middle ground: Structured IR instead of full doc AST

You don’t have to jump straight to “full document AST.” A pragmatic staged approach:

1. Token layer: Maintain a lexer/tokenizer for each syntax (Markdown, wiki, URL).
2. Link-centric IR: Produce an array of LinkNode objects with optional context fields (blockType, headingLevel, inCode, offsets).
3. Optional context provider: If the user supplies an existing AST (from remark, micromark, etc.), enrich your nodes instead of rebuilding one.
4. Pluggable analyzers: Operate over the IR; if later you need hierarchical relations, introduce lightweight parent/child grouping.
5. Full AST (only if demanded): Add non-link nodes gradually (Text, Paragraph, Heading) to support more complex transforms.

This “IR first” route keeps velocity while leaving an escape hatch.

## Key decision criteria checklist

Ask these (score them 1–5):

- Do we need to differentiate links based on structural containers?
- Will users want to mutate documents, not just report on links?
- Is round‑trip fidelity (spacing, original formatting) a requirement?
- Are multi-pass analyses (e.g., resolving reference-style links) important?
- Is a plugin/visitor API a strategic goal?

High scores → migrate toward an AST. Low scores → stay simple.

## Trade-offs

| Dimension             | Simple Parser            | Full AST                                  |
| --------------------- | ------------------------ | ----------------------------------------- |
| Performance           | Fast, low memory         | Slower, more objects                      |
| Complexity            | Easy to maintain         | More code + spec drift risk               |
| Extensibility         | Limited                  | High (visitors, transforms)               |
| Output Stability      | Simple schema versioning | Node shape churn risk                     |
| Ecosystem Integration | Good as a “module”       | Could overlap with existing AST libraries |

## Practical recommendation for Linkity now

Given your current folder structure (separate parsers per syntax) and likely focus on link extraction, it’s probably best to:

- Keep the core as a simple parser returning a normalized `LinkInfo[]`.
- Add optional positional + shallow context metadata (e.g., `context: { inHeading: boolean; headingLevel?: number; inCode: boolean; }` when cheaply derivable).
- Define a stable TypeScript interface (`LinkNode` or `LinkInfo`) as the “contract.”
- Expose an experimental hook: `visitLinks(source, options, visitor)` so you can later swap in an AST-backed traversal without breaking consumers.

Then, only if you hit hard constraints (complex transforms, IDE integrations), layer an internal AST while keeping the external contract unchanged.

## Suggested minimal contract

Inputs: source string + parser options (syntax enum, enablePositions boolean).
Outputs: Array of

```
interface LinkInfo {
  raw: string;          // Original matched text
  url: string;          // Resolved/normalized URL
  text?: string;        // Link label or alt text
  type: 'markdown' | 'wikilink' | 'url';
  start?: number;       // Character offset
  end?: number;
  context?: {
    inCode?: boolean;
    inHeading?: boolean;
    headingLevel?: number;
    inline?: boolean;
  };
}
```

Error modes: Throw on malformed wiki syntax (if strict), or include `errors: ParseIssue[]`.

## Future-proofing without full AST

- Provide a `parseDetailed()` that returns `{ links: LinkInfo[]; internalState?: any }`.
- Reserve a hidden field like `_nodeRef?` for future AST node mapping—ignored by current consumers.
- Version fields in output if you evolve shape.

## Edge cases to handle either way

- Nested parentheses in URLs.
- Reference-style Markdown links with definitions later.
- Autolinks vs inline code links.
- Escaped brackets and wikilinks inside code fences.
- Performance on very large files (streaming vs whole-buffer).

## Conclusion

Stay a simple, link-focused parser for now, but evolve the output into a richer link-centric IR with light context. Delay building a full document AST unless clear transformational, plugin, or IDE-driven needs emerge. This path lets you move quickly, minimizes maintenance overhead, and leaves the door open for an AST internally later without a disruptive public pivot.
