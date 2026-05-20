<script setup lang="ts">
  import { format } from 'date-fns'
  import { es } from 'date-fns/locale'
  import { computed } from 'vue'

  import { Badge, Card, Heading, Text } from '@/components/atoms'
  import { formatCurrency } from '@/utils/currency'

  export interface GoalMovementItem {
    id?: string
    date: string
    amount: number
    kind?: 'aporte' | 'interes' | 'ajuste'
    note?: string
  }

  type MovementKind = 'aporte' | 'interes' | 'ajuste'

  interface GoalMovementsProps {
    goalId?: string
    movements?: GoalMovementItem[]
  }

  const props = withDefaults(defineProps<GoalMovementsProps>(), {
    goalId: '',
    movements: () => []
  })

  const sortedMovements = computed(() =>
    [...props.movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd/MMM/yyyy', { locale: es })

  const TYPE_LABELS: Record<MovementKind, string> = {
    aporte: 'Aporte',
    interes: 'Interés',
    ajuste: 'Ajuste'
  }

  const TYPE_VARIANTS: Record<MovementKind, 'success' | 'secondary' | 'neutral'> = {
    aporte: 'success',
    interes: 'secondary',
    ajuste: 'neutral'
  }

  const getTypeLabel = (kind?: MovementKind) => TYPE_LABELS[kind ?? 'aporte']
  const getTypeVariant = (kind?: MovementKind) => TYPE_VARIANTS[kind ?? 'aporte']
</script>

<template>
  <Card class="goal-movements">
    <Heading level="h3" size="lg" weight="bold">Movimientos</Heading>

    <div v-if="sortedMovements.length === 0" class="goal-movements__empty">
      <Text size="sm" color="muted">Aún no hay movimientos registrados para esta meta</Text>
    </div>

    <div v-else class="goal-movements__table">
      <div class="goal-movements__header">
        <div class="goal-movements__col--date">Fecha</div>
        <div class="goal-movements__col--amount">Monto</div>
        <div class="goal-movements__col--type">Tipo</div>
        <div class="goal-movements__col--note">Nota</div>
      </div>

      <div class="goal-movements__body">
        <div
          v-for="movement in sortedMovements"
          :key="movement.id"
          class="goal-movements__row"
        >
          <div class="goal-movements__col--date">
            <Text size="sm">{{ formatDate(movement.date) }}</Text>
          </div>
          <div class="goal-movements__col--amount">
            <Text size="sm" weight="semibold">{{ formatCurrency(movement.amount, 'COP') }}</Text>
          </div>
          <div class="goal-movements__col--type">
            <Badge :variant="getTypeVariant(movement.kind)" size="xs">
              {{ getTypeLabel(movement.kind) }}
            </Badge>
          </div>
          <div class="goal-movements__col--note">
            <Text size="sm" color="muted">{{ movement.note ?? '—' }}</Text>
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
    @apply grid grid-cols-12 gap-4 border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-400;
  }

  .goal-movements__body {
    @apply space-y-2;
  }

  .goal-movements__row {
    @apply grid grid-cols-12 gap-4 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800;
  }

  .goal-movements__col--date {
    @apply col-span-3 flex items-center;
  }

  .goal-movements__col--amount {
    @apply col-span-3 flex items-center;
  }

  .goal-movements__col--type {
    @apply col-span-2 flex items-center;
  }

  .goal-movements__col--note {
    @apply col-span-4 flex items-center;
  }
</style>
