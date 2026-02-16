---
status: completed
priority: p1
estimated_hours: 14
actual_hours: 8
completion_date: 2026-02-16
related_commits:
  - eb39b35 (feat: implement VS Code language providers for rich IDE features)
dependencies: [work-item-02-resolution]
tags: [backlinks, visualization, user-experience]
created_date: 2026-02-16
---

# Work Item 4: Backlinks Index & Sidebar Panel

## Goal

Build a reverse index of all wikilink relationships and create a VS Code sidebar panel showing incoming/outgoing links for the active document.

## Background

Backlinks are a core feature of knowledge management systems like Obsidian and Foam. Users need to see which documents reference the current document (incoming) and which documents the current document references (outgoing).

## Tasks

- [ ] Implement BacklinksIndex service
  - [ ] Build reverse index: `{targetUri: [sourceUri1, sourceUri2]}`
  - [ ] Index all workspace documents on activation
  - [ ] Update index incrementally on document save
  - [ ] Support anchor-level backlinks (track heading references)
  - [ ] Query API: getIncomingLinks(), getOutgoingLinks()
- [ ] Create BacklinksTreeDataProvider
  - [ ] Tree view showing incoming and outgoing links
  - [ ] Group by "Incoming" and "Outgoing" sections
  - [ ] Show file basenames with counts
  - [ ] Click to open file
  - [ ] Refresh on active editor change
- [ ] Implement BacklinksView (sidebar panel)
  - [ ] Register TreeView in package.json contributes
  - [ ] Show "No backlinks" message when empty
  - [ ] Add refresh command
  - [ ] Add "Open in Editor" context menu
- [ ] Add performance optimization
  - [ ] Lazy loading for large link counts
  - [ ] Debounce refresh on rapid file changes
  - [ ] Cache query results per document

## Technical Details

### BacklinksIndex API

```typescript
export interface BacklinkEntry {
  sourceUri: Uri;
  targetUri: Uri;
  linkText: string;
  anchor?: string;
  position: Position;
}

export class BacklinksIndex {
  private index: Map<string, BacklinkEntry[]>;
  
  async buildIndex(): Promise<void>
  getIncomingLinks(targetUri: Uri): BacklinkEntry[]
  getOutgoingLinks(sourceUri: Uri): BacklinkEntry[]
  addLink(entry: BacklinkEntry): void
  removeLinksForFile(uri: Uri): void
  
  onDidChangeIndex(handler: () => void): Disposable
}
```

### TreeView Structure

```ascii-tree
Backlinks (5)
├── Incoming Links (3)
│   ├── project-notes.md
│   ├── meeting-2024-02-15.md
│   └── ideas.md
└── Outgoing Links (2)
    ├── reference-doc.md
    └── resources.md
```

### BacklinksTreeDataProvider

```typescript
export class BacklinksTreeDataProvider implements vscode.TreeDataProvider<BacklinkItem> {
  constructor(private index: BacklinksIndex) {}
  
  getTreeItem(element: BacklinkItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(element?: BacklinkItem): BacklinkItem[] {
    if (!element) {
      // Root level: Incoming and Outgoing
      return [
        new BacklinkItem('Incoming', this.incoming),
        new BacklinkItem('Outgoing', this.outgoing)
      ];
    }
    return element.children;
  }
  
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
```

## Deliverables

1. BacklinksIndex service with full workspace indexing
2. BacklinksTreeDataProvider for VS Code TreeView
3. Sidebar panel showing backlinks for active document
4. Auto-refresh on document save and active editor change
5. Performance benchmarks (target: <500ms for 500+ links)

## Acceptance Criteria

### BacklinksIndex

1. Indexes 1,000 files in <2s on activation
2. Incremental update <200ms per document save
3. Correctly tracks incoming/outgoing relationships
4. Handles file renames (updates all affected links)
5. Handles file deletes (removes from index)
6. Memory usage <20MB for 1k files

### Backlinks Panel

1. Shows in sidebar under Explorer view
2. Displays incoming and outgoing link counts
3. Updates when active editor changes (<500ms)
4. Click on link opens target file
5. Shows "No backlinks" message when none exist
6. Refresh icon forces rebuild
7. Works with excludePatterns config

### User Experience

1. Panel visible when markdown file is active
2. Hidden when non-markdown file is active
3. Shows loading spinner during index build
4. Handles large link counts (100+ per file) without lag

## Dependencies

- Work Item 2: FilenameResolver (for resolving wikilinks in index)

## Test Cases

```typescript
describe('BacklinksIndex', () => {
  it('builds index from workspace')
  it('returns incoming links for file')
  it('returns outgoing links for file')
  it('updates index on file save')
  it('removes links when file deleted')
  it('handles anchor-level backlinks')
  it('performs well with 1k files')
})

describe('BacklinksTreeDataProvider', () => {
  it('shows incoming and outgoing sections')
  it('displays correct link counts')
  it('refreshes on active editor change')
  it('opens file on item click')
})
```

## Notes

- Consider showing link context (surrounding text) in hover
- Future enhancement: Group by folder or tag
- Future enhancement: Show anchor targets in tree
- Use debounce for refresh to avoid thrashing on rapid edits
