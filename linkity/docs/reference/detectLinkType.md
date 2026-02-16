---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: reference-detect-link-type
title: detectLinkType
type: document
subtype: reference
lifecycle: active
status: accepted
classification:
  diataxis: reference
  sensitivity: public
tags: [linkity, api, detectLinkType]
---

Detect the link type from an input string.

## Signature

```typescript
export function detectLinkType(
  str: string
): "wikilink" | "markdown" | "url" | "custom" | null;
```

## Parameters

- `str`: Raw input string to evaluate.

## Returns

- A `LinkType` value if the input matches a supported format.
- `null` when no link format is detected.

## Example

```typescript
import { detectLinkType } from "linkity";

detectLinkType("[[Page]]");
// => "wikilink"

detectLinkType("[text](https://example.com)");
// => "markdown"

detectLinkType("https://example.com");
// => "url"
```

## Notes

- `custom` is returned when the string matches a configured custom scheme.
- Use `parseLinks` or the individual parsers for structured output.
