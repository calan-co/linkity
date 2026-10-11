---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-decide-semantify-integration
title: Decide Semantify Integration Path
type: work-item
subtype: architecture
lifecycle: active
status: complete
priority: high
classification:
  diataxis: explanation
  sensitivity: internal
tags: [afk, architecture, semantify, linkity]
links:
  - related: "[[task-reconcile-semantify-linkity-scope]]"
---

**Estimated Effort:** 2 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `task-implement-link-ast-syntax-contract`

## Overview

Make a concrete decision on whether Semantify belongs in Linkity's implementation path now that Linkity owns a canonical link-scoped AST and syntax parse/render dialects.

## Context

Earlier scope said Semantify should be fully integrated if it remains strategically and architecturally logical. The current Linkity primitive may make Semantify unnecessary for MVP or may define the right profile/projection boundary.

## Checklist

- [x] Compare current `Ast`/`Syntax` model against Semantify profile/projection responsibilities.
- [x] Identify whether Semantify adds necessary value for canonical link semantics, profile assets, or projection rules.
- [x] Verify compatibility with Linkity constraints: ESM-first, browser-compatible, minimal dependencies, no governance leakage.
- [x] Record one of: integrate now, defer with rationale, or remove from Linkity scope.
- [x] If integration is chosen, create a follow-up implementation work item with concrete API and tests.

## Success Criteria

- [x] Semantify scope is no longer ambiguous.
- [x] Linkity does not carry placeholder Semantify language without an implementation path.

## Decision

Defer Semantify from the MVP implementation path. Revisit only if Linkity needs cross-product projection rules or profile packaging beyond `Syntax` dialects.

## Validation

- [x] Architecture decision recorded in `docs/explanation/adr-semantify-linkity-boundaries.md`.
