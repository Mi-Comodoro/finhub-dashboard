<script setup lang="ts">
  import EmptyState from '@/components/atoms/empty-state/EmptyState.vue'
  import BudgetSurplusModal from '@/components/business/budget/BudgetSurplusModal.vue'
  import BudgetCloneForm from '@/components/business/budget/forms/BudgetCloneForm.vue'
  import BudgetForm from '@/components/business/budget/forms/BudgetForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useBudgetClose } from '@/composables/application/useBudgetClose'
  import { useBudgetListApplication } from '@/composables/application/useBudgetListApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useBudgetListPresenter } from '@/composables/presenters/useBudgetListPresenter'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useExpensesStore } from '@/stores/expense.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useTransactionStore } from '@/stores/transaction.store'
  import DateUtils from '@/utils/date'
  import type { CurrentBudgetPlan, PlannedIncomeSummary } from '~/types/domain'

  definePageMeta({
    layout: 'dashboard',
    title: 'Presupuestos',
    breadcrumb: 'Presupuestos'
  })

  const router = useRouter()
  const { success: successToast, error: errorToast } = useFeedback()

  const {
    loadBudgets,
    loadPlannedIncomes,
    getExpectedIncomeForBudget,
    budgets,
    isLoading,
    error,
    currency
  } = useBudgetListApplication()

  const { handleDelete, enableBudget } = useBudgetActions()
  const { fetchGoals } = useGoalsApplication()
  const goalsStore = useGoalsStore()
  const { fetchTotals } = useTransactionApplication()
  const transactionStore = useTransactionStore()
  const { fetchExpenses } = useExpenseApplication()
  const expensesStore = useExpensesStore()

  const {
    showSurplusModal,
    showDeficitModal,
    surplus,
    pendingClose: _pendingClose,
    isClosing,
    initiateClosure,
    executeClosure,
    cancelClosure
  } = useBudgetClose()

  const presenter = useBudgetListPresenter()
  const originalGetCardBorderClass = presenter.getCardBorderClass
  const { getStatusVariant, getStatusLabel, getMonthName, getYearOptions, getStrategyLabel } =
    presenter

  const selectedYear = ref(new Date().getFullYear())
  const allIncomes = ref<PlannedIncomeSummary[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showCloneModal = ref(false)
  const selectedBudget = ref<CurrentBudgetPlan | null>(null)
  const closingBudget = ref<CurrentBudgetPlan | null>(null)

  const showNextBudgetModal = ref(false)
  const nextBudgetSource = ref<CurrentBudgetPlan | null>(null)

  const STATUS_ORDER: Record<string, number> = { ACTIVE: 0, PLANNED: 1, CLOSED: 2 }
  const sortedBudgets = computed(() =>
    [...budgets.value].sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3))
  )

  const yearOptions = computed(() => getYearOptions())
  const activeGoals = computed(() => goalsStore.goals.filter(g => g.isActive))

  const budgetInitialData = computed(() => {
    if (!selectedBudget.value) return undefined
    return {
      name: selectedBudget.value.name,
      month: parseInt(selectedBudget.value.month),
      year: selectedBudget.value.year,
      strategy: selectedBudget.value.strategy,
      needsLimit: selectedBudget.value.limits.needs,
      wantsLimit: selectedBudget.value.limits.wants,
      savingsLimit: selectedBudget.value.limits.savings
    }
  })

  const getExpected = (budgetId: string) => getExpectedIncomeForBudget(budgetId, allIncomes.value)

  const getEstimatedSavings = (budgetId: string, savingsLimit: number) =>
    Math.round(getExpected(budgetId) * (Number(savingsLimit) / 100))

  const getCardBorderClass = (budget: CurrentBudgetPlan): string => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    let budgetMonth: number
    if (typeof budget.month === 'number') {
      budgetMonth = budget.month
    } else {
      budgetMonth = DateUtils.getMonthNumber(String(budget.month))
    }

    const isActive = budget.status === 'ACTIVE'
    const isCurrentMonth = budget.year === currentYear && budgetMonth === currentMonth
    const isPastMonth =
      budget.year < currentYear || (budget.year === currentYear && budgetMonth < currentMonth)

    if (isActive && isCurrentMonth) {
      return 'budget-index__card--active-current'
    }
    if (isActive && isPastMonth) {
      return 'budget-index__card--active-past'
    }
    return originalGetCardBorderClass(budget.status)
  }

  onMounted(async () => {
    await loadBudgets(selectedYear.value)
    allIncomes.value = await loadPlannedIncomes()
    await fetchGoals()
  })

  watch(selectedYear, async year => {
    await loadBudgets(year)
  })

  const goToDetail = (id: string) => router.push(`/dashboard/budget/${id}`)

  const openEdit = (budget: CurrentBudgetPlan) => {
    selectedBudget.value = budget
    showEditModal.value = true
  }

  const openClone = (budget: CurrentBudgetPlan) => {
    selectedBudget.value = budget
    showCloneModal.value = true
  }

  const getNextPeriod = (budget: CurrentBudgetPlan) => {
    const monthNum =
      typeof budget.month === 'number'
        ? budget.month
        : DateUtils.getMonthNumber(String(budget.month))
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1
    const nextYear = monthNum === 12 ? budget.year + 1 : budget.year
    return { nextMonth, nextYear }
  }

  const hasNextPeriodBudget = (budget: CurrentBudgetPlan): boolean => {
    const { nextMonth, nextYear } = getNextPeriod(budget)
    return budgets.value.some(b => {
      const bMonth =
        typeof b.month === 'number' ? b.month : DateUtils.getMonthNumber(String(b.month))
      return bMonth === nextMonth && b.year === nextYear
    })
  }

  const close = async (budget: CurrentBudgetPlan) => {
    closingBudget.value = budget
    expensesStore.setBudget(budget.id)
    await Promise.all([fetchTotals(budget.id), fetchExpenses()])
    const totals = transactionStore.totals
    const income = totals?.income ?? 0
    const savings = totals?.savings ?? 0
    const committed = expensesStore.totalCommitted
    const excedente = income - savings - committed
    const normalizedExcedente = isNaN(excedente) ? 0 : excedente
    await initiateClosure(budget, normalizedExcedente)
    // excedente === 0 closes the budget directly (no modal). Handle cleanup here.
    if (normalizedExcedente === 0) {
      closingBudget.value = null
      await loadBudgets(selectedYear.value)
      if (!hasNextPeriodBudget(budget)) {
        nextBudgetSource.value = budget
        showNextBudgetModal.value = true
      }
    }
  }

  const handleEnable = async (budget: CurrentBudgetPlan) => {
    const { success } = await enableBudget(budget.id)
    if (success) {
      successToast('Reactivado', `El presupuesto ${budget.name} fue reactivado.`)
      await loadBudgets(selectedYear.value)
    } else {
      errorToast('Error', 'No se pudo reactivar el presupuesto.')
    }
  }

  const handleSurplusConfirm = async (action: string, goalId?: string) => {
    if (!closingBudget.value) return
    const budget = closingBudget.value
    const ok = await executeClosure(
      budget.id,
      action as 'transfer_to_goal' | 'carry_forward' | 'ignore',
      goalId
    )
    closingBudget.value = null
    await loadBudgets(selectedYear.value)
    if (ok && !hasNextPeriodBudget(budget)) {
      nextBudgetSource.value = budget
      showNextBudgetModal.value = true
    }
  }

  const handleSurplusCancel = () => {
    cancelClosure()
    closingBudget.value = null
  }

  const confirmDelete = async (budgetId: string) => {
    const { success } = await handleDelete(budgetId)
    if (success) {
      successToast('Eliminado', 'El presupuesto fue eliminado.')
      await loadBudgets(selectedYear.value)
    } else {
      errorToast('Error', 'No se pudo eliminar el presupuesto.')
    }
  }

  const onFormSuccess = async () => {
    showCreateModal.value = false
    showEditModal.value = false
    showCloneModal.value = false
    selectedBudget.value = null
    await loadBudgets(selectedYear.value)
    allIncomes.value = await loadPlannedIncomes()
  }

  const getStatusDependentLabel = (status: string, type: 'income' | 'savings') => {
    const labels = {
      income: {
        PLANNED: 'Ingreso Esperado',
        ACTIVE: 'Ingreso Esperado',
        CLOSED: 'Ingreso Total'
      },
      savings: {
        PLANNED: 'Ahorro Estimado',
        ACTIVE: 'Ahorro Estimado',
        CLOSED: 'Ahorro Finalizado'
      }
    }
    return labels[type][status as keyof (typeof labels)['income']] || labels[type]['ACTIVE']
  }
