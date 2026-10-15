---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-syntax-harness-webpage
title: Build Syntax Harness Webpage
type: work-item
subtype: feature
lifecycle: active
status: complete
priority: medium
classification:
  diataxis: how-to
  sensitivity: internal
tags: [afk, developer-tools, syntax, harness, linkity]
links:
  - related: "[[task-build-syntax-registry-extension-contract]]"
---

**Estimated Effort:** 3 hours  
**Priority:** Medium  
**Assignee:** TBD  
**Depends On:** `task-build-syntax-registry-extension-contract`

## Overview

Create a browser-based development harness for validating links against selected syntax profiles, translating links between syntaxes, and prototyping new syntax profiles.

## Checklist

- [x] Add a static harness webpage inspired by regex101, iOS Translate, and Postman-style profile labs.
- [x] Support validating a specific link syntax against a selected syntax profile.
- [x] Support bidirectional conversion between selected syntaxes.
- [x] Support creating and testing custom syntax profiles in the browser.
- [x] Add focused tests before implementation for harness core behavior and page structure.
- [x] Document the harness in README examples.

## Acceptance Criteria

- [x] Harness can validate a link and show match, AST, rendered output, diagnostics, or errors.
- [x] Harness can convert between built-in syntaxes in either direction.
- [x] Harness can register a custom syntax profile from development snippets.
- [x] Harness is dependency-free and uses existing built artifacts.

## Validation

- [x] `npx vitest run tests/harness-core.test.ts tests/harness-page.test.ts` passed.
- [x] `npx vitest run` passed after consolidation.
- [x] `npx vitest run` passed after profile editing refinement: 10 files, 45 tests.
- [x] `npm run typecheck -- --pretty false` passed after consolidation.
- [x] `npm run lint:md` passed after consolidation.

## Refinement: Consolidated Validate and Translate Panel

- [x] Remove manual Validate button; validation runs as the input/profile changes.
- [x] Show a checkmark/error indicator next to the link field.
- [x] Put human-readable error details in the indicator tooltip.
- [x] Move translation into an expandable section in the main validation panel.
- [x] Automatically convert valid input when the translation section is expanded or target syntax changes.

## Refinement: Profile Editing and Readonly Translation Output

- [x] Add readonly translated-link input for the translated value.
- [x] Keep the default link valid against the default syntax.
- [x] Add an `anchor` syntax profile for HTML `<a href="...">...</a>` links.
- [x] Allow Custom Profile Lab to load and edit existing profiles such as gfm, wikilink, obsidian, url, and anchor.

## Refinement: PEG-Based Profile Editing

- [x] Replace JavaScript `match`, `parse`, and `render` snippets with a simplified PEG editor.
- [x] Add a PEG compiler for custom syntax profiles.
- [x] Serialize existing profiles into editable PEG source.
- [x] Keep `anchor` profile expressed as PEG instead of hardcoded profile methods.
