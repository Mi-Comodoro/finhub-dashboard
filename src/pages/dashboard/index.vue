<script setup lang="ts">
  // Referencia al wizard para poder llamar tryComplete
  import { computed, onMounted, ref } from 'vue'

  import { Button, Card, Heading, MetricCard, Text } from '@/components/atoms'
  import { BudgetDonutChart } from '@/components/molecules'
  import { OnboardingWizard } from '@/components/organisms'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'
  import { ModalWizard } from '@/components/organisms/modal-wizard'
  import { useBudget } from '@/composables/useBudget'
  import { useAuthStore } from '@/stores/auth.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'

  const authStore = useAuthStore()

  const showWizard = ref(false)

  // Solo una función handleWizardCompleted, tipada correctamente

  function handleWizardCompleted() {
    showWizard.value = false
  }

  definePageMeta({
    layout: 'dashboard'
  })

  const { fetchCurrentBudget } = useBudget()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  onMounted(() => {
    fetchCurrentBudget()
    // Mostrar wizard si el usuario necesita onboarding
    setTimeout(() => {
      if (authStore.needsOnboarding()) {
        showWizard.value = true
      } else {
        const { showModal } = useModalNotification()
        showModal('info', {
          title: 'Onboarding completado',
          message: 'Tu perfil ya está configurado. ¡Bienvenido!',
          actionLabel: undefined
        })
      }
    }, 500)
  })

  const currency = computed(() => financesStore.defaultCurrency)

  const totalIncome = computed(() => budgetStore.currentBudgetPlan?.totalIncome ?? 0)

  // Expenses start at 0 until transactions are loaded
  const totalExpenses = computed(() => 0)

  const savingsAmount = computed(() =>
    percentOf(totalIncome.value, budgetStore.currentBudgetPlan?.limits.savings ?? 0, currency.value)
  )

  // Available = (totalIncome - savingsAmount) - expenses
  const available = computed(() =>
    subtractAmounts(
      subtractAmounts(totalIncome.value, savingsAmount.value, currency.value),
      totalExpenses.value,
      currency.value
    )
  )

  // Budget used = totalExpenses / spendable income (income - savings)
  const categories = computed(() => {
    const plan = budgetStore.currentBudgetPlan
    if (!plan) return []
    const cur = currency.value
    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(plan.totalIncome, plan.limits.needs, cur),
        spent: 0,
        percentage: plan.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants' as const,
        budgeted: percentOf(plan.totalIncome, plan.limits.wants, cur),
        spent: 0,
        percentage: plan.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(plan.totalIncome, plan.limits.savings, cur),
        spent: 0,
        percentage: plan.limits.savings
      }
    ]
  })
</script>

<template>
  <div class="space-y-8 p-6">
    <!-- Dashboard Header -->

    <!-- Quick Actions -->
    <div class="flex items-center justify-between">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
          Dashboard Financiero
        </Heading>
        <Text size="sm" color="muted">
          Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.
        </Text>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon="download">Reporte</Button>
        <Button variant="primary" size="sm" icon="add">Nueva Transacción</Button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="mb-8 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Ingreso Total"
        :value="totalIncome"
        :currency-code="currency"
        icon="account_balance_wallet"
        variant="income"
      />

      <MetricCard
        title="Gastos Totales"
        :value="totalExpenses"
        :currency-code="currency"
        icon="receipt_long"
        variant="expense"
      />
      <MetricCard
        title="Ahorro e Inversiones"
        :value="savingsAmount"
        :currency-code="currency"
        icon="trending_up"
        variant="neutral"
        icon-class="bg-yellow-200 text-yellow-700"
      />
      <MetricCard
        title="Disponible"
        :value="available"
        :currency-code="currency"
        icon="savings"
        variant="available"
      />
    </div>

    <!-- Budget Overview -->
    <div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Budget Distribution -->
      <div
        class="rounded-2xl border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <Heading level="h3" size="lg" weight="semibold">Distribución del Presupuesto</Heading>
          <Badge
            size="sm"
            class="ml-2"
            :variant="
              budgetStore.currentBudgetPlan?.strategy === 'BALANCED' ? 'primary' : 'secondary'
            "
          >
            {{
              budgetStore.currentBudgetPlan?.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada'
            }}
          </Badge>
        </div>

        <div class="flex items-center gap-6 p-5">
          <!-- Donut (left, fixed size) -->
          <div class="shrink-0">
            <ClientOnly>
              <BudgetDonutChart
                :items="categories"
                :total="totalIncome"
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

      <!-- Right Sidebar Placeholder -->
      <Card
        class-name="rounded-xl border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
      >
        <Heading level="h3" size="lg" weight="semibold" class="mb-4">Alertas Inteligentes</Heading>
        <Text color="muted">
          Próximamente: Alertas personalizadas y sugerencias inteligentes...
        </Text>
      </Card>
    </div>

    <!-- Recent Transactions Placeholder -->
    <Card
      class-name="rounded-xl border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
    >
      <Heading level="h3" size="lg" weight="semibold" class="mb-4">Transacciones Recientes</Heading>
      <Text color="muted">Próximamente: Lista de transacciones recientes...</Text>
    </Card>

    <!-- Onboarding Wizard -->
    <ModalWizard :show="showWizard" class="px-8">
      <OnboardingWizard ref="wizardRef" @completed="handleWizardCompleted" />
    </ModalWizard>
  </div>
</template>

<style scoped></style>
