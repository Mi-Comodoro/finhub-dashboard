<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'

  import { Card, Heading, Icon, Text } from '@/components/atoms'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useTransactionStore } from '@/stores/transaction.store'
  import { formatCurrency } from '@/utils/currency'
  import type { TransactionSummary } from '~/types/domain'
  import DateUtils from '~/utils/date'

  const props = defineProps<{
    budgetId: string
    type?: TransactionSummary['type']
  }>()

  const transactionStore = useTransactionStore()
  const financesStore = useFinancesStore()

  const router = useRouter()

  const items = computed(() => transactionStore.items ?? [])

  const loadItems = async () => {
    if (!props.budgetId) return
    await transactionStore.fetchByBudget(props.budgetId, { limit: 10 })
  }

  // Computed para formatear el monto con prefijo y color
  const getFormattedAmount = (item: TransactionSummary) => {
    const amount = formatCurrency(item.amount, financesStore.defaultCurrency)

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
    transactionStore.setBudgetId(props.budgetId)
    router.push({
      path: '/dashboard/transactions'
    })
  }
</script>

<template>
  <SectionCard icon="swap_vertical_circle" icon-variant="primary" title="Ultimas Transacciones">
    <template v-if="transactionStore.isLoading">
      <div class="space-y-3">
        <div
          v-for="index in 4"
          :key="index"
          class="animate-pulse rounded-md border border-slate-100 bg-slate-50 p-4"
        >
          <div class="mb-3 h-4 w-40 rounded bg-slate-200"></div>
          <div class="mb-2 h-3 w-28 rounded bg-slate-200"></div>
          <div class="h-3 w-24 rounded bg-slate-200"></div>
        </div>
      </div>
    </template>

    <div v-else-if="items.length === 0" class="flex flex-col items-center gap-3 py-10 text-center">
      <Icon name="receipt_long" size="2xl" class="text-slate-300" />
      <Heading level="h3" size="lg" color="muted">No hay transacciones</Heading>
      <Text size="sm" color="muted">
        Las transacciones asociadas a este presupuesto aparecerán en esta lista.
      </Text>
    </div>

    <div v-else class="space-y-2">
      <Card v-for="item in items" :key="item.id" class-name="!p-3" class="border border-slate-100">
        <!-- Fila 1: Fuente y badge -->
        <div class="flex items-start justify-between gap-2">
          <Heading level="h3" size="sm" weight="extrabold" class="truncate">
            {{ translate[item.source]?.toUpperCase() ?? item.source.toUpperCase() }}
          </Heading>
        </div>

        <!-- Fila 2: Categoría, monto y fecha -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <Text size="xs" color="muted" class="truncate">
            {{ item.category?.name ?? 'Sin categoría' }} -
            {{ DateUtils.formatDate(item.transactionDate) }}
          </Text>
          <div class="flex shrink-0 items-center gap-2">
            <Text
              size="sm"
              weight="bold"
              class="whitespace-nowrap"
              :class="getFormattedAmount(item).colorClass"
            >
              {{ getFormattedAmount(item).text }}
              <span class="text-xs uppercase" :class="getFormattedAmount(item).colorClass">
                {{ financesStore.defaultCurrency }}
              </span>
            </Text>
          </div>
        </div>
      </Card>
    </div>

    <Button @click="onViewTransactions">Ver todas las transacciones</Button>
  </SectionCard>
</template>
