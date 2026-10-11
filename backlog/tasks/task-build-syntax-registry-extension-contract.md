---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-syntax-registry-extension-contract
title: Build Syntax Registry and Extension Contract
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: high
classification:
  diataxis: how-to
  sensitivity: internal
tags: [afk, api, syntax, extensions, linkity, transforms]
links:
  - related: "[[task-implement-link-ast-syntax-contract]]"
---

**Estimated Effort:** 3 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `task-implement-link-ast-syntax-contract`

## Overview

Harden the syntax ecosystem contract so built-in and third-party syntaxes can be registered, discovered, and used consistently for single-link parse/render transforms.

## Context

The agreed architecture defines `Syntax` as a dialect bundle with `match`, `parse`, `render`, and `supports`. Linkity should support future syntaxes such as GFM, Obsidian, Foam, Roam Research, Notion, and consumer-provided extensions without hardcoded enum coupling.

## Checklist

- [x] Define a minimal syntax registry API for registering and retrieving `Syntax` implementations.
- [x] Keep built-in syntaxes available directly and through the registry.
- [x] Add duplicate-id and missing-syntax diagnostics or errors.
- [x] Document extension syntax requirements: cheap `match`, single-link `parse`, single-link `render`, and `supports` feature list.
- [x] Add examples for registering a custom syntax.
- [x] Add focused tests before implementation.

## Success Criteria

- [x] Consumers can register and use new syntaxes without modifying Linkity internals.
- [x] Built-ins remain zero-dependency and ESM-first.
- [x] Registry behavior is covered by focused tests.

## Validation

- [x] `npm run typecheck -- --pretty false` passed.
- [x] `npx vitest run` passed: 5 files, 21 tests.
- [x] `npm run build` passed.
