<script setup lang="ts">
  import { LineChart, type LineSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption, use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import VChart from 'vue-echarts'

  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useAnalyticsSavingsTrendApplication } from '@/composables/application/useAnalyticsSavingsTrendApplication'
  import type { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    LineSeriesOption | GridComponentOption | TooltipComponentOption
  >

  const period = inject<ReturnType<typeof useAnalyticsPeriod>>('analyticsPeriod')!
  const { selectedYear, selectedMonth } = period

  const { savingsByMonth, isLoading, totalSaved, monthlyAvg, currency } =
    useAnalyticsSavingsTrendApplication(selectedYear)

  const selectedMonthSaving = computed(
    () => savingsByMonth.value[selectedMonth.value - 1]?.actual ?? 0
  )

  const monthsWithData = computed(
    () => savingsByMonth.value.filter(m => (m.actual ?? 0) > 0).length
  )

  const chartOption = computed<EChartsOption>(() => ({
    grid: { left: '2%', right: '2%', top: 16, bottom: '2%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ axisValue: string; value: number }>) =>
        `${params[0].axisValue}: <strong>${formatCurrency(Number(params[0].value ?? 0), currency.value)}</strong>`
    },
    xAxis: {
      type: 'category',
      data: savingsByMonth.value.map(m => m.label),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        formatter: (value: number) => formatCompactCurrency(value, currency.value)
      },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
    },
    series: [
      {
        name: 'Ahorro real',
        type: 'line',
        smooth: true,
        data: savingsByMonth.value.map(m => m.actual),
        areaStyle: { opacity: 0.15, color: CHART_COLORS.savings },
        itemStyle: { color: CHART_COLORS.savings },
        lineStyle: { color: CHART_COLORS.savings, width: 3 }
      }
    ]
  }))
</script>

