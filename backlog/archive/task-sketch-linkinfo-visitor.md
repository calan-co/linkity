---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-003
title: Sketch LinkInfo Interface & Visitor Prototype
type: work-item
subtype: feature
lifecycle: archived
status: duplicate
priority: medium
classification:
  diataxis: how-to
  sensitivity: internal
tags: [types, api, extensibility, linkity]
links:
  - duplicates: "[[task-refine-linkinfo-interface]]"
    note: wi-003 was split into wi-003a
  - duplicates: "[[task-prototype-visitor-api]]"
    note: wi-003 was split into wi-003b
---

**Estimated Effort:** 1–2 hours  
**Priority:** Medium (future extensibility)  
**Assignee:** TBD  
**Depends On:** None

## Overview

Design and document a refined `LinkInfo` (or `LinkNode`) TypeScript interface to support richer link metadata and future extensibility. Prototype a visitor API for traversing or transforming link records, enabling future migration to an AST or IR model if needed.

## Context

- Interface should support optional context fields (e.g., inCode, inHeading, headingLevel, inline)
- Visitor prototype should allow consumers to process or transform link records with minimal coupling
- Should be consistent with current project conventions and ESM-first design

## Checklist

### API & Type Design

- [ ] Draft a refined `LinkInfo`/`LinkNode` TypeScript interface in `src/types/index.ts`
- [ ] Prototype a visitor function (e.g., `visitLinks`) in a suitable location (e.g., `src/index.ts` or `src/utils/`)
- [ ] Document usage examples and rationale in code comments or a short doc section

## Success Criteria

✅ Interface supports current and future metadata needs  
✅ Visitor prototype enables extensible link processing  
✅ Changes are documented and ready for review

## References

- `src/types/index.ts` (type definitions)
- `src/index.ts`, `src/utils/` (API surface)
- `docs/ARCHITECTURE.md` (strategic direction)
