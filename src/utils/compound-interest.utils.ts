export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually'

export interface ProjectionPoint {
  month: number
  balance: number
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
