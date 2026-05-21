<script setup lang="ts">
  import { Badge, Heading, Text } from '@/components/atoms'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import GoalProgressBar from '@/components/business/savings/GoalProgressBar.vue'
  import { CardInfo } from '@/components/molecules'
  import SidebarPage from '@/components/templates/SidebarPage.vue'
  import type { AccountData, GoalHistory, GoalsData } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  import { GOAL_STATUS_LABELS, type GoalStatus } from '@/utils/goals.utils'
  import type { Currency } from '~/components/organisms/forms/types'

  interface GoalSidebarPanelProps {
    goal?: GoalsData
    history?: GoalHistory[]
    account?: AccountData | null
    progressPercentage?: number
    savedAmount?: number
    totalDeposited?: number
    totalInterest?: number
    currency?: string
    estimatedTimeToGoal?: string
    loading?: boolean
  }

  const props = withDefaults(defineProps<GoalSidebarPanelProps>(), {
    goal: () => ({}) as GoalsData,
    history: () => [],
    account: null,
    progressPercentage: 0,
    savedAmount: 0,
    totalDeposited: 0,
    totalInterest: 0,
    currency: '',
    estimatedTimeToGoal: '',
    loading: false
  })

  const statusLabel = computed(() => {
    const status = (props.goal?.status ?? 'SCHEDULED') as GoalStatus
    return GOAL_STATUS_LABELS[status]
  })

  const statusVariant = computed(() => {
    const status = (props.goal?.status ?? 'SCHEDULED') as GoalStatus
    return status === 'IN_PROGRESS' ? 'primary' : 'default'
  })

  const deadlineLabel = computed(() => {
    if (!props.goal.targetDate) return 'Sin plazo'
    return DateUtils.formatDate(String(props.goal.targetDate), 'numeric')
  })

  const targetAmountLabel = computed(() => {
    return formatCurrency(props.goal.targetAmount ?? 0, props.currency as Currency)
  })

  const formatTimestamp = (date: string) => DateUtils.formatDate(date, 'numeric')

  const formatDateOnly = (dateString: string): string => {
    try {
      const result = DateUtils.formatDate(dateString, 'numeric')
      return result === '---' || result === 'Fecha inválida' ? '—' : result
    } catch {
      return '—'
    }
  }

  const FIELD_LABELS: Record<string, string> = {
    targetAmount: 'Meta',
    savedAmount: 'Aportado',
    interestRate: 'Tasa de interés',
    targetDate: 'Fecha objetivo',
    name: 'Nombre',
    status: 'Estado'
  }

  const formatHistoryValue = (field: string, value: unknown): string => {
    const moneyFields = ['targetAmount', 'savedAmount', 'amount']
    const dateFields = ['targetDate', 'startDate']
    const percentFields = ['interestRate', 'percentage']
    if (moneyFields.includes(field))
      return formatCurrency(Number(value) || 0, props.currency as Currency)
    if (dateFields.includes(field)) {
      if (!value || value === 'null' || value === 'undefined') return '—'
      return formatDateOnly(String(value))
    }
    if (percentFields.includes(field)) return `${value}%`
    return String(value ?? '—')
  }
</script>

