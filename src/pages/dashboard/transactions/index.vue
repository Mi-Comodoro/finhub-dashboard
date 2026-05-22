<script setup lang="ts">
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import { QuickTransactionForm, TransactionForm } from '@/components/business'
  import type { Column } from '@/components/organisms'
  import { ModalWizard } from '@/components/organisms'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useTransactionFiltersPresenter } from '@/composables/presenters/useTransactionFiltersPresenter'
  import { useTransactionMetricsPresenter } from '@/composables/presenters/useTransactionMetricsPresenter'
  import { useFeedback } from '@/composables/useFeedback'
  import DateUtils from '@/utils/date'
  import { translate } from '@/utils/translateToUI'
  import type { TransactionSummary } from '~/types/domain'

  type TransactionEndpoint = {
    label: string
    detail?: string
  }

  type TransactionRow = TransactionSummary & {
    origin: TransactionEndpoint
    destination: TransactionEndpoint
  }

  definePageMeta({
    layout: 'dashboard',
    title: 'Transacciones',
    breadcrumb: 'Transacciones'
  })

  const route = useRoute()

  const {
    transactions,
    pagination,
    totals,
    currency,
    financeId,
    budgetSelected,
    budgetPlans,
    budgetOptions,
    categoryOptions,
    fetchTransaction,
    fetchTotals,
    loadInitialData,
    deleteTransaction
  } = useTransactionApplication()

  const { success: successToast } = useFeedback()

  const { goals, accounts, loadGoalsData } = useGoalsApplication()

  const budgetSelect = ref<string>('')
  const showForm = ref(false)
  const showQuickModal = ref(false)
  const showDetailsModal = ref(false)
  const showDeleteModal = ref(false)
  const transactionToDelete = ref<{ id: string; amount: number; type: string } | null>(null)
  const editingTransaction = ref<{ id: string; data: Record<string, unknown> } | null>(null)
  const selectedTransaction = ref<TransactionRow | null>(null)

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

  const openDetailsModal = (row: TransactionRow) => {
    selectedTransaction.value = row
    showDetailsModal.value = true
  }

  const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedTransaction.value = null
  }

  const handleEditTransaction = (row: TransactionSummary) => {
    editingTransaction.value = {
      id: row.id as string,
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

  const handleEditFromDetails = (row: TransactionRow) => {
    handleEditTransaction(row)
    closeDetailsModal()
  }

  const handleDeleteTransaction = (row: { id: string; amount: number; type: string }) => {
    transactionToDelete.value = row
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!transactionToDelete.value) return
    const { success } = await deleteTransaction(transactionToDelete.value.id)
    if (success) {
      successToast('Transacción eliminada', 'La transacción fue eliminada correctamente.')
    }
    showDeleteModal.value = false
    transactionToDelete.value = null
  }

  // --- Fetch centralizado ---
  const loadTransactions = async (resetPage = false) => {
    if (!budgetSelect.value) return
    if (resetPage) filters.resetPage()
    const fetchPage = fetchTransaction(budgetSelect.value, filters.activeFilters.value)
    if (resetPage) {
      await Promise.all([fetchPage, fetchTotals(budgetSelect.value, filters.filterParams.value)])
    } else {
      await fetchPage
    }
  }

  // --- Composables ---
  const filters = useTransactionFiltersPresenter(loadTransactions)
  const metrics = useTransactionMetricsPresenter(
    totals,
    pagination,
    filters.currentPage,
    filters.pageSize
  )

  // --- Tabla ---
  const columns: Column[] = [
    { key: 'transactionDate', label: 'Fecha', type: 'date', bold: true },
    { key: 'flow', label: 'Origen / destino' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: `Monto (${currency.value})`, type: 'currency' },
    { key: 'category', label: 'Categoría' },
    { key: 'actions', label: 'Acciones' }
  ]

  const formatText = (value?: string | null) => {
    if (!value) return ''
    return capitalizeFirstLetter(translate[value] ?? value)
  }

  const getAccountName = (id?: string, account?: { id: string; name: string }) => {
    if (account?.name) return account.name
    if (!id) return ''
    return accounts.value.find(item => item.id === id)?.name ?? ''
  }

  const getOrigin = (transaction: TransactionSummary): TransactionEndpoint => {
    const fromAccountName = getAccountName(transaction.fromAccountId, transaction.fromAccount)
    const accountName = getAccountName(transaction.accountId, transaction.account)

    if (fromAccountName) {
      return { label: fromAccountName, detail: 'Cuenta origen' }
    }

    if (transaction.type === 'income') {
      return {
        label: formatText(transaction.source) || 'Origen externo',
        detail: 'Fuente del ingreso'
      }
    }

    if (accountName) {
      return { label: accountName, detail: 'Cuenta asociada' }
    }

    if (transaction.type === 'savings') {
      return { label: formatText(transaction.source) || 'Presupuesto', detail: 'Origen del ahorro' }
    }

    return { label: 'Presupuesto', detail: 'Origen del egreso' }
  }

  const getDestination = (transaction: TransactionSummary): TransactionEndpoint => {
    const toAccountName = getAccountName(transaction.toAccountId, transaction.toAccount)
    const accountName = getAccountName(transaction.accountId, transaction.account)

    if (toAccountName) {
      return { label: toAccountName, detail: 'Cuenta destino' }
    }

    if (transaction.type === 'income') {
      if (accountName) return { label: accountName, detail: 'Cuenta destino' }
      return { label: 'Presupuesto', detail: 'Destino del ingreso' }
    }

    if (transaction.type === 'savings') {
      if (accountName) return { label: accountName, detail: 'Cuenta de ahorro' }
      return { label: 'Meta de ahorro', detail: 'Destino del ahorro' }
    }

    return {
      label: transaction.category?.name || formatText(transaction.source) || 'Gasto',
      detail: transaction.plannedExpenseId ? 'Gasto planificado' : 'Gasto no planificado'
    }
  }

  const result = computed(() =>
    transactions.value?.map((t: TransactionSummary) => ({
      id: t.id,
      transactionDate: t.transactionDate,
      source: t.source,
      amount: t.amount,
      category: t.category,
      type: t.type,
      plannedIncomeId: t.plannedIncomeId,
      plannedExpenseId: t.plannedExpenseId,
      description: t.description,
      accountId: t.accountId,
      account: t.account,
      fromAccountId: t.fromAccountId,
      fromAccount: t.fromAccount,
      toAccountId: t.toAccountId,
      toAccount: t.toAccount,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      origin: getOrigin(t),
      destination: getDestination(t)
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

    await loadTransactions(true)
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
        <Text size="xs" color="muted">Historial completo de movimientos</Text>
      </div>
      <div class="transactions-page__header-actions">
        <Select v-model="budgetSelect" name="budgetId" :options="budgetOptions" />

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
          size="xs"
          weight="bold"
          class="transactions-page__amount"
          :class="getFormattedAmount(row).colorClass"
        >
          {{ getFormattedAmount(row).text }}
        </Text>
      </template>

      <template #cell-flow="{ row }">
        <div class="transactions-page__flow">
          <div class="transactions-page__endpoint">
            <span class="transactions-page__endpoint-label">{{ row.origin.label }}</span>
            <span v-if="row.origin.detail" class="transactions-page__endpoint-detail">
              {{ row.origin.detail }}
            </span>
          </div>
          <span class="transactions-page__flow-icon material-symbols-outlined">arrow_forward</span>
          <div class="transactions-page__endpoint">
            <span class="transactions-page__endpoint-label">{{ row.destination.label }}</span>
            <span v-if="row.destination.detail" class="transactions-page__endpoint-detail">
              {{ row.destination.detail }}
            </span>
          </div>
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
        {{ row.type === 'income' || row.type === 'savings' ? 'N/A' : value?.name }}
      </template>

      <template #cell-actions="{ row }">
        <div class="transactions-page__actions">
          <Button
            variant="primary"
            size="sm"
            icon="visibility"
            icon-only
            @click="openDetailsModal(row)"
          />

          <Button
            variant="secondary"
            size="sm"
            icon="edit"
            icon-only
            @click="handleEditTransaction(row)"
          />

          <Button
            variant="danger"
            size="sm"
            icon="delete"
            icon-only
            @click="handleDeleteTransaction(row)"
          />
        </div>
      </template>

      <template #empty>
        <div class="transactions-page__empty">
          <EmptyStateIllustration
            type="no-transactions"
            class="transactions-page__empty-illustration"
          />
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

    <ModalWizard v-model:show="showDeleteModal">
      <div class="delete-confirmation">
        <Heading level="h2" size="lg" weight="extrabold">Eliminar transacción</Heading>
        <Text size="sm" color="muted">
          ¿Estás seguro de eliminar esta transacción de
          <strong>
            {{ transactionToDelete ? formatCurrency(transactionToDelete.amount, currency) : '' }}
          </strong>
          ? Esta acción no se puede deshacer.
        </Text>
        <div class="delete-confirmation__actions">
          <Button variant="ghost" size="sm" @click="showDeleteModal = false">Cancelar</Button>
          <Button variant="danger" size="sm" @click="confirmDelete">Eliminar</Button>
        </div>
      </div>
    </ModalWizard>

    <ModalWizard v-model:show="showDetailsModal">
      <div v-if="selectedTransaction" class="transaction-detail">
        <div class="transaction-detail__header">
          <div>
            <Heading level="h2" size="lg" weight="extrabold">Detalle de Transaccion</Heading>
            <Text size="xs" color="muted">
              {{ DateUtils.formatDate(selectedTransaction.transactionDate) }}
            </Text>
          </div>
          <Button variant="ghost" size="sm" icon="close" icon-only @click="closeDetailsModal" />
        </div>

        <div class="transaction-detail__amount">
          <Text size="xl" weight="bold" :class="getFormattedAmount(selectedTransaction).colorClass">
            {{ getFormattedAmount(selectedTransaction).text }}
          </Text>
          <Badge
            :variant="
              selectedTransaction.type === 'income'
                ? 'success'
                : selectedTransaction.type === 'expense'
                  ? 'danger'
                  : 'warning'
            "
          >
            {{ translate[selectedTransaction.type] ?? selectedTransaction.type }}
          </Badge>
        </div>

        <div class="transaction-detail__flow">
          <div class="transaction-detail__endpoint">
            <Text size="xs" color="muted">Origen</Text>
            <Text size="xs" weight="bold">{{ selectedTransaction.origin.label }}</Text>
            <Text v-if="selectedTransaction.origin.detail" size="xs" color="muted">
              {{ selectedTransaction.origin.detail }}
            </Text>
          </div>
          <span class="transaction-detail__flow-icon material-symbols-outlined">arrow_forward</span>
          <div class="transaction-detail__endpoint">
            <Text size="xs" color="muted">Destino</Text>
            <Text size="xs" weight="bold">{{ selectedTransaction.destination.label }}</Text>
            <Text v-if="selectedTransaction.destination.detail" size="xs" color="muted">
              {{ selectedTransaction.destination.detail }}
            </Text>
          </div>
        </div>

        <div class="transaction-detail__grid">
          <div class="transaction-detail__field">
            <Text size="xs" color="muted">Fuente</Text>
            <Text size="xs">{{ formatText(selectedTransaction.source) || 'N/A' }}</Text>
          </div>
          <div class="transaction-detail__field">
            <Text size="xs" color="muted">Categoria</Text>
            <Text size="xs">{{ selectedTransaction.category?.name || 'N/A' }}</Text>
          </div>
          <div class="transaction-detail__field">
            <Text size="xs" color="muted">Planificacion</Text>
            <Text size="xs">
              {{
                selectedTransaction.plannedIncomeId || selectedTransaction.plannedExpenseId
                  ? 'Planificada'
                  : 'No planificada'
              }}
            </Text>
          </div>
          <div class="transaction-detail__field">
            <Text size="xs" color="muted">ID</Text>
            <Text size="xs">{{ selectedTransaction.id }}</Text>
          </div>
        </div>

        <div class="transaction-detail__description">
          <Text size="xs" color="muted">Descripcion</Text>
          <Text size="xs">{{ selectedTransaction.description || 'Sin descripcion' }}</Text>
        </div>

        <div class="transaction-detail__actions">
          <Button variant="outline" size="sm" @click="closeDetailsModal">Cerrar</Button>
          <Button
            variant="primary"
            size="sm"
            icon="edit"
            @click="handleEditFromDetails(selectedTransaction)"
          >
            Editar
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .transactions-page {
    @apply space-y-4 px-4 py-2;
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

  .transactions-page__flow {
    @apply flex min-w-80 items-center gap-2;
  }

  .transactions-page__endpoint {
    @apply flex min-w-0 flex-col;
  }

  .transactions-page__endpoint-label {
    @apply max-w-36 truncate text-sm font-semibold text-slate-900;
  }

  .transactions-page__endpoint-detail {
    @apply max-w-36 truncate text-xs text-slate-500;
  }

  .transactions-page__flow-icon {
    @apply text-base text-slate-400;
  }

  .transactions-page__empty {
    @apply flex flex-col items-center gap-2 py-10 text-center;
  }

  .transactions-page__empty-illustration {
    @apply max-w-[140px];
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

  .transaction-detail {
    @apply flex w-full flex-col gap-5;
  }

  .transaction-detail__header {
    @apply flex items-start justify-between gap-4;
  }

  .transaction-detail__amount {
    @apply flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4;
  }

  .transaction-detail__flow {
    @apply grid grid-cols-[1fr_auto_1fr] items-center gap-3;
  }

  .transaction-detail__endpoint {
    @apply min-h-24 rounded-lg border border-slate-200 p-4;
  }

  .transaction-detail__flow-icon {
    @apply text-xl text-slate-400;
  }

  .transaction-detail__grid {
    @apply grid grid-cols-2 gap-3;
  }

  .transaction-detail__field,
  .transaction-detail__description {
    @apply rounded-lg border border-slate-100 p-3;
  }

  .transaction-detail__actions {
    @apply flex justify-end gap-2;
  }

  .delete-confirmation {
    @apply flex flex-col gap-4;
  }

  .delete-confirmation__actions {
    @apply flex justify-end gap-2;
  }
</style>
