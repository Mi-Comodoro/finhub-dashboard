<script setup lang="ts">
  // =========================
  // Imports
  // =========================
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  // UI
  import { AlertBanner, Button, Heading, Text } from '@/components/atoms'
  import { BudgetDonutChart } from '@/components/molecules'
  import { OnboardingWizard } from '@/components/organisms'
  import { ModalWizard } from '@/components/organisms/modal-wizard'
  import { useCommon } from '@/composables/useCommon'
  // Composables
  import { useSetup } from '@/composables/useSetup'
  // Stores
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  // Utils
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'

  // Types

  // =========================
  // Router & Stores
  // =========================
  const router = useRouter()

  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()

  // =========================
  // Composables
  // =========================

  const {
    budgetMissingMessage,
    budgetWarningMessage,
    isUsingPreviousBudget,
    load,
    handleCompleteSetup,
    openOnboarding
  } = useSetup()
  const { currentBudget, budgetStatus } = useCommon()

  const isPageLoading = ref(true)

  // =========================
  // Computeds
  // =========================
  const expectedAmount = computed(() => plannedIncomeStore.expectedIncome)
  const buckets = computed(() => plannedIncomeStore.buckets)
  const currency = computed(() => financesStore.defaultCurrency)
  const totalExpenses = computed(() => 0)

  const available = computed(() =>
    subtractAmounts(
      subtractAmounts(expectedAmount.value, buckets.value.savingsAmount, currency.value),
      totalExpenses.value,
      currency.value
    )
  )

  const categories = computed(() => {
    if (!currentBudget.value) return []

    const cur = currency.value

    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(expectedAmount.value, currentBudget.value.limits.needs, cur),
        spent: 0,
        percentage: currentBudget.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants' as const,
        budgeted: percentOf(expectedAmount.value, currentBudget.value.limits.wants, cur),
        spent: 0,
        percentage: currentBudget.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(expectedAmount.value, currentBudget.value.limits.savings, cur),
        spent: 0,
        percentage: currentBudget.value.limits.savings
      }
    ]
  })

  const strategyInfo = computed(() => {
    if (!currentBudget.value) return null
    const isBalanced = currentBudget.value.strategy === 'BALANCED'
    return {
      label: isBalanced ? '50/30/20' : 'Personalizada',
      icon: isBalanced ? 'auto_awesome' : 'tune',
      title: isBalanced ? 'Regla del 50/30/20' : 'Distribución personalizada',
      description: isBalanced
        ? 'Método de presupuesto diseñado por Elizabeth Warren: la mitad del ingreso cubre necesidades esenciales, el 30% para gastos flexibles y el 20% se destina al ahorro e inversión. Ideal para construir hábitos financieros saludables.'
        : `Este presupuesto usa una distribución ajustada a tus necesidades: ${currentBudget.value.limits.needs}% para gastos fijos, ${currentBudget.value.limits.wants}% para gastos variables y ${currentBudget.value.limits.savings}% para ahorro. Puedes modificar los porcentajes en cualquier momento.`
    }
  })

  // =========================
  // Lifecycle
  // =========================
  onMounted(async () => {
    try {
      await load()
    } finally {
      isPageLoading.value = false
    }
  })

  // =========================
  // Page Meta
  // =========================
  definePageMeta({
    layout: 'dashboard',
    title: 'Dashboard',
    breadcrumb: 'Dashboard'
  })
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Dashboard Header -->

    <!-- Quick Actions -->
    <div class="flex items-center justify-between">
      <div class="md:pr-4 xl:pr-0">
        <div class="mb-2 flex items-center gap-2">
          <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
            Tu Plan Financiero
          </Heading>
          <Badge
            bold
            :rounded="false"
            :variant="budgetStatus === 'PLANNED' ? 'warning' : 'secondary'"
            class-name="uppercase"
          >
            {{ budgetStatus === 'PLANNED' ? 'Planificado' : 'En Ejecución' }}
          </Badge>
        </div>

        <Text size="sm" color="muted">
          Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.
        </Text>
      </div>
      <div v-if="budgetStatus !== 'PLANNED'" class="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon="download">Reporte</Button>
        <Button variant="primary" size="sm" icon="add">Nueva Transacción</Button>
      </div>
    </div>
    <AlertBanner
      v-if="isUsingPreviousBudget"
      title="Presupuesto desactualizado"
      variant="warning"
      icon="warning"
    >
      <Text size="sm" color="warning">
        {{ budgetWarningMessage }}
      </Text>
    </AlertBanner>

    <AlertBanner
      v-else-if="budgetMissingMessage"
      title="Presupuesto pendiente"
      variant="warning"
      icon="warning"
    >
      <Text size="sm" color="warning">
        {{ budgetMissingMessage }}
      </Text>
    </AlertBanner>
    <div
      v-if="isPageLoading"
      class="mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <div
        v-for="item in 4"
        :key="item"
        class="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
      />
    </div>

    <div
      v-else-if="expectedAmount"
      class="mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <FinancialProgressCard
        :title="'Ingresos'"
        title-color="white"
        text-color="white"
        :amount="expectedAmount"
        icon-name="account_balance_wallet"
        icon-text-class="text-primary-500"
        currency-text-class="text-yellow-300"
        class="!bg-primary-900"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Ahorro Sugerido/Mes'"
        title-color="white"
        text-color="white"
        :amount="buckets.savingsAmount"
        icon-name="savings"
        icon-text-class="text-primary-500"
        currency-text-class="text-yellow-300"
        class="!bg-primary-900"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Disponible'"
        title-color="white"
        text-color="white"
        :amount="available"
        icon-name="payments"
        icon-text-class="text-primary-500"
        currency-text-class="text-yellow-300"
        class="!bg-primary-900"
        variant="accent"
      />

      <FinancialProgressCard
        v-if="budgetStatus === 'PLANNED'"
        title-color="white"
        text-color="white"
        icon-mark="savings"
        icon-text-class="text-primary-500"
      >
        <template #body>
          <div class="flex flex-col justify-between">
            <div class="p-1">
              <Text color="muted" size="sm" class="leading-relaxed">
                Ahora es el momento de definir cómo vas a ahorrar tu
                <strong>{{ currentBudget?.limits.savings }}%</strong>
              </Text>
            </div>
            <div class="z-10 flex items-center justify-end gap-2">
              <Button size="sm" @click="router.push(`/dashboard/goals`)">Definir Metas</Button>
            </div>
          </div>
        </template>
      </FinancialProgressCard>
      <FinancialProgressCard
        v-else
        title-color="white"
        text-color="white"
        icon-mark="savings"
        icon-text-class="text-primary-500"
      >
        <template #body>
          <div class="flex flex-col justify-between">
            <div class="p-1">
              <Text color="muted" size="sm" class="leading-relaxed">
                El Presupuesto esta en
                <strong>Ejecucion</strong>
                , puedes gestionar tu presupesto
              </Text>
            </div>
            <div class="z-10 flex items-center justify-end gap-2">
              <Button size="sm" @click="router.push(`/dashboard/budget/${currentBudget?.id}`)">
                Ver Presupuesto
              </Button>
            </div>
          </div>
        </template>
      </FinancialProgressCard>
    </div>
    <!--  -->
    <Tips v-if="strategyInfo" :icon="strategyInfo.icon" :title="strategyInfo.title">
      <Text size="sm" class="mb-3 leading-relaxed">{{ strategyInfo.description }}</Text>
    </Tips>
    <div v-if="currentBudget" class="mb-8 grid grid-cols-1">
      <!-- Budget Distribution -->
      <div
        class="rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <Heading level="h3" size="lg" weight="semibold">
            {{
              budgetStatus === 'PLANNED'
                ? 'Planificacion del Presupuesto'
                : 'Estado del Presupuesto'
            }}
          </Heading>
          <Badge
            size="sm"
            class="ml-2"
            :variant="currentBudget?.strategy === 'BALANCED' ? 'primary' : 'secondary'"
          >
            {{ currentBudget?.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada' }}
          </Badge>
        </div>

        <div class="flex items-center gap-6 p-5">
          <!-- Donut (left, fixed size) -->
          <div class="shrink-0">
            <ClientOnly>
              <BudgetDonutChart
                :items="categories"
                :total="expectedAmount"
                :currency="currency"
                :show-legend="false"
              />
              <template #fallback>
                <div class="h-44 w-44 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
              </template>
            </ClientOnly>
          </div>

          <!-- Execution bars (right) -->
          <div class="min-w-0 flex-1 space-y-4">
            <div v-for="cat in categories" :key="cat.id" class="space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    :class="[
                      'h-3 w-3 shrink-0 rounded-full',
                      cat.type === 'needs'
                        ? 'bg-teal-500'
                        : cat.type === 'wants'
                          ? 'bg-indigo-500'
                          : 'bg-yellow-400'
                    ]"
                  />
                  <Text size="sm" class="truncate">
                    {{ cat.name }}
                    <span class="text-slate-400">({{ cat.percentage }}%)</span>
                  </Text>
                </div>
                <Text size="sm" weight="semibold" class="shrink-0">
                  {{ formatCurrency(cat.budgeted, currency) }}
                </Text>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <!-- fills with cat.spent / cat.budgeted × 100 once transactions load -->
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-700',
                    cat.type === 'needs'
                      ? 'bg-teal-500'
                      : cat.type === 'wants'
                        ? 'bg-indigo-500'
                        : 'bg-yellow-400'
                  ]"
                  :style="{
                    width:
                      cat.budgeted > 0
                        ? `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%`
                        : '0%'
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!isPageLoading"
      class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <Heading level="h3" size="lg" weight="semibold" class="mb-2">
        No hay un presupuesto cargado para mostrar
      </Heading>
      <Text size="sm" color="muted" class="mx-auto max-w-2xl">
        {{
          budgetMissingMessage ||
          'Todavia no encontramos un presupuesto disponible para este periodo. Revisa tus presupuestos y crea manualmente el nuevo mes cuando corresponda.'
        }}
      </Text>
      <div class="mt-4 flex justify-center">
        <Button size="sm" @click="router.push('/dashboard/budget')">Ir a Presupuestos</Button>
      </div>
    </div>
    <!-- Onboarding Wizard -->
    <ModalWizard :show="openOnboarding" class="px-8">
      <OnboardingWizard ref="wizardRef" @completed="handleCompleteSetup" />
    </ModalWizard>
  </div>
</template>

<style scoped></style>