</script>

<template>
  <div class="budget-index">
    <div class="budget-index__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="budget-index__title">
          Presupuestos
        </Heading>
        <Text size="xs" color="muted">Administrá tus períodos presupuestarios</Text>
      </div>
      <div class="budget-index__header-actions">
        <Select
          name="year-filter"
          :model-value="selectedYear"
          :options="yearOptions"
          class="budget-index__year-select"
          @update:model-value="selectedYear = Number($event)"
        />
        <Button variant="primary" size="sm" icon="add" @click="showCreateModal = true">
          Nuevo presupuesto
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="budget-index__loading">
      <div v-for="n in 3" :key="n" class="budget-index__skeleton" />
    </div>

    <div v-else-if="error" class="budget-index__error">
      <Text size="sm" class="budget-index__error-text">
        {{ error.message }}
      </Text>
    </div>

    <EmptyState
      v-else-if="sortedBudgets.length === 0"
      :title="`No hay presupuestos para ${selectedYear}`"
      description="Creá tu primer presupuesto para empezar a planificar."
      illustration="no-budget"
      class="budget-index__empty"
    >
      <Button variant="primary" size="sm" @click="showCreateModal = true">Crear presupuesto</Button>
    </EmptyState>

    <div v-else class="budget-index__grid">
      <div
        v-for="budget in sortedBudgets"
        :key="budget.id"
        class="budget-index__card"
        :class="getCardBorderClass(budget)"
      >
        <div class="budget-index__card-header">
          <div class="budget-index__card-header-content">
            <div class="budget-index__card-badges">
              <Text size="sm" weight="bold" class="budget-index__card-title">
                {{ replaceUnderscoresWithSpaces(budget.name) }}
              </Text>
              <Badge :variant="getStatusVariant(budget.status)" size="xs">
                {{ getStatusLabel(budget.status) }}
              </Badge>
              <Badge variant="secondary" size="xs">
                {{ getStrategyLabel(budget.strategy) }}
              </Badge>
            </div>
            <Text size="xs" color="muted" class="budget-index__card-date">
              {{ getMonthName(budget.month) }} {{ budget.year }}
            </Text>
          </div>
        </div>

        <div class="budget-index__card-metrics">
          <div class="budget-index__metric">
            <Text size="xs" color="muted" class="budget-index__metric-label">
              {{ getStatusDependentLabel(budget.status, 'income') }}
            </Text>
            <Text size="sm" weight="bold" class="budget-index__metric-value">
              {{ formatCurrency(getExpected(budget.id), currency) }}
            </Text>
          </div>
          <div class="budget-index__metric">
            <Text size="xs" color="muted" class="budget-index__metric-label">
              {{ getStatusDependentLabel(budget.status, 'savings') }}
            </Text>
            <Text size="sm" weight="bold" class="budget-index__metric-value--savings">
              {{
                formatCurrency(
                  getEstimatedSavings(budget.id, budget.limits?.savings ?? 0),
                  currency
                )
              }}
            </Text>
          </div>
        </div>

        <div class="budget-index__card-actions">
          <template v-if="budget.status === 'ACTIVE'">
            <Button
              variant="ghost"
              size="sm"
              icon="visibility"
              class="budget-index__action--primary"
              @click="goToDetail(budget.id)"
            >
              Ver
            </Button>
            <Button variant="secondary" size="sm" icon="not_interested" @click="close(budget)">
              Cerrar
            </Button>
            <Button variant="primary" size="sm" icon="content_copy" @click="openClone(budget)">
              Duplicar
            </Button>
          </template>

          <template v-else-if="budget.status === 'CLOSED'">
            <Button
              variant="ghost"
              size="sm"
              icon="visibility"
              class="budget-index__action--primary"
              @click="goToDetail(budget.id)"
            >
              Ver
            </Button>
            <Button variant="secondary" size="sm" icon="restart_alt" @click="handleEnable(budget)">
              Reactivar
            </Button>
            <Button variant="primary" size="sm" icon="content_copy" @click="openClone(budget)">
              Duplicar
            </Button>
          </template>

          <template v-else-if="budget.status === 'PLANNED'">
            <Button
              variant="ghost"
              size="sm"
              icon="visibility"
              class="budget-index__action--primary"
              @click="goToDetail(budget.id)"
            >
              Ver
            </Button>
            <Button variant="secondary" size="sm" icon="edit" @click="openEdit(budget)">
              Editar
            </Button>
            <Button variant="danger" size="sm" icon="delete" @click="confirmDelete(budget.id)">
              Eliminar
            </Button>
          </template>

          <template v-else>
            <Button
              variant="ghost"
              size="sm"
              icon="visibility"
              class="budget-index__action--primary"
              @click="goToDetail(budget.id)"
            >
              Ver detalle
            </Button>
          </template>
        </div>
      </div>
    </div>

    <ModalWizard v-model:show="showCreateModal">
      <BudgetForm mode="create" @on-close="showCreateModal = false" @on-success="onFormSuccess" />
    </ModalWizard>

    <ModalWizard v-model:show="showEditModal">
      <BudgetForm
        v-if="selectedBudget"
        mode="edit"
        :budget-id="selectedBudget.id"
        :initial-data="budgetInitialData"
        @on-close="showEditModal = false"
        @on-success="onFormSuccess"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showCloneModal">
      <BudgetCloneForm
        v-if="selectedBudget"
        :source-budget-id="selectedBudget.id"
        :source-budget-name="selectedBudget.name"
        @on-close="showCloneModal = false"
        @on-success="onFormSuccess"
      />
    </ModalWizard>

    <!-- Modal de excedente: se muestra cuando hay saldo positivo al cerrar -->
    <ModalWizard v-model:show="showSurplusModal">
      <BudgetSurplusModal
        :surplus="surplus"
        :available-goals="activeGoals"
        :is-loading="isClosing"
        :currency="currency"
        @confirm="handleSurplusConfirm"
        @cancel="handleSurplusCancel"
      />
    </ModalWizard>

    <!-- Modal post-cierre: crear o duplicar para el siguiente período -->
    <ModalWizard v-model:show="showNextBudgetModal">
      <div v-if="nextBudgetSource" class="next-budget-modal">
        <div class="next-budget-modal__header">
          <span class="material-symbols-outlined next-budget-modal__icon">calendar_month</span>
          <Heading level="h1" size="xl" weight="extrabold" color="black">
            ¿Y el próximo mes?
          </Heading>
          <Text size="xs" color="muted">
            No tenés un presupuesto para
            {{ getMonthName(getNextPeriod(nextBudgetSource).nextMonth) }}
            {{ getNextPeriod(nextBudgetSource).nextYear }}. ¿Querés crear uno?
          </Text>
        </div>
        <div class="next-budget-modal__actions">
          <Button variant="ghost" size="sm" @click="showNextBudgetModal = false">Ahora no</Button>
          <Button
            variant="secondary"
            size="sm"
            icon="content_copy"
            @click="
              () => {
                showNextBudgetModal = false
                openClone(nextBudgetSource!)
              }
            "
          >
            Duplicar este
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon="add"
            @click="
              () => {
                showNextBudgetModal = false
                showCreateModal = true
              }
            "
          >
            Crear nuevo
          </Button>
        </div>
      </div>
    </ModalWizard>

    <!-- Modal de déficit: confirmación cuando el presupuesto cierra en negativo -->
    <ModalWizard v-model:show="showDeficitModal">
      <div class="deficit-modal">
        <div class="deficit-modal__header">
          <span class="material-symbols-outlined deficit-modal__icon">warning</span>
          <Heading level="h1" size="xl" weight="extrabold" color="black">
            El presupuesto tiene un déficit
          </Heading>
          <Text size="xs" color="muted">
            El saldo al cierre es de
            <strong>{{ formatCurrency(surplus, currency) }}</strong>
            . ¿Deseas cerrarlo de todas formas?
          </Text>
        </div>
        <div class="deficit-modal__actions">
          <Button variant="ghost" size="sm" :disabled="isClosing" @click="handleSurplusCancel">
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            :loading="isClosing"
            @click="handleSurplusConfirm('ignore')"
          >
            Cerrar de todas formas
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .budget-index {
    @apply space-y-4 px-4 py-2;
  }

  .budget-index__header {
    @apply flex items-start justify-between gap-4;
  }

  .budget-index__header-actions {
    @apply flex shrink-0 items-center gap-3;
  }

  .budget-index__year-select {
    @apply w-28;
  }

  .budget-index__loading {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3;
  }

  .budget-index__skeleton {
    @apply h-52 animate-pulse rounded-xl bg-neutral-100;
  }

  .budget-index__error {
    @apply rounded-xl border border-danger-200 bg-danger-50 p-6;
  }

  .budget-index__error-text {
    @apply text-danger-700;
  }

  .budget-index__empty {
    @apply rounded-xl border border-neutral-200 bg-white;
  }

  .budget-index__grid {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3;
  }

  .budget-index__card {
    @apply flex flex-col rounded-xl bg-white p-4 transition-shadow;
  }

  .budget-index__card--active-current {
    @apply border-2 border-primary-500;
  }

  .budget-index__card--active-past {
    @apply border-2 border-warning-500;
  }

  .budget-index__card-header {
    @apply mb-3 flex items-start justify-between gap-2;
  }

  .budget-index__card-header-content {
    @apply min-w-0 flex-1;
  }

  .budget-index__card-badges {
    @apply flex flex-wrap items-center gap-2;
  }

  .budget-index__card-title {
    @apply truncate text-neutral-900;
  }

  .budget-index__card-date {
    @apply mt-0.5;
  }

  .budget-index__card-metrics {
    @apply mb-3 grid grid-cols-2 gap-2;
  }

  .budget-index__metric {
    @apply rounded-lg bg-neutral-50 p-2;
  }

  .budget-index__metric-label {
    @apply mb-0.5 uppercase tracking-wide;
  }

  .budget-index__metric-value {
    @apply text-neutral-900;
  }

  .budget-index__metric-value--savings {
    @apply text-warning-600;
  }

  .budget-index__card-progress {
    @apply mb-3;
  }

  .budget-index__progress-header {
    @apply mb-1 flex justify-between;
  }

  .budget-index__progress-bar {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .budget-index__progress-fill {
    @apply h-full w-0 rounded-full bg-primary-500 transition-all;
  }

  .budget-index__card-actions {
    @apply mt-auto flex gap-2 border-t border-neutral-100 pt-3;
  }

  .budget-index__action--primary {
    @apply flex-1;
  }

  .next-budget-modal {
    @apply flex flex-col gap-6 p-6;
  }

  .next-budget-modal__header {
    @apply flex flex-col items-center gap-2 text-center;
  }

  .next-budget-modal__icon {
    @apply text-4xl text-primary-500;
  }

  .next-budget-modal__actions {
    @apply flex justify-end gap-3;
  }

  .deficit-modal {
    @apply flex flex-col gap-6 p-6;
  }

  .deficit-modal__header {
    @apply flex flex-col items-center gap-2 text-center;
  }

  .deficit-modal__icon {
    @apply text-4xl text-danger-500;
  }

  .deficit-modal__actions {
    @apply flex justify-end gap-3;
  }
</style>
