<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import type { ButtonSize, ButtonVariant } from '@/components/atoms/button/types/button.types'
  import Icon from '@/components/atoms/icons/Icon.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import BudgetClosedBanner from '@/components/business/budget/BudgetClosedBanner.vue'
  import BudgetDistribution from '@/components/business/budget/BudgetDistribution.vue'
  import BudgetEditForm from '@/components/business/budget/forms/BudgetEditForm.vue'
  import BudgetIncome from '@/components/business/budget/income/BudgetIncome.vue'
  import BudgetInsights from '@/components/business/budget/insight/BudgetInsights.vue'
  import ExpensePlannedSection from '@/components/business/expense/ExpensedPlanedSection.vue'
  import ExpensePlannedForm from '@/components/business/expense/forms/ExpensePlannedForm.vue'
  import IncomeForm from '@/components/business/income/forms/IncomeForm.vue'
  import SavingDistributionForm from '@/components/business/savings/forms/SavingDistributionForm.vue'
  import PlannedSavingList from '@/components/business/savings/PlannedSavingList.vue'
  import Tips from '@/components/business/tips/Tips.vue'
  import TransactionList from '@/components/business/transactions/TransactionList.vue'
  import ConfirmDeleteModal from '@/components/organisms/confirm-delete/ConfirmDeleteModal.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import SidebarPage from '@/components/templates/SidebarPage.vue'
  import { useBillsApplication } from '@/composables/application/useBillsApplication'
  import { useBudgetDetailApplication } from '@/composables/application/useBudgetDetailApplication'
  import { useBudgetTransferApplication } from '@/composables/application/useBudgetTransferApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useApiHandler } from '@/composables/useApiHandler'
  import { useFeedback } from '@/composables/useFeedBack'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  import { replaceUnderscoresWithSpaces } from '@/utils/strings'
  definePageMeta({
    layout: 'dashboard',
    title: 'Detalles',
    breadcrumb: 'Detalles',
    parents: ['Presupuesto']
  })

  const route = useRoute()
  const router = useRouter()

  const { loadBudgetDetail, budgetSelected, expectedIncome, defaultCurrency } =
    useBudgetDetailApplication()
  const { deleteExpense } = useExpenseApplication()
  const { fetchByBudget: fetchTransactions, fetchTotals } = useTransactionApplication()
  const { fetchByBudget: fetchPlannedSavings } = usePlannedSavingApplication()
  const { success: successToast } = useFeedback()
  const { handleError } = useApiHandler()
  const { lastUpdate } = usePlannedIncomeApplication()
  const { fetchGoals, goals } = useGoalsApplication()
  const { transferToBudget, transferToGoal } = useBudgetTransferApplication()

  const budgetId = route.params['id'] as string

  onMounted(async () => {
    const { success, error } = await loadBudgetDetail(budgetId)
    if (!success && error) handleError(error)

    if (budgetId) {
      await Promise.all([
        fetchTransactions(budgetId),
        fetchTotals(budgetId),
        fetchPlannedSavings(budgetId),
        fetchGoals()
      ])
    }
  })

  const budgetStart = () => {
    successToast('Gasto Registrado', 'Se registró correctamente')
  }

  const strategyInfo = computed(() => {
    if (!plan.value) return null
    const isBalanced = plan.value.strategy === 'BALANCED'
    return {
      label: isBalanced ? '50/30/20' : 'Personalizada',
      icon: isBalanced ? 'auto_awesome' : 'tune',
      title: isBalanced ? 'Regla del 50/30/20' : 'Distribución personalizada',
      description: isBalanced
        ? 'Método de presupuesto diseñado por Elizabeth Warren: la mitad del ingreso cubre necesidades esenciales, el 30% para gastos flexibles y el 20% se destina al ahorro e inversión. Ideal para construir hábitos financieros saludables.'
        : `Este presupuesto usa una distribución ajustada a tus necesidades: ${plan.value.limits.needs}% para gastos fijos, ${plan.value.limits.wants}% para gastos variables y ${plan.value.limits.savings}% para ahorro. Puedes modificar los porcentajes en cualquier momento.`
    }
  })

  const headerButtonActions = computed(() => [
    {
      name: 'Editar',
      size: 'sm',
      variant: 'ghost',
      icon: 'edit',
      condition: statusConfig.canEdit(),
      click: () => {
        showEditModal.value = true
      }
    },
    {
      name: 'Duplicar',
      size: 'sm',
      variant: 'primary',
      icon: 'content_copy',
      condition: statusConfig.canDuplicate()
    },
    {
      name: 'Activar',
      size: 'sm',
      variant: 'secondary',
      icon: 'rocket_launch',
      condition: statusConfig.canActivate(),
      click: budgetStart
    },
    {
      name: 'Eliminar',
      size: 'sm',
      variant: 'danger',
      icon: 'delete',
      condition: statusConfig.canDelete()
    }
  ])

  const plan = computed(() => budgetSelected.value)

  const planStatus = computed(() => plan.value?.status ?? 'PLANNED')
  const expectedAmount = computed(() => expectedIncome.value)

  const showForm = ref(false)
  const showIncomeModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteConfirm = ref(false)
  const expenseToDelete = ref<{ id: string; name: string } | null>(null)
  const editingExpense = ref<{ id: string; data: Record<string, unknown> } | null>(null)
  const formMode = ref<'create' | 'edit' | 'view'>('create')

  const budgetEditInitialData = computed(() => {
    if (!plan.value) return undefined
    return {
      name: plan.value.name,
      strategy: plan.value.strategy as 'BALANCED' | 'CUSTOM',
      needsLimit: plan.value.limits.needs,
      wantsLimit: plan.value.limits.wants,
      savingsLimit: plan.value.limits.savings
    }
  })

  const handleEditClose = async () => {
    showEditModal.value = false
    const { success, error } = await loadBudgetDetail(budgetId)
    if (!success && error) handleError(error)
  }

  const openForm = () => {
    editingExpense.value = null
    formMode.value = 'create'
    showForm.value = true
  }

  const closeForm = () => {
    showForm.value = false
    editingExpense.value = null
    formMode.value = 'create'
  }

  const handleFormSuccess = async () => {
    const isEdit = formMode.value === 'edit'
    successToast(
      isEdit ? 'Gasto actualizado' : 'Gasto registrado',
      isEdit
        ? 'El gasto planificado fue actualizado correctamente.'
        : 'El gasto fue agregado al presupuesto.'
    )
    closeForm()
    if (budgetId) {
      await Promise.all([fetchTransactions(budgetId), fetchTotals(budgetId)])
    }
  }

  const showSavingDistributionForm = ref(false)

  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }

  const { activeBills, importBillsToBudget } = useBillsApplication()
  const expenseSectionRef = ref<{ refresh: () => void } | null>(null)
  const showBillImport = ref(false)
  const selectedBillIds = ref<string[]>([])

  const openBillImport = () => {
    selectedBillIds.value = []
    showBillImport.value = true
  }

  const handleImportBills = async () => {
    if (!selectedBillIds.value.length) return
    const { success, imported } = await importBillsToBudget(budgetId, {
      billIds: selectedBillIds.value
    })
    showBillImport.value = false
    if (success) {
      successToast('Facturas importadas', `Se crearon ${imported} gastos planificados.`)
      expenseSectionRef.value?.refresh()
    }
  }

  const handleMarkExpenseAsPaid = async (_row: { id: string }) => {
    successToast('Gasto pagado', 'El gasto fue marcado como pagado y se registró la transacción.')
    if (budgetId) {
      await Promise.all([fetchTransactions(budgetId), fetchTotals(budgetId)])
    }
  }

  const handleEditExpense = (row: Record<string, unknown>) => {
    editingExpense.value = {
      id: row.id as string,
      data: {
        name: row.name,
        expectedAmount: row.expectedAmount,
        dueDate: row.dueDate,
        categoryId: row.categoryId,
        isEssential: row.isEssential,
        notes: row.notes
      }
    }
    formMode.value = 'edit'
    showForm.value = true
  }

  const handleViewExpense = (row: Record<string, unknown>) => {
    editingExpense.value = {
      id: row.id as string,
      data: {
        name: row.name,
        expectedAmount: row.expectedAmount,
        dueDate: row.dueDate,
        category: row.category,
        bucket: row.bucket,
        status: row.status,
        isEssential: row.isEssential,
        notes: row.notes
      }
    }
    formMode.value = 'view'
    showForm.value = true
  }

  const handleDeleteExpense = (row: { id: string; name: string }) => {
    expenseToDelete.value = row
    showDeleteConfirm.value = true
  }

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete.value) return
    const { success } = await deleteExpense(expenseToDelete.value.id)
    if (success) {
      successToast('Gasto eliminado', 'El gasto planificado fue eliminado correctamente.')
    }
    expenseToDelete.value = null
  }
  const statusConfig = {
    isActive: () => planStatus.value === 'ACTIVE',
    isPlanned: () => planStatus.value === 'PLANNED',
    isClosed: () => planStatus.value === 'CLOSED',
    canEdit: () => planStatus.value !== 'CLOSED',
    canDuplicate: () => planStatus.value !== 'PLANNED',
    canActivate: () => planStatus.value === 'PLANNED',
    canDelete: () => planStatus.value === 'PLANNED'
  }

  const isClosed = computed(() => planStatus.value === 'CLOSED')
  const hasPendingBalance = computed(() => isClosed.value && (plan.value?.freeAmount ?? 0) > 0)
  const activeGoals = computed(() => goals.value.filter(g => g.isActive))

  const refreshBudget = async () => {
    const { success, error } = await loadBudgetDetail(budgetId)
    if (!success && error) handleError(error)
  }

  const handleTransferToBudget = async () => {
    const amount = plan.value?.freeAmount ?? 0
    const { success } = await transferToBudget(budgetId, amount)
    if (success) {
      successToast('Saldo transferido', 'El saldo fue transferido al presupuesto activo.')
      await refreshBudget()
    }
  }

  const handleTransferToGoal = async (goalId: string) => {
    const amount = plan.value?.freeAmount ?? 0
    const { success } = await transferToGoal(budgetId, goalId, amount)
    if (success) {
      successToast('Saldo transferido', 'El saldo fue abonado a la meta de ahorro.')
      await refreshBudget()
    }
  }

  const badgeVariant = computed(() =>
    planStatus.value === 'ACTIVE'
      ? 'success'
      : planStatus.value === 'PLANNED'
        ? 'warning'
        : 'danger'
  )

  const displayStatus = computed(() => {
    const statusMap = { ACTIVE: 'Activo', PLANNED: 'Planificado', CLOSED: 'Cerrado' }
    return statusMap[planStatus.value] ?? planStatus.value
  })
