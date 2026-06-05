import { useUserStore } from '~/stores/user.store'

export const useTimezone = () => {
  const userStore = useUserStore()
  const tz = computed(() => userStore.timezone ?? 'America/Bogota')

  const format = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
  ) => new Intl.DateTimeFormat('es-CO', { ...options, timeZone: tz.value }).format(new Date(date))

  const formatDate = (d: Date | string | number) => format(d, { dateStyle: 'medium' })

  const formatDateTime = (d: Date | string | number) =>
    format(d, { dateStyle: 'medium', timeStyle: 'short' })

  const formatTime = (d: Date | string | number) => format(d, { timeStyle: 'short' })

  const formatRelative = (date: Date | string | number) => {
    const diff = Date.now() - new Date(date).getTime()
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
    if (diff < 60_000) return rtf.format(-Math.floor(diff / 1_000), 'second')
    if (diff < 3_600_000) return rtf.format(-Math.floor(diff / 60_000), 'minute')
    if (diff < 86_400_000) return rtf.format(-Math.floor(diff / 3_600_000), 'hour')
    return rtf.format(-Math.floor(diff / 86_400_000), 'day')
  }

  const currentMonth = computed(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.value,
      month: 'numeric',
      year: 'numeric'
    }).formatToParts(new Date())
    return {
      month: parseInt(parts.find(p => p.type === 'month')!.value),
      year: parseInt(parts.find(p => p.type === 'year')!.value)
    }
  })

  return { tz, formatDate, formatDateTime, formatTime, formatRelative, currentMonth }
}
