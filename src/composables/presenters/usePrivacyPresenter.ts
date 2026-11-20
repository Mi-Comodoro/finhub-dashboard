import { useTimezone } from '@/composables/useTimezone'

// Presenter: text shown to the person about a scheduled account deletion. Pure functions, no state.
export const usePrivacyPresenter = () => {
  const { formatDate } = useTimezone()

  const scheduledDateLabel = (scheduledAt: string | null | undefined): string =>
    scheduledAt ? formatDate(scheduledAt) : ''

  const daysLeftLabel = (daysLeft: number | null | undefined): string => {
    if (daysLeft === null || daysLeft === undefined) return ''
    if (daysLeft <= 0) return 'hoy'
    return daysLeft === 1 ? 'queda 1 día' : `quedan ${daysLeft} días`
  }

  return { scheduledDateLabel, daysLeftLabel }
}
