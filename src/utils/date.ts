/* eslint-disable @typescript-eslint/no-extraneous-class */
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
  static formatDate(date: Date, locale: string = 'es-CO') {
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
}
export default DateUtils
