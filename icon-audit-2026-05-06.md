# Icon Audit — 2026-05-06

## Summary

- **Total icon usages found:** ~95 (across pages, business components, organisms, molecules, atoms)
- **Inconsistencies detected:** 9
- **Files to modify:** 8
- **Icon systems in play:**
  - Material Icons web font via `<Icon name="..." />` (custom atom wrapping `material-symbols-outlined`) — dominant system, used in ~94 of ~95 usages
  - Iconify via `<UIcon name="i-material-symbols-..." />` — used in exactly 1 place
  - Bare `<span class="material-symbols-outlined">` — used in 4 places (bypassing the Icon atom)
  - `material-icons` (old icon font class) — used in 1 place

---

## Current Icon Inventory

| Concept | Sidebar/Nav | Page Header / Section | Cards / Metrics | Action Buttons | System |
|---------|------------|----------------------|-----------------|----------------|--------|
| Dashboard (home) | `dashboard` | — | — | — | Icon atom |
| Metas de Ahorro | `savings` | `savings` (CardInfo, GoalsForm, ContributionForm, PlannedSavingList) | `savings` (empty state) | — | Icon atom |
| Presupuesto | `account_balance_wallet` | `account_balance_wallet` (BudgetForm CardInfo, settings section, OnboardingWizard) | `account_balance` (empty state budget/profile card) | — | Icon atom |
| Transacciones | `receipt_long` | `swap_vertical_circle` (SectionCard in TransactionList) | `receipt_long` (empty state) | — | Icon atom |
| Ingresos | — | `payments` (IncomeForm CardInfo, BudgetIncome CardInfo, income page metrics) | `payments` (empty state) | — | Icon atom / UIcon (savings preview) |
| Gastos | — | `receipt_long` (ExpensePlannedForm CardInfo) | — | — | Icon atom |
| Configuración | `settings` | `account_balance_wallet` (budget section), `notifications`, `attach_money`, `category` (settings page sections) | — | — | Icon atom |
| Perfil | `person` | `person` (BasicFormData CardInfo, PersonalInfoCard), `account_balance` (FinancialProfileCard) | — | — | Icon atom |
| Cerrar sesión | `logout` | — | — | — | Icon atom |
| Notificaciones | — | `notifications_none` (NotificationCenter trigger), `notifications` (settings section) | — | — | Icon atom |
| Buscar | — | `search` (SearchInput) | — | — | Icon atom |
| Agregar | — | — | — | `add` (all pages), `add_task` (goals) | Icon atom |
| Editar | — | — | — | `edit` (all CRUD tables/lists) | Icon atom |
| Eliminar | — | — | — | `delete` (all CRUD tables/lists) | Icon atom |
| Duplicar | — | — | — | `content_copy` (budget) | Icon atom |
| Ver detalle | — | — | — | `visibility` (budget list/table) | Icon atom |
| Volver | — | `arrow_back` (DashboardHeader, budget detail) | — | `arrow_back` (OnboardingWizard, budget detail) | Icon atom |
| Validación ✓/✗ | — | — | — | `check_circle` / `error` (BudgetStrategyForm total indicator) | bare `<span class="material-symbols-outlined">` |
| Ahorro (preview) | — | — | `i-material-symbols-savings` (IncomeForm step 2) | — | UIcon (Iconify) |
| Radio selected | — | — | `radio_button_checked` / `radio_button_unchecked`, `check` (RadioButton card variant) | — | bare `<span class="material-symbols-outlined">` |
| Trend indicators | — | — | `trending_up` / `trending_down` / `trending_flat` (AccountRateTimeline), inline `material-icons` (BudgetDonutChartEnhanced) | — | Icon atom / bare `material-icons` |
| Cámara / Foto | — | `photo_camera` (ProfileHeader, UserBasicInformation) | — | — | Icon atom |
| Distribución donut | — | `donut_large` (BudgetDistribution, SavingsDistribution) | — | — | Icon atom |
| Estrategia | — | `auto_awesome` / `tune` (budget detail, BudgetStrategyForm button) | — | — | Icon atom |
| Lanzar / Activar | — | — | — | `rocket_launch` (budget activate) | Icon atom |
| Insights / Tips | — | `show_chart` (Tips widget), `lightbulb_2` (goals tip card), `lightbulb` (GoalSidebarPanel) | — | — | Icon atom |
| Categoría | — | `category` (CategoryForm CardInfo, settings section, CategoryList empty) | — | — | Icon atom |
| Intercambio | — | `swap_horiz` (TransactionForm CardInfo) | — | — | Icon atom |
| Calendario | — | `calendar_month` (DatePickerInput) | — | — | Icon atom |
| Seguridad | — | `security` (CardSummary, AccountInfoSection) | — | — | Icon atom |
| Historial | — | `history` (GoalSidebarPanel) | — | — | Icon atom |
| Alerta | — | `warning` (AlertBanner variant warning, dashboard banners) | — | — | Icon atom |
| Info | — | `info` (AlertBanner variant info, GoalsForm, GoalSidebarPanel, SavingDistributionForm, IncomesForm) | — | — | Icon atom |

