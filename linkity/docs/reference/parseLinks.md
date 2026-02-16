---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: reference-parse-links
title: parseLinks
type: document
subtype: reference
lifecycle: active
status: accepted
classification:
  diataxis: reference
  sensitivity: public
tags: [linkity, api, parseLinks]
---

Parse text and return an array of `LinkNode` records for all detected links.

## Signature

```typescript
export function parseLinks(
  text: string,
  options?: LinkityParseOptions
): LinkNode[];
```

## Parameters

- `text`: The input text to scan.
- `options`: Optional configuration to enable or disable specific link parsers.

## Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `enableWikilink` | boolean | `true` | Parse Obsidian-style `[[Page]]` links |
| `enableMarkdown` | boolean | `true` | Parse Markdown `[text](url)` links |
| `enableUrl` | boolean | `true` | Parse raw URLs like `https://example.com` |
| `customSchemes` | string[] | `[]` | Additional URL schemes to recognize |

## Returns

- Array of `LinkNode` records with optional `position` offsets in the original text.
- Links inside fenced code blocks are ignored by default.

## Example

```typescript
import { parseLinks } from "linkity";

const text = "See [[Home]] and https://example.com";
const links = parseLinks(text, {
  enableMarkdown: false,
  customSchemes: ["vscode", "obsidian"]
});

console.log(links);
```

## Notes

- Positions are character offsets into the original string.
- For per-syntax parsing, use `parseWikilink`, `parseMarkdownLink`, or `parseRawUrl`.
