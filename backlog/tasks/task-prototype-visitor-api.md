---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-003b
title: Prototype Visitor API for Link AST Records
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: medium
classification:
  diataxis: how-to
  sensitivity: internal
tags: [afk, api, extensibility, linkity, visitor]
links:
  - related: "[[task-reconcile-semantify-linkity-scope]]"
---

**Estimated Effort:** 1 hour  
**Priority:** Medium (future extensibility)  
**Assignee:** TBD  
**Depends On:** `task-implement-link-ast-syntax-contract`

## Overview

Prototype a visitor API for traversing or transforming link-scoped `Ast` records, enabling extensible link processing without requiring Linkity to own a document AST. Ensure the API is consistent with project conventions and ESM-first design.

## Context

- Visitor function should allow consumers to process or transform link AST records with minimal coupling.
- Visitor API should remain a small utility over already parsed links; syntax parse/render remains the primitive for single-link transforms.
- Should be compatible with current parser outputs and the canonical `Ast` type.

## Checklist

- [x] Implement a visitor function (e.g., `visitLinks`) in a suitable location (e.g., `src/index.ts` or `src/utils/`)
- [x] Document usage examples and rationale in code comments or a short doc section

## Acceptance Criteria

- [x] Visitor prototype enables extensible link processing over canonical `Ast` records.
- [x] Visitor returns collected visitor results and returns `undefined` for side-effect-only visitors.
- [x] Visitor behavior is covered by focused tests.
- [x] Changes are documented and ready for review.

## Validation

- [x] `npm run typecheck -- --pretty false` passed.
- [x] `npx vitest run tests/visitLinks.test.ts` passed: 1 file, 3 tests.

## References

- `src/index.ts`, `src/utils/` (API surface)
- `docs/ARCHITECTURE.md` (strategic direction)
