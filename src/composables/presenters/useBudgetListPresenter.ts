import type { BadgeVariant } from '@/components/atoms/badge/types/badge.types'

export function useBudgetListPresenter() {
  const getStatusVariant = (status: string): BadgeVariant => {
    const map: Record<string, BadgeVariant> = {
      ACTIVE: 'success',
      PLANNED: 'warning',
      CLOSED: 'secondary'
    }
    return map[status] ?? 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'Activo',
      PLANNED: 'Planificado',
      CLOSED: 'Cerrado'
    }
    return map[status] ?? status
  }

  const getCardBorderClass = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'border-2 border-primary-300',
      PLANNED: 'border border-neutral-200',
      CLOSED: 'border border-neutral-200 opacity-75'
    }
    return map[status] ?? 'border border-neutral-200'
  }

  const getMonthName = (month: string | number): string => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    return months[Number(month) - 1] ?? String(month)
  }

  const getYearOptions = () => {
    const current = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => ({
      label: String(current - 2 + i),
      value: current - 2 + i
    }))
  }

  const getStrategyLabel = (strategy: string) =>
    strategy === 'BALANCED' ? '50/30/20' : 'Personalizada'

  return {
    getStatusVariant,
    getStatusLabel,
    getCardBorderClass,
    getMonthName,
    getYearOptions,
    getStrategyLabel
  }
}
