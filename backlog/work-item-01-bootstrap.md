---
status: completed
priority: p0
estimated_hours: 8
actual_hours: 6
completion_date: 2026-02-16
related_commits:
  - 5f977cf (feat: implement extension activation and core adapters)
  - 3582a9c (test: add unit tests for LinkityAdapter)
dependencies: []
tags: [core, infrastructure]
created_date: 2026-02-16
---

# Work Item 1: Bootstrap Extension & Linkity Integration

## Goal

Initialize VS Code extension project with TypeScript configuration, register extension activation, and integrate linkity parser as the core parsing engine.

## Background

The extension needs a solid foundation with proper TypeScript configuration, VS Code extension manifest, and linkity integration. Linkity provides battle-tested wikilink parsing with zero dependencies, saving ~34 hours of development effort on parsing logic.

## Tasks

- [x] Create extension project structure
- [x] Configure package.json with VS Code extension metadata
- [x] Add linkity as dependency
- [ ] Create extension.ts activation entry point
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup esbuild bundling
- [ ] Create LinkityAdapter wrapper class
- [ ] Register extension providers on activation
- [ ] Add development scripts (compile, watch, test)

## Technical Details

### File Structure

```ascii-tree
vscode-wikilinks/
├── package.json          (manifest + dependencies)
├── tsconfig.json         (TypeScript config)
├── src/
│   ├── extension.ts      (activation entry point)
│   ├── core/
│   │   └── LinkityAdapter.ts
│   ├── providers/
│   ├── services/
│   └── utils/
├── dist/                 (compiled output)
└── syntaxes/
```

### LinkityAdapter Interface

```typescript
export class LinkityAdapter {
  parseDocument(text: string): LinkNode[]
  extractPositions(nodes: LinkNode[]): ParsedLink[]
  resolveAnchors(node: LinkNode): {target: string, anchor?: string, alias?: string}
}
```

## Deliverables

1. Working VS Code extension skeleton that activates on markdown files
2. Linkity integrated and accessible via LinkityAdapter
3. Build pipeline (esbuild) configured
4. Extension shows "Wikilinks extension activated" message on load

## Acceptance Criteria

1. `npm install` succeeds without errors
2. `npm run compile` produces dist/extension.js
3. Extension loads in VS Code Extension Development Host
4. LinkityAdapter successfully parses test wikilink: `[[test]]`
5. No console errors on activation
6. Activation time <500ms

## Dependencies

None (foundational work item)

## Notes

- Use esbuild for fast compilation (not webpack)
- Target Node 18+ for VS Code 1.85+ compatibility
- Keep bundle size minimal by leveraging linkity's zero-dep philosophy
