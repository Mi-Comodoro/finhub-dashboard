export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually'

export interface ProjectionPoint {
  month: number
  balance: number
}

export interface DailyProjectionPoint {
  day: number
  balance: number
}

export interface WeeklyProjectionPoint {
  week: number
  balance: number
}

export interface MonthlyProjectionPoint {
  day: number
  withInterest: number
  withoutInterest: number
}

export interface SavingPoint {
  label: string // "Día 1", "May", etc.
  withInterest: number
  withoutInterest: number
}

export interface ProjectionInput {
  savings: Array<{
    amount: number
    status: 'pending' | 'completed' | 'skipped'
    completedAt?: string | null
    date: Date | string
  }>
  annualRate: number
  view: '1m' | '3m' | '12m' | '24m' | '36m'
  referenceDate?: Date
}

export function projectCompoundGrowth(params: {
  principal: number
  monthlyContribution: number
  annualRate: number // EA (Efectiva Anual) en porcentaje. Ej: 9.75
  compoundingFrequency: CompoundingFrequency
  months: number
}): ProjectionPoint[] {
  const { principal, monthlyContribution, annualRate, compoundingFrequency, months } = params

  if (annualRate < 0 || months <= 0) return []

  const ea = annualRate / 100 // EA decimal. Ej: 0.0975

  // Períodos de capitalización por año según frecuencia
  const periodsPerYear: Record<CompoundingFrequency, number> = {
    daily: 365,
    monthly: 12,
    quarterly: 4,
    annually: 1
  }

  const n = periodsPerYear[compoundingFrequency]

  // Tasa por período usando EA:
  // i_periodo = (1 + EA)^(1/n) - 1
  // Esto es matematicamente correcto para tasas efectivas
  const ratePerPeriod = Math.pow(1 + ea, 1 / n) - 1

  // Cuántos meses hay entre cada capitalización
  const monthsPerPeriod = 12 / n // ej: daily → 12/365 ≈ 0.0329

  let balance = principal
  const result: ProjectionPoint[] = []

  // Acumulador de meses para capitalización diaria
  let accumulatedMonths = 0

  for (let m = 1; m <= months; m++) {
    // Agregar contribución mensual al inicio de cada mes
    balance += monthlyContribution

    accumulatedMonths += 1

    // Aplicar interés cuando se completa un período de capitalización
    // Para daily: capitalizar ~30.4 veces por mes (365/12)
    if (compoundingFrequency === 'daily') {
      // Aplicar interés diario para cada día del mes (~30.44 días/mes)
      const daysInMonth = 365 / 12
      for (let d = 0; d < daysInMonth; d++) {
        balance *= 1 + ratePerPeriod
      }
    } else {
      // Para monthly, quarterly, annually:
      // Capitalizar cuando acumulatedMonths alcanza monthsPerPeriod
      if (accumulatedMonths >= monthsPerPeriod) {
        balance *= 1 + ratePerPeriod
        accumulatedMonths = 0
      }
    }

    result.push({ month: m, balance: Math.round(balance) })
  }

  return result
}

/**
 * Project compound growth by days (for 1 month horizon).
 * Uses daily compounding for granular visualization.
 */
export function projectByDays(params: {
  principal: number
  dailyContribution: number
  annualRate: number // EA (Efectiva Anual) en porcentaje
  days: number
}): DailyProjectionPoint[] {
  const { principal, dailyContribution, annualRate, days } = params

  if (annualRate < 0 || days <= 0) return []

  const ea = annualRate / 100
  const dailyRate = Math.pow(1 + ea, 1 / 365) - 1

  let balance = principal
  const result: DailyProjectionPoint[] = []

  for (let d = 1; d <= days; d++) {
    balance += dailyContribution
    balance *= 1 + dailyRate
    result.push({ day: d, balance: Math.round(balance) })
  }

  return result
}

/**
 * Project compound growth by weeks (for 3 month horizon).
 * Uses weekly compounding for medium granularity.
 */
export function projectByWeeks(params: {
  principal: number
  weeklyContribution: number
  annualRate: number // EA (Efectiva Anual) en porcentaje
  weeks: number
}): WeeklyProjectionPoint[] {
  const { principal, weeklyContribution, annualRate, weeks } = params

  if (annualRate < 0 || weeks <= 0) return []

  const ea = annualRate / 100
  const weeklyRate = Math.pow(1 + ea, 1 / 52) - 1

  let balance = principal
  const result: WeeklyProjectionPoint[] = []

  for (let w = 1; w <= weeks; w++) {
    balance += weeklyContribution
    balance *= 1 + weeklyRate
    result.push({ week: w, balance: Math.round(balance) })
  }

  return result
}

const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
/**
 * Build monthly projection (30 days) based on actual completed savings.
 * This accounts for when each saving was actually deposited (completedAt),
 * showing $0 before deposits and accurate interest calculation after.
 */
