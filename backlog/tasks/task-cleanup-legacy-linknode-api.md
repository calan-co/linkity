---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-cleanup-legacy-linknode-api
title: Clean Up Legacy LinkNode API Compatibility
type: work-item
subtype: maintenance
lifecycle: active
status: complete
priority: medium
classification:
  diataxis: how-to
  sensitivity: internal
tags: [afk, api, migration, compatibility, linkity]
links:
  - related: "[[task-implement-link-ast-syntax-contract]]"
---

**Estimated Effort:** 2 hours  
**Priority:** Medium  
**Assignee:** TBD  
**Depends On:** `task-build-syntax-registry-extension-contract`

## Overview

Plan and execute the compatibility cleanup after the public model rename from `LinkNode`/`LinkityParseOptions` to unprefixed `Ast`/`ParseOptions`.

## Context

The implementation keeps deprecated aliases for compatibility. A follow-up should decide how long aliases remain, update examples, and ensure legacy wrappers do not keep URL/document-parser assumptions alive.

## Checklist

- [x] Audit exported deprecated aliases and legacy parser wrappers.
- [x] Document migration from `LinkNode` to `Ast` and old fields to canonical AST fields.
- [x] Decide whether `parseLinks()` remains a convenience wrapper or moves to a separate package later.
- [x] Add compatibility tests for deprecated aliases if retained.
- [x] Remove stale docs/examples that imply `url` is a canonical AST property.

## Success Criteria

- [x] Public migration path is explicit.
- [x] Deprecated compatibility surface is intentional and retained as aliases.

## Decision

Retain deprecated aliases for compatibility and document migration. Keep `parseLinks()` as a compatibility convenience wrapper; new transform work should use `Syntax.match/parse/render`.

## Validation

- [x] Migration docs added to README.
- [x] Existing typecheck and visitor/parser tests cover retained compatibility paths.
