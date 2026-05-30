export const useAnalyticsPeriod = () => {
  const selectedYear = ref(new Date().getFullYear())
  const selectedMonth = ref(new Date().getMonth() + 1)

  const availableYears = computed(() => {
    const current = new Date().getFullYear()
    return [current - 1, current]
  })

  const availableMonths = computed(() => [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ])

  const periodLabel = computed(() => {
    const month = availableMonths.value.find(m => m.value === selectedMonth.value)
    return `${month?.label ?? ''} ${selectedYear.value}`
  })

  return { selectedYear, selectedMonth, availableYears, availableMonths, periodLabel }
}
