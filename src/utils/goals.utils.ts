import { differenceInMonths } from 'date-fns'

export type GoalTerm = 'short' | 'medium' | 'long' | 'none'
export type GoalStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'

export function getGoalTerm(targetDate?: Date | null): GoalTerm {
  if (!targetDate) return 'none'
  const months = differenceInMonths(new Date(targetDate), new Date())
  if (months <= 12) return 'short'
  if (months <= 36) return 'medium'
  return 'long'
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  PAUSED: 'Pausada'
}

export const GOAL_TERM_LABELS: Record<GoalTerm, string> = {
  short: 'Corto plazo',
  medium: 'Mediano plazo',
  long: 'Largo plazo',
  none: 'Sin plazo'
}

export function getStatusVariant(status: GoalStatus | null | undefined): BadgeVariant {
  const statusMap: Record<GoalStatus, BadgeVariant> = {
    SCHEDULED: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    PAUSED: 'secondary'
  }
  return statusMap[status ?? 'SCHEDULED']
}

export function getGoalProgress(currentBalance: number, targetAmount: number | null): number {
  if (!targetAmount || targetAmount === 0) return 0
  return Math.min(100, Math.round((currentBalance / targetAmount) * 100))
}
