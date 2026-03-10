/**
 * Shared budget period helpers used across the budget list and detail pages.
 * Centralised here to avoid duplication and keep status logic consistent.
 */

// ─── Month name maps ─────────────────────────────────────────────────────────

export const MONTH_NAMES_SHORT: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic'
}

export const MONTH_NAMES_FULL: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre'
}

export const monthShort = (m: string): string => MONTH_NAMES_SHORT[m] ?? m
export const monthFull = (m: string): string => MONTH_NAMES_FULL[m] ?? m

// ─── Status ──────────────────────────────────────────────────────────────────

export type BudgetStatus = 'upcoming' | 'active' | 'closed'

/**
 * Determines the status of a budget period.
 * `month` is a zero-padded string '01'–'12'.
 * currentYear / currentMonth are derived fresh each call so the result
 * stays accurate even if the tab has been open a long time.
 */
export function getBudgetStatus(year: number, month: string): BudgetStatus {
  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth() + 1
  const m = new Date(`${year}-${month}-01`).getMonth() + 1

  if (year > cy || (year === cy && m > cm)) return 'upcoming'
  if (year === cy && m === cm) return 'active'
  return 'closed'
}

export const STATUS_LABEL: Record<BudgetStatus, string> = {
  upcoming: 'Próximo',
  active: 'Activo',
  closed: 'Cerrado'
}

export const STATUS_CLASS: Record<BudgetStatus, string> = {
  upcoming: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  active: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  closed: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
}
