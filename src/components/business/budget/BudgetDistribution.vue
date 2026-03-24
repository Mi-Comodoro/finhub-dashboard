<script setup lang="ts">
  import type { BudgetDonutItem } from '@/components/molecules'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useExpensesStore } from '@/stores/expense.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'

  const budgetStore = useBudgetStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const financesStore = useFinancesStore()
  const expenseStore = useExpensesStore()

  const currency = computed(() => financesStore.defaultCurrency)
  const expectedAmount = computed(() =>
    plannedIncomeStore.summary?.reduce((acc, b) => acc + Number(b.amount), 0)
  )
  const plan = computed(() => budgetStore.budgetSelected)

  // ─── Derived amounts ──────────────────────────────────────────────────────
  const needsAmount = computed(() =>
    plan.value ? percentOf(expectedAmount.value!, plan.value.limits.needs, currency.value) : 0
  )
  const wantsAmount = computed(() =>
    plan.value ? percentOf(expectedAmount.value!, plan.value.limits.wants, currency.value) : 0
  )
  const savingsAmount = computed(() =>
    plan.value ? percentOf(expectedAmount.value!, plan.value.limits.savings, currency.value) : 0
  )

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

  const donutItems = computed<BudgetDonutItem[]>(() => {
    if (!plan.value) return []
    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs',
        budgeted: needsAmount.value,
        percentage: plan.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants',
        budgeted: wantsAmount.value,
        percentage: plan.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings',
        budgeted: savingsAmount.value,
        percentage: plan.value.limits.savings
      }
    ]
  })
  const options = computed(() => {
    if (!plan.value) return []
    return [
      {
        title: 'Gastos Fijos',
        percentage: plan.value.limits.needs,
        amount: needsAmount.value,
        currency: currency.value,
        className: 'bg-teal-500',
        progress: getProgress(needsAmount.value, 'needs')
      },
      {
        title: 'Gastos Variables',
        percentage: plan.value.limits.wants,
        amount: wantsAmount.value,
        currency: currency.value,
        className: 'bg-indigo-500',
        progress: getProgress(wantsAmount.value, 'wants')
      },
      {
        title: 'Ahorro e Inversiones',
        percentage: plan.value.limits.savings,
        amount: savingsAmount.value,
        currency: currency.value,
        className: 'bg-yellow-400',
        progress: getProgress(savingsAmount.value, 'savings')
      }
    ]
  })

  const getProgress = (amount: number, bucketName: string) => {
    // 1. Sumamos solo los gastos que pertenecen al bucket solicitado
    const totalBucket = expenseStore.expenses
      .filter(expense => expense.bucket === bucketName)
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)

    // 2. Calculamos el porcentaje (evitando división por cero)
    if (amount === 0) return 0

    const percentage = (totalBucket / amount) * 100
    return percentage
  }
</script>
<template>
  <SectionCard title="Proyeccion de Gastos Planificado">
    <!-- Añadimos xl:gap-4 para que no estén tan lejos y xl:max-w-4xl para que no estiren al infinito -->
    <div
      class="mx-auto grid grid-cols-1 xl:max-w-5xl xl:grid-cols-[auto_1fr] xl:items-center xl:gap-2 xl:px-4"
    >
      <!-- Cambiamos m-auto por xl:m-0 y ajustamos el padding -->
      <div class="m-auto shrink-0 p-4 xl:m-0 xl:p-2">
        <ClientOnly>
          <BudgetDonutChart
            :items="donutItems"
            :total="expectedAmount"
            :currency="currency"
            :show-legend="false"
          />
          <template #fallback>
            <div class="h-44 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </template>
        </ClientOnly>
      </div>

      <!-- Reducimos el padding de las barras y las alineamos a la izquierda -->
      <div class="w-full p-4 xl:py-2 xl:pl-0 xl:pr-0">
        <BudgetCategoryRow
          v-for="(option, index) in options"
          :key="index"
          :label="option.title"
          :percentage="option.percentage"
          :amount="option.amount"
          :currency="option.currency"
          :color="option.className"
          :progress="option.progress"
        />
      </div>
    </div>

    <AlertBanner
      v-if="strategyInfo"
      variant="secondary"
      :icon="strategyInfo.icon"
      :title="strategyInfo.title"
      class="m-5"
    >
      <Text size="sm" class="mb-3 leading-relaxed">{{ strategyInfo.description }}</Text>
    </AlertBanner>
  </SectionCard>
</template>
<style lang="postcss" scoped></style>
