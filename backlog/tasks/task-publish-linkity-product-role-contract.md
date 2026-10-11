---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-linkity-product-role-contract
title: Publish Linkity Product Role Contract
type: work-item
subtype: architecture
lifecycle: active
status: complete
priority: high
classification:
  diataxis: explanation
  sensitivity: internal
tags: [afk, architecture, linkity, contracts, product-roles]
links:
  - related: "[[task-reconcile-semantify-linkity-scope]]"
---

**Estimated Effort:** 3 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `task-reconcile-semantify-linkity-scope`, `task-document-graph-ecosystem-boundaries`

## Overview

Publish Linkity's role in the cross-product architecture: Linkity owns link
syntax extraction, link occurrence records, and target-normalization contracts,
while repository traversal policy, schema policy, lifecycle diagnostics, and CI
governance remain with Doc-Vader or other consumers.

## Context

The 2026-06-26 architecture review found that product roles were still framed as
implementation conveniences across Doc-Vader, Linkity, and TemplJS. For Linkity,
the missing durable backlog item is the explicit package contract that says what
Linkity owns, what it delegates to consumer adapters, and what policy must not
leak into Linkity.

## Checklist

- [x] Document Linkity-owned responsibilities in README and architecture docs: syntax parsing, canonical `Ast`, feature diagnostics, and render contracts.
- [x] Document Linkity non-goals: schema policy, work-item lifecycle policy, repository traversal decisions, graph persistence, and CI gate outcomes.
- [x] Define the public contract shape expected by Doc-Vader adapters, including canonical AST fields, spans, and parser provenance.
- [x] Clarify Semantify is deferred for MVP and Linkity normalization is `Syntax.parse -> Ast -> Syntax.render`.
- [x] Add examples showing Doc-Vader or consumers supplying artifact indexes and lifecycle state through adapters/context instead of Linkity reading repository state itself.

## Success Criteria

- [x] Linkity docs clearly distinguish parse/render normalization from governance policy.
- [x] Doc-Vader integration expectations are described as adapter/context contracts, not source imports or repository traversal behavior inside Linkity.
- [x] The role contract aligns with the Linkity AST/Syntax boundary and Semantify deferral decision.

## Validation

- [x] README and architecture docs updated with Product Role Contract.

## References

- `docs/explanation/adr-semantify-linkity-boundaries.md`
- `docs/ARCHITECTURE.md`
