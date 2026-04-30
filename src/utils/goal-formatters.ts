/**
 * Goal formatting utilities
 * Centralized functions for goal-related formatting and calculations
 */

/**
 * Formats a number of months into a human-readable time estimate
 * @param months - Number of months (can be null for no projection)
 * @returns Formatted string like "8 años 3 meses" or "No proyectado"
 */
export function formatMonthsToGoal(months: number | null): string {
  if (months === null) return 'No proyectado'
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`

  return `${years} ${years === 1 ? 'año' : 'años'} ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`
}

/**
 * Calculates the progress percentage towards a goal
 * @param saved - Amount already saved
 * @param target - Target amount to reach
 * @returns Percentage (0-100), capped at 100
 */
export function getProgressPercentage(saved: number, target: number | null): number {
  if (!target || target === 0) return 0
  return Math.min(100, Math.round((saved / target) * 100))
}
