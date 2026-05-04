<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'

  import { Card, Heading, Icon, Text } from '@/components/atoms'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  import type { TransactionSummary } from '~/types/domain'

  const props = withDefaults(
    defineProps<{
      budgetId?: string
      type?: TransactionSummary['type']
    }>(),
    {
      budgetId: '',
      type: undefined
    }
  )

  const { transactions, isLoading, currency, fetchTransaction, setBudgetId } =
    useTransactionApplication()

  const router = useRouter()

  const items = computed(() => transactions.value ?? [])

  const loadItems = async () => {
    if (!props.budgetId) return
    await fetchTransaction(props.budgetId, { limit: 10 })
  }

  // Computed para formatear el monto con prefijo y color
  const getFormattedAmount = (item: TransactionSummary) => {
    const amount = formatCurrency(item.amount, currency.value)

    if (item.type === 'income') {
      return {
        text: `+${amount}`,
        colorClass: 'text-success-700'
      }
    }

    if (item.type === 'expense') {
      return {
        text: `-${amount}`,
        colorClass: 'text-danger-700'
      }
    }

    // savings
    return {
      text: `-${amount}`,
      colorClass: 'text-warning-700'
    }
  }

  onMounted(loadItems)

  watch(
    () => [props.budgetId, props.type] as const,
    async ([budgetId, type], [previousBudgetId, previousType]) => {
      if (!budgetId) return
      if (budgetId === previousBudgetId && type === previousType) return
      await loadItems()
    }
  )
  const onViewTransactions = () => {
    setBudgetId(props.budgetId)
    router.push({
      path: '/dashboard/transactions'
    })
  }
</script>

<template>
  <SectionCard icon="swap_vertical_circle" icon-variant="primary" title="Ultimas Transacciones">
    <template v-if="isLoading">
      <div class="transaction-list__loading">
        <div v-for="index in 4" :key="index" class="transaction-list__skeleton">
          <div class="transaction-list__skeleton-title"></div>
          <div class="transaction-list__skeleton-subtitle"></div>
          <div class="transaction-list__skeleton-text"></div>
        </div>
      </div>
    </template>

    <div v-else-if="items.length === 0" class="transaction-list__empty">
      <Icon name="receipt_long" size="2xl" class="transaction-list__empty-icon" />
      <Heading level="h3" size="lg" color="muted">No hay transacciones</Heading>
      <Text size="sm" color="muted">
        Las transacciones asociadas a este presupuesto aparecerán en esta lista.
      </Text>
    </div>

    <div v-else class="transaction-list__items">
      <Card v-for="item in items" :key="item.id" class-name="!p-3" class="transaction-list__card">
        <!-- Fila 1: Fuente y badge -->
        <div class="transaction-list__header">
          <Heading level="h3" size="sm" weight="extrabold" class="transaction-list__header-title">
            {{ translate[item.source]?.toUpperCase() ?? item.source.toUpperCase() }}
          </Heading>
        </div>

        <!-- Fila 2: Categoría, monto y fecha -->
        <div class="transaction-list__content">
          <Text size="xs" color="muted" class="transaction-list__content-info">
            {{ item.category?.name ?? 'Sin categoría' }} -
            {{ DateUtils.formatDate(item.transactionDate) }}
          </Text>
          <div class="transaction-list__content-amount">
            <Text
              size="sm"
              weight="bold"
              class="transaction-list__amount-text"
              :class="getFormattedAmount(item).colorClass"
            >
              {{ getFormattedAmount(item).text }}
              <span class="transaction-list__currency" :class="getFormattedAmount(item).colorClass">
                {{ currency }}
              </span>
            </Text>
          </div>
        </div>
      </Card>
    </div>

    <Button size="sm" @click="onViewTransactions">Ver todas las transacciones</Button>
  </SectionCard>
</template>

<style scoped lang="postcss">
  .transaction-list__loading {
    @apply space-y-3;
  }

  .transaction-list__skeleton {
    @apply animate-pulse rounded-md border border-slate-100 bg-slate-50 p-4;
  }

  .transaction-list__skeleton-title {
    @apply mb-3 h-4 w-40 rounded bg-slate-200;
  }

  .transaction-list__skeleton-subtitle {
    @apply mb-2 h-3 w-28 rounded bg-slate-200;
  }

  .transaction-list__skeleton-text {
    @apply h-3 w-24 rounded bg-slate-200;
  }

  .transaction-list__empty {
    @apply flex flex-col items-center gap-3 py-10 text-center;
  }

  .transaction-list__empty-icon {
    @apply text-slate-300;
  }

  .transaction-list__items {
    @apply space-y-2;
  }

  .transaction-list__card {
    @apply border border-slate-100;
  }

  .transaction-list__header {
    @apply flex items-start justify-between gap-2;
  }

  .transaction-list__header-title {
    @apply truncate;
  }

  .transaction-list__content {
    @apply flex flex-wrap items-center justify-between gap-2 text-xs;
  }

  .transaction-list__content-info {
    @apply truncate;
  }

  .transaction-list__content-amount {
    @apply flex shrink-0 items-center gap-2;
  }

  .transaction-list__amount-text {
    @apply whitespace-nowrap;
  }

  .transaction-list__currency {
    @apply text-xs uppercase;
  }
</style>
