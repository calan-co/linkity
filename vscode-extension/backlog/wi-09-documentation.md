---
title: "Phase 3: Documentation - API reference, usage guides, enhanced READMEs"
id: 9
status: not_started
priority: medium
complexity: medium
estimated_hours: 14
actual_hours: null
completed_date: null
related_commits: []
test_results: null
dependencies:
  - "[[8-feature-enhancements.md]]"
notes: []
---

# Work Item 9: Documentation

## Goal

Complete comprehensive documentation for linkity and vscode-extension: API reference, usage guides, and enhanced README examples. Ensure all docs follow YAML frontmatter schema and diataxis classification.

## Background

Today's documentation is strong (PRD, ARCHITECTURE, CONTRIBUTING), but needs:

1. **API Reference for linkity**: Function signatures, options, return types, examples for parseLinks(), detectLinkType(), visitLinks()
2. **Usage Guides**: How-to docs covering common workflows (multiple syntaxes, custom schemes, visitor pattern, resolution strategies, graph navigation)
3. **Enhanced READMEs**: npm install commands, configuration reference, working examples, marketplace links

All docs must include valid YAML frontmatter per CONTRIBUTING.md requirements.

## Tasks

### Linkity API Documentation

- [ ] Create `linkity/docs/reference/` folder
- [ ] Write `parseLinks.md`: function signature, options table, return type, 2-3 examples
- [ ] Write `detectLinkType.md`: detection rules, examples for each type
- [ ] Write `visitLinks.md`: visitor API usage, custom processor example
- [ ] Write `types.md`: LinkNode, LinkType, LinkityParseOptions schemas with field descriptions
- [ ] Include YAML frontmatter with schema directive, classification.diataxis=reference

### Linkity How-To Guides

- [ ] Create `linkity/docs/how-to/` folder
- [ ] Write `parse-multiple-syntaxes.md`: Parse wikilinks + markdown + raw URLs in one document
- [ ] Write `custom-schemes.md`: Extending with custom link protocols (e.g., `@mention:user`)
- [ ] Write `visitor-pattern.md`: Writing custom link processors with visitLinks()
- [ ] Include YAML frontmatter with classification.diataxis=how-to for all guides

### VS Code Extension Usage Guides

- [ ] Create `vscode-extension/docs/how-to/` folder
- [ ] Write `configure-resolution.md`: Setting linkity.linkResolution strategy (firstMatch, mostSpecific, interactive)
- [ ] Write `backlinks-workflow.md`: Exploring incoming/outgoing links in sidebar, interpreting graph
- [ ] Write `graph-navigation.md`: Using D3 graph to navigate knowledge base, filtering by degree
- [ ] Include YAML frontmatter with classification.diataxis=how-to

### Enhanced READMEs

- [ ] Update `linkity/README.md`:
  - Basic usage example (parse wikilinks + markdown)
  - Options reference table
  - Output structure (LinkNode shape)
  - npm install command with scoped package name
  
- [ ] Update `vscode-extension/README.md`:
  - Installation steps (marketplace link)
  - Key features summary with screenshots
  - Key commands/keyboard shortcuts
  - Configuration snippets (common scenarios)
  - Marketplace link and version info

## Deliverables

- ✅ `linkity/docs/reference/` with 4 comprehensive reference docs
- ✅ `linkity/docs/how-to/` with 3 usage guides
- ✅ `vscode-extension/docs/how-to/` with 3 usage guides
- ✅ Updated linkity/README.md with npm command and examples
- ✅ Updated vscode-extension/README.md with installation and config
- ✅ All docs pass frontmatter validation
- ✅ All docs pass markdownlint

## Acceptance Criteria

1. ✅ All new docs include valid YAML frontmatter with schema directive
2. ✅ API reference docs have runnable TypeScript examples
3. ✅ How-to guides include practical, copy-paste-able workflows
4. ✅ READMEs include marketable content (features, benefits, getting started)
5. ✅ `npm run docs:validate` returns zero errors
6. ✅ `npm run lint:md` returns zero errors for all new docs
7. ✅ All cross-references use wikilink syntax where applicable

## Technical Notes

- YAML frontmatter schema: `./schemas/document.frontmatter.schema.json`
- Diataxis categories: tutorial, how-to, reference, explanation
- Use `# yaml-language-server: $schema=...` as first line in all docs per CONTRIBUTING.md
- Cross-reference other docs using `[[../path/to/doc.md]]` wikilink syntax
- Include code block language specifiers (typescript, bash, etc.) for syntax highlighting
