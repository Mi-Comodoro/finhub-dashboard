import type {
  BudgetDonutItemEnhanced,
  HealthStatus
} from '../types/budget-donut-chart-enhanced.types'
import { CHART_COLORS } from '@/utils/design-tokens'

/**
 * Visual utility helpers for budget donut chart
 */

/**
 * Get segment color based on category type
 * @param type - Category type
 * @returns Hex color code
 */
export const getSegmentColor = (type: 'needs' | 'wants' | 'savings'): string => {
  const colorMap = {
    needs: CHART_COLORS.income,
    wants: CHART_COLORS.wants,
    savings: CHART_COLORS.savings
  }
  return colorMap[type]
}

/**
 * Get health ring color based on health status
 * @param health - Health status
 * @returns Hex color code
 */
export const getHealthRingColor = (health: HealthStatus): string => {
  const colorMap: Record<HealthStatus, string> = {
    healthy: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    critical: '#ef4444', // red-500
    neutral: '#94a3b8' // slate-400
  }
  return colorMap[health]
}

/**
 * Get health ring opacity based on utilization
 * @param utilization - Utilization percentage
 * @returns Opacity value (0-1)
 */
export const getHealthRingOpacity = (utilization: number): number => {
  if (utilization === 0) return 0.2
  if (utilization < 50) return 0.4
  if (utilization < 70) return 0.6
  if (utilization < 90) return 0.8
  return 1
}

/**
 * Format utilization percentage for display
 * @param utilization - Utilization percentage
 * @returns Formatted string
 */
export const formatUtilization = (utilization: number): string => {
  return `${Math.round(utilization)}%`
}

/**
 * Get utilization text color class based on health
 * @param health - Health status
 * @returns Tailwind text color class
 */
export const getUtilizationColorClass = (health: HealthStatus): string => {
  const colorMap: Record<HealthStatus, string> = {
    healthy: 'text-success-600',
    warning: 'text-warning-600',
    critical: 'text-danger-600',
    neutral: 'text-neutral-500'
  }
  return colorMap[health]
}

/**
 * Calculate tooltip content data for enhanced tooltips
 * @param item - Enhanced budget item
 * @param currency - Currency code
 * @returns Tooltip data object
 */
export const getTooltipData = (item: BudgetDonutItemEnhanced, currency: string) => {
  const remaining = item.budgeted - item.spent
  const isOverBudget = remaining < 0

  return {
    name: item.name,
    budgeted: item.budgeted,
    spent: item.spent,
    remaining: Math.abs(remaining),
    isOverBudget,
    utilization: item.utilization || 0,
    health: item.health || 'neutral',
    trend: item.trend,
    currency
  }
}

/**
 * Get gradient colors for chart segments with health indicators
 * @param baseColor - Base segment color
 * @param health - Health status
 * @returns Array of gradient colors
 */
export const getSegmentGradient = (baseColor: string, health?: HealthStatus): string[] => {
  if (!health || health === 'neutral') {
    return [baseColor, baseColor]
  }

  const healthColor = getHealthRingColor(health)
  return [baseColor, healthColor]
}

/**
 * Calculate chart emphasis animation scale based on health
 * @param health - Health status
 * @returns Scale multiplier
 */
export const getEmphasisScale = (health: HealthStatus): number => {
  const scaleMap: Record<HealthStatus, number> = {
    healthy: 1.05,
    warning: 1.08,
    critical: 1.1,
    neutral: 1.05
  }
  return scaleMap[health]
}

/**
 * Get border width for segments based on health urgency
 * @param health - Health status
 * @returns Border width in pixels
 */
export const getSegmentBorderWidth = (health: HealthStatus): number => {
  const widthMap: Record<HealthStatus, number> = {
    healthy: 4,
    warning: 5,
    critical: 6,
    neutral: 4
  }
  return widthMap[health]
}
