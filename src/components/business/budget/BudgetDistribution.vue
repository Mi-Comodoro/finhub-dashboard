<script setup lang="ts">
  import { useBudgetStore } from '@/stores/budget.store'
  import { useExpensesStore } from '@/stores/expense.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'

  const budgetStore = useBudgetStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const financesStore = useFinancesStore()
  const expenseStore = useExpensesStore()

  const { savingProgress } = useSavingPlanned()
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

  const isBalanced = plan.value?.strategy === 'BALANCED'

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
        progress: savingProgress.value
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
  <SectionCard
    icon="donut_large"
    icon-variant="primary"
    :title="isBalanced ? 'Distribucion 50/30/20' : 'Distribucion Personalizada'"
  >
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
  </SectionCard>
</template>
<style lang="postcss" scoped></style>