<template>
  <SidebarPage>
    <!-- Skeleton -->
    <template v-if="loading">
      <!-- Resumen skeleton -->
      <div class="goal-sidebar-panel__section">
        <div class="goal-sidebar-panel__skeleton-header" />
        <div class="goal-sidebar-panel__skeleton-progress" />
        <div class="goal-sidebar-panel__skeleton-rows">
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--full" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--wide" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--full" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--medium" />
          <div class="goal-sidebar-panel__skeleton-divider" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--full" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--wide" />
          <div class="goal-sidebar-panel__skeleton-row goal-sidebar-panel__skeleton-row--full" />
        </div>
      </div>

      <!-- Historial skeleton -->
      <div class="goal-sidebar-panel__section">
        <div class="goal-sidebar-panel__skeleton-header" />
        <div class="goal-sidebar-panel__skeleton-history">
          <div v-for="i in 3" :key="i" class="goal-sidebar-panel__skeleton-history-item" />
        </div>
      </div>
    </template>

    <!-- Sección 1: Resumen -->
    <div v-if="!loading" class="goal-sidebar-panel__section">
      <CardInfo
        title="Resumen de Meta"
        sub-title="Estado actual"
        title-size="base"
        weight="extrabold"
        level="h3"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="info"
        icon-variant="primary"
        icon-size="md"
      />

      <GoalProgressBar
        :progress-percentage="progressPercentage"
        :saved-amount="savedAmount"
        :target-amount="goal.targetAmount ?? 0"
        :currency-code="currency"
      />

      <!-- Tabla de detalles -->
      <div class="goal-sidebar-panel__details">
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Estado</Text>
          <Badge :text="statusLabel" :variant="statusVariant" size="xs" />
        </div>
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Plazo</Text>
          <Text size="xs">{{ deadlineLabel }}</Text>
        </div>
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Meta</Text>
          <Text size="xs" weight="medium">{{ targetAmountLabel }}</Text>
        </div>
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Tiempo</Text>
          <Text size="xs">{{ estimatedTimeToGoal }}</Text>
        </div>
        <div class="goal-sidebar-panel__divider" />
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Total Aportes</Text>
          <Text size="xs" weight="medium">{{ formatCurrency(totalDeposited, currency as Currency) }}</Text>
        </div>
        <div class="goal-sidebar-panel__row">
          <Text size="xs" class="goal-sidebar-panel__label">Total Intereses</Text>
          <Text size="xs" weight="medium" class="goal-sidebar-panel__interest">{{ formatCurrency(totalInterest, currency as Currency) }}</Text>
        </div>
        <div class="goal-sidebar-panel__row goal-sidebar-panel__row--highlight">
          <Text size="xs" weight="semibold">Total Abonado</Text>
          <Text size="xs" weight="bold">{{ formatCurrency(totalDeposited + totalInterest, currency as Currency) }}</Text>
        </div>
      </div>
    </div>

    <!-- Sección 2: Historial -->
    <div v-if="!loading" class="goal-sidebar-panel__section">
      <CardInfo
        title="Historial"
        sub-title="Cambios registrados"
        title-size="base"
        weight="extrabold"
        level="h3"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="history"
        icon-variant="primary"
        icon-size="md"
      />

      <div v-if="history.length > 0" class="goal-sidebar-panel__history-list">
        <div v-for="item in history" :key="item.id" class="goal-sidebar-panel__history-item">
          <span class="goal-sidebar-panel__history-bullet">●</span>
          <div class="goal-sidebar-panel__history-content">
            <span class="goal-sidebar-panel__history-date">{{ formatTimestamp(item.changedAt) }}</span>
            <span class="goal-sidebar-panel__history-text">
              <strong>{{ FIELD_LABELS[item.field] ?? item.field }}:</strong>
              {{ formatHistoryValue(item.field, item.oldValue) }} → {{ formatHistoryValue(item.field, item.newValue) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="goal-sidebar-panel__empty">
        <EmptyStateIllustration type="no-transactions" class="goal-sidebar-panel__empty-illustration" />
        <Heading level="h3" size="sm" weight="semibold">Sin cambios registrados</Heading>
        <Text size="xs" color="muted">El historial de cambios aparecerá aquí.</Text>
      </div>
    </div>
  </SidebarPage>
</template>

<style scoped lang="postcss">
  .goal-sidebar-panel__section {
    @apply flex flex-col gap-3 rounded-lg border border-neutral-100 bg-white p-4;
  }

  .goal-sidebar-panel__details {
    @apply flex flex-col gap-2;
  }

  .goal-sidebar-panel__row {
    @apply flex items-center justify-between text-sm;
  }

  .goal-sidebar-panel__label {
    @apply text-neutral-500;
  }

  .goal-sidebar-panel__divider {
    @apply border-t border-neutral-100;
  }

  .goal-sidebar-panel__interest {
    @apply text-warning-600;
  }

  .goal-sidebar-panel__row--highlight {
    @apply rounded-md bg-primary-50 px-2 py-1;
  }

  .goal-sidebar-panel__history-list {
    @apply flex flex-col gap-2;
  }

  .goal-sidebar-panel__history-item {
    @apply flex items-start gap-1.5 text-xs;
  }

  .goal-sidebar-panel__history-bullet {
    @apply mt-0.5 shrink-0 text-[8px] text-primary-400;
  }

  .goal-sidebar-panel__history-content {
    @apply flex flex-col gap-0.5;
  }

  .goal-sidebar-panel__history-date {
    @apply text-[10px] text-neutral-400 dark:text-neutral-500;
  }

  .goal-sidebar-panel__history-text {
    @apply leading-snug text-neutral-600 dark:text-neutral-300;
  }

  .goal-sidebar-panel__empty {
    @apply flex flex-col items-center gap-3 py-6 text-center;
  }

  .goal-sidebar-panel__empty-illustration {
    @apply h-24 w-24 mx-auto;
  }

  /* Skeleton */
  .goal-sidebar-panel__skeleton-header {
    @apply h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-700;
  }

  .goal-sidebar-panel__skeleton-progress {
    @apply h-5 w-full animate-pulse rounded-full bg-slate-100 dark:bg-neutral-700;
  }

  .goal-sidebar-panel__skeleton-rows {
    @apply flex flex-col gap-2;
  }

  .goal-sidebar-panel__skeleton-row {
    @apply h-5 animate-pulse rounded-md bg-slate-100 dark:bg-neutral-700;
  }

  .goal-sidebar-panel__skeleton-row--full {
    @apply w-full;
  }

  .goal-sidebar-panel__skeleton-row--wide {
    @apply w-4/5;
  }

  .goal-sidebar-panel__skeleton-row--medium {
    @apply w-3/5;
  }

  .goal-sidebar-panel__skeleton-divider {
    @apply border-t border-neutral-100 dark:border-neutral-700;
  }

  .goal-sidebar-panel__skeleton-history {
    @apply flex flex-col gap-2;
  }

  .goal-sidebar-panel__skeleton-history-item {
    @apply h-8 w-full animate-pulse rounded-md bg-slate-100 dark:bg-neutral-700;
  }
</style>
