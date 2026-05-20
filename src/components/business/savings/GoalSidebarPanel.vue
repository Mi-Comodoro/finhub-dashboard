<script setup lang="ts">
  import { format } from 'date-fns'
  import { es } from 'date-fns/locale'

  import { Badge, Text } from '@/components/atoms'
  import GoalProgressBar from '@/components/business/savings/GoalProgressBar.vue'
  import { CardInfo } from '@/components/molecules'
  import SidebarPage from '@/components/templates/SidebarPage.vue'
  import type { AccountData, GoalHistory, GoalsData } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'
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
    estimatedTimeToGoal: ''
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
    return format(new Date(props.goal.targetDate), 'dd MMM yyyy', { locale: es })
  })

  const targetAmountLabel = computed(() => {
    return formatCurrency(props.goal.targetAmount ?? 0, props.currency as Currency)
  })

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es })
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
    if (dateFields.includes(field)) return formatDate(value as string)
    if (percentFields.includes(field)) return `${value}%`
    return String(value ?? '—')
  }
</script>

<template>
  <SidebarPage>
    <!-- Sección 1: Resumen -->
    <div class="goal-sidebar-panel__section">
      <CardInfo
        title="Resumen de Meta"
        sub-title="Estado actual"
        title-size="xl"
        weight="extrabold"
        level="h1"
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

    <!-- Sección 3: Tips -->
    <div class="goal-sidebar-panel__section">
      <CardInfo
        title="Tips"
        sub-title="Información útil"
        title-size="xl"
        weight="extrabold"
        level="h1"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="lightbulb"
        icon-variant="primary"
        icon-size="md"
      />

      <div class="goal-sidebar-panel__tips">
        <Text size="xs" color="muted">
          El interés se calcula día a día con interés compuesto. Tu capital crece un poco cada día
          que permanece depositado. En vistas de 3 meses o más, los aportes futuros son estimados
          basados en tu último aporte registrado.
        </Text>
        <Text size="xs" color="muted">
          Las proyecciones son estimadas y pueden variar según las actualizaciones de tasa de
          interés por parte de las entidades financieras.
        </Text>
      </div>
    </div>

    <!-- Sección 2: Historial -->
    <div class="goal-sidebar-panel__section">
      <CardInfo
        title="Historial"
        sub-title="Cambios registrados"
        title-size="xl"
        weight="extrabold"
        level="h1"
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
          <span class="goal-sidebar-panel__history-date">{{ formatDate(item.changedAt) }}</span>
          <span class="goal-sidebar-panel__history-text">
            <strong>{{ FIELD_LABELS[item.field] ?? item.field }}:</strong>
            {{ formatHistoryValue(item.field, item.oldValue) }} →
            {{ formatHistoryValue(item.field, item.newValue) }}
          </span>
        </div>
      </div>
      <Text v-else size="sm" color="muted" class="goal-sidebar-panel__empty">
        Sin cambios registrados
      </Text>
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
    @apply flex flex-col gap-3;
  }

  .goal-sidebar-panel__history-item {
    @apply flex items-start gap-2 text-sm;
  }

  .goal-sidebar-panel__history-bullet {
    @apply text-primary-500;
  }

  .goal-sidebar-panel__history-date {
    @apply text-neutral-500 dark:text-neutral-400;
  }

  .goal-sidebar-panel__history-text {
    @apply flex-1 text-neutral-700 dark:text-neutral-200;
  }

  .goal-sidebar-panel__empty {
    @apply text-center;
  }

  .goal-sidebar-panel__tips {
    @apply flex flex-col gap-3;
  }
</style>
