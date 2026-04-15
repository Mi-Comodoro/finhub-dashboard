/**
 * Insights Types
 * Types for financial insights and recommendations
 */

export type InsightType = 'success' | 'warning' | 'action' | 'info'

export interface FinancialInsight {
  id: string
  type: InsightType
  icon?: string
  message: string
  subMessage?: string
  cta?: {
    label: string
    route: string
  }
}
