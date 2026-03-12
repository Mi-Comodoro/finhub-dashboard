export interface BudgetAllocation {
  needs: number // Gastos Fijos
  wants: number // Gastos Variables u Ocasionales
  savings: number // Ahorro e Inversiones
}

export interface BudgetStrategyCardProps {
  title: string
  description: string
  allocation: BudgetAllocation
  icon?: string
  recommended?: boolean
  advanced?: boolean
  selected?: boolean
  selectable?: boolean
}
