/* eslint-disable @typescript-eslint/no-extraneous-class */
type FormatType = 'numeric' | 'short' | 'long' | 'full'
class DateUtils {
  static getProgress(startDate: Date, endDate: Date) {
    const now = new Date()
    const MS_PER_DAY = 1000 * 60 * 60 * 24

    const totalTime = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()

    // Asegurar que el tiempo restante no sea negativo si la fecha ya pasó
    const remainingTime = Math.max(0, endDate.getTime() - now.getTime())

    // 1. Días restantes (Usar Math.floor o Math.ceil dependiendo de si quieres ser optimista)
    // Con Math.max evitamos días negativos
    const remainingDays = Math.max(0, Math.ceil(remainingTime / MS_PER_DAY))

    // 2. Porcentaje de progreso
    // Si totalTime es 0 (fechas iguales), evitamos división por cero
    let percentage = totalTime > 0 ? (elapsed / totalTime) * 100 : 100
    percentage = Number(Math.min(Math.max(percentage, 0), 100).toFixed(2))

    return {
      percentage,
      remainingDays
    }
  }
  static formatDate(date: Date | string | number | null, type: FormatType = 'numeric') {
    if (!date) return '---'
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) {
      console.warn('Fecha inválida detectada:', date)
      return 'Fecha inválida'
    }
    const formats: Record<FormatType, Intl.DateTimeFormatOptions> = {
      numeric: { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }, // 24/05/2024
      short: { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }, // 24 may 2024
      long: { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }, // 24 de mayo de 2024
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } // viernes, 24 de mayo...
    }

    return new Intl.DateTimeFormat('es-CO', formats[type]).format(dateObj)
  }

  static getRelativeTime(date: Date | string | number | null | undefined): string {
    if (!date) return '---'

    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Fecha inválida'

    const now = new Date()
    const diffInMs = dateObj.getTime() - now.getTime()
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

    // Configurador de formato relativo en español
    const rtf = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })

    // 1. Manejo de Hoy y Ayer (automático por 'numeric: auto')
    if (Math.abs(diffInDays) < 7) {
      return rtf.format(diffInDays, 'day') // Retorna "hoy", "ayer", "hace 2 días", etc.
    }

    // 2. Manejo de Semanas
    const diffInWeeks = Math.round(diffInDays / 7)
    if (Math.abs(diffInWeeks) < 4) {
      return rtf.format(diffInWeeks, 'week') // Retorna "hace 1 semana", "hace 2 semanas", etc.
    }

    // 3. Manejo de Meses
    const diffInMonths = Math.round(diffInDays / 30)
    return rtf.format(diffInMonths, 'month') // Retorna "el mes pasado" o "hace X meses"
  }

  static formatSmartDate(date: Date | string | number | null | undefined): string {
    if (!date) return '---'
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Fecha inválida'

    const now = new Date()
    // Eliminamos la hora para comparar solo fechas (días)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())

    const diffInMs = targetDate.getTime() - today.getTime()
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

    // 1. Formateador para la hora (08:45 AM)
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj)

    // 2. Si es Hoy o Ayer, usamos el texto relativo + la hora
    if (diffInDays === 0 || diffInDays === -1) {
      const rtf = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })
      const relativePart = rtf.format(diffInDays, 'day') // "hoy" o "ayer"
      // Capitalizamos la primera letra (Hoy / Ayer)
      const capitalized = relativePart.charAt(0).toUpperCase() + relativePart.slice(1)
      return `${capitalized}, ${timeStr}`
    }

    // 3. Si es más antiguo (semanas/meses), usamos el formato relativo normal
    return this.getRelativeTime(date)
  }
}
export default DateUtils
