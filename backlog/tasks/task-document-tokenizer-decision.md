---
# yaml-language-server: $schema=../schemas/work-item.frontmatter.schema.json
id: wi-004
title: Document Tokenizer/Lexer Library Decision
type: work-item
subtype: documentation
lifecycle: active
status: complete
priority: high
classification:
  diataxis: explanation
  sensitivity: internal
links:
  - provenance: "[[mvp scope#Do you need a tokenizer?]]"
tags: [architecture, dependencies, linkity]
---

**Estimated Effort:** 1 hour  
**Priority:** High (core technical direction)  
**Assignee:** TBD  
**Depends On:** None

## Overview

Record the decision to use a bespoke tokenizer/lexer for Linkity, including a list of existing libraries considered, rationale for a custom solution, and triggers for when to reevaluate this choice.

## Context

- Linkity requires zero runtime dependencies, ESM-first, and strict TypeScript
- Existing libraries (moo, chevrotain, micromark, marked) were considered
- Custom solution is preferred for size, tree-shaking, and syntax control
- Triggers for reevaluation: need for full Markdown parsing, plugin ecosystem, extensible grammars

## Checklist

- [x] Add a section to `docs/ARCHITECTURE.md` documenting the tokenizer/lexer decision
- [x] List existing libraries and why they were not chosen
- [x] State rationale for bespoke solution
- [x] Define triggers for reevaluation
- [x] Ensure documentation is clear and passes linting

## Success Criteria

✅ Decision and rationale are clearly documented  
✅ Triggers for reevaluation are defined  
✅ Document passes linting and schema validation

## References

- `docs/ARCHITECTURE.md` (architecture record)
- `CONTRIBUTING.md` (documentation conventions)
