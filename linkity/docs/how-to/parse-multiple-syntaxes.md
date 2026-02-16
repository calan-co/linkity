---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: how-to-parse-multiple-syntaxes
title: Parse Multiple Link Syntaxes
type: document
subtype: guide
lifecycle: active
status: accepted
classification:
  diataxis: how-to
  sensitivity: public
tags: [linkity, how-to, parsing]
---

# Parse Multiple Link Syntaxes

Use `parseLinks` to parse wikilinks, Markdown links, and raw URLs in one pass.

## Steps

1. Call `parseLinks` on the full document text.
2. Filter results by `LinkNode.type`.
3. Use `position` offsets to map links back to the document.

## Example

```typescript
import { parseLinks } from "linkity";

const text = `
See [[Home]] and [Docs](https://example.com/docs).
Also visit https://example.com.
`;

const links = parseLinks(text, {
  enableWikilink: true,
  enableMarkdown: true,
  enableUrl: true
});

const wikilinks = links.filter((l) => l.type === "wikilink");
const markdownLinks = links.filter((l) => l.type === "markdown");
const urls = links.filter((l) => l.type === "url");

console.log({ wikilinks, markdownLinks, urls });
```

## Tips

- Use per-syntax parsers (`parseWikilink`, `parseMarkdownLink`, `parseRawUrl`) when you only need one type.
- `parseLinks` skips fenced code blocks by default.
