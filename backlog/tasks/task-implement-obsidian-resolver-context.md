---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-obsidian-resolver-context
title: Implement Obsidian Resolver with Caller-Provided Context
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: high
classification:
  diataxis: how-to
  sensitivity: internal
tags: [afk, obsidian, resolver, syntax, linkity]
links:
  - related: "[[task-implement-link-ast-syntax-contract]]"
---

**Estimated Effort:** 4 hours  
**Priority:** High  
**Assignee:** TBD  
**Depends On:** `task-build-syntax-registry-extension-contract`

## Overview

Implement Obsidian-style relative wikilink resolution using caller-provided file/index context, including the rules documented in `backlog/todo.md`.

## Context

For `[[README.md]]` to resolve correctly, the Obsidian syntax must receive enough context about the source file and available files. Linkity must not scan repositories or own document traversal; consumers supply the index.

## Checklist

- [x] Convert the Obsidian resolver gist in `backlog/todo.md` into focused tests.
- [x] Define the smallest `FileIndex`/resolver context needed by `obsidianSyntax.parse()`.
- [x] Resolve relative wikilinks against `sourcePath` and caller-provided candidates.
- [x] Preserve unresolved input with clear diagnostics or errors.
- [x] Keep filesystem/repository traversal outside Linkity.
- [x] Document caller responsibilities and examples.

## Success Criteria

- [x] Obsidian relative links resolve deterministically from supplied context.
- [x] No hidden filesystem scan is introduced.
- [x] Focused resolver tests pass.

## Validation

- [x] `npx vitest run tests/obsidian-resolver.test.ts` passed: 1 file, 6 tests.
- [x] `npm run typecheck -- --pretty false` passed.
- [x] `npx vitest run` passed: 6 files, 27 tests.
- [x] `npm run build` passed.
