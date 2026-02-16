---
title: "Phase 2: Feature Enhancements - Interactive file picker & position tracking"
id: 8
status: completed
priority: medium
complexity: medium
estimated_hours: 12
actual_hours: 4
completed_date: 2026-02-16
related_commits:
  - "feat: add interactive wikilink resolution and accurate backlink positions"
test_results: "29/29 tests passing (extension)"
dependencies:
  - "[[wi-07-polish-and-qa.md]]"
notes:
  - timestamp: 2026-02-16T12:45:00Z
    note: |
      Implemented interactive picker for ambiguous links and accurate position mapping
      for backlinks. Deferred user choice persistence as a future enhancement.
---

# Work Item 8: Feature Enhancements

## Goal

Implement 2 feature enhancements: (1) Interactive file picker for ambiguous wikilinks in FilenameResolver, and (2) Actual line:column position calculation in BacklinksIndex for improved link discovery UX.

## Background

Both features currently have fallback implementations that work but could be enhanced:

1. **Interactive Picker**: When `[[index]]` matches multiple files, currently falls back to `mostSpecific` strategy. Enhancement: Show `window.showQuickPick()` UI to let user choose.
2. **Position Tracking**: BacklinksIndex currently uses `Position(0, 0)` placeholder for all links. Enhancement: Calculate actual line:column from LinkNode positions and file content.

These enhancements improve user experience without breaking existing functionality.

## Tasks

### Interactive File Picker

- [x] Read FilenameResolver.ts to understand current resolution logic
- [x] Implement `window.showQuickPick()` UI for ambiguous matches
- [ ] Add user choice persistence (remember user preference?)
- [x] Add tests for ambiguous/unambiguous scenarios
- [x] Test with files having similar names in different folders
- [x] Verify resolution strategies still work as fallback

### Position Calculation in BacklinksIndex

- [x] Read BacklinksIndex.ts and understand LinkNode structure
- [x] Parse LinkNode.position (start, end offsets) into file context
- [x] Calculate line:column from character offsets using file line breaks
- [x] Update BacklinkEntry position from Position(0, 0) to actual position
- [x] Add unit tests for position accuracy across different files
- [x] Test with links at various line:column positions (beginning, middle, end of file)

## Deliverables

- ✅ FilenameResolver shows interactive picker when ambiguous matches exist
- ✅ BacklinksIndex computes accurate Position(line, column) for each link
- ✅ Unit tests verify both features with edge cases
- ✅ All existing tests still pass

## Acceptance Criteria

1. ✅ Ambiguous link: User sees `window.showQuickPick()` with file options
2. ✅ Single match: Resolves immediately without picker
3. ✅ BacklinksIndex.position reflects actual line:column (not Position(0,0))
4. ✅ Tests verify position accuracy: links at different lines/columns
5. ✅ No regression in existing resolution strategies
6. ✅ All 12+ tests pass after enhancements

## Technical Notes

- LinkNode from linkity includes `position: { start: number, end: number }` (character offsets)
- File line breaks: Use `sourceUri` content to split into lines and calculate column offset
- Position(line, column) is 0-indexed in vscode
- Interactive picker should only show when `linkity.linkResolution === 'interactive'` OR fallback when ambiguous
