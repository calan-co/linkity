---
title: "Phase 4: Publish & Release - npm package and VS Code marketplace"
id: 10
status: not_started
priority: high
complexity: medium
estimated_hours: 8
actual_hours: null
completed_date: null
related_commits: []
test_results: null
dependencies:
  - "[[9-documentation.md]]"
notes: []
---

## Goal

Publish linkity to npm and vscode-extension to VS Code marketplace. Create GitHub releases with comprehensive release notes and verify all distribution channels work correctly.

## Background

Both projects are feature-complete, tested, and documented. Publishing validates the entire pipeline and makes the wikilink solution available to end users across npm and the VS Code marketplace.

## Tasks

### Linkity npm Publication

- [ ] Verify `package.json` exports are correct (ESM/CJS/types)
- [ ] Verify dist/ folder exists with all build outputs
- [ ] Run `npm publish --dry-run` to validate package contents
- [ ] Decide on package scope (public vs. scoped, e.g., @your-org/linkity)
- [ ] Execute `npm publish` with correct scope/registry
- [ ] Update `linkity/README.md` with npm install command
- [ ] Verify package appears on npmjs.com
- [ ] Test installation: `npm install linkity` and verify imports work

### VS Code Extension Publication

- [ ] Bump version in `vscode-extension/package.json` (semantic versioning)
- [ ] Update `vscode-extension/CHANGELOG.md` with release notes (features, fixes, breaking changes)
- [ ] Ensure extension icon/logo is present and acceptable
- [ ] Create PAT (Personal Access Token) for VS Code marketplace
- [ ] Run `vsce publish` to submit extension
- [ ] Verify extension appears in VS Code marketplace
- [ ] Test installation: Install from marketplace and verify activation
- [ ] Update `vscode-extension/README.md` with marketplace link

### GitHub Releases

- [ ] Tag `v1.0.0` (or appropriate semver) on main for both projects
- [ ] Create GitHub release for linkity v1.0.0:
  - Release title, description, changelog excerpt
  - Link to npm package
  - List main features, target use cases
  
- [ ] Create GitHub release for vscode-extension v1.0.0:
  - Release title, description, changelog excerpt
  - Link to VS Code marketplace extension page
  - Installation instructions, key features
  - Screenshot or demo GIF links (if available)

- [ ] Create merged/master GitHub release summarizing both:
  - "Linkity v1.0.0 & VS Code Extension v1.0.0 Released"
  - Links to both marketplace pages
  - High-level feature summary

## Deliverables

- ✅ linkity published to npm (publicly searchable)
- ✅ vscode-extension published to VS Code marketplace
- ✅ GitHub releases created for both with comprehensive notes
- ✅ Installation tested and verified functional
- ✅ All documentation updated with publishing details
- ✅ CHANGELOG.md reflects complete feature set

## Acceptance Criteria

1. ✅ `npm install linkity` succeeds and package imports work
2. ✅ Extension installable from VS Code marketplace by name
3. ✅ Extension activates and features functional after marketplace install
4. ✅ GitHub releases appear on releases page for both projects
5. ✅ Release notes include user-facing benefits (not just commit hashes)
6. ✅ Links in release notes are accurate and functional
7. ✅ README files updated with marketplace/npm links

## Technical Notes

- Semantic Versioning: v1.0.0 indicates stable, feature-complete release
- vsce publish requires VS Code extension PAT (not npm token)
- Both projects should be tagged on same commit or clearly documented relation
- Release notes should highlight: Wikilink support, Obsidian/Foam compatibility, auto-reference generation, graph visualization
- Consider announcement channels: GitHub releases, marketplace featured, community forums/blogs
