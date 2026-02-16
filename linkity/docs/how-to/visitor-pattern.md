---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: how-to-visitor-pattern
title: Process Links with visitLinks
type: document
subtype: guide
lifecycle: active
status: accepted
classification:
  diataxis: how-to
  sensitivity: public
tags: [linkity, how-to, visitLinks]
---

# Process Links with visitLinks

Use `visitLinks` to traverse links and return mapped results.

## Steps

1. Parse the document with `parseLinks`.
2. Call `visitLinks` to map or transform the results.
3. Use returned values or handle `undefined` when nothing is produced.

## Example

```typescript
import { parseLinks, visitLinks } from "linkity";

const text = "See [[Home]] and [Docs](https://example.com).";
const links = parseLinks(text);

const display = visitLinks(links, (link) => {
  if (link.type === "wikilink") return `Wiki: ${link.value}`;
  if (link.type === "markdown") return `Markdown: ${link.url}`;
  return `Other: ${link.value}`;
});

console.log(display);
```

## Notes

- If all visitor calls return `undefined`, `visitLinks` returns `undefined`.
- `visitLinks` skips undefined entries to remain robust.
