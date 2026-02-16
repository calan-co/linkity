---
# yaml-language-server: $schema=./schemas/document.frontmatter.schema.json
id: how-to-custom-schemes
title: Add Custom URL Schemes
type: document
subtype: guide
lifecycle: active
status: accepted
classification:
  diataxis: how-to
  sensitivity: public
tags: [linkity, how-to, custom-schemes]
---

# Add Custom URL Schemes

Use `customSchemes` to recognize additional URL schemes (for example `vscode:` or `obsidian:`).

## Steps

1. Define the schemes you want to support.
2. Pass them to `parseLinks` via `customSchemes`.
3. Filter returned links by `type === "custom"`.

## Example

```typescript
import { parseLinks } from "linkity";

const text = "Open vscode://file/path and obsidian://open?vault=notes";

const links = parseLinks(text, {
  enableUrl: true,
  customSchemes: ["vscode", "obsidian"]
});

const customLinks = links.filter((l) => l.type === "custom");
console.log(customLinks);
```

## Notes

- Custom schemes are detected as type `custom`.
- Use `detectLinkType` if you only need to classify a single string.
