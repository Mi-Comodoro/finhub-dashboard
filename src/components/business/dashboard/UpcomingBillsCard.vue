<script setup lang="ts">
  import { computed } from 'vue'

  import { Badge, Button, Text } from '@/components/atoms'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import { formatCurrency } from '@/utils/currency'

  interface Reminder {
    id?: string
    name: string
    daysUntilDue: number
    amount: number
    isEssential?: boolean
    type?: 'planned_expense' | 'accounts_payable'
  }

  interface Props {
    bills?: Reminder[]
    currencyCode?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    bills: () => [],
    currencyCode: 'COP'
  })

  const emit = defineEmits<{
    (e: 'view' | 'pay', item: Reminder): void
  }>()

  const displayBills = computed(() => props.bills ?? [])
  const totalCommitted = computed(() => displayBills.value.reduce((sum, b) => sum + b.amount, 0))

  type UrgencyLevel = 'overdue' | 'critical' | 'soon' | 'ok' | 'low'

  function getUrgencyLevel(days: number, isEssential: boolean): UrgencyLevel {
    if (days <= 0) return 'overdue'
    if (days <= 3 && isEssential) return 'critical'
    if (days <= 3 || (days <= 7 && isEssential)) return 'soon'
    if (days <= 7) return 'ok'
    return 'low'
  }

  function getItemClass(days: number, isEssential: boolean): string {
    const map: Record<UrgencyLevel, string> = {
      overdue: 'bills-card__item--overdue',
      critical: 'bills-card__item--critical',
      soon: 'bills-card__item--soon',
      ok: 'bills-card__item--ok',
      low: 'bills-card__item--low'
    }
    return map[getUrgencyLevel(days, isEssential)]
  }

  function getDotClass(days: number, isEssential: boolean): string {
    const map: Record<UrgencyLevel, string> = {
      overdue: 'bills-card__dot--overdue',
      critical: 'bills-card__dot--critical',
      soon: 'bills-card__dot--soon',
      ok: 'bills-card__dot--ok',
      low: 'bills-card__dot--low'
    }
    return map[getUrgencyLevel(days, isEssential)]
  }

  function getDaysClass(days: number, isEssential: boolean): string {
    const level = getUrgencyLevel(days, isEssential)
    if (level === 'overdue' || level === 'critical') return 'bills-card__item-days--urgent'
    if (level === 'soon') return 'bills-card__item-days--soon'
    return 'bills-card__item-days--ok'
  }

  type BadgeVariant = 'danger' | 'warning' | 'secondary'

  function getPriorityBadge(
    isEssential: boolean,
    days: number
  ): { label: string; variant: BadgeVariant } {
    if (!isEssential) return { label: 'Opcional', variant: 'secondary' }
    const level = getUrgencyLevel(days, isEssential)
    if (level === 'overdue' || level === 'critical')
      return { label: 'Obligatorio', variant: 'danger' }
    return { label: 'Obligatorio', variant: 'warning' }
  }

  function getDaysLabel(days: number): string {
    if (days < 0) return `Venció hace ${Math.abs(days)} días`
    if (days === 0) return 'Vence hoy'
    return `Vence en ${days} días`
  }
</script>

