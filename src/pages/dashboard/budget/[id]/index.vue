<script setup lang="ts">
  import { computed, onMounted } from 'vue'

  import {
    Button,
    type ButtonSize,
    type ButtonVariant,
    Heading,
    Icon,
    Text
  } from '@/components/atoms'
  import {
    BudgetDistribution,
    ExpensePlannedForm,
    ExpensePlannedSection,
    PlannedSavingList,
    Tips,
    TransactionList
  } from '@/components/business'
  import { ModalWizard } from '@/components/organisms'
  import { useApiHandler } from '@/composables/useApiHandler'
  import { useFeedback } from '@/composables/useFeedBack'
  import { usePlannedIncome } from '@/composables/usePlannedIncome'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import DateUtils from '~/utils/date'
  definePageMeta({
    layout: 'dashboard',
    title: 'Detalles',
    breadcrumb: 'Detalles',
    parents: ['Presupuesto']
  })

  const route = useRoute()
  const router = useRouter()

  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const { success: successToast } = useFeedback()
  const { handleError } = useApiHandler()
  const { lastUpdate } = usePlannedIncome()

  const budgetId = route.params['id'] as string

  onMounted(async () => {
    await budgetStore.fetchBudgetById(budgetId)
    await plannedIncomeStore.fetchPlannedIncomeByBudgetId(budgetId)
    const error = budgetStore.error || plannedIncomeStore.error
    if (error) handleError(error)
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
      condition: planStatus.value !== 'CLOSED'
    },
    {
      name: 'Duplicar',
      size: 'sm',
      variant: 'primary',
      icon: 'content_copy',
      condition: planStatus.value !== 'PLANNED'
    },
    {
      name: 'Activar',
      size: 'sm',
      variant: 'secondary',
      icon: 'rocket_launch',
      condition: planStatus.value == 'PLANNED',
      click: budgetStart
    },
    {
      name: 'Eliminar',
      size: 'sm',
      variant: 'danger',
      icon: 'delete',
      condition: planStatus.value == 'PLANNED'
    }
  ])

  const plan = computed(() => budgetStore.budgetSelected)

  const planStatus = computed(() => plan.value?.status)
  const expectedAmount = computed(() => plannedIncomeStore.expectedIncome)

  const showForm = ref(false)
  const openForm = () => {
    showForm.value = true
  }
  const closeForm = () => {
    showForm.value = false
  }

  const showSavingDistributionForm = ref(false)

  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }
</script>

<template>
  <div v-if="plan?.id" class="space-y-4">
    <!-- Header -->
    <div class="flex w-full flex-wrap items-start p-4">
      <div class="flex items-center gap-2">
        <div class="flex flex-col">
          <div class="flex flex-wrap items-center gap-2">
            <Heading level="h1" size="2xl" weight="extrabold" class="leading-tight">
              {{ replaceUnderscoresWithSpaces(plan.name) }}
            </Heading>

            <div class="hidden gap-2 xl:flex">
              <Badge :variant="planStatus === 'ACTIVE' ? 'success' : 'warning'" size="sm">
                {{ planStatus === 'ACTIVE' ? 'Activo' : 'PLANIFICADO' }}
              </Badge>
              <Badge variant="secondary" size="xs">{{ strategyInfo?.label }}</Badge>
              <Badge v-if="plan.isShared" variant="warning" size="xs">
                <Icon name="group" size="xs" />
                Compartido
              </Badge>
            </div>
          </div>

          <div class="">
            <Text size="sm" color="muted" weight="bold" class="flex items-center gap-1">
              Actualizado {{ DateUtils.formatSmartDate(lastUpdate!) }}
            </Text>
            <Text color="muted" size="sm"></Text>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="ml-auto flex items-center gap-2">
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

    <div class="grid w-full grid-cols-12 gap-4 px-4">
      <div class="col-span-8 flex flex-col gap-4">
        <BudgetInsights />
        <PlannedSavingList :budget-id="budgetId" />
        <ExpensePlannedSection :budget-id="budgetId" @open-form="openForm" />
      </div>

      <div class="col-span-4 flex flex-col gap-4">
        <Tips icon="show_chart" title="Optimizacion Inteligente">
          El ahorro del {{ plan?.limits?.savings || 0 }}% del
          <strong>({{ formatCurrency(expectedAmount!, financesStore.defaultCurrency, 2) }})</strong>
          , se activará automáticamente cuando confirmes tu primer ingreso.
        </Tips>
        <BudgetIncome />
        <BudgetDistribution />
        <TransactionList :budget-id="budgetId" />
      </div>
    </div>

    <ModalWizard v-model:show="showForm">
      <ExpensePlannedForm :budget-id="budgetId" @on-close="closeForm" />
    </ModalWizard>

    <ModalWizard v-model:show="showSavingDistributionForm">
      <SavingDistributionForm @on-close="closeSavingDistributionForm" />
    </ModalWizard>
  </div>
  <div v-else class="flex flex-col items-center gap-4 py-20 text-center">
    <Icon name="search_off" class="text-slate-400 dark:text-slate-600" size="2xl" />
    <Heading level="h3" color="muted">Presupuesto no encontrado</Heading>
    <Text size="sm" color="muted">No se encontró un presupuesto con el ID indicado.</Text>
    <Button
      variant="ghost"
      size="sm"
      icon="arrow_back"
      class="mt-2"
      @click="router.push('/dashboard/budget')"
    >
      Volver a Presupuestos
    </Button>
  </div>
</template>

<style lang="postcss" scoped>
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
</style>
