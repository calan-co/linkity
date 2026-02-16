---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: how-to-configure-resolution
title: Configure Link Resolution
type: document
subtype: guide
lifecycle: active
status: accepted
classification:
  diataxis: how-to
  sensitivity: public
tags: [vscode, linkity, how-to, configuration]
---

Control how ambiguous wikilinks resolve when multiple files match a single target.

## Options

- `firstMatch`: Choose the first match returned by the index.
- `mostSpecific`: Choose the shortest relative path from the source document.
- `interactive`: Prompt for a file selection on explicit navigation actions.

## Example

Add this to your VS Code settings:

```json
{
  "linkity.linkResolution": "interactive"
}
```

## Notes

- `interactive` prompts only for user-triggered navigation (for example, Go to Definition).
- Hover and automatic document links keep a non-interactive fallback to avoid noisy prompts.