<template>
  <div class="bills-card">
    <div class="bills-card__header">
      <CardInfo
        title="Recordatorios"
        sub-title="Gastos y deudas por vencer"
        icon="alarm"
        icon-variant="secondary"
        icon-size="md"
        title-size="sm"
        weight="semibold"
        level="h3"
        sub-title-size="xs"
        sub-title-color="muted"
      />
    </div>

    <div v-if="displayBills.length > 0" class="bills-card__list">
      <div
        v-for="bill in displayBills"
        :key="`${bill.type}-${bill.id ?? bill.name}`"
        class="bills-card__item"
        :class="getItemClass(bill.daysUntilDue, bill.isEssential ?? false)"
      >
        <span
          class="bills-card__dot"
          :class="getDotClass(bill.daysUntilDue, bill.isEssential ?? false)"
        />

        <div class="bills-card__item-info">
          <p class="bills-card__item-name">{{ bill.name }}</p>
          <p class="bills-card__item-amount">{{ formatCurrency(bill.amount, currencyCode) }}</p>
        </div>

        <div class="bills-card__item-right">
          <div class="bills-card__item-meta">
            <span
              class="bills-card__item-days"
              :class="getDaysClass(bill.daysUntilDue, bill.isEssential ?? false)"
            >
              {{ getDaysLabel(bill.daysUntilDue) }}
            </span>
            <Badge
              :variant="getPriorityBadge(bill.isEssential ?? false, bill.daysUntilDue).variant"
              size="xs"
            >
              {{ getPriorityBadge(bill.isEssential ?? false, bill.daysUntilDue).label }}
            </Badge>
          </div>
          <div class="bills-card__item-actions">
            <Button size="sm" variant="ghost" @click="emit('view', bill)">Ver</Button>
            <Button size="sm" variant="primary" @click="emit('pay', bill)">Pagar</Button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bills-card__empty">
      <EmptyStateIllustration type="no-transactions" class="bills-card__empty-illustration" />
      <Text size="sm" color="muted">No tienes pagos pendientes por recordar</Text>
    </div>

    <div class="bills-card__legend">
      <p class="bills-card__legend-title">Cómo leer esta sección</p>
      <div class="bills-card__legend-body">
        <div class="bills-card__legend-group">
          <div class="bills-card__legend-item">
            <span class="bills-card__legend-dot bills-card__dot--overdue" />
            <span>Vencido</span>
          </div>
          <div class="bills-card__legend-item">
            <span class="bills-card__legend-dot bills-card__dot--critical" />
            <span>Urgente (≤ 3 días)</span>
          </div>
          <div class="bills-card__legend-item">
            <span class="bills-card__legend-dot bills-card__dot--soon" />
            <span>Esta semana</span>
          </div>
          <div class="bills-card__legend-item">
            <span class="bills-card__legend-dot bills-card__dot--low" />
            <span>Próximo</span>
          </div>
        </div>
        <div class="bills-card__legend-divider" />
        <div class="bills-card__legend-group">
          <div class="bills-card__legend-item">
            <Badge variant="danger" size="xs">Obligatorio</Badge>
            <span>No se puede diferir</span>
          </div>
          <div class="bills-card__legend-item">
            <Badge variant="secondary" size="xs">Opcional</Badge>
            <span>Puede esperar</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="displayBills.length > 0" class="bills-card__footer">
      <div class="bills-card__footer-row">
        <Text size="xs" color="muted">Total comprometido</Text>
        <Text size="sm" weight="bold">{{ formatCurrency(totalCommitted, currencyCode) }}</Text>
      </div>
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
    @apply grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-0 rounded-md p-3 transition-colors;
  }

  .bills-card__item--overdue {
    @apply border-l-2 border-danger-400 bg-danger-50 pl-2.5;
  }

  .bills-card__item--critical {
    @apply bg-danger-50;
  }

  .bills-card__item--soon {
    @apply bg-warning-50;
  }

  .bills-card__item--ok {
    @apply bg-slate-50;
  }

  .bills-card__item--low {
    @apply bg-slate-50;
  }

  .bills-card__dot {
    @apply mt-1.5 h-2 w-2 shrink-0 rounded-full;
  }

  .bills-card__dot--overdue {
    @apply bg-danger-600;
  }

  .bills-card__dot--critical {
    @apply bg-danger-500;
  }

  .bills-card__dot--soon {
    @apply bg-warning-500;
  }

  .bills-card__dot--ok {
    @apply bg-primary-500;
  }

  .bills-card__dot--low {
    @apply bg-slate-400;
  }

  .bills-card__item-info {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  .bills-card__item-name {
    @apply truncate text-sm font-medium text-neutral-700;
  }

  .bills-card__item-amount {
    @apply text-sm font-semibold text-neutral-900;
  }

  .bills-card__item-right {
    @apply flex flex-col items-end gap-1.5;
  }

  .bills-card__item-meta {
    @apply flex items-center gap-1.5;
  }

  .bills-card__item-days {
    @apply text-xs font-medium;
  }

  .bills-card__item-days--urgent {
    @apply text-danger-600;
  }

  .bills-card__item-days--soon {
    @apply text-warning-600;
  }

  .bills-card__item-days--ok {
    @apply text-slate-500;
  }

  .bills-card__item-actions {
    @apply flex gap-1;
  }

  /* Legend */

  .bills-card__legend {
    @apply rounded-lg border border-slate-100 bg-slate-50 p-3;
  }

  .bills-card__legend-title {
    @apply mb-2 text-xs font-semibold text-slate-500;
  }

  .bills-card__legend-body {
    @apply flex flex-col gap-2;
  }

  .bills-card__legend-group {
    @apply flex flex-wrap gap-x-4 gap-y-1;
  }

  .bills-card__legend-item {
    @apply flex items-center gap-1.5 text-xs text-slate-500;
  }

  .bills-card__legend-dot {
    @apply h-2 w-2 shrink-0 rounded-full;
  }

  .bills-card__legend-divider {
    @apply border-t border-slate-200;
  }

  /* Footer */

  .bills-card__footer {
    @apply border-t border-slate-100 pt-3;
  }

  .bills-card__footer-row {
    @apply flex items-center justify-between;
  }

  .bills-card__empty {
    @apply flex flex-col items-center gap-2 py-4 text-center;
  }

  .bills-card__empty-illustration {
    @apply mx-auto h-16 w-16;
  }
</style>
