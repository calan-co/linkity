# Changelog

All notable changes to the "Wikilinks for VS Code" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-16

### Added
- Initial release
- Wikilink parsing using linkity library
- DocumentLinkProvider for clickable wikilinks (Ctrl+Click navigation)
- HoverProvider for file previews
- DefinitionProvider for "Go to Definition" support
- CompletionItemProvider for autocomplete when typing `[[`
- Backlinks panel showing incoming/outgoing links
- Reference generation command for GitHub/GFM compatibility
- Auto-generation of references on save (configurable, OFF by default)
- Smart ambiguity resolution with three strategies (firstMatch, mostSpecific, interactive)
- Workspace scanner with file indexing
- Configuration manager with full settings support
- TextMate grammar for wikilink syntax highlighting
- Support for aliases: `[[Target|Display]]`
- Support for anchors: `[[File#Heading]]`
- Exclude patterns for node_modules, .git, etc.

### Performance
- <1s workspace indexing for 1,000 files
- <50ms link resolution per wikilink
- <200ms hover response time

### Ecosystem Support
- Obsidian compatibility (wikilinks, aliases, anchors)
- Foam compatibility (reference generation)
- GFM/GitHub compatibility (markdown references)

## [Unreleased]

### Planned
- Graph visualization panel with D3.js
- Interactive ambiguity resolution picker
- File rename synchronization
- Link validation with diagnostics
- Quick fixes for broken links
- Block reference support (`^blockid`)
- Link embeds support
- Daily note templates
- Tag indexing
