<script setup lang="ts">
  import { computed, onMounted } from 'vue'

  import {
    Button,
    type ButtonSize,
    type ButtonVariant,
    Heading,
    Icon,
    MetricCard,
    Text
  } from '@/components/atoms'
  import {
    BudgetDistribution,
    ExpensePlannedForm,
    ExpensePlannedSection,
    SavingsDistribution
  } from '@/components/business'
  import { ModalWizard } from '@/components/organisms'
  import { usePlannedIncomes } from '@/composables/usePlannedIncome'
  import { useAuthStore } from '@/stores/auth.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useModalStore } from '@/stores/modal.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { useToast } from '~/components/organisms/toast/useToast'
  import DateUtils from '~/utils/date'

  definePageMeta({
    layout: 'dashboard',
    title: 'Detalles',
    breadcrumb: 'Detalles',
    parents: ['Presupuesto']
  })

  const route = useRoute()
  const router = useRouter()

  const authStore = useAuthStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const modalStore = useModalStore()
  const { fetchPlannedIncomeByBudgetId } = usePlannedIncomes()

  // ─── Load data if navigated directly (store empty) ────────────────────────
  const budgetId = route.params['id'] as string
  const handleActions = () => {
    if (budgetStore.error?.status === 401) {
      authStore.clearAuth()
      return navigateTo('/', { replace: true })
    } else {
      modalStore.hideModal()
    }
  }
  onMounted(async () => {
    await budgetStore.fetchBudgetById(budgetId)
    await fetchPlannedIncomeByBudgetId(budgetId)

    if (budgetStore.error) {
      modalStore.showModal('error', {
        title: budgetStore.error.title,
        message: budgetStore.error.message,
        actionLabel: 'Aceptar',
        onAction: handleActions
      })
    }
  })

  const { show } = useToast()
  const budgetStart = () => {
    show({
      title: 'Gasto guardado',
      description: 'Se registró correctamente',
      type: 'success'
    })
  }
  const currency = computed(() => financesStore.defaultCurrency)
  const sources = computed(() => {
    function sourceMap(source: string) {
      let item
      if (source === 'salary') {
        item = 'Salario'
      }
      if (source === 'freelance') {
        item = 'Freelance'
      }
      return item
    }
    const sources = plannedIncomeStore.summary?.map(item => sourceMap(item.source))
    return sources
  })
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

  const needsAmount = computed(() => plannedIncomeStore.buckets.needsAmount)
  const wantsAmount = computed(() => plannedIncomeStore.buckets.wantsAmount)
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)

  // ─── Spending data — placeholder until transactions are linked ────────────
  // TODO: replace with real values from transactions store once integrated
  const spentNeeds = computed(() => 0)
  const spentWants = computed(() => 0)

  const remainingNeeds = computed(() => needsAmount.value - spentNeeds.value)
  const remainingWants = computed(() => wantsAmount.value - spentWants.value)

  const needsUsedPct = computed(() =>
    needsAmount.value > 0 ? Math.round((spentNeeds.value / needsAmount.value) * 100) : 0
  )
  const wantsUsedPct = computed(() =>
    wantsAmount.value > 0 ? Math.round((spentWants.value / wantsAmount.value) * 100) : 0
  )

  const showForm = ref(false)
  const openForm = () => {
    showForm.value = true
  }
  const closeForm = () => {
    showForm.value = false
  }

  const lastUpdate = computed(
    () => plannedIncomeStore.summary?.find(item => item.updatedAt != undefined)?.updatedAt
  )
  type MetricCardVariant = 'neutral' | 'income' | 'expense' | 'available'

  interface MetricCardData {
    id: string
    title: string
    value: number
    currencyCode: Currency
    icon: string
    variant: MetricCardVariant
    percentage?: number
    percentageText?: string
    subtitle?: string
    iconClass: string
  }

  const metricCards = computed<MetricCardData[]>(() => [
    {
      id: 'fixed-expenses',
      title: 'Gastos Fijos',
      value: remainingNeeds.value,
      currencyCode: currency.value,
      icon: 'home',
      variant: 'expense',
      percentage: needsUsedPct.value,
      percentageText: `de ${formatCurrency(needsAmount.value, currency.value)}`,
      iconClass: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
    },
    {
      id: 'variable-expenses',
      title: 'Gastos Variables',
      value: remainingWants.value,
      currencyCode: currency.value,
      icon: 'shopping_bag',
      variant: 'expense',
      percentage: wantsUsedPct.value,
      percentageText: `de ${formatCurrency(wantsAmount.value, currency.value)}`,
      iconClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
    },
    {
      id: 'savings',
      title: 'Ahorro e Inversiones',
      value: savingsAmount.value,
      currencyCode: currency.value,
      icon: 'savings',
      variant: 'available', // o el variant que corresponda según las opciones disponibles
      subtitle: `${plan.value?.limits?.savings || 0}% del ingreso`,
      iconClass: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  ])

  const showSavingDistributionForm = ref(false)
  const createSavingDistributionForm = () => {
    showSavingDistributionForm.value = true
  }
  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }
</script>

<template>
  <div v-if="plan?.id" class="space-y-4">
    <!-- ── Main content ────────────────────────────────────────────────────── -->

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

              <Badge v-if="plan.isShared" variant="warning" size="xs">
                <Icon name="group" size="xs" />
                Compartido
              </Badge>
            </div>
          </div>

          <Text size="sm" color="muted" class="flex items-center gap-1">
            Análisis mensual · Estrategia
            <Badge variant="secondary" size="xs">{{ strategyInfo?.label }}</Badge>
          </Text>
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

    <div class="px-4">
      <Card class="flex p-4">
        <div class="flex flex-1 items-center gap-2">
          <IconBadge icon="account_balance" variant="primary" size="md" />
          <div>
            <Label variant="section" text="Ingreso total esperado" color="muted" />
            <Text color="black" size="xl" weight="bold">
              {{ formatCurrency(expectedAmount!, financesStore.defaultCurrency, 2) }}
              <span class="text-sm uppercase text-slate-500">
                {{ financesStore.defaultCurrency }}
              </span>
            </Text>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="place-items-end">
            <Label variant="form" text="Fuentes de ingreso" color="muted" />
            <Text color="muted" size="sm" weight="bold">
              {{ sources?.join(', ') }}
            </Text>
          </div>
          <div class="place-items-end text-end">
            <Label variant="form" text="Ultima actualización" color="muted" />
            <Text color="muted" size="sm" weight="bold">
              {{ DateUtils.formatSmartDate(lastUpdate!) }}
            </Text>
          </div>
        </div>
      </Card>
    </div>

    <!-- ── Summary metric cards ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="card in metricCards" :key="card.id" v-bind="card" />
    </div>

    <!-- ── Strategy insight ────────────────────────────────────────────── -->

    <div class="grid gap-6 px-4 lg:grid-cols-2">
      <!-- LEFT: Distribución -->
      <BudgetDistribution />

      <!-- RIGHT: Desglose de Ahorros -->
      <SavingsDistribution @open-form="createSavingDistributionForm" />
    </div>
    <div class="px-4">
      <ExpensePlannedSection :budget-id="budgetId" @open-form="openForm" />
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
