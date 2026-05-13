<script setup lang="ts">
  import { computed } from 'vue'

  import { Badge, Heading, Text } from '@/components/atoms'
  import { formatCurrency } from '@/utils/currency'

  interface Bill {
    name: string
    daysUntilDue: number
    amount: number
  }

  interface Props {
    bills?: Bill[]
    currencyCode?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    bills: undefined,
    currencyCode: 'COP'
  })

  const mockBills: Bill[] = [
    { name: 'Tarjeta Bancolombia', daysUntilDue: 2, amount: 450000 },
    { name: 'Préstamo vehículo', daysUntilDue: 8, amount: 1200000 },
    { name: 'Netflix + Spotify', daysUntilDue: 18, amount: 85000 }
  ]

  const displayBills = computed(() =>
    props.bills && props.bills.length > 0 ? props.bills : mockBills
  )

  const totalCommitted = computed(() => displayBills.value.reduce((sum, b) => sum + b.amount, 0))

  type UrgencyVariant = 'danger' | 'warning' | 'primary'

  function getUrgency(days: number): {
    variant: UrgencyVariant
    label: string
    dotClass: string
  } {
    if (days <= 3)
      return { variant: 'danger', label: 'Urgente', dotClass: 'bills-card__dot--urgent' }
    if (days <= 7)
      return { variant: 'warning', label: 'Esta semana', dotClass: 'bills-card__dot--soon' }
    return { variant: 'primary', label: 'Al día', dotClass: 'bills-card__dot--ok' }
  }
</script>

<template>
  <div class="bills-card">
    <div class="bills-card__header">
      <Heading level="h3" size="sm" weight="semibold">Próximos vencimientos</Heading>
      <Badge variant="warning" size="xs">Próximamente</Badge>
    </div>

    <div class="bills-card__list">
      <div v-for="bill in displayBills" :key="bill.name" class="bills-card__item">
        <span class="bills-card__dot" :class="getUrgency(bill.daysUntilDue).dotClass" />
        <div class="bills-card__item-info">
          <p class="bills-card__item-name">{{ bill.name }}</p>
          <p class="bills-card__item-days">
            {{ bill.daysUntilDue <= 0 ? 'Vence hoy' : `Vence en ${bill.daysUntilDue} días` }}
          </p>
        </div>
        <div class="bills-card__item-right">
          <Text size="sm" weight="semibold">{{ formatCurrency(bill.amount, currencyCode) }}</Text>
          <Badge :variant="getUrgency(bill.daysUntilDue).variant" size="xs">
            {{ getUrgency(bill.daysUntilDue).label }}
          </Badge>
        </div>
      </div>
    </div>

    <div class="bills-card__footer">
      <div class="bills-card__footer-row">
        <Text size="xs" color="muted">Total comprometido este mes</Text>
        <Text size="sm" weight="bold">{{ formatCurrency(totalCommitted, currencyCode) }}</Text>
      </div>
    </div>

    <div class="bills-card__action">
      <Text size="xs" color="muted">Módulo de deudas y facturas en desarrollo</Text>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .bills-card {
    @apply flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4;
  }

  .bills-card__header {
    @apply flex items-center justify-between;
  }

  .bills-card__list {
    @apply flex flex-col gap-2;
  }

  .bills-card__item {
    @apply flex items-center gap-3 rounded-md bg-slate-50 p-2.5;
  }

  .bills-card__dot {
    @apply h-2.5 w-2.5 shrink-0 rounded-full;
  }

  .bills-card__dot--urgent {
    @apply bg-danger-500;
  }

  .bills-card__dot--soon {
    @apply bg-warning-500;
  }

  .bills-card__dot--ok {
    @apply bg-primary-500;
  }

  .bills-card__item-info {
    @apply min-w-0 flex-1;
  }

  .bills-card__item-name {
    @apply truncate text-sm font-medium text-neutral-700;
  }

  .bills-card__item-days {
    @apply text-xs text-slate-500;
  }

  .bills-card__item-right {
    @apply flex flex-col items-end gap-1;
  }

  .bills-card__footer {
    @apply border-t border-slate-100 pt-3;
  }

  .bills-card__footer-row {
    @apply flex items-center justify-between;
  }

  .bills-card__action {
    @apply pt-1;
  }
</style>
