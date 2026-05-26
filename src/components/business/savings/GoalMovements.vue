<script setup lang="ts">
  import { computed } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Card from '@/components/atoms/card/Card.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import type { Column } from '@/components/organisms/datatable/types'
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

  const columns: Column[] = [
    { key: 'date', label: 'Fecha', type: 'date', bold: true },
    { key: 'amount', label: 'Monto', type: 'currency' },
    { key: 'kind', label: 'Tipo' },
    { key: 'note', label: 'Nota' }
  ]

  const tableData = computed(() =>
    [...props.movements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(m => ({
        id: m.id ?? m.date,
        date: m.date,
        amount: m.amount,
        kind: m.kind ?? 'aporte',
        note: m.note ?? '—'
      }))
  )

  const TYPE_LABELS: Record<MovementKind, string> = {
    aporte: 'Aporte',
    interes: 'Interés',
    ajuste: 'Ajuste'
  }

  const TYPE_VARIANTS: Record<MovementKind, 'success' | 'secondary' | 'default'> = {
    aporte: 'success',
    interes: 'secondary',
    ajuste: 'default'
  }
</script>

<template>
  <Card class="goal-movements">
    <Heading level="h3" size="lg" weight="bold">Movimientos</Heading>

    <DataTable :columns="columns" :data="tableData">
      <template #cell-amount="{ value }">
        <Text size="xs" weight="semibold">{{ formatCurrency(value as number, 'COP') }}</Text>
      </template>

      <template #cell-kind="{ value }">
        <Badge :variant="TYPE_VARIANTS[value as MovementKind]" size="xs">
          {{ TYPE_LABELS[value as MovementKind] }}
        </Badge>
      </template>

      <template #cell-note="{ value }">
        <Text size="xs" color="muted">{{ value }}</Text>
      </template>

      <template #empty>
        <div class="goal-movements__empty">
          <EmptyStateIllustration
            type="no-transactions"
            class="goal-movements__empty-illustration"
          />
          <Heading level="h3" size="sm" weight="semibold">Sin movimientos</Heading>
          <Text size="xs" color="muted">Aún no hay movimientos registrados para esta meta.</Text>
        </div>
      </template>
    </DataTable>
  </Card>
</template>

<style scoped lang="postcss">
  .goal-movements {
    @apply space-y-4;
  }

  .goal-movements__empty {
    @apply flex flex-col items-center gap-3 py-10 text-center;
  }

  .goal-movements__empty-illustration {
    @apply mx-auto h-28 w-28;
  }
</style>
