<!-- components/business/TransactionMetricsBar.vue -->
<script setup lang="ts">
  withDefaults(
    defineProps<{
      totalIncome?: number
      totalExpense?: number
      totalSavings?: number
      countIncome?: number
      countExpense?: number
      countSavings?: number
      currency?: Currency
    }>(),
    {
      totalIncome: 0,
      totalExpense: 0,
      totalSavings: 0,
      countIncome: 0,
      countExpense: 0,
      countSavings: 0,
      currency: 'COP'
    }
  )
</script>

<template>
  <div class="transaction-metrics-bar">
    <Card class="transaction-metrics-bar__card">
      <Text size="xs" color="muted">Total ingresos</Text>
      <Text size="lg" weight="bold" class="transaction-metrics-bar__value--income">
        +{{ formatCurrency(totalIncome, currency) }}
      </Text>
      <Text size="xs" color="muted">{{ countIncome }} transacciones</Text>
    </Card>
    <Card class="transaction-metrics-bar__card">
      <Text size="xs" color="muted">Total gastos</Text>
      <Text size="lg" weight="bold">-{{ formatCurrency(totalExpense, currency) }}</Text>
      <Text size="xs" color="muted">{{ countExpense }} transacciones</Text>
    </Card>
    <Card class="transaction-metrics-bar__card">
      <Text size="xs" color="muted">Total ahorros</Text>
      <Text size="lg" weight="bold" class="transaction-metrics-bar__value--savings">
        {{ formatCurrency(totalSavings, currency) }}
      </Text>
      <Text size="xs" color="muted">{{ countSavings }} transacciones</Text>
    </Card>
  </div>
</template>

<style scoped lang="postcss">
  .transaction-metrics-bar {
    @apply grid grid-cols-1 gap-3 sm:grid-cols-3;
  }
  .transaction-metrics-bar__card {
    @apply space-y-1;
  }
  .transaction-metrics-bar__value--income {
    @apply text-success-700 dark:text-neutral-100;
  }
  .transaction-metrics-bar__value--savings {
    @apply text-warning-700 dark:text-neutral-100;
  }
</style>
