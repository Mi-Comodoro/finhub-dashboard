<script setup lang="ts">
  import { QuickTransactionForm, TransactionForm } from '@/components/business'
  import type { Column } from '@/components/organisms'
  import { ModalWizard } from '@/components/organisms'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useTransactionFiltersPresenter } from '@/composables/presenters/useTransactionFiltersPresenter'
  import { useTransactionMetricsPresenter } from '@/composables/presenters/useTransactionMetricsPresenter'
  import { useFeedback } from '@/composables/useFeedback'
  import { translate } from '@/utils/translateToUI'
  import type { TransactionSummary } from '~/types/domain'
  definePageMeta({
    layout: 'dashboard',
    title: 'Transacciones',
    breadcrumb: 'Transacciones'
  })

  const route = useRoute()

  const {
    transactions,
    pagination,
    currency,
    financeId,
    budgetSelected,
    budgetPlans,
    budgetOptions,
    categoryOptions,
    fetchTransaction,
    loadInitialData,
    deleteTransaction
  } = useTransactionApplication()

  const { success: successToast } = useFeedback()

  const { goals, accounts, loadGoalsData } = useGoalsApplication()

  const budgetSelect = ref<string>('')
  const showForm = ref(false)
  const showQuickModal = ref(false)
  const editingTransaction = ref<{ id: string; data: Record<string, unknown> } | null>(null)

  const openQuickModal = () => {
    showQuickModal.value = true
  }

  const closeQuickModal = () => {
    showQuickModal.value = false
  }

  const closeForm = () => {
    showForm.value = false
    editingTransaction.value = null
  }

  const handleEditTransaction = (row: Record<string, unknown>) => {
    editingTransaction.value = {
      id: row.id,
      data: {
        type: row.type,
        amount: row.amount,
        transactionDate: row.transactionDate,
        source: row.source,
        categoryId: row.category?.id,
        description: row.description
      }
    }
    showForm.value = true
  }

  const handleDeleteTransaction = async (row: { id: string; amount: number; type: string }) => {
    const confirmed = confirm(
      `¿Estás seguro de eliminar esta transacción de ${formatCurrency(row.amount, currency.value)}?`
    )
    if (!confirmed) return

    const { success } = await deleteTransaction(row.id)
    if (success) {
      successToast('Transacción eliminada', 'La transacción fue eliminada correctamente.')
    }
  }

  // --- Fetch centralizado ---
  const loadTransactions = async (resetPage = false) => {
    if (!budgetSelect.value) return
    if (resetPage) filters.resetPage()
    await fetchTransaction(budgetSelect.value, filters.activeFilters.value)
  }

  // --- Composables ---
  const filters = useTransactionFiltersPresenter(loadTransactions)
  const metrics = useTransactionMetricsPresenter(
    transactions,
    pagination,
    filters.currentPage,
    filters.pageSize
  )

  // --- Tabla ---
  const columns: Column[] = [
    { key: 'transactionDate', label: 'Fecha', type: 'date', bold: true },
    { key: 'source', label: 'Fuente', type: 'badge' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: 'Monto', type: 'currency' },
    { key: 'category', label: 'Categoría' },
    { key: 'actions', label: 'Acciones' }
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
    await loadInitialData(financeId.value, 2026)
    await loadGoalsData()

    const queryBudgetId = route.query.budgetId as string | undefined
    budgetSelect.value = queryBudgetId || budgetSelected.value?.id || budgetPlans.value[0]?.id || ''

    await loadTransactions()
  })

  watch(budgetSelect, () => {
    filters.activeTypeBtn.value = 'all'
    filters.filterType.value = ''
    loadTransactions(true)
  })
</script>

<template>
  <div class="transactions-page">
    <div class="transactions-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="transactions-page__title">
          Transacciones
        </Heading>
        <Text size="sm" color="muted">Historial completo de movimientos</Text>
      </div>
      <div class="transactions-page__header-actions">
        <Select
          v-model="budgetSelect"
          name="budgetId"
          label="Presupuesto"
          :options="budgetOptions"
        />

        <Button variant="primary" size="sm" icon="add" @click="openQuickModal">
          Nueva transacción
        </Button>
      </div>
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
          class="transactions-page__amount"
          :class="getFormattedAmount(row).colorClass"
        >
          {{ getFormattedAmount(row).text }}
          <span class="transactions-page__currency" :class="getFormattedAmount(row).colorClass">
            {{ currency }}
          </span>
        </Text>
      </template>

      <template #cell-source="{ value, row }">
        <div class="transactions-page__source">
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

      <template #cell-actions="{ row }">
        <div class="transactions-page__actions">
          <Button variant="ghost" size="sm" icon="edit" @click="handleEditTransaction(row)">
            Editar
          </Button>
          <Button variant="ghost" size="sm" icon="delete" @click="handleDeleteTransaction(row)">
            Eliminar
          </Button>
        </div>
      </template>

      <template #empty>
        <div class="transactions-page__empty">
          <Text size="sm" color="muted">No hay transacciones para estos filtros</Text>
          <Button variant="ghost" size="sm" @click="filters.clearFilters">Limpiar filtros</Button>
        </div>
      </template>

      <template #footer>
        <div v-if="metrics.showPagination.value" class="transactions-page__footer">
          <div class="transactions-page__footer-info">
            <Text size="xs" color="muted">{{ metrics.countLabel.value }}</Text>
            <Select
              v-model="filters.pageSize.value"
              name="pageSize"
              :options="filters.pageSizeOptions"
            />
          </div>
          <div class="transactions-page__footer-actions">
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

    <ModalWizard v-model:show="showForm">
      <TransactionForm
        :budget-id="budgetSelect"
        :transaction-id="editingTransaction?.id"
        :initial-data="editingTransaction?.data"
        @on-close="closeForm"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showQuickModal">
      <QuickTransactionForm :goals="goals" :accounts="accounts" @on-close="closeQuickModal" />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .transactions-page {
    @apply space-y-4;
  }

  .transactions-page__header {
    @apply flex items-center justify-between;
  }

  .transactions-page__header-actions {
    @apply flex items-center gap-2;
  }

  .transactions-page__title {
    @apply mb-1;
  }

  .transactions-page__actions {
    @apply flex items-center gap-1;
  }

  .transactions-page__amount {
    @apply whitespace-nowrap;
  }

  .transactions-page__currency {
    @apply text-xs uppercase;
  }

  .transactions-page__source {
    @apply flex items-center gap-2;
  }

  .transactions-page__empty {
    @apply flex flex-col items-center gap-2 py-10 text-center;
  }

  .transactions-page__footer {
    @apply flex items-center justify-between border-t border-slate-100 px-5 py-3.5;
  }

  .transactions-page__footer-info {
    @apply flex items-center gap-3;
  }

  .transactions-page__footer-actions {
    @apply flex items-center gap-1;
  }
</style>
