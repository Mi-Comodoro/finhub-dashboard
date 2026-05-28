<script setup lang="ts">
  import VChart from 'vue-echarts'

  import Card from '@/components/atoms/card/Card.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useAnalyticsCashFlowApplication } from '@/composables/application/useAnalyticsCashFlowApplication'
  import type { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  const period = inject<ReturnType<typeof useAnalyticsPeriod>>('analyticsPeriod')!
  const { selectedYear, selectedMonth } = period

  const { fetchTransactionsByPeriod, groupTransactionsByWeek, currency, fetchForecast } =
    useAnalyticsCashFlowApplication()

  const { data: transactions, pending } = await useAsyncData(
    'analytics-cashflow',
    () => fetchTransactionsByPeriod(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const { data: forecast, pending: loadingForecast } = await useAsyncData(
    'analytics-cashflow-forecast',
    () => fetchForecast(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const forecastWarning = computed(() =>
    !forecast.value?.assumptions.basedOnBudget
      ? 'Sin presupuesto activo. El pronóstico usa valores en cero.'
      : null
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

  const netFlowVariant = computed(() =>
    !netFlow.value || netFlow.value >= 0 ? 'income' : 'expense'
  )

  const hasData = computed(() => (transactions.value ?? []).length > 0)

  const forecastChartOption = computed(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Ingresos proy.', 'Gastos proy.', 'Neto proy.'], top: 8 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: forecast.value?.months.map(m => m.month) ?? []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatCompactCurrency(value, currency.value)
      }
    },
    series: [
      {
        name: 'Ingresos proy.',
        type: 'line',
        data: forecast.value?.months.map(m => m.projectedIncome ?? 0) ?? [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: CHART_COLORS.income }
      },
      {
        name: 'Gastos proy.',
        type: 'line',
        data: forecast.value?.months.map(m => m.projectedExpenses ?? 0) ?? [],
        lineStyle: { type: 'dashed' },
        itemStyle: { color: CHART_COLORS.expense }
      },
      {
        name: 'Neto proy.',
        type: 'bar',
        data: forecast.value?.months.map(m => m.projectedNet ?? 0) ?? [],
        itemStyle: { color: CHART_COLORS.savings }
      }
    ]
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
      <div v-if="hasData" class="cashflow-view__kpis">
        <div class="cashflow-view__kpi-card cashflow-view__kpi-card--income">
          <div class="cashflow-view__kpi-icon cashflow-view__kpi-icon--income">
            <span class="material-symbols-outlined cashflow-view__kpi-icon-svg">payments</span>
          </div>
          <div class="cashflow-view__kpi-body">
            <Text size="xs" color="muted">Total Ingresos</Text>
            <p class="cashflow-view__kpi-value" :title="formatCurrency(totalIncome, currency)">
              {{ formatCompactCurrency(totalIncome, currency) }}
            </p>
          </div>
        </div>

        <div class="cashflow-view__kpi-card cashflow-view__kpi-card--expense">
          <div class="cashflow-view__kpi-icon cashflow-view__kpi-icon--expense">
            <span class="material-symbols-outlined cashflow-view__kpi-icon-svg">shopping_cart</span>
          </div>
          <div class="cashflow-view__kpi-body">
            <Text size="xs" color="muted">Total Gastos</Text>
            <p class="cashflow-view__kpi-value" :title="formatCurrency(totalExpense, currency)">
              {{ formatCompactCurrency(totalExpense, currency) }}
            </p>
          </div>
        </div>

        <div :class="['cashflow-view__kpi-card', `cashflow-view__kpi-card--${netFlowVariant}`]">
          <div :class="['cashflow-view__kpi-icon', `cashflow-view__kpi-icon--${netFlowVariant}`]">
            <span class="material-symbols-outlined cashflow-view__kpi-icon-svg">
              waterfall_chart
            </span>
          </div>
          <div class="cashflow-view__kpi-body">
            <Text size="xs" color="muted">Flujo Neto</Text>
            <p
              :class="[
                'cashflow-view__kpi-value',
                { 'cashflow-view__kpi-value--negative': netFlow < 0 }
              ]"
              :title="formatCurrency(netFlow, currency)"
            >
              {{ formatCompactCurrency(netFlow, currency) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="hasData" class="cashflow-view__pill-summary">
        <span>Ingresos {{ formatCurrency(totalIncome, currency) }}</span>
        <span class="cashflow-view__pill-sep">·</span>
        <span>Gastos {{ formatCurrency(totalExpense, currency) }}</span>
        <span class="cashflow-view__pill-sep">·</span>
        <span
          :class="netFlow >= 0 ? 'cashflow-view__pill--positive' : 'cashflow-view__pill--negative'"
        >
          Flujo Neto {{ formatCurrency(netFlow, currency) }}
        </span>
      </div>

      <Card class="cashflow-view__chart-card">
        <div class="cashflow-view__chart-header">
          <Heading level="h3" size="lg" weight="semibold">Flujo de Caja por Semana</Heading>
        </div>

        <div v-if="!hasData" class="analytics-view__empty">
          <EmptyStateIllustration
            type="no-transactions"
            class="analytics-view__empty-illustration"
          />
          <p class="analytics-view__empty-title">Sin movimientos registrados</p>
          <p class="analytics-view__empty-description">
            Registra ingresos y gastos para ver tu flujo de caja
          </p>
          <NuxtLink to="/dashboard/budget" class="analytics-view__empty-cta">
            Ir al presupuesto
          </NuxtLink>
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
        <span class="material-symbols-outlined cashflow-view__forecast-banner-icon">warning</span>
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
            :class="[
              'cashflow-view__forecast-card',
              month.projectedNet >= 0
                ? 'cashflow-view__forecast-card--positive'
                : 'cashflow-view__forecast-card--negative'
            ]"
          >
            <div class="cashflow-view__forecast-card-top">
              <div
                :class="[
                  'cashflow-view__forecast-icon',
                  month.projectedNet >= 0
                    ? 'cashflow-view__forecast-icon--positive'
                    : 'cashflow-view__forecast-icon--negative'
                ]"
              >
                <span
                  v-if="month.projectedNet >= 0"
                  class="material-symbols-outlined cashflow-view__forecast-icon-svg"
                >
                  trending_up
                </span>
                <span v-else class="material-symbols-outlined cashflow-view__forecast-icon-svg">
                  trending_down
                </span>
              </div>
              <p class="cashflow-view__forecast-month">{{ month.month }}</p>
            </div>

            <p
              :class="[
                'cashflow-view__forecast-net',
                month.projectedNet >= 0
                  ? 'cashflow-view__forecast-net--positive'
                  : 'cashflow-view__forecast-net--negative'
              ]"
              :title="formatCurrency(month.projectedNet ?? 0, currency)"
            >
              {{ formatCompactCurrency(month.projectedNet ?? 0, currency) }}
            </p>

            <div class="cashflow-view__forecast-detail">
              <span class="cashflow-view__forecast-detail-income">
                ↑ {{ formatCompactCurrency(month.projectedIncome ?? 0, currency) }}
              </span>
              <span class="cashflow-view__forecast-detail-expense">
                ↓ {{ formatCompactCurrency(month.projectedExpenses ?? 0, currency) }}
              </span>
            </div>
          </div>
        </div>

        <p class="cashflow-view__forecast-note">
          Valores estimados con base en el historial de ingresos y gastos del período.
        </p>

        <Card class="cashflow-view__chart-card">
          <div class="cashflow-view__chart-header">
            <Heading level="h3" size="lg" weight="semibold">
              Pronóstico — Líneas Proyectadas
            </Heading>
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

  .cashflow-view__kpi-card {
    @apply flex min-w-0 items-start gap-3 rounded-xl border p-4;
  }

  .cashflow-view__kpi-card--income {
    @apply border-primary-100 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20;
  }

  .cashflow-view__kpi-card--expense {
    @apply border-danger-100 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20;
  }

  .cashflow-view__kpi-icon {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-lg;
  }

  .cashflow-view__kpi-icon--income {
    @apply bg-primary-100 dark:bg-primary-800;
  }

  .cashflow-view__kpi-icon--expense {
    @apply bg-danger-100 dark:bg-danger-800;
  }

  .cashflow-view__kpi-icon-svg {
    @apply text-xl leading-none;
  }

  .cashflow-view__kpi-icon--income .cashflow-view__kpi-icon-svg {
    @apply text-primary-600 dark:text-primary-400;
  }

  .cashflow-view__kpi-icon--expense .cashflow-view__kpi-icon-svg {
    @apply text-danger-600 dark:text-danger-400;
  }

  .cashflow-view__kpi-body {
    @apply flex min-w-0 flex-col gap-0.5;
    overflow-wrap: anywhere;
  }

  .cashflow-view__kpi-value {
    @apply font-sans text-lg font-bold leading-snug text-black;
    @apply dark:text-neutral-100;
  }

  .cashflow-view__kpi-value--negative {
    @apply text-danger-600;
  }

  .cashflow-view__chart-card {
    @apply p-5;
  }

  .cashflow-view__chart-header {
    @apply mb-4;
  }

  .analytics-view__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .analytics-view__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  .analytics-view__empty-title {
    @apply text-base font-semibold text-neutral-800;
  }

  .analytics-view__empty-description {
    @apply max-w-xs text-sm text-neutral-500;
  }

  .analytics-view__empty-cta {
    @apply text-sm font-medium text-primary-600 underline;
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
    @apply flex min-w-0 flex-col gap-2 rounded-xl border p-4;
  }

  .cashflow-view__forecast-card--positive {
    @apply border-primary-100 bg-primary-50;
  }

  .cashflow-view__forecast-card--negative {
    @apply border-danger-100 bg-danger-50;
  }

  .cashflow-view__forecast-card-top {
    @apply flex items-center gap-2;
  }

  .cashflow-view__forecast-icon {
    @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-lg;
  }

  .cashflow-view__forecast-icon--positive {
    @apply bg-primary-100;
  }

  .cashflow-view__forecast-icon--negative {
    @apply bg-danger-100;
  }

  .cashflow-view__forecast-icon-svg {
    @apply text-lg leading-none;
  }

  .cashflow-view__forecast-icon--positive .cashflow-view__forecast-icon-svg {
    @apply text-primary-600;
  }

  .cashflow-view__forecast-icon--negative .cashflow-view__forecast-icon-svg {
    @apply text-danger-600;
  }

  .cashflow-view__forecast-month {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-600;
  }

  .cashflow-view__forecast-net {
    @apply text-xl font-bold leading-tight;
    overflow-wrap: anywhere;
  }

  .cashflow-view__forecast-net--positive {
    @apply text-primary-700;
  }

  .cashflow-view__forecast-net--negative {
    @apply text-danger-700;
  }

  .cashflow-view__forecast-detail {
    @apply flex flex-wrap gap-3 text-xs;
    overflow-wrap: anywhere;
  }

  .cashflow-view__forecast-detail-income {
    @apply text-primary-600;
  }

  .cashflow-view__forecast-detail-expense {
    @apply text-danger-600;
  }

  .cashflow-view__forecast-note {
    @apply text-[11px] italic text-neutral-400;
  }

  .cashflow-view__pill-summary {
    @apply hidden flex-wrap items-center gap-2 text-sm text-neutral-600 sm:flex;
  }

  .cashflow-view__pill-sep {
    @apply text-neutral-300;
  }

  .cashflow-view__pill--positive {
    @apply font-semibold text-primary-700;
  }

  .cashflow-view__pill--negative {
    @apply font-semibold text-danger-700;
  }
</style>
