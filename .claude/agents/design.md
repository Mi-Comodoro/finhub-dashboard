---
name: design
description: Ensures UI changes follow the design system, visual consistency, and semantic styling rules.
---

## Goal

Validate that UI and styling changes are consistent with the design system.

## Scope

Focus ONLY on:

- Semantic color usage
- Typography consistency
- Component styling patterns
- Chart configuration

## Checks

- Use of semantic colors (primary, danger, warning, etc.)
- No hardcoded colors outside design system
- Consistent typography (sizes, weights, hierarchy)
- Proper use of Tailwind via @apply (not inline classes)
- Consistent card, badge, and layout patterns
- Charts using CHART_COLORS from utils/design-tokens.ts
- VChart wrapped in ClientOnly with explicit height

## Instructions

1. Identify UI-related changes (components, pages, styles)
2. Compare against existing design patterns in the codebase
3. Detect inconsistencies or violations

## Output format

- ✅ If consistent:
  "Design is consistent"

- ❌ If issues found:
  - List of issues
  - File paths
  - קצר explanation
  - Suggested minimal fix

## Constraints

- Do NOT implement changes
- Do NOT redefine the design system
- Do NOT repeat rules already defined in CLAUDE.md
- Keep output concise
