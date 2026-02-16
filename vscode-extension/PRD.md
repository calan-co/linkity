# Product Requirements Document: VS Code Wikilinks Extension

**Version**: 1.0  
**Date**: February 16, 2026  
**Status**: Approved  
**Owner**: Engineering Team

---

## Executive Summary

### Problem Statement

Markdown power users, Obsidian/Foam vault users, and GitHub documentation maintainers lack native VS Code support for `[[wikilink]]`-style references. This forces users to:
- Switch between VS Code and Obsidian/Foam for wikilink-based workflows
- Manually verify wikilink targets exist
- Lose navigation capabilities (Go to Definition, autocomplete) for wikilinks
- Manually maintain reference definitions for GitHub/GFM compatibility

### Proposed Solution

Build a comprehensive VS Code extension that enhances native markdown tooling with full `[[wikilink]]` support. The extension will:
- Parse wikilinks using the battle-tested **linkity** parsing library
- Resolve wikilinks to workspace files with smart ambiguity handling
- Provide VS Code language features (hover, definition, completion, links)
- Generate standard markdown references for GitHub/GFM compatibility
- Visualize knowledge graphs and backlinks relationships
- Support Obsidian, Foam, and GFM implementations through configuration

### Success Criteria

**User Adoption:**
- 10,000+ installs within 6 months
- 4.5+ star rating on VS Code marketplace
- <10% uninstall rate

**Performance:**
- <200ms hover/completion response time on 500+ link documents
- <50ms link resolution per wikilink
- <1s workspace indexing for 1,000-file vaults
- <5s backlinks refresh on document save

**Functionality:**
- 95%+ wikilink resolution accuracy on test vaults (Obsidian, Foam, custom)
- 100% parity with Obsidian link syntax (aliases, anchors, embeds)
- Zero false positives in code blocks/inline code

---

## User Experience & Functionality

### Target Audiences

1. **Obsidian Vault Users**: Want VS Code integration without losing wikilink functionality
2. **Foam Users**: Need reference generation for GitHub Pages compatibility
3. **GitHub Documentation Teams**: Use wikilinks internally, export to GFM
4. **Academic Researchers**: Zettelkasten and personal knowledge management workflows
5. **Technical Writers**: Building interconnected documentation systems

### User Stories

**As a knowledge worker**, I want to:
- Use `[[wikilinks]]` in VS Code markdown files with full IDE support
- Navigate between notes using Ctrl+Click on wikilinks
- See hover previews of linked files
- Get autocomplete suggestions when typing `[[`
- Visualize my knowledge graph to understand note relationships
- See incoming/outgoing backlinks for the current note

**As a Foam user**, I want to:
- Auto-generate markdown reference definitions for GitHub compatibility
- Configure reference generation to run on save or manually
- Preserve manually-edited reference descriptions

**As an Obsidian power user**, I want to:
- Support for aliases: `[[Target|Display Text]]`
- Support for heading anchors: `[[Note#Heading]]`
- Support for block IDs: `[[Note#^blockid]]`
- File rename synchronization (update all affected wikilinks)

**As a team lead**, I want to:
- Validate all wikilinks in the workspace (no broken links)
- Quick-fix suggestions for unresolved links (create file, link to similar)
- Configurable validation severity (error, warning, info)

### Key Workflows

#### 1. Link Creation & Navigation
```
User types [[ → Extension shows autocomplete → Select file → Link created
User Ctrl+Clicks [[link]] → Opens target file
User hovers [[link]] → Sees preview
```

#### 2. Reference Generation (Foam Mode)
```
User saves document → Extension detects wikilinks → 
  If autoGenerate enabled → Appends reference definitions
  Else → Shows notification "Generate references?"
```

#### 3. File Rename
```
User renames file.md → Extension detects rename →
Shows notification "Update 42 links?" → User confirms →
All wikilinks updated across workspace
```

#### 4. Backlinks Exploration
```
User opens document → Backlinks panel shows:
- 5 incoming links (files linking TO this file)
- 8 outgoing links (files this file links TO)
User clicks link → Opens in editor
```

---

## Technical Specification

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         VS Code Extension Host                  │
├─────────────────────────────────────────────────┤
│  Extension Activation (extension.ts)            │
│  - Register Providers                           │
│  - Initialize Services                          │
│  - Setup Event Listeners                        │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴───────┐
    │                │
