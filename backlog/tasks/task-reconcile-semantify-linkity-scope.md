---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-semantify-linkity-scope
title: Reconcile Semantify and Linkity Scope
type: work-item
subtype: architecture
lifecycle: active
status: proposed
priority: high
classification:
  diataxis: explanation
  sensitivity: internal
tags: [architecture, semantify, linkity, adapters]
links:
  - related: "[[task-prototype-visitor-api]]"
---

**Estimated Effort:** 3 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `docs/explanation/adr-semantify-linkity-boundaries.md`

## Overview

Revise Linkity implementation and docs so Linkity owns a layered reference
normalization product: the syntax layer emits `LinkOccurrence` observations, and
Linkity-owned Semantify profiles perform canonical reference normalization and
generation internally.

## Checklist

- [ ] Define the minimal Linkity-native link occurrence contract.
- [ ] Confirm Linkity encapsulates Semantify profiles as part of its reference normalization path.
- [ ] Add examples showing Linkity-owned Semantify profiles consuming Linkity syntax output.
- [ ] Move traversal policy and CI gate language to Doc-Vader or governance-consumer docs.

## Success Criteria

- Linkity uses Semantify profiles internally for reference normalization and generation.
- The syntax extraction layer remains separable from repository traversal policy.
- Governance policy is not assigned to Linkity.

## References

- `docs/explanation/adr-semantify-linkity-boundaries.md`
- `docs/ARCHITECTURE.md`
