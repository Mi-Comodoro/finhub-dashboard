export type ExpenseData = {
  name: string
  budgetId: string
  categoryId: string
  expectedAmount: number
  dueDate: Date
  isEssential: boolean
  status: string
  notes?: string
  billsdId?: string | null
}
