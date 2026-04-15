import type { BudgetDonutItem } from '@/components/molecules/budget-donut-chart/types/budget-donut-chart.types'
import type {
  BudgetDonutItemEnhanced,
  HealthStatus,
  TrendDirection
} from '@/components/molecules/budget-donut-chart/types/budget-donut-chart-enhanced.types'

/**
 * Presentation composable for budget donut chart analytics
 * Handles health status calculation, trend analysis, and utilization metrics
 */
export function useBudgetDonutPresenter() {
  /**
   * Calculate health status based on utilization percentage
   * @param utilization - Percentage of budget spent (0-100+)
   * @returns Health status indicator
   */
  const calculateHealthStatus = (utilization: number): HealthStatus => {
    if (utilization === 0) return 'neutral'
    if (utilization < 70) return 'healthy'
    if (utilization < 90) return 'warning'
    return 'critical'
  }

  /**
   * Calculate trend direction and percentage change
   * @param current - Current period value
   * @param previous - Previous period value
   * @returns Trend information
   */
  const calculateTrend = (
    current: number,
    previous: number | null | undefined
  ): { direction: TrendDirection; percentageChange: number; previousValue: number } | undefined => {
    if (previous === null || previous === undefined || previous === 0) {
      return {
        direction: 'new',
        percentageChange: 0,
        previousValue: 0
      }
    }

    const change = ((current - previous) / previous) * 100
    let direction: TrendDirection = 'stable'

    if (Math.abs(change) < 5) {
      direction = 'stable'
    } else if (change > 0) {
      direction = 'up'
    } else {
      direction = 'down'
    }

    return {
      direction,
      percentageChange: Math.abs(change),
      previousValue: previous
    }
  }

  /**
   * Calculate utilization percentage
   * @param spent - Amount spent
   * @param budgeted - Budgeted amount
   * @returns Utilization percentage (0-100+)
   */
  const calculateUtilization = (spent: number, budgeted: number): number => {
    if (budgeted === 0) return 0
    return (spent / budgeted) * 100
  }

  /**
   * Enhance budget donut items with analytics
   * @param items - Base budget items
   * @param spentData - Map of category ID to spent amount
   * @param previousData - Optional map of category ID to previous period spent amount
   * @returns Enhanced items with trend, health, and utilization
   */
  const enhanceItems = (
    items: BudgetDonutItem[],
    spentData: Record<string, number>,
    previousData?: Record<string, number>
  ): BudgetDonutItemEnhanced[] => {
    return items.map(item => {
      const spent = spentData[item.id] || 0
      const utilization = calculateUtilization(spent, item.budgeted)
      const health = calculateHealthStatus(utilization)
      const previousSpent = previousData?.[item.id]
      const trend = calculateTrend(spent, previousSpent)

      return {
        ...item,
        spent,
        utilization,
        health,
        trend
      }
    })
  }

  /**
   * Get health status color class
   * @param health - Health status
   * @returns Tailwind color class
   */
  const getHealthColor = (health: HealthStatus): string => {
    const colors: Record<HealthStatus, string> = {
      healthy: 'text-success-500',
      warning: 'text-warning-500',
      critical: 'text-danger-500',
      neutral: 'text-neutral-400'
    }
    return colors[health]
  }

  /**
   * Get trend icon name
   * @param direction - Trend direction
   * @returns Material icon name
   */
  const getTrendIcon = (direction: TrendDirection): string => {
    const icons: Record<TrendDirection, string> = {
      up: 'trending_up',
      down: 'trending_down',
      stable: 'trending_flat',
      new: 'fiber_new'
    }
    return icons[direction]
  }

  /**
   * Get trend color class
   * @param direction - Trend direction
   * @param type - Category type (spending categories should show red for up, savings should show green)
   * @returns Tailwind color class
   */
  const getTrendColor = (direction: TrendDirection, type: 'needs' | 'wants' | 'savings'): string => {
    if (direction === 'new') return 'text-primary-500'
    if (direction === 'stable') return 'text-neutral-400'

    // For savings, up is good (green), down is bad (red)
    if (type === 'savings') {
      return direction === 'up' ? 'text-success-500' : 'text-danger-500'
    }

    // For expenses (needs/wants), down is good (green), up is bad (red)
    return direction === 'down' ? 'text-success-500' : 'text-danger-500'
  }

  return {
    calculateHealthStatus,
    calculateTrend,
    calculateUtilization,
    enhanceItems,
    getHealthColor,
    getTrendIcon,
    getTrendColor
  }
}
