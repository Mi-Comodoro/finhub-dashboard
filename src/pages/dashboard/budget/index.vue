<script setup lang="ts">
  import { BudgetCloneForm, BudgetForm } from '@/components/business'
  import { ModalWizard } from '@/components/organisms'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useBudgetListApplication } from '@/composables/application/useBudgetListApplication'
  import { useBudgetListPresenter } from '@/composables/presenters/useBudgetListPresenter'
  import { useFeedback } from '@/composables/useFeedback'
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

  const { handleDelete } = useBudgetActions()

  const {
    getStatusVariant,
    getStatusLabel,
    getCardBorderClass,
    getMonthName,
    getYearOptions,
    getStrategyLabel
  } = useBudgetListPresenter()

  const selectedYear = ref(new Date().getFullYear())
  const allIncomes = ref<PlannedIncomeSummary[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showCloneModal = ref(false)
  const selectedBudget = ref<CurrentBudgetPlan | null>(null)

  const yearOptions = computed(() => getYearOptions())

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
    Math.round(getExpected(budgetId) * (savingsLimit / 100))

  onMounted(async () => {
    await loadBudgets(selectedYear.value)
    allIncomes.value = await loadPlannedIncomes()
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
        ACTIVE: 'Ingreso Recibido',
        CLOSED: 'Ingreso Total'
      },
      savings: {
        PLANNED: 'Ahorro Estimado',
        ACTIVE: 'Ahorro Generado',
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
        <Text size="sm" color="muted">Administrá tus períodos presupuestarios</Text>
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

    <div v-else-if="budgets.length === 0" class="budget-index__empty">
      <Icon name="account_balance" size="2xl" class="budget-index__empty-icon" />
      <Heading level="h3" size="lg" color="muted" class="budget-index__empty-title">
        No hay presupuestos para {{ selectedYear }}
      </Heading>
      <Text size="sm" color="muted" class="budget-index__empty-text">
        Creá tu primer presupuesto para empezar a planificar.
      </Text>
      <Button variant="primary" size="sm" @click="showCreateModal = true">Crear presupuesto</Button>
    </div>

    <div v-else class="budget-index__grid">
      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="budget-index__card"
        :class="getCardBorderClass(budget.status)"
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
          <template v-if="budget.status === 'ACTIVE' || budget.status === 'CLOSED'">
            <Button
              variant="ghost"
              size="sm"
              icon="visibility"
              class="budget-index__action--primary"
              @click="goToDetail(budget.id)"
            >
              Ver detalle
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="content_copy"
              :disabled="budget.status === 'CLOSED'"
              @click="openClone(budget)"
            >
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
              Ver detalle
            </Button>
            <Button variant="secondary" size="sm" icon="edit" icon-only @click="openEdit(budget)" />
            <Button
              variant="danger"
              size="sm"
              icon="delete"
              icon-only
              @click="confirmDelete(budget.id)"
            />
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
  </div>
</template>

<style scoped lang="postcss">
  .budget-index {
    @apply space-y-4 p-4;
  }

  .budget-index__header {
    @apply flex items-start justify-between gap-4;
  }

  .budget-index__title {
    @apply mb-1;
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
    @apply rounded-xl border border-neutral-200 bg-white p-12 text-center;
  }

  .budget-index__empty-icon {
    @apply mb-3 text-neutral-300;
  }

  .budget-index__empty-title {
    @apply mb-2;
  }

  .budget-index__empty-text {
    @apply mb-4;
  }

  .budget-index__grid {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3;
  }

  .budget-index__card {
    @apply flex flex-col rounded-xl bg-white p-4 transition-shadow;
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
</style>
