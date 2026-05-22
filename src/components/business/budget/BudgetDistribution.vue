<script setup lang="ts">
  import { useBudgetDetailApplication } from '@/composables/application/useBudgetDetailApplication'
  import { useBudgetInsightsPresenter } from '@/composables/presenters/useBudgetInsightsPresenter'
  import { getPercentage, percentOf } from '@/utils/currency'

  const {
    budgetSelected: plan,
    defaultCurrency: currency,
    expectedIncome,
    needsSpent,
    wantsSpent
  } = useBudgetDetailApplication()
  const { receivedIncome, generatedSavings } = useBudgetInsightsPresenter()

  const isBalanced = computed(() => plan.value?.strategy === 'BALANCED')
  const isActive = computed(() => plan.value?.status === 'ACTIVE')

  // When ACTIVE use actual received income as base (same as dashboard); otherwise use planned
  const incomeBase = computed(() =>
    isActive.value ? receivedIncome.value : (expectedIncome.value ?? 0)
  )

  const needsAmount = computed(() => {
    if (!plan.value) return 0
    return percentOf(incomeBase.value, plan.value.limits.needs, currency.value)
  })
  const wantsAmount = computed(() => {
    if (!plan.value) return 0
    return percentOf(incomeBase.value, plan.value.limits.wants, currency.value)
  })
  const savingsAmount = computed(() => {
    if (!plan.value) return 0
    return percentOf(incomeBase.value, plan.value.limits.savings, currency.value)
  })

  const needsProgress = computed(() => getPercentage(needsAmount.value, needsSpent.value))
  const wantsProgress = computed(() => getPercentage(wantsAmount.value, wantsSpent.value))
  // Use totalSavingTarget (pending + completed, non-skipped) to match dashboard logic
  const savingProgress = computed(() => getPercentage(savingsAmount.value, generatedSavings.value))

  const options = computed(() => {
    if (!plan.value) return []
    return [
      {
        title: 'Gastos Fijos',
        percentage: plan.value.limits.needs,
        amount: needsAmount.value,
        currency: currency.value,
        className: 'bg-teal-500',
        progress: needsProgress.value
      },
      {
        title: 'Gastos Variables',
        percentage: plan.value.limits.wants,
        amount: wantsAmount.value,
        currency: currency.value,
        className: 'bg-indigo-500',
        progress: wantsProgress.value
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
