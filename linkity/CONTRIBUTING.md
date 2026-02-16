---
# yaml-language-server: $schema=.frontmatter.schema.json
id: contributing
title: Contributing to Linkity
type: document
subtype: guide
lifecycle: active
status: accepted
classification:
  diataxis: how-to
  sensitivity: public
tags: [linkity, contributing, development]
---

## Development Setup

### Prerequisites

- Node.js >= 18
- npm (comes with Node.js)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd linkity

# Install dependencies
npm install

# Run tests in watch mode
npm run test:watch

# Build all targets
npm run build
```

## Developer Workflows

### Building

Build all targets (Node ESM/CJS + browser):

```bash
npm run build
```

This uses tsup (see `tsup.config.ts`) and outputs to `dist/`:

- Node: `index.mjs`, `index.cjs`, types `index.d.ts` (+ maps)
- Browser: `index.browser.mjs` (minified)

### Development Mode

```bash
npm run dev  # Watch mode for development
```

## Running Tests and Type Checking

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run typecheck     # Type checking only
```

### Linting

```bash
npm run lint:code     # ESLint
npm run lint:md       # Markdownlint
npm run docs:validate # Validate docs frontmatter
```

## Adding or Modifying a Parser

Follow this checklist when adding a new parser:

1. **Create parser file**: `src/parsers/<name>.ts` exporting `function parse<Name>(text): LinkNode[]`
2. **Export from index**: Add to `src/parsers/index.ts` and re‑export via `src/index.ts` if public
3. **Wire into main API**: Add to `parseLinks()` in `src/index.ts` behind an option flag
4. **Add tests** in `test/parse.test.ts`:
   - Happy path: returns at least one `LinkNode` with correct `type`, `value`, and character `position` offsets
   - Off switch: when `enable*` flag is false, results exclude that parser
   - Edge case: escaped brackets or punctuation are not falsely parsed
   - Test examples: `[[Page]]`, `[[Page|Alias]]`, `[text](url)`, `http(s)://…`
5. **Update detection**: If adding a new scheme/syntax, update `detectLinkType()` in `src/utils/detect.ts`

### Position Offset Testing Guidelines

When testing parsers, verify position accuracy:

- Assert `0 <= start < end <= text.length` and both are integers
- Assert `text.slice(start, end) === node.value` (or the raw matched text if `value` is normalized)
- Include at least one test with mixed content to ensure offsets align when multiple parsers are enabled
- Include an edge case with escaped brackets/backticks to ensure no false positives

Example (Vitest):

```ts
const text = "See [[Page|Alias]] and https://ex.com";
const [first] = parseLinks(text, { enableMarkdown: false });
expect(first.position).toBeTruthy();
const { start, end } = first.position!;
expect(start).toBeGreaterThanOrEqual(0);
expect(end).toBeLessThanOrEqual(text.length);
expect(text.slice(start, end)).toBe(first.value);
```

## Documentation Guidelines

### Frontmatter Requirements

All Markdown docs in `docs/` must include YAML frontmatter conforming to the appropriate schema.

**For documents**, add this as the first line:

```yaml
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
```

**For work items**, use:

```yaml
# yaml-language-server: $schema=./schemas/work-item.frontmatter.schema.json
```

### Sample Frontmatter

Document example:

```yaml
---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: docs-001
title: Architecture Overview
type: document
subtype: architecture
lifecycle: active
status: accepted
classification:
  diataxis: explanation # tutorial, how-to, reference, or explanation
  sensitivity: public
tags: [linkity, docs]
---
```

Work item example:

```yaml
---
# yaml-language-server: $schema=./schemas/work-item.frontmatter.schema.json
id: wi-001
title: Implement Feature X
type: work-item
subtype: feature
lifecycle: active
status: proposed
classification:
  diataxis: how-to
  sensitivity: internal
tags: [linkity, feature]
---
```

### Diataxis Organization

Organize documentation using the [Diataxis framework](https://diataxis.fr/):

- **Tutorial** (`docs/tutorial/`): Learning-oriented, step-by-step lessons
- **How-to** (`docs/how-to/`): Task-oriented, practical guides
- **Reference** (`docs/reference/`): Information-oriented, technical descriptions
- **Explanation** (`docs/explanation/`): Understanding-oriented, conceptual discussions

Set `classification.diataxis` in frontmatter to match the folder location.

### Validating Documentation

```bash
# Validate frontmatter (strict by default)
npm run docs:validate

# Non-strict mode (warnings only)
node scripts/validate-frontmatter.mjs --no-strict

# Fix diataxis folder mismatches
node scripts/fix-docs-diataxis.mjs --dry-run  # preview
node scripts/fix-docs-diataxis.mjs            # apply
```

## Pre-commit Workflow

We recommend setting up a pre-commit hook to catch issues early.

### Manual Setup

Add to `package.json` (if not already present):

```json
{
  "scripts": {
    "precommit": "npm run typecheck && npm test && npm run lint:code && npm run lint:md && npm run docs:validate"
  }
}
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"
npm run precommit
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

## Continuous Integration

The CI workflow (`.github/workflows/ci.yml`) runs on pull requests:

1. Install dependencies
2. Typecheck
3. Build
4. Run tests
5. Lint code (ESLint)
6. Lint markdown (Markdownlint)
7. Validate docs frontmatter (strict)

Ensure all checks pass before submitting a PR.

## Coding Conventions

### TypeScript & ESM

- Use explicit `.js` extensions in TypeScript imports: `./parsers/wikilink.js`
- Configured with `"verbatimModuleSyntax": true` and `moduleResolution: "bundler"`
- Strict mode enabled
- Target ES2022

### Dependencies

- **Zero runtime dependencies** for the library code
- `sideEffects: false` for optimal tree-shaking
- Dev dependencies are fine for tooling (tests, build, linting)

### Position Tracking

- `LinkNode.position` contains character offsets `{ start, end }` into the original string
- Both `start` and `end` are integers
- `text.slice(start, end)` must equal `node.value`

### Test Conventions

- Tests use Vitest
- Import from `"linkity"` in tests (resolved to source via Vitest alias in `vitest.config.ts`)
- Keep tests focused and minimal
- Prioritize happy path, off-switch behavior, and edge cases
- Achieve _at least_ 80% code coverage

## Public API Stability

When modifying the public API, ensure backward compatibility:

- `parseLinks(text: string, options?: LinkityParseOptions): LinkNode[]`
- `detectLinkType(str: string): LinkType | null`
- `LinkNode` shape in `src/types/index.ts`

Breaking changes require a major version bump.

## Release Process

1. Ensure all tests pass: `npm test`
2. Ensure build succeeds: `npm run build`
3. Update version in `package.json`
4. Tag release: `git tag v<version>`
5. Push tag: `git push --tags`
6. Publish: `npm publish`

The `prepublishOnly` hook automatically runs build and tests before publishing.

## Getting Help

- Check `docs/ARCHITECTURE.md` for system design
- See `docs/PROJECT_STRUCTURE.md` for folder layout
- Review existing parsers in `src/parsers/` for examples
- Look at `test/parse.test.ts` for test patterns

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something useful together.
