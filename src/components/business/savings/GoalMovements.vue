<script setup lang="ts">
  import { format } from 'date-fns'
  import { es } from 'date-fns/locale'
  import { computed } from 'vue'

  import { Badge, Card, Heading, Text } from '@/components/atoms'
  import type { PlannedSaving } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'

  interface GoalMovementsProps {
    goalId?: string
    movements?: PlannedSaving[]
  }

  const props = withDefaults(defineProps<GoalMovementsProps>(), {
    goalId: '',
    movements: () => []
  })

  const sortedMovements = computed(() => {
    return [...props.movements].sort((a, b) => {
      const dateA = new Date(a.completedAt ?? a.date)
      const dateB = new Date(b.completedAt ?? b.date)
      return dateB.getTime() - dateA.getTime()
    })
  })

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es })
  }

  const getStatusVariant = (status: string) => {
    if (status === 'completed') return 'success'
    if (status === 'skipped') return 'danger'
    return 'warning'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Realizado'
    if (status === 'skipped') return 'Omitido'
    return 'Pendiente'
  }
</script>

<template>
  <Card class="goal-movements">
    <Heading level="h3" size="lg" weight="bold">Movimientos</Heading>

    <div v-if="sortedMovements.length === 0" class="goal-movements__empty">
      <Text size="sm" color="muted">Aún no hay movimientos registrados para esta meta</Text>
    </div>

    <div v-else class="goal-movements__table">
      <div class="goal-movements__header">
        <div class="goal-movements__header-cell goal-movements__header-cell--date">Fecha</div>
        <div class="goal-movements__header-cell goal-movements__header-cell--amount">Monto</div>
        <div class="goal-movements__header-cell goal-movements__header-cell--type">Tipo</div>
        <div class="goal-movements__header-cell goal-movements__header-cell--status">Estado</div>
      </div>

      <div class="goal-movements__body">
        <div v-for="movement in sortedMovements" :key="movement.id" class="goal-movements__row">
          <div class="goal-movements__cell goal-movements__cell--date">
            <Text size="sm">{{ formatDate(String(movement.completedAt ?? movement.date)) }}</Text>
          </div>
          <div class="goal-movements__cell goal-movements__cell--amount">
            <Text size="sm" weight="semibold">{{ formatCurrency(movement.amount, 'COP') }}</Text>
          </div>
          <div class="goal-movements__cell goal-movements__cell--type">
            <Text size="sm">Aporte</Text>
          </div>
          <div class="goal-movements__cell goal-movements__cell--status">
            <Badge :variant="getStatusVariant(movement.status)" size="xs">
              {{ getStatusLabel(movement.status) }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped lang="postcss">
  .goal-movements {
    @apply space-y-4;
  }

  .goal-movements__empty {
    @apply py-8 text-center;
  }

  .goal-movements__table {
    @apply w-full;
  }

  .goal-movements__header {
    @apply grid grid-cols-12 gap-4 border-b border-neutral-200 pb-2 dark:border-neutral-700;
  }

  .goal-movements__header-cell {
    @apply text-sm font-medium text-neutral-600 dark:text-neutral-400;
  }

  .goal-movements__header-cell--date {
    @apply col-span-4;
  }

  .goal-movements__header-cell--amount {
    @apply col-span-3;
  }

  .goal-movements__header-cell--type {
    @apply col-span-2;
  }

  .goal-movements__header-cell--status {
    @apply col-span-3;
  }

  .goal-movements__body {
    @apply space-y-2;
  }

  .goal-movements__row {
    @apply grid grid-cols-12 gap-4 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800;
  }

  .goal-movements__cell {
    @apply flex items-center;
  }

  .goal-movements__cell--date {
    @apply col-span-4;
  }

  .goal-movements__cell--amount {
    @apply col-span-3;
  }

  .goal-movements__cell--type {
    @apply col-span-2;
  }

  .goal-movements__cell--status {
    @apply col-span-3;
  }
</style>
