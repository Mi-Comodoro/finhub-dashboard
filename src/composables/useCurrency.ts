/**
 * useCurrency composable
 *
 * Provides currency formatting utilities for Colombian Peso (COP).
 * Uses Intl.NumberFormat with es-CO locale for consistent formatting.
 */

interface UseCurrencyReturn {
  /**
   * Format a numeric value as currency without suffix.
   * @param _value - The numeric amount to format
   * @returns Formatted string like "$10.000.000,00"
   */
  format: (_value: number) => string

  /**
   * Format a numeric value as currency with separate suffix.
   * The suffix is intended to be rendered as superscript in templates.
   * @param _value - The numeric amount to format
   * @returns Object with amount and suffix properties
   */
  formatWithSuffix: (_value: number) => { amount: string; suffix: string }
}

export function useCurrency(): UseCurrencyReturn {
  const locale = 'es-CO'
  const currency = 'COP'
  const decimals = 2

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  const format = (value: number): string => {
    return formatter.format(value)
  }

  const formatWithSuffix = (value: number): { amount: string; suffix: string } => {
    const formatted = formatter.format(value)
    return {
      amount: formatted,
      suffix: currency
    }
  }

  return {
    format,
    formatWithSuffix
  }
}
