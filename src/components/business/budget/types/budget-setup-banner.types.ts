export interface BudgetSetupStep {
  key: string
  label: string
  detail: string
  done: boolean
}

export interface BudgetSetupBannerProps {
  steps: BudgetSetupStep[]
  canActivate: boolean
  isActivating?: boolean
  title?: string
  description?: string
}
