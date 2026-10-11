---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-semantify-linkity-scope
title: Reconcile Semantify and Linkity Scope
type: work-item
subtype: architecture
lifecycle: active
status: complete
priority: high
classification:
  diataxis: explanation
  sensitivity: internal
tags: [afk, architecture, semantify, linkity, adapters]
links:
  - related: "[[task-prototype-visitor-api]]"
---

**Estimated Effort:** 3 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `task-decide-semantify-integration`

## Overview

Revise Linkity implementation and docs so Linkity owns a layered reference
normalization product: the syntax layer emits `LinkOccurrence` observations, and
Linkity-owned Semantify profiles perform canonical reference normalization and
generation internally.

## Checklist

- [x] Define the minimal Linkity-native canonical `Ast` contract.
- [x] Confirm Semantify is deferred from MVP runtime path pending concrete value beyond `Ast`/`Syntax`.
- [x] Add architecture notes showing `Syntax.parse -> Ast -> Syntax.render` as the MVP normalization path.
- [x] Move traversal policy and CI gate language to Doc-Vader or governance-consumer docs.

## Success Criteria

- [x] Linkity MVP reference normalization is defined through canonical `Ast` and `Syntax` dialects.
- [x] The syntax extraction/rendering layer remains separable from repository traversal policy.
- [x] Governance policy is not assigned to Linkity.

## Validation

- [x] Architecture docs updated to reflect Semantify deferral and Linkity-owned MVP normalization path.

## References

- `docs/explanation/adr-semantify-linkity-boundaries.md`
- `docs/ARCHITECTURE.md`