</script>

<template>
  <div v-if="plan?.id" class="budget-detail">
    <!-- Header -->
    <div class="budget-detail__header">
      <div class="budget-detail__header-info">
        <div class="budget-detail__header-content">
          <div class="budget-detail__header-title">
            <Heading level="h1" size="2xl" weight="extrabold" class="budget-detail__header-name">
              {{ replaceUnderscoresWithSpaces(plan.name) }}
            </Heading>

            <div class="budget-detail__header-badges">
              <Badge :variant="badgeVariant" size="sm">
                {{ displayStatus }}
              </Badge>
              <Badge variant="secondary" size="xs">{{ strategyInfo?.label }}</Badge>
              <Badge v-if="plan.isShared" variant="warning" size="xs">
                <Icon name="group" size="xs" />
                Compartido
              </Badge>
            </div>
          </div>

          <div class="budget-detail__header-meta">
            <Text size="sm" color="muted" weight="bold" class="budget-detail__header-updated">
              Actualizado {{ DateUtils.formatSmartDate(lastUpdate!) }}
            </Text>
            <Text color="muted" size="sm"></Text>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="budget-detail__header-actions">
        <template v-for="(action, index) in headerButtonActions" :key="index">
          <Button
            v-if="action.condition"
            :variant="action.variant as ButtonVariant"
            :size="action.size as ButtonSize"
            :icon="action.icon"
            @click="action.click"
          >
            {{ action.name }}
          </Button>
        </template>
      </div>
    </div>

    <BudgetClosedBanner
      v-if="isClosed && hasPendingBalance"
      :budget="plan"
      :available-goals="activeGoals"
      class="budget-detail__banner"
      @transfer-to-budget="handleTransferToBudget"
      @transfer-to-goal="handleTransferToGoal"
    />

    <div v-else-if="isClosed" class="budget-detail__closed-badge">
      <span class="material-symbols-outlined">lock</span>
      <Text size="sm" color="muted">Presupuesto cerrado</Text>
    </div>

    <div class="budget-detail__layout">
      <div class="budget-detail__main">
        <BudgetInsights :budget-status="planStatus" />
        <PlannedSavingList :budget-id="budgetId" />
        <ExpensePlannedSection
          ref="expenseSectionRef"
          :budget-id="budgetId"
          @open-form="openForm"
          @open-bill-import="openBillImport"
          @mark-as-payed="handleMarkExpenseAsPaid"
          @edit="handleEditExpense"
          @view="handleViewExpense"
          @remove="handleDeleteExpense"
        />
      </div>

      <div class="budget-detail__sidebar">
        <SidebarPage>
          <Tips icon="show_chart" title="Optimizacion Inteligente">
            El ahorro del {{ plan?.limits?.savings || 0 }}% del
            <strong>({{ formatCurrency(expectedAmount!, defaultCurrency, 2) }})</strong>
            , se activará automáticamente cuando confirmes tu primer ingreso.
          </Tips>
          <BudgetIncome :budget-id="budgetId" />
          <BudgetDistribution />
          <TransactionList :budget-id="budgetId" />
        </SidebarPage>
      </div>
    </div>

    <ModalWizard v-model:show="showForm">
      <ExpensePlannedForm
        :budget-id="budgetId"
        :expense-id="editingExpense?.id"
        :initial-data="editingExpense?.data"
        :currency="defaultCurrency"
        :mode="formMode"
        @success="handleFormSuccess"
        @close="closeForm"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showSavingDistributionForm">
      <SavingDistributionForm @on-close="closeSavingDistributionForm" />
    </ModalWizard>

    <ModalWizard v-model:show="showIncomeModal">
      <IncomeForm
        :budget-id="budgetId"
        :show-savings-plan-step="true"
        :savings-plan-required="true"
        :budget-savings-percentage="plan?.limits?.savings ?? 20"
        :currency="defaultCurrency"
        @on-close="showIncomeModal = false"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showEditModal">
      <BudgetEditForm
        :budget-id="plan!.id"
        :initial-data="budgetEditInitialData"
        @on-close="handleEditClose"
      />
    </ModalWizard>

    <ConfirmDeleteModal
      v-model:show="showDeleteConfirm"
      :title="`¿Eliminar '${expenseToDelete?.name}'?`"
      @confirm="confirmDeleteExpense"
    />

    <ModalWizard :show="showBillImport" @close="showBillImport = false">
      <div class="bill-import-modal">
        <Heading level="h2" size="lg" weight="semibold">Importar Facturas</Heading>
        <Text size="sm" color="muted">
          Selecciona las facturas activas que deseas agregar como gastos planificados.
        </Text>

        <div v-if="activeBills?.length" class="bill-import-modal__list">
          <label v-for="bill in activeBills" :key="bill.id" class="bill-import-modal__item">
            <input
              v-model="selectedBillIds"
              type="checkbox"
              :value="bill.id"
              class="bill-import-modal__checkbox"
            />
            <div class="bill-import-modal__info">
              <span class="bill-import-modal__name">{{ bill.name }}</span>
              <span class="bill-import-modal__day">Día {{ bill.billingDay }}</span>
            </div>
          </label>
        </div>
        <Text v-else size="sm" color="muted">No hay facturas activas para importar.</Text>

        <div class="bill-import-modal__actions">
          <Button variant="ghost" size="sm" @click="showBillImport = false">Cancelar</Button>
          <Button
            variant="primary"
            size="sm"
            icon="sync"
            :disabled="!selectedBillIds.length"
            @click="handleImportBills"
          >
            Importar ({{ selectedBillIds.length }})
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
  <div v-else class="budget-detail__empty">
    <Icon name="search_off" class="budget-detail__empty-icon" size="2xl" />
    <Heading level="h3" color="muted">Presupuesto no encontrado</Heading>
    <Text size="sm" color="muted">No se encontró un presupuesto con el ID indicado.</Text>
    <Button
      variant="ghost"
      size="sm"
      icon="arrow_back"
      class="budget-detail__empty-button"
      @click="router.push('/dashboard/budget')"
    >
      Volver a Presupuestos
    </Button>
  </div>
