// composables/useTransactionFilters.ts
import type { TransactionType } from '~/types/api'
import type { TransactionFilters } from '~/types/domain'

type FilterType = TransactionType | 'all'

// eslint-disable-next-line no-unused-vars
export function useTransactionFilters(onFilter: (resetPage?: boolean) => void) {
  const filterCat = ref<string>('')
  const filterDateFrom = ref<Date | null>(null)
  const filterDateTo = ref<Date | null>(null)
  const filterType = ref<TransactionType | ''>('')
  const activeTypeBtn = ref<FilterType>('all')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const pageSizeOptions = [
    { label: '5 por página', value: 5 },
    { label: '10 por página', value: 10 },
    { label: '20 por página', value: 20 },
    { label: '50 por página', value: 50 }
  ]

  const typeButtons: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Ingresos', value: 'income' },
    { label: 'Gastos', value: 'expense' },
    { label: 'Ahorros', value: 'savings' }
  ]

  // Objeto de filtros listo para pasar al fetch
  const activeFilters = computed(
    (): Partial<TransactionFilters> => ({
      type: filterType.value || undefined,
      categoryId: filterCat.value || undefined,
      dateFrom: filterDateFrom.value?.toISOString() ?? undefined,
      dateTo: filterDateTo.value?.toISOString() ?? undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
  )

  const hasActiveFilters = computed(
    () => !!(filterType.value || filterCat.value || filterDateFrom.value || filterDateTo.value)
  )

  const setTypeBtn = (type: FilterType) => {
    activeTypeBtn.value = type
    filterType.value = type === 'all' ? '' : type
    onFilter(true)
  }

  const clearFilters = () => {
    filterType.value = ''
    filterCat.value = ''
    filterDateFrom.value = null
    filterDateTo.value = null
    activeTypeBtn.value = 'all'
    onFilter(true)
  }

  const goToPage = (page: number) => {
    currentPage.value = page
    onFilter(false)
  }

  const resetPage = () => {
    currentPage.value = 1
  }

  // Watchers internos
  watch(filterCat, () => onFilter(true))
  watch(filterDateFrom, () => onFilter(true))
  watch(filterDateTo, () => onFilter(true))
  watch(pageSize, () => onFilter(true))

  return {
    // state
    filterCat,
    filterDateFrom,
    filterDateTo,
    filterType,
    activeTypeBtn,
    currentPage,
    pageSize,
    // computed
    activeFilters,
    hasActiveFilters,
    // opciones
    pageSizeOptions,
    typeButtons,
    // acciones
    setTypeBtn,
    clearFilters,
    goToPage,
    resetPage
  }
}
