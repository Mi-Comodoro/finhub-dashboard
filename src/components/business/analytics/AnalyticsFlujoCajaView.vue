<script setup lang="ts">
  import VChart from 'vue-echarts'

  import { Card, Heading, MetricCard, Text } from '@/components/atoms'
  import { useAnalyticsCashFlowApplication } from '@/composables/application/useAnalyticsCashFlowApplication'
  import type { Currency } from '@/utils/currency'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { useFinancesStore } from '@/stores/finances.store'

  const period = inject('analyticsPeriod') as {
    selectedYear: Ref<number>
    selectedMonth: Ref<number>
  }
  const { selectedYear, selectedMonth } = period

  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency as Currency)

  const { fetchTransactionsByPeriod, groupTransactionsByWeek } =
    useAnalyticsCashFlowApplication()

  const { data: transactions, pending } = await useAsyncData(
    'analytics-cashflow',
    () => fetchTransactionsByPeriod(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const weeklyGroups = computed(() => groupTransactionsByWeek(transactions.value ?? []))

  const totalIncome = computed(() =>
    (transactions.value ?? [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const totalExpense = computed(() =>
    (transactions.value ?? [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const netFlow = computed(() => totalIncome.value - totalExpense.value)

  const netFlowVariant = computed(() => (netFlow.value >= 0 ? 'income' : 'expense'))

  const hasData = computed(() => (transactions.value ?? []).length > 0)

  const chartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { seriesName: string; value: number; color: string }[]) =>
        params
          .map(
            p =>
              `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px"></span>${p.seriesName}: ${formatCurrency(Number(p.value), currency.value)}`
          )
          .join('<br/>')
    },
    legend: { data: ['Ingresos', 'Gastos', 'Ahorro', 'Flujo Neto'], top: 8 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: weeklyGroups.value.map(w => w.week) },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatCompactCurrency(value, currency.value)
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        data: weeklyGroups.value.map(w => w.income),
        itemStyle: { color: '#14b8a6' }
      },
      {
        name: 'Gastos',
        type: 'bar',
        data: weeklyGroups.value.map(w => w.expense),
        itemStyle: { color: '#ef4444' }
      },
      {
        name: 'Ahorro',
        type: 'bar',
        data: weeklyGroups.value.map(w => w.savings),
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: 'Flujo Neto',
        type: 'line',
        data: weeklyGroups.value.map(w => w.netFlow),
        itemStyle: { color: '#6366f1' },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }))
</script>

<template>
  <div class="cashflow-view">
    <USkeleton v-if="pending" class="cashflow-view__skeleton" />

    <template v-else>
      <div class="cashflow-view__kpis">
        <MetricCard
          title="Total Ingresos"
          :value="totalIncome"
          variant="income"
          icon="payments"
          currency
          :currency-code="currency"
        />
        <MetricCard
          title="Total Gastos"
          :value="totalExpense"
          variant="expense"
          icon="shopping_cart"
          currency
          :currency-code="currency"
        />
        <MetricCard
          title="Flujo Neto"
          :value="netFlow"
          :variant="netFlowVariant"
          icon="waterfall_chart"
          currency
          :currency-code="currency"
        />
      </div>

      <Card class="cashflow-view__chart-card">
        <div class="cashflow-view__chart-header">
          <Heading level="h3" size="lg" weight="semibold">Flujo de Caja por Semana</Heading>
        </div>

        <div v-if="!hasData" class="cashflow-view__empty">
          <Text size="sm" color="muted">No hay transacciones para el período seleccionado.</Text>
        </div>

        <ClientOnly v-else>
          <VChart :option="chartOption" style="height: 320px" autoresize />
          <template #fallback>
            <div class="cashflow-view__chart-fallback">
              <USkeleton class="cashflow-view__chart-skeleton" />
            </div>
          </template>
        </ClientOnly>
      </Card>
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .cashflow-view {
    @apply flex flex-col gap-4;
  }

  .cashflow-view__skeleton {
    @apply h-64 w-full rounded-xl;
  }

  .cashflow-view__kpis {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-3;
  }

  .cashflow-view__chart-card {
    @apply p-5;
  }

  .cashflow-view__chart-header {
    @apply mb-4;
  }

  .cashflow-view__empty {
    @apply flex h-48 items-center justify-center;
  }

  .cashflow-view__chart-fallback {
    @apply flex h-[320px] items-center justify-center;
  }

  .cashflow-view__chart-skeleton {
    @apply h-full w-full rounded-lg;
  }
</style>