---

## Inconsistencies Detected

| # | Concept | Issue | Files Affected |
|---|---------|-------|----------------|
| 1 | Saving/Ahorro icon | Two different systems used for the same icon (`savings`): the IncomeForm step 2 uses `<UIcon name="i-material-symbols-savings">` (Iconify) while every other occurrence uses `<Icon name="savings">` (Material Symbols atom). Mixed icon systems for the same concept in the same feature. | `src/components/business/income/forms/IncomeForm.vue:159` |
| 2 | Bare `<span class="material-symbols-outlined">` — BudgetStrategyForm | Raw font-based span used directly instead of the `<Icon>` atom for `check_circle` / `error` icons, bypassing the design system abstraction. | `src/components/organisms/forms/BudgetStrategyForm.vue:223` |
| 3 | Bare `<span class="material-symbols-outlined">` — FinancialProgressCard | Background decorative icon renders via a raw `<span class="material-symbols-outlined !text-[150px]">` instead of the `<Icon>` atom. | `src/components/molecules/financial-progress-card/FinancialProgressCard.vue:292` |
| 4 | Bare `<span class="material-symbols-outlined">` — RadioButton | Card-variant radio buttons render the selection state indicator (`radio_button_checked`, `radio_button_unchecked`, `check`) with bare `<span class="material-symbols-outlined">` instead of `<Icon>`. | `src/components/atoms/radio/RadioButton.vue:96` and `:113` |
| 5 | `material-icons` class (old font) in BudgetDonutChartEnhanced | Trend direction icon uses `:class="['material-icons text-xs', ...]"` — this references the *old* Material Icons font (`material-icons`), not Material Symbols (`material-symbols-outlined`). This is a different web font and will render incorrectly if the old font is not loaded, or render with wrong optical sizing. | `src/components/molecules/budget-donut-chart/BudgetDonutChartEnhanced.vue:263` |
| 6 | `material-icons-sharp` in Button.vue | The icon span in the Button atom carries both `material-icons-sharp` and `material-symbols-outlined` classes simultaneously. `material-icons-sharp` is the old font API. The two APIs are incompatible; having both creates fragility. | `src/components/atoms/button/Button.vue:67` |
| 7 | Notifications icon inconsistency | The NotificationCenter trigger uses `notifications_none` (outline, no dot), but the settings page section header uses `notifications` (filled). Both represent the notifications concept but use different icon variants without semantic reason. | `src/components/molecules/notification/NotificationCenter.vue:58` vs `src/pages/dashboard/settings/index.vue:232` |
| 8 | Insights/lightbulb inconsistency | The goals page tip card uses `lightbulb_2` (via `<IconBadge icon="lightbulb_2">`), while GoalSidebarPanel uses `lightbulb` for the same tips concept. Two different icons for the same semantic concept. | `src/pages/dashboard/goals/index.vue:392` vs `src/components/business/savings/GoalSidebarPanel.vue:135` |
| 9 | GoalSidebarPanel `icon-variant="secondary"` on Historial CardInfo | All other CardInfo instances in this project use `icon-variant="primary"` (per CLAUDE.md standard). The Historial section in GoalSidebarPanel uses `icon-variant="secondary"`, which breaks the "CardInfo icon-variant is always primary" rule. | `src/components/business/savings/GoalSidebarPanel.vue:165` |

