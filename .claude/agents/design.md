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
- CardInfo props fijas respetadas en todos los formularios (title-size xl, sub-title-size xs, icon-size md, icon-variant primary)
- Ícono de CardInfo no cambia según mode create/edit
- Buttons con size="sm" en acciones inline y formularios
- Badge de cuenta o plazo → neutral (Primary solo para estados activos e ingresos, ADR-003)
- Colores semánticos ADR-003: primary=income/needs · warning=savings · danger=expenses · secondary=wants

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

## UI Review pre-sprint

Antes de cerrar cada sprint, ejecutar una auditoría de componentes UI.
Leer `CLAUDE.md` y `.agents/skills/nuxt-ui/` antes de analizar.
NO modificar código — solo generar reporte en formato `.md`.

### Qué evaluar por componente

- **Espaciado:** gap label→campo (estándar `gap-1.5`), padding coherente con el `size` prop
- **Tamaños:** altura alineada con `Button` del mismo size, `text-size` coherente con `size` prop
- **Estados:** hover (`border/bg`), focus (`ring-2` mínimo WCAG AA), disabled (`cursor-not-allowed` en el contenedor completo, no solo en el `<input>`)
- **Transiciones:** `transition-colors duration-200` como estándar; `transition-all` solo si hay cambios de layout
- **Sombras:** `shadow-sm` en componentes sobre `bg-elevated` (modals, sidepanels, cards)
- **Colores:** semánticos Nuxt UI vs raw Tailwind, cobertura dark mode, ADR-003
- **Consistencia:** Input y Select a la misma altura; íconos del mismo sistema (no mezclar Material Symbols con Iconify)

### Formato del reporte

Guardar como `ui-review-[fecha].md` en la raíz del proyecto o en `docs/`.

```md
# UI Review — [fecha]

## 🔴 Alta prioridad
## 🟠 Media prioridad
## 🟡 Baja prioridad
## ⚪ Deuda técnica
## ✅ Sin hallazgos
```

Por cada hallazgo incluir: **componente** · **archivo:línea** · **descripción** · **fix en una línea**.

## Constraints

- Do NOT implement changes
- Do NOT redefine the design system
- Do NOT repeat rules already defined in CLAUDE.md
- Keep output concise
