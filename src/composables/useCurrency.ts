/**
 * useCurrency composable
 *
 * Thin wrapper over utils/currency.ts for components that always format in COP.
 * Output always carries the currency code, e.g. "$ 10.000.000,00 COP".
 */
import { formatCurrency } from '@/utils/currency'

interface UseCurrencyReturn {
  /**
   * Format a numeric value as COP currency (2 decimals, with currency code).
   * @param _value - The numeric amount to format
   */
  format: (_value: number) => string
}

export function useCurrency(): UseCurrencyReturn {
  const format = (value: number): string => formatCurrency(value, 'COP')

  return { format }
}