---

## Proposed Standard Table

All icons below use the Material Symbols web font via the custom `<Icon>` atom (`<Icon name="..." />`). No `<UIcon>` or bare `<span class="material-symbols-outlined">` should be used for these concepts.

| Concept | Icon name (Material Symbols) | Notes |
|---------|------------------------------|-------|
| Dashboard / Inicio | `dashboard` | Current sidebar — keep |
| Metas de Ahorro | `savings` | Consistent across project — keep |
| Presupuesto | `account_balance_wallet` | Consistent in sidebar and forms — keep |
| Transacciones | `receipt_long` | Keep (sidebar + empty state); `swap_vertical_circle` OK for section header card |
| Ingresos | `payments` | Current dominant usage — keep |
| Gastos / Expenses | `receipt_long` | Current ExpensePlannedForm — keep |
| Configuración | `settings` | Sidebar — keep |
| Perfil | `person` | Sidebar + BasicFormData — keep |
| Perfil Financiero | `account_balance` | Profile page financial card — acceptable semantic distinction from wallet |
| Cerrar sesión | `logout` | Keep |
| Notificaciones | `notifications` | Prefer filled form; use `notifications_none` only for "no unread" state |
| Buscar | `search` | Keep |
| Agregar (genérico) | `add` | Keep |
| Agregar meta | `add_task` | Goals-specific add — keep semantic variant |
| Editar | `edit` | Keep |
| Eliminar | `delete` | Keep |
| Duplicar / Copiar | `content_copy` | Keep |
| Ver detalle | `visibility` | Keep |
| Volver | `arrow_back` | Keep |
| Validación OK | `check_circle` | Should use `<Icon>` atom, not bare span |
| Validación error | `error` | Should use `<Icon>` atom, not bare span |
| Tendencia sube | `trending_up` | Use `<Icon>` atom; replace `material-icons` class |
| Tendencia baja | `trending_down` | Use `<Icon>` atom; replace `material-icons` class |
| Tendencia plana | `trending_flat` | Use `<Icon>` atom; replace `material-icons` class |
| Tips / Consejo | `lightbulb` | Standardize on this; drop `lightbulb_2` |
| Cámara / Foto perfil | `photo_camera` | Keep |
| Distribución donut | `donut_large` | Keep |
| Estrategia balanceada | `auto_awesome` | Keep |
| Estrategia personalizada | `tune` | Keep |
| Activar / Lanzar | `rocket_launch` | Keep |
| Historial | `history` | Keep |
| Categoría | `category` | Keep |
| Intercambio | `swap_horiz` | Keep |
| Calendario | `calendar_month` | Keep |
| Seguridad | `security` | Keep |
| Alerta / Warning | `warning` | Keep |
| Información | `info` | Keep |
| Omitir (skip) | `skip_next` | Keep |
| Confirmar ✓ | `check` | Keep (check mark in badge/circle) |
| Expandir | `expand_more` | Keep |
| Colapsar | `chevron_right` | Keep |
| Radio seleccionado | `radio_button_checked` | Should use `<Icon>` atom, not bare span |
| Radio no seleccionado | `radio_button_unchecked` | Should use `<Icon>` atom, not bare span |

---

## Files to Modify

### 1. `src/components/business/income/forms/IncomeForm.vue` — line 159

**Issue:** UIcon (Iconify) used instead of Icon atom for savings preview.

```
Before: <UIcon name="i-material-symbols-savings" class="income-form__savings-icon" />
After:  <Icon name="savings" class="income-form__savings-icon" />
```

