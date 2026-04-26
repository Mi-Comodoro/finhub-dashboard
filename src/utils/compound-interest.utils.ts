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
    const dayDate = new Date(year, month, day)

    // Only include savings whose completedAt <= dayDate
    const activeSavings = savings.filter(s => {
      const completedDate = new Date(s.completedAt)
      return completedDate <= dayDate
    })

    // Total principal without interest
    const totalPrincipal = activeSavings.reduce((acc, s) => acc + s.amount, 0)

    // Calculate balance with compound interest
    const withInterest = activeSavings.reduce((acc, s) => {
      const completedDate = new Date(s.completedAt)
      const daysElapsed = Math.max(
        0,
        Math.floor((dayDate.getTime() - completedDate.getTime()) / 86_400_000)
      )
      const balanceWithInterest =
        s.amount * Math.pow(1 + annualRate / 100, daysElapsed / 365)
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