</template>

<style lang="postcss" scoped>
  .budget-detail {
    @apply space-y-4;
  }

  .budget-detail__header {
    @apply flex w-full flex-wrap items-start p-4;
  }

  .budget-detail__header-info {
    @apply flex items-center gap-2;
  }

  .budget-detail__header-content {
    @apply flex flex-col;
  }

  .budget-detail__header-title {
    @apply flex flex-wrap items-center gap-2;
  }

  .budget-detail__header-name {
    @apply leading-tight;
  }

  .budget-detail__header-badges {
    @apply hidden gap-2 xl:flex;
  }

  .budget-detail__header-updated {
    @apply flex items-center gap-1;
  }

  .budget-detail__header-actions {
    @apply ml-auto flex items-center gap-2;
  }

  .budget-detail__banner {
    @apply mx-4;
  }

  .budget-detail__closed-badge {
    @apply mx-4 flex items-center gap-2 text-neutral-500;
  }

  .budget-detail__layout {
    @apply flex flex-col gap-6 px-4 lg:flex-row lg:items-start;
  }

  .budget-detail__main {
    @apply flex min-w-0 flex-1 flex-col gap-4;
  }

  .budget-detail__sidebar {
    @apply w-full lg:sticky lg:top-4 lg:w-80 lg:shrink-0 lg:self-start;
  }

  .budget-detail__sidebar :deep(.sidebar-page) {
    @apply gap-3;
  }

  /* Compact Card atoms in sidebar */
  .budget-detail__sidebar :deep(.card) {
    @apply p-3;
  }

  /* Compact SectionCard (BudgetDistribution, TransactionList) in sidebar */
  .budget-detail__sidebar :deep(.section-card__header) {
    @apply p-3;
  }

  .budget-detail__sidebar :deep(.section-card__body) {
    @apply p-3;
  }

  .budget-detail__empty {
    @apply flex flex-col items-center gap-4 py-20 text-center;
  }

  .budget-detail__empty-icon {
    @apply text-slate-400 dark:text-neutral-500;
  }

  .budget-detail__empty-button {
    @apply mt-2;
  }

  .coming-soon-card {
    @apply p-8 text-center;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .coming-soon-card__icon {
    @apply mx-auto mb-4 w-fit bg-neutral-100 text-neutral-600;
    @apply dark:bg-neutral-700 dark:text-neutral-300;
  }

  .coming-soon-card__title {
    @apply mb-2 text-neutral-900;
    @apply dark:text-white;
  }

  .coming-soon-card__description {
    @apply text-neutral-500;
    @apply dark:text-neutral-400;
  }

  .bill-import-modal {
    @apply flex flex-col gap-4 p-2;
  }

  .bill-import-modal__list {
    @apply flex max-h-64 flex-col gap-2 overflow-y-auto;
  }

  .bill-import-modal__item {
    @apply flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50;
    @apply dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .bill-import-modal__checkbox {
    @apply h-4 w-4 accent-primary-600;
  }

  .bill-import-modal__info {
    @apply flex flex-1 items-center justify-between;
  }

  .bill-import-modal__name {
    @apply text-sm font-medium text-neutral-900 dark:text-white;
  }

  .bill-import-modal__day {
    @apply text-xs text-neutral-500 dark:text-neutral-400;
  }

  .bill-import-modal__actions {
    @apply flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700;
  }
</style>
