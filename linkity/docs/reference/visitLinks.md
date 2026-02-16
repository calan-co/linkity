---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: reference-visit-links
title: visitLinks
type: document
subtype: reference
lifecycle: active
status: accepted
classification:
  diataxis: reference
  sensitivity: public
tags: [linkity, api, visitLinks]
---

Traverse an array of `LinkNode` records and optionally return mapped results.

## Signature

```typescript
export function visitLinks<T = void>(
  links: LinkNode[],
  visitor: (link: LinkNode, index: number, array: LinkNode[]) => T
): T[] | void;
```

## Parameters

- `links`: Array of `LinkNode` objects (from `parseLinks` or per-syntax parsers).
- `visitor`: Callback invoked for each link.

## Returns

- An array of visitor results, or `undefined` if the visitor returns `undefined` for all items.
- Returns `undefined` if `links` is not an array.

## Example

```typescript
import { parseLinks, visitLinks } from "linkity";

const text = "See [[Home]] and https://example.com";
const links = parseLinks(text);

const types = visitLinks(links, (link) => link.type);
// => ["wikilink", "url"]
```

## Notes

- `visitLinks` skips any undefined entries in the array for robustness.
