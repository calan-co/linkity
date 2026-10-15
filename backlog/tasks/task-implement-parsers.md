---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-001
title: Implement Individual Parsers (wikilink, markdown, url)
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: high
classification:
  diataxis: how-to
  sensitivity: internal
tags: [parsers, linkity, implementation]
---

**Estimated Effort:** 4–6 hours  
**Priority:** High (core functionality)  
**Assignee:** TBD  
**Depends On:** None

## Overview

Implement the three core link parsers for Linkity: Wikilink, Markdown, and Raw URL. Integrate them into the main API and ensure comprehensive test coverage.

## Context

- Each parser should return an array of `LinkNode` objects with accurate position offsets
- Parsers must be ESM-first, zero runtime dependencies
- Tests must verify happy path, off-switch, and edge cases

## Checklist

### Core Functionality

- [x] Implement `parseWikilink(text: string): LinkNode[]` in `src/parsers/wikilink.ts`
- [x] Implement `parseMarkdownLink(text: string): LinkNode[]` in `src/parsers/markdown.ts`
- [x] Implement `parseRawUrl(text: string, customSchemes?): LinkNode[]` in `src/parsers/url.ts`
- [x] Export all parsers in `src/parsers/index.ts`
- [x] Integrate each parser into `parseLinks()` in `src/index.ts` behind the correct option flag
- [x] Update `detectLinkType()` in `src/utils/detect.ts` to recognize new link types

### Testing & Validation

- [x] Add comprehensive tests in `test/parse.test.ts` for:
  - Happy path (correct parsing and position offsets)
  - Off-switch behavior (parser disabled via options)
  - Edge cases (escaped brackets, punctuation, mixed content)
- [x] Ensure all tests pass and coverage is adequate

## Success Criteria

✅ All three parsers implemented and integrated  
✅ Tests cover all major cases and pass  
✅ No runtime dependencies added  
✅ Accurate position offsets for all detected links

## References

- `src/parsers/wikilink.ts`, `markdown.ts`, `url.ts`
- `src/index.ts` (main API)
- `src/types/index.ts` (LinkNode type)
- `test/parse.test.ts` (test patterns)

## CommonMark and GFM Link Profiles

- [x] Add separate `commonmark` and `gfm` profiles.
- [x] Use composed Peggy grammar sources: GFM reuses CommonMark link rules and adds only extended autolinks.
- [x] Resolve full, collapsed, and shortcut references from `ParseContext.referenceDefinitions`.
- [x] Add authoritative positive and negative CommonMark/GFM fixtures.
