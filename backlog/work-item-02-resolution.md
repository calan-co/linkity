---
status: not_started
priority: p0
estimated_hours: 16
actual_hours: 0
dependencies: [work-item-01-bootstrap]
tags: [core, file-resolution]
created_date: 2026-02-16
---

# Work Item 2: Workspace Scanner & Filename Resolver

## Goal
Build the core file resolution engine that scans workspace markdown files, indexes them, and resolves wikilink targets to absolute file paths with smart ambiguity handling.

## Background
The resolver is the critical bridge between linkity's parsed `LinkNode` objects and actual workspace files. It must handle:
- Case-insensitive matching
- Ambiguous filenames (multiple files with same name)
- Relative path resolution
- Performance at scale (10k+ files)

## Tasks
- [ ] Implement WorkspaceScanner service
  - [ ] Scan workspace for markdown files on activation
  - [ ] Build filename → [paths] index
  - [ ] Detect ambiguous filenames
  - [ ] Watch for file system changes (create/delete/rename)
  - [ ] Support exclude patterns from config
- [ ] Implement FilenameResolver service
  - [ ] Resolve wikilink value to file URI
  - [ ] Implement resolution strategies (firstMatch, mostSpecific, interactive)
  - [ ] Handle relative paths from source file context
  - [ ] Support configurable root folder
  - [ ] Return helpful errors for unresolved links
- [ ] Add ConfigManager for settings access
- [ ] Create performance benchmarks

## Technical Details

### WorkspaceScanner API
```typescript
export class WorkspaceScanner {
  private fileIndex: Map<string, Uri[]>;
  
  async scanWorkspace(): Promise<void>
  getFilesMatching(basename: string): Uri[]
  getAllFiles(): Uri[]
  isAmbiguous(basename: string): boolean
  
  // Events
  onDidChangeFiles(handler: (change: FileChangeEvent) => void)
}
```

### FilenameResolver API
```typescript
export interface ResolveOptions {
  strategy: 'firstMatch' | 'mostSpecific' | 'interactive';
  rootFolder?: string;
  sourceFileUri?: Uri;
}

export class FilenameResolver {
  resolve(wikilinkValue: string, options: ResolveOptions): Uri | null
  resolveWithAnchor(value: string, anchor: string, options: ResolveOptions): ResolvedLink
  suggestSimilar(value: string): Uri[]  // For validation quick fixes
}
```

### Resolution Strategy: mostSpecific
```
Files: 
  /notes/work/project.md
  /notes/personal/project.md
  
Wikilink: [[project]]
Source: /notes/work/tasks.md

Result: /notes/work/project.md (shortest relative path from source)
```

## Deliverables
1. WorkspaceScanner that indexes markdown files on activation
2. FilenameResolver with all three resolution strategies
3. ConfigManager exposing all config options
4. Unit tests for resolution edge cases
5. Performance benchmark (target: <1s for 1k files)

## Acceptance Criteria
1. Scans 1,000 markdown files in <1s
2. Scans 10,000 markdown files in <5s
3. Resolves unambiguous links with 100% accuracy
4. mostSpecific strategy chooses correct file in 95%+ of ambiguous cases
5. Handles missing files gracefully (returns null, not crash)
6. Memory usage <50MB for 1k files
7. Respects exclude patterns (skips node_modules, .git, etc.)
8. File watcher updates index <200ms after file system change

## Dependencies
- Work Item 1 (LinkityAdapter must exist to provide LinkNode types)

## Test Cases
```typescript
describe('FilenameResolver', () => {
  it('resolves unambiguous links')
  it('resolves ambiguous links with mostSpecific strategy')
  it('resolves ambiguous links with firstMatch strategy')
  it('handles case-insensitive matching')
  it('resolves relative paths from source context')
  it('returns null for missing files')
  it('suggests similar files for typos')
  it('handles root folder offset')
})
```

## Notes
- Use minimatch or picomatch for exclude patterns
- Consider caching resolution results per document
- Log ambiguous resolution warnings for user awareness
