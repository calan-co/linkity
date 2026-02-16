# Linkity for VS Code

Complete [[wikilink]] support for VS Code—powered by linkity. Features navigation, backlinks, graph visualization, and reference generation.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

🔗 **Full Wikilink Support**

- Parse `[[Page]]` and `[[Page|Alias]]` syntax
- Anchor support: `[[Page#Heading]]`
- Block references: `[[Page#^blockid]]`

🎯 **Rich IDE Features**

- **Click to navigate**: Ctrl+Click on wikilinks to open files
- **Hover previews**: See file content on hover
- **Autocomplete**: Suggestions when typing `[[`
- **Go to Definition**: F12 or right-click "Go to Definition"

🔍 **Backlinks Panel**

- See all files linking to current document
- See all files current document links to
- Click to navigate between documents

📊 **Knowledge Graph**

- Interactive force-directed graph visualization
- Explore relationships between notes

🔄 **Reference Generation**

- Convert wikilinks to markdown reference definitions
- Auto-generation on save (configurable, OFF by default)
- Perfect for GitHub/GFM compatibility

⚡ **Performance**

- Fast: <1s workspace indexing for 1,000 files
- Smart: mostSpecific resolution strategy for ambiguous links
- Lightweight: Built on [linkity](https://github.com/user/linkity) (zero dependencies)

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Wikilinks"
4. Click Install

Or install from VSIX:

```bash
code --install-extension vscode-wikilinks-0.1.0.vsix
```

## Usage

### Basic Wikilink

Type `[[` and get file suggestions:

```markdown
Check out [[My Note]] for details.
```

Ctrl+Click to open the file.

### With Alias

```markdown
See [[Long Document Title|the docs]] for more info.
```

### With Anchor

```markdown
Jump to [[Project Notes#Todo Section]]
```

### Generate References

For GitHub compatibility, convert wikilinks to standard markdown references:

1. Open command palette (Ctrl+Shift+P)
2. Run "Wikilinks: Generate Reference Definitions"

Result:

```markdown
Check out [[My Note|the docs]].

<!-- wikilinks:references-start -->
[the docs]: path/to/My%20Note.md
<!-- wikilinks:references-end -->
```

## Configuration

Configure in VS Code settings (`settings.json`):

```json
{
  "wikilinks.enabled": true,
  "wikilinks.linkResolution": "mostSpecific",
  "wikilinks.autoGenerateReferences": false,
  "wikilinks.enableBacklinks": true,
  "wikilinks.excludePatterns": ["node_modules", ".git", "dist"]
}
```

### Settings Reference

| Setting | Type | Default | Description |
| ------- | ---- | ------- | ----------- |
| `wikilinks.enabled` | boolean | `true` | Enable/disable the extension |
| `wikilinks.rootFolder` | string | `./` | Root folder for link resolution |
| `wikilinks.linkResolution` | enum | `mostSpecific` | Strategy for ambiguous links: `firstMatch`, `mostSpecific`, `interactive` |
| `wikilinks.autoGenerateReferences` | boolean | `false` | Auto-generate references on save |
| `wikilinks.referenceFormat` | enum | `markdown` | Reference format: `markdown`, `inline` |
| `wikilinks.enableBacklinks` | boolean | `true` | Show backlinks panel |
| `wikilinks.enableGraph` | boolean | `true` | Enable graph visualization |
| `wikilinks.excludePatterns` | array | `["node_modules", ".git", "dist"]` | Glob patterns to exclude |
| `wikilinks.validationSeverity` | enum | `warning` | Diagnostic severity: `error`, `warning`, `info`, `hint` |

### Resolution Strategies

**mostSpecific** (recommended): Choose file with shortest relative path from source

```text
Source: /notes/work/tasks.md
Link: [[project]]
Files: /notes/work/project.md, /notes/personal/project.md
Result: /notes/work/project.md (closer to source)
```

**firstMatch**: Use first file found (fastest, but less accurate)

**interactive**: Prompt user when ambiguous (on explicit navigation actions)

## Commands

| Command | Description |
| ------- | ----------- |
| `Wikilinks: Generate Reference Definitions` | Convert wikilinks to markdown references |
| `Wikilinks: Show Backlinks Panel` | Open backlinks sidebar |
| `Wikilinks: Rebuild Workspace Index` | Force rescan all markdown files |
| `Wikilinks: Validate All Links` | Check for broken wikilinks (coming soon) |

## Ecosystem Compatibility

### Obsidian

✅ Wikilinks, aliases, anchors  
✅ Block references  
⚠️ Embeds (coming soon)

### Foam

✅ All Foam syntax  
✅ Reference generation  
✅ GitHub Pages compatibility

### GitHub Flavored Markdown (GFM)

✅ Reference definitions work on GitHub  
✅ Configurable auto-generation

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| `Ctrl+Click` | Navigate to wikilink target |
| `F12` | Go to Definition |
| `Ctrl+Shift+P` → "Wikilinks: ..." | Access commands |

## Performance

Benchmarks on MacBook Pro M1:

- 1,000 files: <1s indexing
- 10,000 files: <5s indexing
- Link resolution: <50ms per link
- Hover preview: <200ms

## Troubleshooting

### Links not working

1. Run "Wikilinks: Rebuild Workspace Index"
2. Check `wikilinks.enabled` is `true`
3. Ensure file exists and isn't in exclude patterns

### Ambiguous links resolved incorrectly

- Use `mostSpecific` strategy (default)
- Add `.md` extension: `[[note.md]]` instead of `[[note]]`
- Use relative paths in alias

### References not generating

- Check `wikilinks.autoGenerateReferences` setting
- Manually run "Generate Reference Definitions" command

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup.

## License

MIT License - see [LICENSE](LICENSE)

## Credits

Built with [linkity](https://github.com/user/linkity) - a zero-dependency wikilink parser.

## Changelog

### 0.1.0 (Initial Release)

- ✨ Wikilink parsing and resolution
- ✨ Link, Hover, Definition, Completion providers
- ✨ Backlinks panel
- ✨ Reference generation (manual)
- ✨ Smart ambiguity resolution
- ✨ Syntax highlighting

---

Made with ❤️ for the knowledge management community
