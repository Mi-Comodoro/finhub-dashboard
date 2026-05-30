import { CHART_COLORS } from '@/utils/design-tokens'

export interface ChartDataItem {
  name: string
  value: number
  itemStyle: { color: string }
}

interface ExpenseInput {
  amount: number
  categoryType?: string
  category?: { id: string; name: string }
}

const BUCKET_LABELS: Record<string, string> = {
  need: 'Necesidades',
  want: 'Gustos',
  saving: 'Ahorro'
}

const BUCKET_COLORS: Record<string, string> = {
  need: CHART_COLORS.needs,
  want: CHART_COLORS.wants,
  saving: CHART_COLORS.savings
}

const CATEGORY_PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#6366f1',
  '#84cc16',
  '#14b8a6'
]

export function useExpensesPresenter() {
  const getBucketLabel = (type: string): string => BUCKET_LABELS[type] ?? type

  const getBucketColor = (type: string): string => BUCKET_COLORS[type] ?? CHART_COLORS.planned

  const groupByBucket = (expenses: ExpenseInput[]): ChartDataItem[] => {
    const grouped: Record<string, number> = {}
    for (const t of expenses) {
      const key = t.categoryType ?? 'unknown'
      grouped[key] = (grouped[key] ?? 0) + Number(t.amount)
    }
    return Object.entries(grouped).map(([type, total]) => ({
      name: getBucketLabel(type),
      value: total,
      itemStyle: { color: getBucketColor(type) }
    }))
  }

  const groupByCategory = (expenses: ExpenseInput[]): ChartDataItem[] => {
    const grouped: Record<string, number> = {}
    for (const t of expenses) {
      const key = t.category?.name ?? 'Sin categoría'
      grouped[key] = (grouped[key] ?? 0) + Number(t.amount)
    }
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, total], index) => ({
        name,
        value: total,
        itemStyle: { color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]! }
      }))
  }

  return { getBucketLabel, getBucketColor, groupByBucket, groupByCategory }
}
