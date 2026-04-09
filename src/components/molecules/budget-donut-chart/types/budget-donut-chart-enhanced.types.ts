import type { Currency } from '@/utils/currency'

import type { BudgetDonutItem } from './budget-donut-chart.types'

/**
 * Trend direction for budget category comparison
 */
export type TrendDirection = 'up' | 'down' | 'stable' | 'new'

/**
 * Health status based on spending vs budget
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'neutral'

/**
 * Enhanced budget donut item with trend and health analytics
 */
export interface BudgetDonutItemEnhanced extends BudgetDonutItem {
  /**
   * Current amount spent in this category
   */
  spent: number

  /**
   * Trend compared to previous period
   */
  trend?: {
    direction: TrendDirection
    percentageChange: number
    previousValue: number
  }

  /**
   * Health status indicator based on utilization
   */
  health?: HealthStatus

  /**
   * Utilization percentage (spent / budgeted * 100)
   */
  utilization?: number
}

/**
 * Enhanced props for BudgetDonutChartEnhanced component
 */
export interface BudgetDonutChartEnhancedProps {
  /**
   * Budget items with enhanced analytics
   */
  items?: BudgetDonutItemEnhanced[]

  /**
   * Total budget amount
   */
  total?: number

  /**
   * Currency for formatting
   */
  currency?: Currency

  /**
   * Show legend beside chart
   */
  showLegend?: boolean

  /**
   * Show trend indicators vs previous period
   */
  showTrends?: boolean

  /**
   * Show health status rings
   */
  showHealthIndicators?: boolean

  /**
   * Enable detailed hover tooltips
   */
  enableHoverDetails?: boolean

  /**
   * Enable comparison mode with previous period
   */
  comparisonEnabled?: boolean
}
