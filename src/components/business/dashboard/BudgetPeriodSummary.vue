<script setup lang="ts">
  import { computed } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Text from '@/components/atoms/typography/Text.vue'

  interface Props {
    month?: string
    year?: number
    budgetStatus?: 'PLANNED' | 'ACTIVE' | 'CLOSED'
    incomeReceived?: number
    incomeExpected?: number
    expensesPaid?: number
    expensesPlanned?: number
    savingsGenerated?: number
    savingsTarget?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    month: '',
    year: 0,
    budgetStatus: 'ACTIVE',
    incomeReceived: 0,
    incomeExpected: 0,
    expensesPaid: 0,
    expensesPlanned: 0,
    savingsGenerated: 0,
    savingsTarget: 0
  })

  const today = new Date()

  const periodDate = computed(() => {
    if (!props.month || !props.year) return today
    const monthIndex = Number(props.month) - 1
    return new Date(props.year, isNaN(monthIndex) ? today.getMonth() : monthIndex, 1)
  })

  const periodLabel = computed(() =>
    periodDate.value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  )

  const daysInMonth = computed(() => {
    const d = periodDate.value
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  })

  const dayOfMonth = computed(() => {
    const d = periodDate.value
    const isSameMonth = today.getMonth() === d.getMonth() && today.getFullYear() === d.getFullYear()
    if (!isSameMonth) return daysInMonth.value
    return today.getDate()
  })

  const daysProgress = computed(() =>
    Math.min(Math.round((dayOfMonth.value / daysInMonth.value) * 100), 100)
  )

  const statusVariant = computed(() => {
    if (props.budgetStatus === 'PLANNED') return 'warning'
    if (props.budgetStatus === 'CLOSED') return 'secondary'
    return 'primary'
  })

  const statusLabel = computed(() => {
    if (props.budgetStatus === 'PLANNED') return 'Planificado'
    if (props.budgetStatus === 'CLOSED') return 'Cerrado'
    return 'En ejecución'
  })

  function pct(value: number, total: number): number {
    if (!total) return 0
    return Math.min(Math.round((value / total) * 100), 100)
  }

  const incomePct = computed(() => pct(props.incomeReceived, props.incomeExpected))
  const expensePct = computed(() => pct(props.expensesPaid, props.expensesPlanned))
  const savingsPct = computed(() => pct(props.savingsGenerated, props.savingsTarget))

  const metrics = computed(() => [
    {
      label: 'Ingresos',
      pct: incomePct.value,
      fillClass: 'budget-summary__metric-fill--income',
      textClass: incomePct.value >= 80 ? 'budget-summary__metric-value--good' : ''
    },
    {
      label: 'Gastos',
      pct: expensePct.value,
      fillClass: 'budget-summary__metric-fill--expense',
      textClass: expensePct.value >= 90 ? 'budget-summary__metric-value--warn' : ''
    },
    {
      label: 'Ahorro',
      pct: savingsPct.value,
      fillClass: 'budget-summary__metric-fill--savings',
      textClass: savingsPct.value >= 80 ? 'budget-summary__metric-value--good' : ''
    }
  ])
</script>

<template>
  <div class="budget-summary">
    <!-- Header -->
    <div class="budget-summary__header">
      <div class="budget-summary__title-row">
        <span class="material-symbols-outlined budget-summary__icon">calendar_month</span>
        <Text size="sm" weight="semibold" class="budget-summary__period">
          {{ periodLabel }}
        </Text>
        <Badge :variant="statusVariant" size="xs">{{ statusLabel }}</Badge>
      </div>
      <Text size="xs" color="muted" class="budget-summary__days">
        Día {{ dayOfMonth }} de {{ daysInMonth }} · {{ daysProgress }}%
      </Text>
    </div>

    <!-- Barra de progreso del mes -->
    <div class="budget-summary__days-track">
      <div class="budget-summary__days-fill" :style="{ width: `${daysProgress}%` }" />
    </div>

    <!-- Métricas de ejecución -->
    <div class="budget-summary__metrics">
      <div v-for="metric in metrics" :key="metric.label" class="budget-summary__metric">
        <div class="budget-summary__metric-header">
          <Text size="xs" color="muted">{{ metric.label }}</Text>
          <span class="budget-summary__metric-value" :class="metric.textClass">
            {{ metric.pct }}%
          </span>
        </div>
        <div class="budget-summary__metric-track">
          <div
            class="budget-summary__metric-fill"
            :class="metric.fillClass"
            :style="{ width: `${metric.pct}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-summary {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4;
  }

  .budget-summary__header {
    @apply flex items-center justify-between gap-2;
  }

  .budget-summary__title-row {
    @apply flex items-center gap-2;
  }

  .budget-summary__icon {
    @apply text-base text-neutral-400;
  }

  .budget-summary__period {
    @apply capitalize;
  }

  .budget-summary__days {
    @apply shrink-0;
  }

  /* Barra de días */
  .budget-summary__days-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .budget-summary__days-fill {
    @apply h-full rounded-full bg-neutral-400 transition-all duration-700;
  }

  /* Métricas */
  .budget-summary__metrics {
    @apply grid grid-cols-3 gap-4;
  }

  .budget-summary__metric {
    @apply flex flex-col gap-1;
  }

  .budget-summary__metric-header {
    @apply flex items-center justify-between;
  }

  .budget-summary__metric-value {
    @apply text-xs font-bold text-neutral-700;
  }

  .budget-summary__metric-value--good {
    @apply text-success-600;
  }

  .budget-summary__metric-value--warn {
    @apply text-danger-600;
  }

  .budget-summary__metric-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .budget-summary__metric-fill {
    @apply h-full rounded-full transition-all duration-700;
  }

  .budget-summary__metric-fill--income {
    @apply bg-primary-500;
  }

  .budget-summary__metric-fill--expense {
    @apply bg-danger-400;
  }

  .budget-summary__metric-fill--savings {
    @apply bg-warning-500;
  }
</style>
