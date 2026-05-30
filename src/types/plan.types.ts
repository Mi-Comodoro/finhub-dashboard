import type { AccountType } from '~/types/domain'

export type { AccountType }

export interface PlanCapabilities {
  maxBudgets: number
  sharedBudgets: number
  historicMonths: number
  exportEnabled: boolean
  customCategories: boolean
}

export const PLAN_CAPABILITIES: Record<AccountType, PlanCapabilities> = {
  TRIAL: {
    maxBudgets: -1,
    sharedBudgets: 6,
    historicMonths: -1,
    exportEnabled: true,
    customCategories: true
  },
  FREE: {
    maxBudgets: 1,
    sharedBudgets: 0,
    historicMonths: 6,
    exportEnabled: false,
    customCategories: false
  },
  PLUS: {
    maxBudgets: 3,
    sharedBudgets: 2,
    historicMonths: 18,
    exportEnabled: true,
    customCategories: true
  },
  PRO: {
    maxBudgets: -1,
    sharedBudgets: 6,
    historicMonths: -1,
    exportEnabled: true,
    customCategories: true
  },
  PARTNER: {
    maxBudgets: -1,
    sharedBudgets: 6,
    historicMonths: -1,
    exportEnabled: true,
    customCategories: true
  }
}