Also add the import: `import { Icon } from '@/components/atoms'` (or confirm it is auto-imported).

---

### 2. `src/components/organisms/forms/BudgetStrategyForm.vue` — line 223

**Issue:** Bare `<span class="material-symbols-outlined">` used for `check_circle` / `error`.

```
Before:
<span class="material-symbols-outlined">
  {{ total === 100 ? 'check_circle' : 'error' }}
</span>

After:
<Icon :name="total === 100 ? 'check_circle' : 'error'" size="md" />
```

Add `import { Icon } from '@/components/atoms'` in the script block.

---

### 3. `src/components/molecules/financial-progress-card/FinancialProgressCard.vue` — line 292

**Issue:** Bare `<span class="material-symbols-outlined !text-[150px]">` for decorative background icon.

```
Before:
<span class="material-symbols-outlined !text-[150px]" :class="styles.bgAccent">
  {{ iconName || iconMark }}
</span>

After:
<Icon :name="iconName || iconMark" size="6xl" :class-name="styles.bgAccent" />
```

Note: `size="6xl"` maps to `text-6xl` in the Icon size map. If 150px is required, extend the sizeMap in Icon.vue or use a custom className. The Icon atom already supports passing arbitrary size strings via `className`. However, do not use `@apply` for this size class — it must remain in the template.

---

### 4. `src/components/atoms/radio/RadioButton.vue` — lines 96, 113

**Issue:** Bare `<span class="material-symbols-outlined">` for radio state icons.

```
Before (line 96):
<span v-else class="material-symbols-outlined pointer-events-none">
  {{ modelValue === option.value ? 'radio_button_checked' : 'radio_button_unchecked' }}
</span>

After:
<Icon
  :name="modelValue === option.value ? 'radio_button_checked' : 'radio_button_unchecked'"
  size="md"
  class="pointer-events-none"
/>

Before (line 113):
<span class="material-symbols-outlined">check</span>

After:
<Icon name="check" size="md" />
```

Add `import { Icon } from '@/components/atoms'` (RadioButton already imports `Badge, IconBadge` from atoms).

---

### 5. `src/components/molecules/budget-donut-chart/BudgetDonutChartEnhanced.vue` — line 263

**Issue:** `material-icons` (old font) class used for trend icons.

```
Before:
:class="['material-icons text-xs', getTrendColor(item.trend.direction, item.type)]"
>
  {{ getTrendIcon(item.trend.direction) }}

After:
Replace the <span> with <Icon> atom:
<Icon
  :name="getTrendIcon(item.trend.direction)"
  size="xs"
  :class-name="getTrendColor(item.trend.direction, item.type)"
/>
```

Verify that `getTrendIcon` returns valid Material Symbols names (`trending_up`, `trending_down`, `trending_flat`) — confirmed in `useBudgetDonutPresenter`. Add `import { Icon } from '@/components/atoms'`.

---

### 6. `src/components/atoms/button/Button.vue` — line 67

**Issue:** `material-icons-sharp` (old font) class alongside `material-symbols-outlined`.

```
Before:
class="btn__icon material-icons-sharp material-symbols-outlined"

After:
class="btn__icon material-symbols-outlined"
```

Remove `material-icons-sharp`. The Button atom's icon rendering already uses Material Symbols correctly via `material-symbols-outlined`; the old font class is redundant and potentially conflicting.

---

### 7. `src/pages/dashboard/goals/index.vue` — line 392

**Issue:** `lightbulb_2` used for tips concept; GoalSidebarPanel uses `lightbulb` for the same concept.

```
Before:
<IconBadge icon="lightbulb_2" variant="primary" size="md" />

After:
<IconBadge icon="lightbulb" variant="primary" size="md" />
```

---

### 8. `src/components/business/savings/GoalSidebarPanel.vue` — line 165

**Issue:** `icon-variant="secondary"` on Historial CardInfo violates the CLAUDE.md rule that `icon-variant` is always `"primary"` in CardInfo.

```
Before:
icon-variant="secondary"

After:
icon-variant="primary"
```
