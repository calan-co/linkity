# Copilot Instructions for Linkity

Purpose: a tiny, ESM‑first library that parses links from text across three syntaxes (wikilink, Markdown, raw URL) for Node and browsers. Zero runtime deps, strict TypeScript, tree‑shakeable.

**IMPORTANT**: Always read `CONTRIBUTING.md` before making changes. It contains critical workflows, testing guidelines, frontmatter requirements, and coding conventions that must be followed.

## Big Picture

- Main API: `parseLinks(text, options?)` in `src/index.ts` aggregates results from individual parsers based on flags.
- Parsers live in `src/parsers/` and each returns `LinkNode[]`:
  - `parseWikilink` (`wikilink.ts`) → `[[Page]]` / `[[Page|Alias]]`
  - `parseMarkdownLink` (`markdown.ts`) → Markdown inline links (e.g., text with a URL in parentheses)
  - `parseRawUrl` (`url.ts`) → bare `https://…` (plus optional custom schemes)
- Types in `src/types/index.ts` define `LinkNode`, `LinkType`, `LinkityParseOptions`.
- Utilities in `src/utils/` include `detectLinkType(str): LinkType | null`.

## Critical Conventions

- ESM‑first with CJS fallback. TypeScript imports use explicit `.js` extensions (e.g. `./parsers/wikilink.js`) with `"verbatimModuleSyntax": true` and `moduleResolution: "bundler"`.
- Node >= 18. **Zero runtime dependencies**; `sideEffects: false` for optimal tree‑shaking.
- Positions in `LinkNode.position` are character offsets `{ start, end }` into the original string.
- Tests resolve `import { … } from "linkity"` to source via a Vitest alias (`vitest.config.ts`).

## Public API Contract (Keep Stable)

- `parseLinks(text: string, options?: LinkityParseOptions): LinkNode[]`
  - Options: `enableWikilink`, `enableMarkdown`, `enableUrl`, `customSchemes?`
- `detectLinkType(str: string): "wikilink" | "markdown" | "url" | "custom" | null`
- `LinkNode` shape in `src/types/index.ts` is the canonical output; extend via optional `alias`, `url`, `data`.

## Adding/Modifying a Parser

1. Create `src/parsers/<name>.ts` exporting `function parse<Name>(text): LinkNode[]`.
2. Export it in `src/parsers/index.ts` and re‑export via `src/index.ts` if part of the public surface.
3. Wire it into `parseLinks()` in `src/index.ts` behind an option flag.
4. Add tests in `test/parse.test.ts` covering happy path, off-switch behavior, and edge cases (see `CONTRIBUTING.md` for position testing guidelines).
5. If detecting a new scheme/syntax, update `detectLinkType()` in `src/utils/detect.ts`.

**For detailed checklists and testing patterns, consult `CONTRIBUTING.md` before implementing.**

## Documentation Requirements

All Markdown docs must include valid YAML frontmatter:

- Schema directive as first line: `# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json`
- Classify via `classification.diataxis`: tutorial, how-to, reference, or explanation
- Place files in matching `docs/<diataxis>/` folders

See `CONTRIBUTING.md` for full frontmatter examples and validation commands.

## Key Commands

```bash
pnpm build      # Build all targets (Node ESM/CJS + browser)
pnpm test       # Run tests (Vitest)
pnpm typecheck  # Type check only
pnpm dev        # Watch mode
```

## Essential References

- **Contributing guide**: `CONTRIBUTING.md` — workflows, setup, conventions
- **Architecture**: `docs/ARCHITECTURE.md` — system design
- **Key files**: `src/index.ts`, `src/parsers/*.ts`, `src/types/index.ts`, `tsup.config.ts`, `vitest.config.ts`
