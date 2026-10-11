---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-graph-ecosystem-boundaries
title: Document Graph Ecosystem Boundaries
type: work-item
subtype: documentation
lifecycle: active
status: complete
priority: medium
classification:
  diataxis: explanation
  sensitivity: internal
tags: [afk, architecture, graph, ecosystem, linkity]
links:
  - related: "[[task-publish-linkity-product-role-contract]]"
---

**Estimated Effort:** 2 hours  
**Priority:** Medium  
**Assignee:** TBD  
**Depends On:** `task-implement-link-ast-syntax-contract`

## Overview

Document how Linkity enables ecosystem use cases without owning graph, document, or repository state.

## Context

Required ecosystem use cases include automatic link updates, dynamic title resolution, and document-wide syntax transformations. Linkity should enable these through single-link AST parse/render primitives, `match()` spans, and caller-provided context, while graph/index tools own state and persistence.

## Checklist

- [x] Document automatic link update boundaries: graph detects rename/move; Linkity renders updated single links.
- [x] Document dynamic title resolution boundaries: external resolver supplies current title; Linkity represents label semantics.
- [x] Document document-wide transform boundaries: external parser finds spans; Linkity parses/renders each link.
- [x] Add examples showing `match()` + span replacement controlled by a consumer.
- [x] Clarify Linkity does not own file loading, persistence, graph updates, or repository traversal.

## Success Criteria

- [x] Ecosystem responsibilities are clear in README and architecture docs.
- [x] The docs prevent conflating Linkity with a document parser or graph engine.

## Validation

- [x] Documentation-only change reviewed against README and architecture docs.
