---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: reference-types
title: Linkity Types
type: document
subtype: reference
lifecycle: active
status: accepted
classification:
  diataxis: reference
  sensitivity: public
tags: [linkity, api, types]
---

Core type definitions for Linkity APIs.

## LinkType

```typescript
type LinkType = "wikilink" | "markdown" | "url" | "custom";
```

## LinkNode

```typescript
interface LinkNode {
  type: LinkType;
  value: string;
  alias?: string;
  fragment?: string;
  url?: string;
  position?: {
    start: number;
    end: number;
  };
  data?: Record<string, any>;
  context?: {
    inCode?: boolean;
    inHeading?: boolean;
    headingLevel?: number;
    inline?: boolean;
    [key: string]: any;
  };
}
```

## LinkityParseOptions

```typescript
interface LinkityParseOptions {
  enableWikilink?: boolean;
  enableMarkdown?: boolean;
  enableUrl?: boolean;
  customSchemes?: string[];
}
```

## Notes

- `fragment` is the parsed anchor/section without the leading `#`. Wikilinks expose `[[Page#Section]]` as `value: "Page"` and `fragment: "Section"`; same-document wikilinks expose `[[#Section]]` as `value: ""` and `fragment: "Section"`. Markdown links and URLs expose the URL fragment when present.
- `position` values are character offsets into the original input.
- `context` is optional and may be extended by future parsers.
