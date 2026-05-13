<script setup lang="ts">
  import VChart from 'vue-echarts'

  import { Card, Heading, MetricCard, Text } from '@/components/atoms'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import { useAnalyticsCashFlowApplication } from '@/composables/application/useAnalyticsCashFlowApplication'
  import type { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  const period = inject<ReturnType<typeof useAnalyticsPeriod>>('analyticsPeriod')!
  const { selectedYear, selectedMonth } = period

  const {
    fetchTransactionsByPeriod,
    groupTransactionsByWeek,
    currency,
    forecast,
    loadingForecast,
    forecastWarning,
  } = useAnalyticsCashFlowApplication()

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

  const forecastChartOption = computed(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos proy.', 'Gastos proy.', 'Neto proy.'], top: 8 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: forecast.value?.months.map(m => m.month) ?? [],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatCompactCurrency(value, currency.value),
      },
    },
    series: [
      {
        name: 'Ingresos proy.',
        type: 'line',
        data: forecast.value?.months.map(m => m.projectedIncome) ?? [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: CHART_COLORS.income },
      },
      {
        name: 'Gastos proy.',
        type: 'line',
        data: forecast.value?.months.map(m => m.projectedExpenses) ?? [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: CHART_COLORS.expense },
      },
      {
        name: 'Neto proy.',
        type: 'bar',
        data: forecast.value?.months.map(m => m.projectedNet) ?? [],
        itemStyle: { color: CHART_COLORS.savings },
      },
    ],
  }))

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
        itemStyle: { color: CHART_COLORS.income }
      },
      {
        name: 'Gastos',
        type: 'bar',
        data: weeklyGroups.value.map(w => w.expense),
        itemStyle: { color: CHART_COLORS.expense }
      },
      {
        name: 'Ahorro',
        type: 'bar',
        data: weeklyGroups.value.map(w => w.savings),
        itemStyle: { color: CHART_COLORS.savings }
      },
      {
        name: 'Flujo Neto',
        type: 'line',
        data: weeklyGroups.value.map(w => w.netFlow),
        itemStyle: { color: CHART_COLORS.secondary },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }))
</script>

<template>
  <div class="cashflow-view">
    <div v-if="pending" class="cashflow-view__skeleton" />

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
          <EmptyStateIllustration
            type="no-transactions"
            class="cashflow-view__empty-illustration"
          />
          <Heading level="h3" size="lg" weight="semibold">Sin transacciones</Heading>
          <Text size="sm" color="muted">
            No hay movimientos para el período seleccionado.
          </Text>
        </div>

        <ClientOnly v-else>
          <VChart :option="chartOption" style="height: 320px" autoresize />
          <template #fallback>
            <div class="cashflow-view__chart-fallback">
              <div class="cashflow-view__chart-skeleton" />
            </div>
          </template>
        </ClientOnly>
      </Card>

      <!-- Forecast section -->
      <div class="cashflow-view__section-title">
        <span>Pronóstico próximos 3 meses</span>
      </div>

      <div v-if="forecastWarning" class="cashflow-view__forecast-banner">
        <span class="material-symbols-outlined cashflow-view__forecast-banner-icon">
          warning
        </span>
        <Text size="sm" color="warning">{{ forecastWarning }}</Text>
      </div>

      <div v-if="loadingForecast" class="cashflow-view__forecast-kpis">
        <div v-for="n in 3" :key="n" class="cashflow-view__forecast-skeleton" />
      </div>

      <template v-else>
        <div class="cashflow-view__forecast-kpis">
          <div
            v-for="month in forecast?.months ?? []"
            :key="month.month"
            class="cashflow-view__forecast-card"
          >
            <p class="cashflow-view__forecast-month">{{ month.month }}</p>
            <p
              class="cashflow-view__forecast-net"
              :class="
                month.projectedNet >= 0
                  ? 'cashflow-view__forecast-net--positive'
                  : 'cashflow-view__forecast-net--negative'
              "
            >
              {{ formatCurrency(month.projectedNet, currency) }}
            </p>
            <div class="cashflow-view__forecast-detail">
              <span>↑ {{ formatCurrency(month.projectedIncome, currency) }}</span>
              <span>↓ {{ formatCurrency(month.projectedExpenses, currency) }}</span>
            </div>
          </div>
        </div>

        <Card class="cashflow-view__chart-card">
          <div class="cashflow-view__chart-header">
            <Heading level="h3" size="lg" weight="semibold">Pronóstico — Líneas Proyectadas</Heading>
          </div>
          <ClientOnly>
            <VChart :option="forecastChartOption" style="height: 320px" autoresize />
            <template #fallback>
              <div class="cashflow-view__chart-fallback">
                <div class="cashflow-view__chart-skeleton" />
              </div>
            </template>
          </ClientOnly>
        </Card>
      </template>
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .cashflow-view {
    @apply flex flex-col gap-4;
  }

  .cashflow-view__skeleton {
    @apply h-64 w-full animate-pulse rounded-xl bg-slate-100;
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
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .cashflow-view__empty-illustration {
    @apply h-32 w-32;
  }

  .cashflow-view__chart-fallback {
    @apply flex h-[320px] items-center justify-center;
  }

  .cashflow-view__chart-skeleton {
    @apply h-full w-full animate-pulse rounded-lg bg-slate-100;
  }

  .cashflow-view__section-title {
    @apply flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-700;
  }

  .cashflow-view__forecast-banner {
    @apply flex items-start gap-2 rounded-lg border border-warning-200 bg-warning-50 p-3;
  }

  .cashflow-view__forecast-banner-icon {
    @apply shrink-0 text-lg leading-none text-warning-600;
  }

  .cashflow-view__forecast-kpis {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-3;
  }

  .cashflow-view__forecast-skeleton {
    @apply h-28 animate-pulse rounded-xl bg-slate-100;
  }

  .cashflow-view__forecast-card {
    @apply flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4;
  }

  .cashflow-view__forecast-month {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500;
  }

  .cashflow-view__forecast-net {
    @apply text-xl font-bold;
  }

  .cashflow-view__forecast-net--positive {
    @apply text-primary-700;
  }

  .cashflow-view__forecast-net--negative {
    @apply text-danger-700;
  }

  .cashflow-view__forecast-detail {
    @apply flex gap-3 text-xs text-neutral-500;
  }
</style>
