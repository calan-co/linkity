---
status: completed
priority: p0
estimated_hours: 18
actual_hours: 10
completion_date: 2026-02-16
dependencies: [work-item-01-bootstrap, work-item-02-resolution]
tags: [providers, user-experience]
created_date: 2026-02-16
---

# Work Item 3: VS Code Language Providers

## Goal
Implement VS Code language service providers (DocumentLink, Hover, Definition, Completion) to provide rich IDE features for wikilinks.

## Background
VS Code's language provider APIs enable features like Ctrl+Click navigation, hover previews, autocomplete, and "Go to Definition". These are critical for a production-quality wikilink experience.

## Tasks
- [ ] Implement DocumentLinkProvider
  - [ ] Parse document for wikilinks using LinkityAdapter
  - [ ] Resolve each wikilink to target URI
  - [ ] Return DocumentLink objects with ranges and targets
  - [ ] Handle code fences (don't detect links in code blocks)
- [ ] Implement HoverProvider
  - [ ] Detect wikilink at hover position
  - [ ] Resolve target file
  - [ ] Read first 200 chars of target file as preview
  - [ ] Format hover with file path and preview
  - [ ] Show helpful message for unresolved links
- [ ] Implement DefinitionProvider
  - [ ] Map wikilink to target file location
  - [ ] Support anchor navigation ([[file#heading]])
  - [ ] Jump to specific line if anchor provided
- [ ] Implement CompletionItemProvider
  - [ ] Trigger on `[[` character sequence
  - [ ] Suggest all markdown files from workspace index
  - [ ] Filter suggestions by partial input
  - [ ] Show file paths for disambiguation
  - [ ] Support anchor completion after `#`
- [ ] Register all providers in extension.ts
- [ ] Add provider activation tests

## Technical Details

### DocumentLinkProvider Implementation
```typescript
export class WikilinkDocumentLinkProvider implements vscode.DocumentLinkProvider {
  constructor(
    private adapter: LinkityAdapter,
    private resolver: FilenameResolver
  ) {}
  
  provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
    const text = document.getText();
    const nodes = this.adapter.parseDocument(text);
    const links: vscode.DocumentLink[] = [];
    
    for (const node of nodes) {
      const uri = this.resolver.resolve(node.value, {
        strategy: config.linkResolution,
        sourceFileUri: document.uri
      });
      
      if (uri) {
        const range = new vscode.Range(
          document.positionAt(node.position!.start),
          document.positionAt(node.position!.end)
        );
        links.push(new vscode.DocumentLink(range, uri));
      }
    }
    
    return links;
  }
}
```

### CompletionItemProvider Implementation
```typescript
export class WikilinkCompletionProvider implements vscode.CompletionItemProvider {
  constructor(private scanner: WorkspaceScanner) {}
  
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    
    // Trigger only after [[
    if (!linePrefix.endsWith('[[')) {
      return [];
    }
    
    const files = this.scanner.getAllFiles();
    
    return files.map(uri => {
      const basename = path.basename(uri.fsPath, '.md');
      const item = new vscode.CompletionItem(basename, vscode.CompletionItemKind.File);
      item.insertText = basename;
      item.detail = vscode.workspace.asRelativePath(uri);
      return item;
    });
  }
}
```

## Deliverables
1. DocumentLinkProvider with Ctrl+Click navigation
2. HoverProvider with file previews
3. DefinitionProvider with "Go to Definition" support
4. CompletionItemProvider with file suggestions
5. All providers registered in extension activation
6. Integration tests for each provider

## Acceptance Criteria

### DocumentLinkProvider
1. Detects all wikilinks in document
2. Makes wikilinks clickable (underlined on hover)
3. Ctrl+Click opens target file
4. Ignores wikilinks in code blocks
5. Updates links when document changes
6. Performance: <200ms for 500-link document

### HoverProvider
1. Shows hover card on wikilink hover
2. Displays target file path
3. Shows 200-char preview of target file
4. Shows "File not found" for unresolved links
5. Shows "Multiple matches" for ambiguous links
6. Performance: <200ms response time

### DefinitionProvider
1. F12 or Ctrl+Click navigates to target
2. Supports anchor navigation ([[file#heading]])
3. Highlights target line if anchor provided
4. Shows error message for unresolved links

### CompletionItemProvider
1. Triggers on `[[` input
2. Shows all markdown files in workspace
3. Filters by partial input (fuzzy matching)
4. Shows relative paths for disambiguation
5. Inserts filename without .md extension (configurable)
6. Performance: <200ms for 1k file workspace

## Dependencies
- Work Item 1: LinkityAdapter
- Work Item 2: FilenameResolver and WorkspaceScanner

## Test Cases
```typescript
describe('Providers', () => {
  describe('DocumentLinkProvider', () => {
    it('detects wikilinks in document')
    it('resolves links to URIs')
    it('ignores links in code fences')
    it('updates on document change')
  })
  
  describe('HoverProvider', () => {
    it('shows file preview on hover')
    it('handles missing files gracefully')
    it('shows ambiguity warning')
  })
  
  describe('CompletionItemProvider', () => {
    it('triggers after [[')
    it('filters suggestions by input')
    it('shows all workspace files')
  })
})
```

## Notes
- Use DocumentSelector to activate only on markdown files
- Consider caching hover content per file for performance
- Handle long hover previews with truncation
- Completion items should respect exclude patterns