┌───▼────────┐  ┌───▼──────────────────┐
│ Providers  │  │ Services             │
│ Layer      │  │ Layer                │
├────────────┤  ├──────────────────────┤
│ Link       │  │ WorkspaceScanner     │
│ Hover      │  │ FilenameResolver     │
│ Definition │  │ BacklinksIndex       │
│ Completion │  │ ReferenceGenerator   │
│ Diagnostic │  │ ChangeTracker        │
└────┬───────┘  └───┬──────────────────┘
     │              │
     └──────┬───────┘
            │
     ┌──────▼──────────────┐
     │   Linkity Parser    │
     │   (npm package)     │
     ├─────────────────────┤
     │ parseWikilink()     │
     │ detectLinkType()    │
     │ LinkNode types      │
     └─────────────────────┘
```

### Tech Stack

**Core:**
- **Language**: TypeScript 5.x
- **Runtime**: VS Code Extension API 1.85+
- **Parser**: linkity ^1.0.0 (zero-dependency wikilink parser)

**Development:**
- **Build**: esbuild (fast bundling)
- **Testing**: Vitest + @vscode/test-electron
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

**Visualization:**
- **Graph**: D3.js v7 (force-directed layout)
- **UI**: VS Code Webview API + HTML/CSS

### Core Modules

#### 1. Linkity Integration (`src/core/LinkityAdapter.ts`)
```typescript
import { parseWikilink, LinkNode } from 'linkity';

export class LinkityAdapter {
  parseDocument(text: string): LinkNode[] {
    return parseWikilink(text);
  }
  
