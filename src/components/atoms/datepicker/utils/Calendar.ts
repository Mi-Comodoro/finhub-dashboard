import type { CalendarDay, DateRange } from '~/types/ui/date-picker.types'

export class Calendar {
  private currentMonth: Date

  constructor(year: number, month: number) {
    const now = new Date()
    // Normalizamos a las 00:00 para evitar errores de zona horaria
    this.currentMonth = new Date(year ?? now.getFullYear(), month ?? now.getMonth(), 1)
  }

  setMonth(year: number, month: number): Date {
    this.currentMonth = new Date(year, month, 1)
    return this.currentMonth
  }

  getMonthDays(
    dynamicMonth: Date | null,
    tempRange: { start: Date | null; end: Date | null } | null,
    modelValue: Date | DateRange | null
  ): CalendarDay[] {
    // Evitamos mutar la referencia original
    if (dynamicMonth) {
      this.currentMonth = new Date(dynamicMonth.getFullYear(), dynamicMonth.getMonth(), 1)
    }

    const year = this.currentMonth.getFullYear()
    const month = this.currentMonth.getMonth()

    // 1. Límites del mes
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const numDays = lastDayOfMonth.getDate()

    // 2. Cálculo de offset (Lunes como inicio)
    const startDayOfWeek = firstDayOfMonth.getDay()
    const offset = (startDayOfWeek + 6) % 7

    const days: CalendarDay[] = []

    // 3. Relleno mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = 0; i < offset; i++) {
      const day = prevMonthLastDay - offset + i + 1
      days.push(this.createDay(new Date(year, month - 1, day), false, true))
    }

    // 4. Días del mes actual
    for (let d = 1; d <= numDays; d++) {
      const date = new Date(year, month, d)
      days.push(this.createDay(date, true, false, tempRange, modelValue))
    }

    // 5. Relleno mes siguiente (Total 42 celdas para rejilla 6x7 constante)
    const totalCells = 42
    const remaining = totalCells - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push(this.createDay(new Date(year, month + 1, i), false, true))
    }

    return days
  }

  private createDay(
    date: Date,
    inMonth: boolean,
    isDisabled: boolean,
    tempRange?: { start: Date | null; end: Date | null } | null,
    modelValue?: Date | DateRange | null
  ): CalendarDay {
    const dTime = date.getTime()
    const today = new Date().toDateString()

    let isSelected = false
    let isInRange = false
    let isRangeStart = false
    let isRangeEnd = false

    // Lógica de Rango
    if (tempRange?.start && tempRange?.end) {
      const sTime = tempRange.start.getTime()
      const eTime = tempRange.end.getTime()

      isRangeStart = dTime === sTime
      isRangeEnd = dTime === eTime
      isSelected = isRangeStart || isRangeEnd
      isInRange = dTime > sTime && dTime < eTime
    }
    // Lógica de Fecha Única
    else if (modelValue instanceof Date) {
      isSelected = date.toDateString() === modelValue.toDateString()
    }

    return {
      date,
      inMonth,
      isToday: date.toDateString() === today,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd,
      isDisabled
    }
  }

  // Métodos de navegación limpios
  prevMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    )
    return this.currentMonth
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    )
    return this.currentMonth
  }

  static getSelectDate(year: number, month: number, selectedDate: Date | null): CalendarDay {
    // Si no hay fecha, usamos el primero del mes
    const date = selectedDate ? new Date(selectedDate) : new Date(year, month, 1)

    // Normalizamos para comparar solo fechas sin horas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    return {
      date,
      inMonth: true,
      isToday: compareDate.getTime() === today.getTime(),
      isSelected: !!selectedDate, // Si pasamos una fecha, está seleccionada
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
      isDisabled: false
    }
  }
}
