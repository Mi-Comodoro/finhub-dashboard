<script setup lang="ts">
  import type { Column } from '@/components/organisms/datatable/types'
  import type { PlannedIncomeSummary } from '@/types/domain'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'

  withDefaults(
    defineProps<{
      incomes?: PlannedIncomeSummary[]
      currency?: string
    }>(),
    {
      incomes: () => [],
      currency: ''
    }
  )

  const emit = defineEmits(['edit', 'delete', 'markReceived'])

  const columns: Column[] = [
    { key: 'source', label: 'Fuente', type: 'text', bold: true },
    { key: 'amount', label: 'Monto', type: 'currency' },
    { key: 'date', label: 'Fecha Esperada', type: 'date' },
    { key: 'status', label: 'Estado', type: 'badge' },
    { key: 'actions', label: 'Acciones', type: 'actions' }
  ]

  const handleEdit = (row: PlannedIncomeSummary) => {
    emit('edit', row)
  }

  const handleDelete = (row: PlannedIncomeSummary) => {
    emit('delete', row)
  }

  const handleMarkReceived = (row: PlannedIncomeSummary) => {
    emit('markReceived', row)
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'warning',
      RECEIVED: 'success',
      CANCELED: 'danger'
    }
    return variants[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      RECEIVED: 'Recibido',
      CANCELED: 'Cancelado'
    }
    return labels[status] || status
  }
</script>

<template>
  <div class="income-history">
    <DataTable :columns="columns" :data="incomes">
      <template #cell-amount="{ row }">
        <Text size="sm" weight="bold" class="income-history__amount">
          {{ formatCurrency(row.amount, currency) }}
          <span class="income-history__currency">{{ currency }}</span>
        </Text>
      </template>

      <template #cell-date="{ value }">
        <Text size="sm">{{ DateUtils.formatDate(value) }}</Text>
      </template>

      <template #cell-status="{ value }">
        <Badge :variant="getStatusVariant(value)" size="sm">
          {{ getStatusLabel(value) }}
        </Badge>
      </template>

      <template #cell-actions="{ row }">
        <div class="income-history__actions">
          <Button
            v-if="row.status === 'PENDING'"
            variant="ghost"
            size="xs"
            icon="check_circle"
            @click="handleMarkReceived(row)"
          >
            Marcar recibido
          </Button>
          <Button variant="ghost" size="xs" icon="edit" @click="handleEdit(row)">Editar</Button>
          <Button variant="ghost" size="xs" icon="delete" @click="handleDelete(row)">
            Eliminar
          </Button>
        </div>
      </template>

      <template #empty>
        <div class="income-history__empty">
          <Icon name="payments" size="2xl" class="income-history__empty-icon" />
          <Text size="sm" color="muted">No hay ingresos planificados</Text>
          <Text size="xs" color="muted">
            Agrega tus ingresos esperados para mantener tu presupuesto actualizado
          </Text>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style lang="postcss" scoped>
  .income-history {
    @apply w-full;
  }

  .income-history__amount {
    @apply whitespace-nowrap text-success-700;
  }

  .income-history__currency {
    @apply text-xs uppercase text-success-600;
  }

  .income-history__actions {
    @apply flex items-center gap-1;
  }

  .income-history__empty {
    @apply flex flex-col items-center gap-2 py-10 text-center;
  }

  .income-history__empty-icon {
    @apply text-slate-400;
  }
</style>
