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

# Linkity Types

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

- `position` values are character offsets into the original input.
- `context` is optional and may be extended by future parsers.