export function buildMonthlyProjection(params: {
  savings: Array<{ amount: number; completedAt: string }>
  annualRate: number // EA (Efectiva Anual) en porcentaje
  referenceDate?: Date
}): MonthlyProjectionPoint[] {
  const { savings, annualRate, referenceDate = new Date() } = params

  if (annualRate < 0) return []

  const daysInMonth = 30
  const points: MonthlyProjectionPoint[] = []
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day, 0, 0, 0, 0)

    // Only include savings whose completedAt <= dayDate
    const activeSavings = savings.filter(s => {
      const completedDate = toDateOnly(new Date(s.completedAt))
      return completedDate <= dayDate
    })

    // Total principal without interest
    const totalPrincipal = activeSavings.reduce((acc, s) => acc + s.amount, 0)

    // Calculate balance with compound interest
    const withInterest = activeSavings.reduce((acc, s) => {
      const completedDate = toDateOnly(new Date(s.completedAt))
      const daysElapsed = Math.max(
        0,
        Math.floor((dayDate.getTime() - completedDate.getTime()) / 86_400_000)
      )
      const balanceWithInterest = s.amount * Math.pow(1 + annualRate / 100, daysElapsed / 365)
      return acc + balanceWithInterest
    }, 0)

    points.push({
      day,
      withInterest: Math.round(withInterest),
      withoutInterest: Math.round(totalPrincipal)
    })
  }

  return points
}

export function calculateAccumulatedBalance(params: {
  contributions: Array<{
    amount: number
    date: Date
  }>
  annualRate: number
  targetDate: Date
}) {
  const { contributions, annualRate, targetDate } = params

  const dailyRate = annualRate === 0 ? 0 : Math.pow(1 + annualRate / 100, 1 / 365) - 1

  let principal = 0
  let interest = 0

  for (const contribution of contributions) {
    // ignorar aportes futuros
    if (contribution.date > targetDate) continue

    const diffMs = targetDate.getTime() - contribution.date.getTime()

    const daysElapsed = Math.max(0, Math.floor(diffMs / 86400000))

    // interés compuesto diario
    const futureValue = contribution.amount * Math.pow(1 + dailyRate, daysElapsed)

    principal += contribution.amount
    interest += futureValue - contribution.amount
  }

  return {
    principal,
    interest,
    total: principal + interest
  }
}

