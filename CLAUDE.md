# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Entorno de desarrollo
- **Node.js requerido: v22.x**
- ESLint falla silenciosamente o no resuelve plugins
  correctamente con versiones anteriores a Node 22.
- Verificar versión activa: `node --version`
- Cambiar con nvm: `nvm use` (lee .nvmrc automáticamente)

## Commands

**Development:**
```bash
npm run dev          # Start Nuxt dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
```

## Architecture Overview

This is a **Nuxt 3** financial dashboard that enforces **strict architectural layering** to maintain separation of concerns.

### Frontend Architecture (CRITICAL)

**Mandatory data flow:**
```
UI (pages/components) → application → store → api → server/api → backend
```

**Layer responsibilities:**

1. **composables/api/** — ONLY layer allowed to use `$fetch`
   - Wraps all HTTP calls to server routes
   - No business logic, no state management
   - Returns raw server responses

2. **composables/application/** — Business logic and use cases
   - Coordinates between stores and API layer
   - Contains business rules and workflows
   - Never calls `$fetch` directly

3. **composables/presenters/** — UI presentation logic
   - Transforms data for display (labels, colors, variants)
   - No business logic, no API calls
   - Pure functions for UI concerns

4. **stores/** (Pinia) — State management ONLY
   - State, getters, and setter actions only
   - Never calls `$fetch` directly (uses api composables)
   - No business logic

5. **pages/ & components/** — Rendering and user interaction
   - Call application composables, never stores directly
   - No `$fetch`, no business logic
   - Handle user input and display data

**Architectural violations are REJECTED:**
- ❌ `$fetch` anywhere except `composables/api/`
- ❌ Business logic in components, pages, or stores
- ❌ Pages/components calling stores directly without application layer
- ❌ Stores calling other stores

### Backend Integration

**Server routes** (`src/server/api/`) act as a BFF (Backend for Frontend):
- Proxy to external NestJS backend
- Handle authentication cookies (httpOnly)
- Transform backend responses if needed

**Backend architecture** (NestJS):
- Hexagonal: `domain/` → `application/` → `infrastructure/`
- All responses wrapped in `{ success, data }`
- Token injection always uses string: `@Inject('RepositoryName')`

## Component Structure

**Atomic Design hierarchy:**
```
components/
├── atoms/       # Button, Badge, Text, Heading, Icon
├── molecules/   # Select, Input, ProgressBar, DatePickerInput
├── organisms/   # DataTable, Form, ModalWizard
└── business/    # Domain-specific components (ALWAYS in feature folder)
```

**CRITICAL rules for business components:**
- ✅ `components/business/budget/BudgetForm.vue`
- ❌ `components/business/BudgetForm.vue` (never in root)

**Component file structure:**
```
atoms/button/
├── Button.vue
├── types/
│   └── button.types.ts
└── index.ts
```

**Props must be defined in types:**
```typescript
// types/button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

// Button.vue
<script setup lang="ts">
import type { ButtonProps } from './types/button.types'
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md'
})
</script>
```

**Component structure order:**
```vue
<script setup lang="ts">
// 1. Imports
// 2. Props/emits
// 3. Logic
</script>

<template>
  <!-- 2. Template -->
</template>

<style scoped lang="postcss">
/* 3. Styles */
</style>
```

## Styling & Design System

**Tailwind is used via @apply in PostCSS, NOT directly in templates:**

❌ Bad:
```vue
<div class="flex items-center gap-2 bg-primary-50">
```

✅ Good:
```vue
<div class="card-header">

