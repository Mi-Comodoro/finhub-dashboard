export interface BudgetAllocation {
  needs: number // Gastos Fijos
  wants: number // Gastos Variables u Ocasionales
  savings: number // Ahorro e Inversiones
}
export type StackedProgressBarProps = {
  title: string
  allocation: BudgetAllocation
  advanced?: boolean
  selected?: boolean
  totalIncome?: number
}