<template>
  <div class="ahorro-view">
    <!-- Loading: unified skeleton, no data race -->
    <template v-if="isLoading">
      <div class="ahorro-view__kpis">
        <div v-for="i in 3" :key="i" class="ahorro-view__kpi-skeleton-card" />
      </div>
      <div class="ahorro-view__chart-full-skeleton" />
    </template>

    <!-- No savings -->
    <div v-else-if="totalSaved === 0" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Sin aportes registrados</p>
      <p class="analytics-view__empty-description">
        Completa un aporte a tus metas para ver tu tendencia de ahorro.
      </p>
      <NuxtLink to="/dashboard/goals" class="analytics-view__empty-cta">Ver metas</NuxtLink>
    </div>

    <!-- Has savings -->
    <template v-else>
      <div class="ahorro-view__kpis">
        <div class="ahorro-view__kpi-card ahorro-view__kpi-card--neutral">
          <div class="ahorro-view__kpi-icon ahorro-view__kpi-icon--neutral">
            <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">account_balance</span>
          </div>
          <div class="ahorro-view__kpi-content">
            <Text size="xs" color="muted">Saldo anterior al año</Text>
            <p class="ahorro-view__kpi-value" :title="formatCurrency(0, currency.value)">
              {{ formatCompactCurrency(0, currency.value) }}
            </p>
          </div>
        </div>

        <div class="ahorro-view__kpi-card ahorro-view__kpi-card--warning">
          <div class="ahorro-view__kpi-icon ahorro-view__kpi-icon--warning">
            <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">savings</span>
          </div>
          <div class="ahorro-view__kpi-content">
            <Text size="xs" color="muted">Ahorro del mes</Text>
            <p
              class="ahorro-view__kpi-value"
              :title="formatCurrency(selectedMonthSaving, currency.value)"
            >
              {{ formatCompactCurrency(selectedMonthSaving, currency.value) }}
            </p>
          </div>
        </div>

        <div class="ahorro-view__kpi-card ahorro-view__kpi-card--success">
          <div class="ahorro-view__kpi-icon ahorro-view__kpi-icon--success">
            <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">query_stats</span>
          </div>
          <div class="ahorro-view__kpi-content">
            <Text size="xs" color="muted">Estimación mensual</Text>
            <p class="ahorro-view__kpi-value" :title="formatCurrency(monthlyAvg, currency.value)">
              {{ formatCompactCurrency(monthlyAvg, currency.value) }}
            </p>
          </div>
        </div>
      </div>

      <div class="ahorro-insight">
        <span class="material-symbols-outlined ahorro-insight__icon">tips_and_updates</span>
        <Text size="xs" color="muted">
          El ahorro constante, aunque pequeño, genera más impacto que un gran esfuerzo esporádico.
          Automatiza tus aportes para mantener el hábito.
        </Text>
      </div>

      <!-- Insufficient months -->
      <div v-if="monthsWithData < 2" class="analytics-view__empty">
        <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
        <p class="analytics-view__empty-title">Datos insuficientes</p>
        <p class="analytics-view__empty-description">
          Se necesitan al menos 2 meses con datos para mostrar la tendencia de ahorro.
        </p>
      </div>

      <!-- Chart -->
      <div v-else class="ahorro-view__chart-card">
        <div class="ahorro-view__chart-header">
          <Heading level="h3" size="lg" weight="semibold">Tendencia de ahorro</Heading>
          <Text size="xs" color="muted">Ahorro real mes a mes durante {{ selectedYear }}</Text>
        </div>

        <div class="ahorro-view__chart-body">
          <ClientOnly>
            <VChart :option="chartOption" autoresize class="ahorro-view__chart" />
            <template #fallback>
              <div class="ahorro-view__chart ahorro-view__chart--loading">
                <div class="ahorro-view__chart-skeleton" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .ahorro-view {
    @apply flex flex-col gap-4;
  }

  .ahorro-view__kpis {
    @apply grid grid-cols-1 gap-3 sm:grid-cols-3;
  }

  .ahorro-view__kpi-card {
    @apply flex min-w-0 items-start gap-3 rounded-xl border p-4;
  }

  .ahorro-view__kpi-card--neutral {
    @apply border-neutral-200 bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-700/40;
  }

  .ahorro-view__kpi-card--warning {
    @apply border-warning-100 bg-warning-50;
    @apply dark:border-warning-900/40 dark:bg-warning-900/20;
  }

  .ahorro-view__kpi-card--success {
    @apply border-success-100 bg-success-50;
    @apply dark:border-success-900/40 dark:bg-success-900/20;
  }

  .ahorro-view__kpi-icon {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-lg;
  }

  .ahorro-view__kpi-icon--neutral {
    @apply bg-neutral-200;
  }

  .ahorro-view__kpi-icon--warning {
    @apply bg-warning-100;
  }

  .ahorro-view__kpi-icon--success {
    @apply bg-success-100;
  }

  .ahorro-view__kpi-icon-svg {
    @apply text-xl leading-none;
  }

  .ahorro-view__kpi-icon--neutral .ahorro-view__kpi-icon-svg {
    @apply text-neutral-600;
    @apply dark:text-neutral-400;
  }

  .ahorro-view__kpi-icon--warning .ahorro-view__kpi-icon-svg {
    @apply text-warning-600;
  }

  .ahorro-view__kpi-icon--success .ahorro-view__kpi-icon-svg {
    @apply text-success-600;
  }

  .ahorro-view__kpi-content {
    @apply flex min-w-0 flex-col gap-0.5;
    overflow-wrap: anywhere;
  }

  .ahorro-view__kpi-value {
    @apply font-sans text-lg font-bold leading-snug text-black;
    @apply dark:text-neutral-100;
  }

  .ahorro-view__kpi-skeleton {
    @apply mt-1 h-7 w-36 animate-pulse rounded bg-slate-100;
  }

  .ahorro-view__kpi-skeleton-card {
    @apply h-20 animate-pulse rounded-xl bg-slate-100;
  }

  .ahorro-view__chart-full-skeleton {
    @apply h-72 animate-pulse rounded-xl bg-slate-100;
  }

  .ahorro-view__chart-card {
    @apply rounded-xl border border-neutral-200 bg-white;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .ahorro-view__chart-header {
    @apply flex flex-col gap-0.5 border-b border-neutral-100 px-5 py-4;
  }

  .ahorro-view__chart-body {
    @apply p-5;
  }

  .ahorro-view__chart {
    @apply h-80 w-full;
  }

  .ahorro-view__chart--loading {
    @apply flex items-center justify-center;
  }

  .ahorro-view__chart-skeleton {
    @apply h-full w-full animate-pulse rounded-lg bg-slate-100;
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

  .ahorro-insight {
    @apply flex items-start gap-2 rounded-lg bg-warning-50 px-3 py-2.5;
    @apply dark:bg-warning-900/20;
  }

  .ahorro-insight__icon {
    @apply shrink-0 text-base leading-none text-warning-600;
  }
</style>
