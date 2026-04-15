<script setup lang="ts">
  import { useBudgetDetailApplication } from '@/composables/application/useBudgetDetailApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { useSavingPlannedApplication } from '@/composables/application/useSavingPlannedApplication'

  const { budgetSelected: plan, defaultCurrency: currency } = useBudgetDetailApplication()
  const { savingProgress, savingsAmount } = useSavingPlannedApplication()
  const { needsProgress, wantsProgress, needsAmount, wantsAmount } = useExpenseApplication()

  // ─── Derived amounts ──────────────────────────────────────────────────────

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
