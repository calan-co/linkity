---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-link-ast-syntax-contract
title: Implement Link AST Syntax Contract
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: high
classification:
  diataxis: how-to
  sensitivity: internal
tags: [api, ast, syntax, transforms, linkity]
links:
  - related: "[[task-reconcile-semantify-linkity-scope]]"
  - related: "[[task-publish-linkity-product-role-contract]]"
---

## Overview

Implement Linkity as a universal single-link parser/renderer: registered syntaxes parse one concrete link string into canonical link-scoped `Ast` and render that `Ast` into another syntax.

## Constraints

- Implementation work happens in isolated work-specific worktree `/tmp/linkity-wi-ast-syntax`.
- Code changes follow TDD: contract tests were written before implementation.
- Linkity does not parse full documents or own graph/repository traversal.

## Checklist

- [x] Define public `Ast`, `Syntax`, `Match`, `Diagnostic`, `Feature`, context, and render result contracts.
- [x] Drop redundant public type prefixes; keep compatibility aliases where needed.
- [x] Provide cheap `match()` rules on syntaxes.
- [x] Provide built-in GFM, Obsidian/wikilink, and URL syntax projections.
- [x] Implement parse/render transform primitives for one link.
- [x] Default lossy render to error and allow opt-in warnings.
- [x] Support caller-provided parse context for relative path resolution.
- [x] Update tests and docs.

## Validation

- `npm run typecheck -- --pretty false` passed.
- `npx vitest run` passed: 4 files, 17 tests.
- `npm run build` passed.
- `dv work ready --json` is blocked by missing Doc-Vader dist file `dist/lib/work/command-inventory.js`.