<style scoped lang="postcss">
.card-header {
  @apply flex items-center gap-2 bg-primary-50;
}
</style>
```

**BEM naming convention:**
```css
.block { }
.block__element { }
.block--modifier { }
```

**Semantic color system:**
```
Income/Needs  → primary   (teal)     bg-primary-50   text-primary-700
Expenses      → danger    (red)      bg-danger-50    text-danger-700
Savings       → warning   (amber)    bg-warning-50   text-warning-700
Wants         → secondary (indigo)   bg-secondary-50 text-secondary-700
Success       → success   (green)    bg-success-50   text-success-700
Neutral       → neutral   (slate)    bg-neutral-100  text-neutral-600
```

**Chart colors:**
- Use `CHART_COLORS` from `utils/design-tokens.ts`
- Always wrap `VChart` in `<ClientOnly>`
- Always set explicit height on charts

## Nuxt UI

Integrado como librería de presentación.
Regla: solo render y feedback visual — nunca toca lógica de negocio.

### Componentes permitidos

UIcon, UButton, UBadge, UModal, USlideover, UTooltip, UPopover,
useToast(), USkeleton, UProgress, UAvatar, UTabs, UAccordion, UAlert

### Prohibido hasta E6

UForm, UFormField, UInput, USelect, UCheckbox, URadio, UTextarea
Motivo: Form.vue con schema es el estándar vigente (ADR-006)

### Iconos

UIcon con Iconify — Material Icons eliminado.
Ejemplo: `<UIcon name="i-material-symbols-savings" />`

## CardInfo

Todo formulario y sección con header debe usar CardInfo.

**Props fijas (no cambiar entre formularios):**
```
title-size="xl" · weight="extrabold" · level="h1" · color="black"
sub-title-size="xs" · sub-title-color="muted"
icon-size="md" · icon-variant="primary"
```

**Props variables:** title (dinámico por mode), sub-title, icon (semántico al contexto)

El ícono NUNCA cambia según mode create/edit.

**Referencia:** `components/business/savings/forms/GoalsForm.vue`

## Tamaños estándar

- **Button:** size="sm" en formularios y acciones inline
- **Input/Select:** si size=sm → text-xs internamente
- **Console warnings:** siempre en una sola línea:
  ```typescript
  if (!props.x) { console.warn('[Componente] x is required'); return }
  ```

## Goals utilities

Centralizado en: `utils/goal-formatters.ts`
- `formatMonthsToGoal`
- `getProgressPercentage`
- `GOAL_TERM_LABELS`

**Vocabulario:** usar 'skipped' (no 'omitted') para aportes saltados

**plannedSavings:** solo disponible en GET /goals/:id — no en GET /goals

## Forms

**Use the dynamic Form.vue component:**
- Schema defined in `components/business/[feature]/forms/schema/`
- Field types: text, number, select, date, switch, textarea, money, slider-percentage, radio-card
- See `ExpensePlannedForm.vue` for reference pattern

## Financial Business Logic

### Monetary Display Rules (CRITICAL)

**Cada centavo cuenta:** Ninguna cifra monetaria se expresa como entero. SIEMPRE usar 2 decimales.
- ✅ `$500.000,00 COP`   ❌ `$500.000`
- ✅ `$1.250,50 COP`     ❌ `$1.250`
- ✅ `$0,00 COP`         ❌ `$0`

**Nunca pasar `decimals=0` a `formatCurrency`:**
- ❌ `formatCurrency(value, currency, 0)`
- ✅ `formatCurrency(value, currency)`

**Siempre incluir código de moneda en UI:**
- Usar `formatCurrency()` que incluye símbolo y código
- En gráficos donde el espacio es limitado, usar `formatCompactCurrency()` que incluye símbolo y código ISO
- El código ISO (COP, USD) debe ser visible para eliminar ambigüedad — ambos usan `$` como símbolo

**`formatCompactCurrency` para ejes de gráficos:**
- ✅ `$1.50M COP`   ✅ `$750.00K COP`
- No construir formatters manuales en los componentes
- Siempre importar y usar `formatCompactCurrency` de `@/utils/currency`

## Key Patterns

**Composables naming:**
- Start with `use`: `useAuth.ts`, `useBudgetApi.ts`
- API composables return functions that make `$fetch` calls
- Application composables coordinate business logic
- Presenter composables transform data for UI

**Store patterns:**
```typescript
defineStore('feature', {
  state: () => ({ items: [], isLoading: false, error: null }),
  getters: { /* derive data from state */ },
  actions: {
    setLoading(loading: boolean) { this.isLoading = loading },
    setItems(items) { this.items = items }
    // NO $fetch here - use api composables
  }
})
```

**Always return `{ success, result }` from application composables:**
```typescript
const loadBudgets = async (year: number) => {
  await budgetStore.fetchBudgets(year)
  return { success: !budgetStore.error }
}
```

**Templates:**
- SidebarPage — Layout wrapper for sidebar panels
  - Location: `components/templates/SidebarPage.vue`
  - Usage: Wrap sidebar content with `<SidebarPage><slot /></SidebarPage>`
  - No props, no domain logic — pure layout component
  - Reference: `GoalSidebarPanel.vue`

## Code Standards

### Language Rules (CRITICAL)

**All code must be written in English:**
- ❌ Variable names in Spanish: `const nombreUsuario = ...`
- ❌ Function names in Spanish: `function obtenerDatos() { }`
- ❌ Constant names in Spanish: `const MENSAJE_ERROR = ...`
- ❌ Interface/Type names in Spanish: `interface UsuarioDTO { }`
- ❌ Class names in Spanish: `class ManejadorPagos { }`

**Only UI text/content is allowed in Spanish:**
- ✅ Template literals: `'Bienvenido al sistema'`
- ✅ i18n keys/translations: `{ title: 'Configuración' }`
- ✅ User-facing messages: `error: 'Ocurrió un error'`
- ✅ Comments explaining business logic (optional)

**Examples:**

❌ Bad:
```typescript
const nombreCompleto = ref('')
const obtenerUsuario = async (id: string) => {
  const usuario = await api.cargarUsuario(id)
  return usuario
}
```

✅ Good:
```typescript
const fullName = ref('')
const getUser = async (id: string) => {
  const user = await api.loadUser(id)
  return user
}
```

**Why:** Maintaining English for all code identifiers ensures:
- International collaboration
- Consistency with libraries and frameworks
- Better IDE autocomplete and tooling
- Clear separation between code and content

## Important Files

**Source of truth for architecture:**
- `CLAUDE.md` — Project conventions, architecture rules, and working patterns
- `docs/ARCHITECTURE.md` — Frontend layering and responsibilities

**Design system:**
- `tailwind.config.ts` — Semantic color palette
- `utils/design-tokens.ts` — Chart colors (ECharts)

**Authentication:**
- Cookies managed server-side only
- Access token in httpOnly cookie
- Firebase for Google OAuth

## Charts & Visualization

**Stack:** ECharts + vue-echarts

**Pattern:**
```vue
<template>
  <ClientOnly>
    <VChart :option="chartOptions" style="height: 300px" />
  </ClientOnly>
