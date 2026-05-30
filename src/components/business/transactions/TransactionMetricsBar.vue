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
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <Card class="space-y-1">
      <Text size="xs" color="muted">Total ingresos</Text>
      <Text size="lg" weight="bold" class="text-success-700">
        +{{ formatCurrency(totalIncome, currency) }}
      </Text>
      <Text size="xs" color="muted">{{ countIncome }} transacciones</Text>
    </Card>
    <Card class="space-y-1">
      <Text size="xs" color="muted">Total gastos</Text>
      <Text size="lg" weight="bold" class="text-danger-700">
        -{{ formatCurrency(totalExpense, currency) }}
      </Text>
      <Text size="xs" color="muted">{{ countExpense }} transacciones</Text>
    </Card>
    <Card class="space-y-1">
      <Text size="xs" color="muted">Total ahorros</Text>
      <Text size="lg" weight="bold" class="text-warning-700">
        {{ formatCurrency(totalSavings, currency) }}
      </Text>
      <Text size="xs" color="muted">{{ countSavings }} transacciones</Text>
    </Card>
  </div>
</template>
