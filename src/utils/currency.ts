/**
 * Currency utilities
 *
 * Currencies supported by the app: COP (primary), USD, EUR (future).
 * Extend the union and CURRENCY_CONFIG map when a new currency is added.
 */

export type Currency = 'COP' | 'USD' | 'EUR'

interface CurrencyConfig {
  locale: string
  label: string
  symbol: string
  /** Natural decimal places for this currency (COP has no cents in practice). */
  decimals: 0 | 2
}

const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  COP: { locale: 'es-CO', label: 'Peso colombiano', symbol: '$', decimals: 2 },
  USD: { locale: 'en-US', label: 'Dólar estadounidense', symbol: '$', decimals: 2 },
  EUR: { locale: 'de-DE', label: 'Euro', symbol: '€', decimals: 2 }
}

// ─── Arithmetic helpers ───────────────────────────────────────────────────────

/**
 * Round to N decimal places using "round half away from zero".
 * Prevents the classic JS drift: round(1.005, 2) → 1.01, not 1.00.
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** Returns the natural decimal precision for a currency. */
export function getCurrencyDecimals(currency: Currency): number {
  return CURRENCY_CONFIG[currency].decimals
}

/**
 * Calculate `percent`% of `total`, rounded to the currency's natural precision.
 *   percentOf(5_000_000, 30, 'COP') → 1_500_000
 *   percentOf(1_200.50, 33.33, 'USD') → 400.09
 */
export function percentOf(total: number, percent: number, currency: Currency): number {
  return round((total * percent) / 100, CURRENCY_CONFIG[currency].decimals)
}

/**
 * Add two monetary amounts, rounded to currency precision.
 * Avoids accumulating floating-point error across multiple additions.
 */
export function addAmounts(a: number, b: number, currency: Currency): number {
  return round(a + b, CURRENCY_CONFIG[currency].decimals)
}

/** Subtract b from a, rounded to currency precision. */
export function subtractAmounts(a: number, b: number, currency: Currency): number {
  return round(a - b, CURRENCY_CONFIG[currency].decimals)
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * Format a numeric amount as a currency string.
 * Uses the correct locale and decimal places for each currency:
 *   COP → $ 1.250.000
 *   USD → $1,250.00
 *   EUR → 1.250,00 €
 *
 * @param decimals - optional override for displayed decimal places
 */
export function formatCurrency(amount: number, currency?: Currency, decimals?: number): string {
  const resolved: Currency = currency && CURRENCY_CONFIG[currency] ? currency : 'COP'
  const { locale } = CURRENCY_CONFIG[resolved]
  const d = decimals ?? CURRENCY_CONFIG[resolved].decimals
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: resolved,
    minimumFractionDigits: d,
    maximumFractionDigits: d
  }).format(amount)
}

/**
 * Format a plain number using the locale of the given currency
 * (no currency symbol, just correct thousand/decimal separators).
 *
 * @param decimals - optional override for displayed decimal places
 */
export function formatNumber(
  amount: number,
  currency: Currency = 'COP',
  decimals?: number
): string {
  const { locale } = CURRENCY_CONFIG[currency]
  const d = decimals ?? CURRENCY_CONFIG[currency].decimals
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  }).format(amount)
}

/**
 * Format an amount in compact notation for tight spaces (chart axes, badges).
 *   COP 5_000_000 → "$5.00M COP"
 *   COP   750_000 → "$750.00K COP"
 *   USD     1_500 → "$1.50K USD"
 */
export function formatCompactCurrency(amount: number, currency: Currency): string {
  const { symbol } = CURRENCY_CONFIG[currency]
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}${symbol}${round(abs / 1_000_000, 2).toFixed(2)}M `
  if (abs >= 1_000) return `${sign}${symbol}${round(abs / 1_000, 2).toFixed(2)}K `
  return `${sign}${formatCurrency(amount, currency)}`
}

/** Human-readable label for a currency code, e.g. "Peso colombiano". */
export function getCurrencyLabel(currency: Currency): string {
  return CURRENCY_CONFIG[currency].label
}

export function getPercentage(total: number, current: number) {
  return Math.round((current / total) * 100)
}