</template>

<script setup>
import VChart from 'vue-echarts'
import { CHART_COLORS } from '@/utils/design-tokens'
</script>
```

## What NOT to Do

- Never use `$fetch` outside `composables/api/`
- Never put business logic in components, pages, or stores
- Never skip the application layer (pages must call application, not stores)
- Never put business components in `components/business/` root
- Never use Tailwind classes directly in templates (use @apply)
- Never use Chart.js (use ECharts)
- Never skip `ClientOnly` wrapper for VChart
- Never modify existing component public APIs without checking usage
- Never use Spanish for variable names, function names, constants, types, or classes (only UI text allowed in Spanish)
- Never create a sidebar panel without wrapping it in `<SidebarPage>`
- Never use `Number(optional)` without `?? 0` fallback
- Never duplicate `formatMonthsToGoal` or `getProgressPercentage` — import from `utils/goal-formatters`
- Never change the icon of CardInfo based on create/edit mode
- Never use UForm, UInput, USelect in forms — use Form.vue with schema (ADR-006, until E6)

## Common Patterns

**Creating a new feature:**
1. Create API composable in `composables/api/use[Feature]Api.ts`
2. Create application composable in `composables/application/use[Feature]Application.ts`
3. Create presenter if needed in `composables/presenters/use[Feature]Presenter.ts`
4. Update store to use API composable (not $fetch)
5. Create UI components in `components/business/[feature]/`
6. Create page that uses application composable

**Refactoring violations:**
1. Check `CLAUDE.md` and `docs/ARCHITECTURE.md` for violation rules
2. Create missing API layer first
3. Migrate logic incrementally
4. Verify compilation after each step
5. Never refactor everything at once

---

## Critical Rules (Learned in Session)

### ADR-008 — Material Icons never in @apply
`material-symbols-outlined`, `material-symbols-rounded`, `material-icons`
must ALWAYS stay in the template `class` attribute.
Never inside `@apply` in `<style>`. Tailwind doesn't know these classes.

### ADR-009 — Dynamic classes never in @apply
`:class` bindings (conditional or computed) must ALWAYS stay in template.
Only static Tailwind classes go in `@apply`.

✅ Goes in @apply:    class="flex items-center gap-3 p-4"
❌ Stays in template: :class="getIconClass(type)"
❌ Stays in template: :class="{ 'bg-primary-500': isActive }"

### ADR-010 — Composables must be destructured
ALWAYS destructure before use. NEVER call inline.

✅ const { updateExpense } = useExpenseApplication()
   await updateExpense(id, data)

❌ await useExpenseApplication().updateExpense(id, data)

### ADR-011 — Category colors derived from type
Color is determined by `type` field, not a separate color field.
Implemented in: `composables/presenters/useCategoryPresenter.ts`

  need    → primary   (teal)
  want    → secondary (indigo)
  saving  → warning   (amber)

---

## Reference Patterns

### New form component
Reference: `ExpensePlannedForm.vue`
Schema in: `components/business/[feature]/forms/schema/`
Supports create and edit modes via props: `itemId?`, `initialData?`

### New page
Reference: `pages/dashboard/income/index.vue`
Structure: header + metrics + table/list + modals
Load data in onMounted via destructured application composable.

### New presenter
Reference: `composables/presenters/useCategoryPresenter.ts`
Pure functions only. No side effects. No store access.

### Delete confirmation
Reference: `handleDeleteExpense` in `pages/dashboard/budget/[id]/index.vue`
NEVER use native `confirm()`. Always use `ModalWizard` with reactive state:
  const itemToDelete = ref(null)
  const showDeleteModal = ref(false)

---

## Project Status (update each session)

| Module       | Frontend | Backend |
|--------------|----------|---------|
| Auth         | ✅ 100%  | ✅ 100% |
| Dashboard    | ✅ 100%  | ✅ 100% |
| Budgets      | ✅ 100%  | ✅ 100% |
| Savings      | ✅ 100%  | ✅ 100% |
| Profile      | ✅ 100%  | ✅ 100% |
| Transactions | ✅ 100%  | ✅ 100% |
| Expenses     | ✅ 100%  | ✅ 100% |
| Income       | ✅ 100%  | ✅ 100% |
| Settings     | ✅ 100%  | ⚠️ endpoints pending |
| Reports      | ❌ 0%    | ❌ 0%   |

Health Score: 98%
Pending technical debt: Tailwind @apply migration — 22 business components

