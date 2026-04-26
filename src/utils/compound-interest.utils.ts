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

/**
 * Build projection based on completed savings and view type.
 * - Vista 1m: Solo capital real + interés, sin proyecciones futuras
 * - Vistas 3m/12m/24m/36m: Incluye aportes hipotéticos futuros
 */
export function buildProjection(input: ProjectionInput): SavingPoint[] {
  const { savings, annualRate, view, referenceDate = new Date() } = input

  if (annualRate < 0) return []

  // Only use completed savings
  const completed = savings.filter(s => s.status === 'completed' && s.completedAt)

  // Generate time points based on view
  const points = generateTimePoints(view, referenceDate)

  // For 1m view: NO future projections, only real completed savings
  if (view === '1m') {
    return points.map(({ label, date }) => {
      const activeSavings = completed.filter(s => new Date(s.completedAt!) <= date)

      const withoutInterest = activeSavings.reduce((a, s) => a + s.amount, 0)

      const withInterest = activeSavings.reduce((acc, s) => {
        const days = Math.floor((date.getTime() - new Date(s.completedAt!).getTime()) / 86_400_000)
        return acc + s.amount * Math.pow(1 + annualRate / 100, days / 365)
      }, 0)

      return {
        label,
        withInterest,
        withoutInterest
      }
    })
  }

  // For 3m/12m/24m/36m views: Include hypothetical future contributions
  // Use last completed saving to project future ones
  const lastCompleted = completed.length > 0
    ? completed.reduce((latest, s) =>
        new Date(s.completedAt!) > new Date(latest.completedAt!) ? s : latest
      )
    : null

  if (!lastCompleted) {
    // No completed savings yet, return empty projections
    return points.map(({ label }) => ({
      label,
      withInterest: 0,
      withoutInterest: 0
    }))
  }

  const lastDate = new Date(lastCompleted.completedAt!)
  const lastAmount = lastCompleted.amount
  const dayOfMonth = lastDate.getDate()

  // Generate hypothetical future contributions (one per month after last completed)
  const projectedSavings: Array<{ amount: number; date: Date }> = []
  for (let i = 1; i <= 36; i++) {
    // Project up to 36 months
    const projectedDate = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth() + i,
      dayOfMonth
    )
    projectedSavings.push({
      amount: lastAmount,
      date: projectedDate
    })
  }

  return points.map(({ label, date }) => {
    // Active completed savings
    const activeSavings = completed.filter(s => new Date(s.completedAt!) <= date)

    // Active projected savings
    const activeProjected = projectedSavings.filter(s => s.date <= date)

    const withoutInterest =
      activeSavings.reduce((a, s) => a + s.amount, 0) +
      activeProjected.reduce((a, s) => a + s.amount, 0)

    const withInterest =
      activeSavings.reduce((acc, s) => {
        const days = Math.floor((date.getTime() - new Date(s.completedAt!).getTime()) / 86_400_000)
        return acc + s.amount * Math.pow(1 + annualRate / 100, days / 365)
      }, 0) +
      activeProjected.reduce((acc, s) => {
        const days = Math.floor((date.getTime() - s.date.getTime()) / 86_400_000)
        return acc + s.amount * Math.pow(1 + annualRate / 100, Math.max(0, days) / 365)
      }, 0)

    return {
      label,
      withInterest,
      withoutInterest
    }
  })
}

/**
 * Generate time points (labels and dates) based on selected view.
 */
function generateTimePoints(
  view: ProjectionInput['view'],
  ref: Date
): Array<{ label: string; date: Date }> {
  const points: Array<{ label: string; date: Date }> = []
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  if (view === '1m') {
    // 30 daily points - end of day for accurate compound interest calculation
    for (let day = 1; day <= 30; day++) {
      const date = new Date(ref.getFullYear(), ref.getMonth(), day, 23, 59, 59)
      points.push({ label: `Día ${day}`, date })
    }
  } else if (view === '3m') {
    // 13 weekly points (~3 months)
    for (let week = 1; week <= 13; week++) {
      const date = new Date(ref)
      date.setDate(ref.getDate() + (week - 1) * 7)
      points.push({ label: `Sem ${week}`, date })
    }
  } else if (view === '12m') {
    // 12 monthly points
    for (let month = 0; month < 12; month++) {
      const date = new Date(ref.getFullYear(), ref.getMonth() + month, ref.getDate())
      const monthName = monthNames[date.getMonth()]
      points.push({ label: monthName, date })
    }
  } else if (view === '24m') {
    // 24 monthly points
    for (let month = 0; month < 24; month++) {
      const date = new Date(ref.getFullYear(), ref.getMonth() + month, ref.getDate())
      const monthName = monthNames[date.getMonth()]
      const year = date.getFullYear() % 100 // Last 2 digits
      points.push({ label: `${monthName} '${year}`, date })
    }
  } else if (view === '36m') {
    // 36 monthly points
    for (let month = 0; month < 36; month++) {
      const date = new Date(ref.getFullYear(), ref.getMonth() + month, ref.getDate())
      const monthName = monthNames[date.getMonth()]
      const year = date.getFullYear() % 100
      points.push({ label: `${monthName} '${year}`, date })
    }
  }

  return points
}