export function buildProjection(input: ProjectionInput): SavingPoint[] {
  const { savings, annualRate, view, referenceDate = new Date() } = input

  if (annualRate < 0) return []

  // =========================
  // HELPERS
  // =========================
  const addDays = (date: Date, days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
  }

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ]

  const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)

  // =========================
  // NORMALIZAR APORTES REALES
  // =========================
  const contributions: Array<{ amount: number; date: Date }> = []

  for (const s of savings) {
    if (s.status !== 'completed') continue
    const rawDate = s.date ?? s.completedAt
    if (!rawDate) continue
    // Parse only the date portion as local noon to avoid UTC→local day shift.
    // "2026-04-24T00:00:00.000Z" in UTC-5 would become April 23 — this prevents that.
    const datePart = String(rawDate).substring(0, 10)
    const parsed = new Date(`${datePart}T12:00:00`)
    if (isNaN(parsed.getTime())) continue
    const amount = Number(s.amount)
    if (!amount || amount <= 0) continue
    contributions.push({
      amount,
      date: toDateOnly(parsed)
    })
  }

  contributions.sort((a, b) => a.date.getTime() - b.date.getTime())

  if (contributions.length === 0) return []

  // =========================
  // CONFIGURAR RANGO
  // =========================
  const startOfCurrentMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)

  let totalDays = 30
  switch (view) {
    case '1m':
      totalDays = 30
      break
    case '3m':
      totalDays = 90
      break
    case '12m':
      totalDays = 365
      break
    case '24m':
      totalDays = 365 * 2
      break
    case '36m':
      totalDays = 365 * 3
      break
  }

  const endDate = addDays(startOfCurrentMonth, totalDays - 1)

  // =========================
  // CALCULAR ACUMULADO HASTA EL MES ANTERIOR
  // =========================
  const lastDayPreviousMonth = new Date(startOfCurrentMonth)
  lastDayPreviousMonth.setDate(0)

  const previousContributions = contributions.filter(c => c.date <= lastDayPreviousMonth)

  // targetDate = startOfCurrentMonth so daysElapsed includes the full last day of the prior month,
  // matching the convention that a deposit earns interest on its own day.
  const accumulated = calculateAccumulatedBalance({
    contributions: previousContributions,
    annualRate,
    targetDate: startOfCurrentMonth
  })

  // =========================
  // MAPA DE APORTES REALES (solo históricos)
  // =========================
  const realContributionsByDay = new Map<string, number>()
  for (const contribution of contributions) {
    const key = `${contribution.date.getFullYear()}-${contribution.date.getMonth()}-${contribution.date.getDate()}`
    const current = realContributionsByDay.get(key) ?? 0
    realContributionsByDay.set(key, current + contribution.amount)
  }

  // =========================
  // NUEVO: GENERAR APORTES FUTUROS (SIMULADOS)
  // =========================
  const projectedContributions: Array<{ amount: number; date: Date }> = []

  const lastRealContribution = contributions[contributions.length - 1]
  if (lastRealContribution) {
    const recurringAmount = lastRealContribution.amount
    const recurringDay = lastRealContribution.date.getDate()

    let nextDate = new Date(lastRealContribution.date)
    nextDate.setMonth(nextDate.getMonth() + 1)
    nextDate = toDateOnly(nextDate)

    const normalizedEndDate = toDateOnly(endDate)

    while (nextDate.getTime() <= normalizedEndDate.getTime()) {
      let targetDay = recurringDay
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
      if (targetDay > lastDayOfMonth) targetDay = lastDayOfMonth

      const projectedDate = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth(),
        targetDay,
        0,
        0,
        0,
        0
      )
      projectedContributions.push({
        amount: recurringAmount,
        date: toDateOnly(projectedDate)
      })

      nextDate.setMonth(nextDate.getMonth() + 1)
      nextDate = toDateOnly(nextDate)
    }
  }

  // =========================
  // NUEVO: MAPA DE APORTES REALES + SIMULADOS
  // =========================
  const allContributionsByDay = new Map<string, number>()
  const allContributions = [...contributions, ...projectedContributions]
  for (const contribution of allContributions) {
    const key = `${contribution.date.getFullYear()}-${contribution.date.getMonth()}-${contribution.date.getDate()}`
    const current = allContributionsByDay.get(key) ?? 0
    allContributionsByDay.set(key, current + contribution.amount)
  }

  // =========================
  // TASA DIARIA
  // =========================
  const dailyRate = annualRate === 0 ? 0 : Math.pow(1 + annualRate / 100, 1 / 365) - 1

  // =========================
  // INICIALIZAR BALANCES
  // =========================
  let balanceWithInterest = accumulated.total // principal + interés de reales anteriores
  let balanceWithoutInterest = accumulated.principal // solo principal de reales anteriores

  // =========================
  // RECORRIDO DIARIO
  // =========================
  const dailySeries: Array<{
    date: Date
    withInterest: number
    withoutInterest: number
  }> = []

  let currentDate = new Date(
    startOfCurrentMonth.getFullYear(),
    startOfCurrentMonth.getMonth(),
    1,
    0,
    0,
    0,
    0
  )

  while (currentDate <= endDate) {
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`

    // NUEVO: total de aportes del día (reales + simulados)
    const totalAmt = allContributionsByDay.get(key) ?? 0

    if (totalAmt > 0) {
      // Ambos balances reciben el mismo aporte (sin interés y con interés)
      balanceWithoutInterest += totalAmt
      balanceWithInterest += totalAmt
    }

    dailySeries.push({
      date: new Date(currentDate),
      withInterest: balanceWithInterest,
      withoutInterest: balanceWithoutInterest
    })

    // Solo el balance con interés crece diariamente por el interés compuesto
    balanceWithInterest *= 1 + dailyRate

    currentDate = addDays(currentDate, 1)
  }

  // =========================
  // FORMATEAR SEGÚN VISTA (sin cambios)
  // =========================
  if (view === '1m') {
    return dailySeries.slice(0, 30).map(point => ({
      label: `${point.date.getDate()} ${monthNames[point.date.getMonth()]}`,
      withInterest: Math.round(point.withInterest),
      withoutInterest: Math.round(point.withoutInterest)
    }))
  }

  if (view === '3m') {
    const weeklyMap = new Map()
    for (const point of dailySeries) {
      const date = point.date
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const key = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth()}-${startOfWeek.getDate()}`
      weeklyMap.set(key, point)
    }
    return Array.from(weeklyMap.values()).map((point, index) => ({
      label: `Sem ${index + 1}`,
      withInterest: Math.round(point.withInterest),
      withoutInterest: Math.round(point.withoutInterest)
    }))
  }

  // Para 12m, 24m, 36m: agrupar por mes (último día del mes)
  const groupedByMonth = new Map<
    string,
    { label: string; withInterest: number; withoutInterest: number; timestamp: number }
  >()

  for (const point of dailySeries) {
    const year = point.date.getFullYear()
    const month = point.date.getMonth()
    const key = `${year}-${month}`
    const label =
      view === '12m' ? monthNames[month] : `${monthNames[month]} '${String(year).slice(-2)}`
    const existing = groupedByMonth.get(key)
    if (!existing || point.date.getTime() > existing.timestamp) {
      groupedByMonth.set(key, {
        label: label as string,
        withInterest: point.withInterest,
        withoutInterest: point.withoutInterest,
        timestamp: point.date.getTime()
      })
    }
  }

  return Array.from(groupedByMonth.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => ({
      label: item.label,
      withInterest: Math.round(item.withInterest),
      withoutInterest: Math.round(item.withoutInterest)
    }))
}