  extractPositions(nodes: LinkNode[]): Array<{value: string, start: number, end: number}> {
    return nodes.map(n => ({
      value: n.value,
      start: n.position!.start,
      end: n.position!.end
    }));
  }
}
```

#### 2. Workspace Scanner (`src/services/WorkspaceScanner.ts`)
- Index all markdown files in workspace on activation
- Maintain file map: `{filename: [full/path1, full/path2]}`
- Detect ambiguous filenames
- Watch for file system changes (create, delete, rename)
- Performance: <1s for 1,000 files, <5s for 10,000 files

#### 3. Filename Resolver (`src/services/FilenameResolver.ts`)
- Resolve wikilink `value` to absolute file URI
- Support resolution strategies:
  - `firstMatch`: Use first found file
  - `mostSpecific`: Use file with shortest unique path
  - `interactive`: Prompt user when ambiguous
- Handle relative paths from source file context
- Support configurable root folder offset

#### 4. Backlinks Index (`src/services/BacklinksIndex.ts`)
- Build reverse index: `{targetFile: [sourceFile1, sourceFile2]}`
- Update incrementally on document changes
- Support anchor-level backlinks
- Query API: `getIncomingLinks(uri)`, `getOutgoingLinks(uri)`

#### 5. Reference Generator (`src/services/ReferenceGenerator.ts`)
- Scan document for wikilinks
- Convert to markdown reference format:
  ```markdown
  [[file|Custom Text]] → [Custom Text]: /path/to/file.md
  ```
- Idempotent: update existing, don't duplicate
- Mark auto-generated section with HTML comment
- Preserve manually-edited descriptions

### VS Code Provider Integration

#### DocumentLinkProvider
```typescript
provideDocumentLinks(document: TextDocument): DocumentLink[] {
  const text = document.getText();
  const nodes = this.adapter.parseDocument(text);
  
  return nodes.map(node => {
    const uri = this.resolver.resolve(node.value, document.uri);
    const range = new Range(
      document.positionAt(node.position!.start),
      document.positionAt(node.position!.end)
    );
    return new DocumentLink(range, uri);
  });
}
```

#### CompletionItemProvider
```typescript
provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
  const linePrefix = document.lineAt(position).text.substr(0, position.character);
  if (!linePrefix.endsWith('[[')) return [];
  
  const files = this.scanner.getAllFiles();
  return files.map(file => ({
    label: basename(file),
    kind: CompletionItemKind.File,
    insertText: basename(file, '.md'),
    detail: file
  }));
}
```

### Configuration Schema

```json
{
  "wikilinks.enabled": {
    "type": "boolean",
    "default": true,
    "description": "Enable wikilinks support"
  },
  "wikilinks.rootFolder": {
    "type": "string",
    "default": "./",
    "description": "Root folder for link resolution"
  },
  "wikilinks.linkResolution": {
    "type": "string",
    "enum": ["firstMatch", "mostSpecific", "interactive"],
    "default": "mostSpecific",
    "description": "Strategy for resolving ambiguous links"
  },
  "wikilinks.autoGenerateReferences": {
    "type": "boolean",
    "default": false,
    "description": "Auto-generate reference definitions on save"
  },
  "wikilinks.referenceFormat": {
    "type": "string",
    "enum": ["markdown", "inline"],
    "default": "markdown",
    "description": "Format for generated references"
  },
  "wikilinks.enableBacklinks": {
    "type": "boolean",
    "default": true,
    "description": "Enable backlinks panel"
  },
  "wikilinks.enableGraph": {
    "type": "boolean",
    "default": true,
    "description": "Enable graph visualization"
  },
  "wikilinks.excludePatterns": {
    "type": "array",
    "default": ["node_modules", ".git", "dist"],
    "description": "Glob patterns to exclude from indexing"
  },
  "wikilinks.validationSeverity": {
    "type": "string",
    "enum": ["error", "warning", "info", "hint"],
    "default": "warning",
    "description": "Severity level for broken link diagnostics"
  }
}
```

---

## Success Metrics & KPIs

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Link resolution time | <50ms | 95th percentile |
| Hover response time | <200ms | 95th percentile |
| Workspace indexing (1k files) | <1s | Average |
| Workspace indexing (10k files) | <5s | Average |
| Backlinks refresh | <500ms | 95th percentile |
| Graph rendering (1k nodes) | <2s | Average |
| Memory usage | <50MB | Steady state (1k files) |
| Extension activation | <500ms | Average |

### Quality Targets

- **Resolution accuracy**: 95%+ on benchmark vaults
- **Test coverage**: ≥80% across core modules
- **Zero false positives**: In code blocks, inline code, URLs
- **Crash rate**: <0.1% sessions
- **Error rate**: <1% operations

### User Engagement

- **Daily active users**: 60% of installs
- **Feature usage**:
  - Link navigation: 80% of users
  - Autocomplete: 70% of users
  - Backlinks panel: 40% of users
  - Graph visualization: 25% of users
  - Reference generation: 20% of users (Foam users)

---

## Out of Scope (Not Building)

### Explicitly Excluded

1. **Full markdown AST parsing**: Linkity handles link extraction; we don't build a complete markdown parser
2. **WYSIWYG editing**: Extension is for code-style editing, not visual editing
3. **Sync with external apps**: No Obsidian/Foam vault sync (users manage files themselves)
4. **Mobile support**: VS Code extension only (no web/mobile)
5. **Publishing/export**: No PDF/HTML export features
6. **Version control**: No built-in git integration beyond VS Code defaults
7. **Collaboration**: No real-time multi-user editing
8. **Plugin system**: No third-party plugin API (at least for MVP)
9. **AI features**: No ChatGPT/AI-powered suggestions (future consideration)
10. **Custom link types**: Only standard wikilinks (no custom syntax like `<<link>>`)

### Future Considerations (Roadmap)

- **Year 1**: Template support, daily notes, tag indexing
- **Year 2**: AI-powered link suggestions, semantic search
- **Year 3**: Plugin API for community extensions

---

## Timeline & Milestones

### Phase 1: MVP (Weeks 1-4) - 54 hours
**Goal**: Core functionality with link resolution and basic providers

- Bootstrap extension project (8h)
- Linkity integration (4h)
- Workspace scanner (8h)
- Filename resolver (8h)
- VS Code providers (Link, Hover, Definition) (16h)
- Configuration manager (6h)
- TextMate grammar (4h)

**Deliverable**: Extension with working link navigation, hover, and autocomplete

### Phase 2: Advanced Features (Weeks 5-8) - 49 hours
**Goal**: File synchronization, backlinks, validation, references

- Backlinks indexing and panel (12h)
- File rename synchronization (10h)
- Block anchors & header extraction (8h)
- Manual reference commands (7h)
- Auto-generation engine (9h)
- Ambiguity resolution (6h)
- Link validation & diagnostics (7h)

**Deliverable**: Full-featured extension with backlinks and reference generation

### Phase 3: Visualization (Weeks 9-10) - 16 hours
**Goal**: Graph panel for knowledge exploration

- Graph panel implementation (12h)
- D3.js integration (4h)

**Deliverable**: Interactive graph visualization

### Phase 4: Polish & Release (Weeks 11-12) - 28 hours
**Goal**: Production-ready extension

- Comprehensive testing suite (20h)
- Documentation & user guide (8h)
- Marketplace submission
- Launch announcement

**Total estimated effort**: 147 hours (~4-5 weeks for 2 engineers)

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance degradation on large vaults (10k+ files) | Medium | High | Implement lazy loading, index caching, incremental updates |
| Linkity parsing misses edge cases | Low | Medium | Comprehensive test suite, contribute fixes upstream |
| Ambiguous link resolution confuses users | Medium | Medium | Clear UI messaging, resolution hints, documentation |
| Reference generation conflicts with manual edits | Medium | High | HTML comment markers, user confirmation, diff preview |
| Graph rendering too slow | Low | Medium | WebGL fallback, limit node count, virtualization |
| Extension incompatibility with other markdown extensions | Medium | High | Test with popular extensions, namespace CSS, careful provider registration |

---

## Competitive Analysis

| Feature | **Our Extension** | Obsidian | Foam | Markdown Links |
|---------|-------------------|----------|------|----------------|
| Wikilink syntax | ✅ Full | ✅ Full | ✅ Full | ❌ None |
| Backlinks panel | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Graph visualization | ✅ Yes | ✅ Yes | ⚠️ Basic | ❌ No |
| Reference generation | ✅ Auto + Manual | ❌ No | ✅ Auto | ❌ No |
| Ambiguity resolution | ✅ Smart | ⚠️ Dialog | ⚠️ First match | N/A |
| File rename sync | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No |
| Autocomplete | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Basic |
| Configuration | ✅ Full | ⚠️ Settings UI | ⚠️ JSON | ⚠️ Limited |
| VS Code native | ✅ Yes | ❌ Standalone | ✅ Yes | ✅ Yes |
| Open source | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |

**Unique Value Props:**
1. **Best-in-class parsing**: Using linkity library (battle-tested, zero deps)
2. **Implementation-agnostic**: Supports Obsidian, Foam, and GFM equally
3. **Reference generation control**: Auto AND manual, with conflict detection
4. **Smart ambiguity**: mostSpecific strategy reduces false matches
5. **Native VS Code**: No separate app, full IDE integration

---

## Glossary

- **Wikilink**: `[[Target]]` or `[[Target|Alias]]` syntax for internal links
- **Backlink**: Incoming reference from another document
- **Reference definition**: Markdown-style link reference `[text]: /path`
- **Ambiguous link**: Wikilink matching multiple files (e.g., two `note.md` files)
- **Anchor**: Section reference in wikilink: `[[file#heading]]`
- **Block ID**: Obsidian-style block reference: `[[file#^blockid]]`
- **Linkity**: Zero-dependency TypeScript library for parsing wikilinks
- **Resolution strategy**: Algorithm for choosing which file when ambiguous links exist

---

## Appendix: Linkity Integration Benefits

### Why Linkity?

1. **Battle-tested**: Already used in production, comprehensive test suite
2. **Zero dependencies**: Keeps extension bundle small, reduces supply chain risk
3. **Position tracking**: Provides exact character offsets for VS Code ranges
4. **Type-safe**: Full TypeScript support with exported types
5. **Maintained**: Active development, clear roadmap
6. **ESM-first**: Modern module system, tree-shakeable
7. **Performance**: Optimized regex-based parsing, <1ms per document

### Integration Points

```typescript
// Direct usage in providers
import { parseWikilink, LinkNode } from 'linkity';

const text = document.getText();
const links: LinkNode[] = parseWikilink(text);

// Each LinkNode has:
// - type: 'wikilink'
// - value: 'Target' (the link target)
// - alias?: 'Display Text' (optional display text)
// - position: { start: 42, end: 52 } (character offsets)
```

### Effort Reduction

| Task | Without Linkity | With Linkity | Savings |
|------|-----------------|--------------|---------|
| Wikilink parsing | 12h | 2h | 10h |
| Position tracking | 6h | 0h | 6h |
| Alias handling | 4h | 0h | 4h |
| Anchor parsing | 8h | 2h | 6h |
| Test creation | 12h | 4h | 8h |
| **Total** | **42h** | **8h** | **34h** |

**34 hours saved** = 1 engineer-week = significant cost reduction

---

**Document End**
