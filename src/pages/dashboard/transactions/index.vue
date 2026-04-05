<script setup lang="ts">
  import type { Column } from '@/components/organisms'
  import { useTransaction } from '@/composables/useTransaction'
  import { useTransactionFilters } from '@/composables/useTransactionFilters'
  import { useTransactionMetrics } from '@/composables/useTransactionMetrics'
  import { translate } from '@/utils/translateToUI'
  import type { TransactionSummary } from '~/types/domain'
  definePageMeta({
    layout: 'dashboard',
    title: 'Transacciones',
    breadcrumb: 'Transacciones'
  })

  const route = useRoute()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const categoryStore = useCategoryStore()
  const currency = computed(() => financesStore.defaultCurrency)

  const { transactions, pagination, fetchTransaction } = useTransaction()
  const { fetchCategories } = useCategories()

  const budgetSelect = ref<string>('')

  // --- Fetch centralizado ---
  const loadTransactions = async (resetPage = false) => {
    if (!budgetSelect.value) return
    if (resetPage) filters.resetPage()
    await fetchTransaction(budgetSelect.value, filters.activeFilters.value)
  }

  // --- Composables ---
  const filters = useTransactionFilters(loadTransactions)
  const metrics = useTransactionMetrics(
    transactions,
    pagination,
    filters.currentPage,
    filters.pageSize
  )

  // --- Opciones ---
  const budgetOptions = computed(() =>
    budgetStore.budgetPlans.map(item => ({
      label: replaceUnderscoresWithSpaces(item.name),
      value: item.id,
      selectable: true
    }))
  )

  const categoryOptions = computed(() =>
    categoryStore.categories.map(item => ({
      label: item.isSelectable ? item.name : item.name.toUpperCase(),
      value: item.id,
      disabled: !item.isSelectable
    }))
  )

  // --- Tabla ---
  const columns: Column[] = [
    { key: 'transactionDate', label: 'Fecha', type: 'date', bold: true },
    { key: 'source', label: 'Fuente', type: 'badge' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: 'Monto', type: 'currency' },
    { key: 'category', label: 'Categoría' }
  ]

  const result = computed(() =>
    transactions.value?.map((t: TransactionSummary) => ({
      id: t.id,
      transactionDate: t.transactionDate,
      source: t.source,
      amount: t.amount,
      category: t.category?.name,
      type: t.type,
      plannedIncomeId: t.plannedIncomeId
    }))
  )

  const getFormattedAmount = (item: TransactionSummary) => {
    const amount = formatCurrency(item.amount, currency.value)
    if (item.type === 'income') return { text: `+${amount}`, colorClass: 'text-success-700' }
    if (item.type === 'expense') return { text: `-${amount}`, colorClass: 'text-danger-700' }
    return { text: `-${amount}`, colorClass: 'text-warning-700' }
  }

  // --- Init ---
  onMounted(async () => {
    const financeId = financesStore.profile?.id as string
    await budgetStore.fetchBudgets(financeId, 2026)
    await fetchCategories()

    const queryBudgetId = route.query.budgetId as string | undefined
    budgetSelect.value =
      queryBudgetId || budgetStore.budgetSelected?.id || budgetStore.budgetPlans[0]?.id || ''

    await loadTransactions()
  })

  watch(budgetSelect, () => {
    filters.activeTypeBtn.value = 'all'
    filters.filterType.value = ''
    loadTransactions(true)
  })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">Transacciones</Heading>
        <Text size="sm" color="muted">Historial completo de movimientos</Text>
      </div>
      <Select v-model="budgetSelect" name="budgetId" label="Presupuesto" :options="budgetOptions" />
    </div>

    <TransactionMetricsBar
      :total-income="metrics.totalIncome.value"
      :total-expense="metrics.totalExpense.value"
      :total-savings="metrics.totalSavings.value"
      :count-income="metrics.countByType('income')"
      :count-expense="metrics.countByType('expense')"
      :count-savings="metrics.countByType('savings')"
      :currency="currency"
    />

    <TransactionFiltersBar
      v-model:filter-cat="filters.filterCat.value"
      v-model:filter-date-from="filters.filterDateFrom.value"
      v-model:filter-date-to="filters.filterDateTo.value"
      v-model:page-size="filters.pageSize.value"
      :category-options="categoryOptions"
      :type-buttons="filters.typeButtons"
      :active-type-btn="filters.activeTypeBtn.value"
      :page-size-options="filters.pageSizeOptions"
      @set-type="filters.setTypeBtn"
      @clear-filters="filters.clearFilters"
    />

    <DataTable :columns="columns" :data="result ?? []">
      <template #cell-amount="{ row }">
        <Text
          size="sm"
          weight="bold"
          class="whitespace-nowrap"
          :class="getFormattedAmount(row).colorClass"
        >
          {{ getFormattedAmount(row).text }}
          <span class="text-xs uppercase" :class="getFormattedAmount(row).colorClass">
            {{ currency }}
          </span>
        </Text>
      </template>

      <template #cell-source="{ value, row }">
        <div class="flex items-center gap-2">
          <span>{{ capitalizeFirstLetter(translate[value] ?? value) }}</span>
          <Badge v-if="!row.plannedIncomeId && row.type === 'income'" size="xs">
            No planificado
          </Badge>
        </div>
      </template>

      <template #cell-type="{ value }">
        <Badge
          :variant="value === 'income' ? 'success' : value === 'expense' ? 'danger' : 'warning'"
        >
          {{ translate[value] ?? value }}
        </Badge>
      </template>

      <template #cell-category="{ row, value }">
        {{ row.type === 'income' || row.type === 'savings' ? 'N/A' : value }}
      </template>

      <template #empty>
        <div class="flex flex-col items-center gap-2 py-10 text-center">
          <Text size="sm" color="muted">No hay transacciones para estos filtros</Text>
          <Button variant="ghost" size="sm" @click="filters.clearFilters">Limpiar filtros</Button>
        </div>
      </template>

      <template #footer>
        <div
          v-if="metrics.showPagination.value"
          class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5"
        >
          <div class="flex items-center gap-3">
            <Text size="xs" color="muted">{{ metrics.countLabel.value }}</Text>
            <Select
              v-model="filters.pageSize.value"
              name="pageSize"
              :options="filters.pageSizeOptions"
            />
          </div>
          <div class="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              :disabled="filters.currentPage.value === 1"
              @click="filters.goToPage(filters.currentPage.value - 1)"
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              :disabled="filters.currentPage.value >= metrics.totalPages.value"
              @click="filters.goToPage(filters.currentPage.value + 1)"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>
