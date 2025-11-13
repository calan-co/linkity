---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-005
title: Sketch Wikilink Tokenizer with Variant Support
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: high
classification:
  diataxis: how-to
  sensitivity: internal
tags: [parsers, tokenizer, wikilink, linkity]
---

**Estimated Effort:** 2–3 hours  
**Priority:** High (core parsing extensibility)  
**Assignee:** TBD  
**Depends On:** None

## Overview

Design and prototype a minimal tokenizer for wikilinks, supporting customizable variants (Obsidian, Foam, Wikimedia, GFM, etc.) and features (aliasing, anchor, embedding, images, etc.).

## Context

- Tokenizer should be ESM-first, zero dependencies, strict TypeScript
- Must support configuration for variant-specific syntax and features
- Should output tokens or link nodes with accurate position offsets and feature flags

## Checklist

- [x] Sketch a minimal tokenizer for wikilinks in `src/parsers/wikilink.ts` or `src/utils/tokenize.ts`
- [x] Support configuration for variant (Obsidian, Foam, Wikimedia, GFM, etc.)
- [x] Handle features: aliasing, anchor, embedding, images, etc.
- [x] Document usage and configuration options in code comments
- [x] Add basic tests for major variants and features, achieving _at least_ 80% code coverage

## Success Criteria

✅ Tokenizer supports major variants and features  
✅ Output is accurate and extensible  
✅ Implementation and documentation are ready for review

## References

- `src/parsers/wikilink.ts`, `src/utils/tokenize.ts` (implementation)
- `test/parse.test.ts` (test patterns)
- `docs/ARCHITECTURE.md` (strategic direction)
