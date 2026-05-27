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
    <div class="ahorro-view__kpis">
      <div class="ahorro-view__kpi-card">
        <div class="ahorro-view__kpi-icon">
          <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">account_balance</span>
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Saldo anterior al año</Text>
          <Heading level="h3" size="xl" weight="bold" color="black">
            {{ formatCurrency(0, currency.value) }}
          </Heading>
        </div>
      </div>

      <div class="ahorro-view__kpi-card">
        <div class="ahorro-view__kpi-icon">
          <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">savings</span>
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Ahorro del mes</Text>
          <div v-if="isLoading" class="ahorro-view__kpi-skeleton" />
          <Heading v-else level="h3" size="xl" weight="bold" color="black">
            {{ formatCurrency(selectedMonthSaving, currency.value) }}
          </Heading>
        </div>
      </div>

      <div class="ahorro-view__kpi-card">
        <div class="ahorro-view__kpi-icon">
          <span class="material-symbols-outlined ahorro-view__kpi-icon-svg">query_stats</span>
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Estimación mensual</Text>
          <div v-if="isLoading" class="ahorro-view__kpi-skeleton" />
          <Heading v-else level="h3" size="xl" weight="bold" color="black">
            {{ formatCurrency(monthlyAvg, currency.value) }}
          </Heading>
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

    <div v-if="!isLoading && totalSaved === 0" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Sin datos de ahorro</p>
      <p class="analytics-view__empty-description">
        Completa un aporte a tus metas para ver tu tendencia
      </p>
      <NuxtLink to="/dashboard/goals" class="analytics-view__empty-cta">Ver metas</NuxtLink>
    </div>

    <div v-else-if="!isLoading && monthsWithData < 2" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Datos insuficientes</p>
      <p class="analytics-view__empty-description">
        Se necesitan al menos 2 meses con datos para mostrar la tendencia de ahorro.
      </p>
    </div>

    <div v-else class="ahorro-view__chart-card">
      <div class="ahorro-view__chart-header">
        <Heading level="h3" size="lg" weight="semibold">Tendencia de ahorro</Heading>
        <Text size="xs" color="muted">Ahorro real mes a mes durante {{ selectedYear }}</Text>
      </div>

      <div class="ahorro-view__chart-body">
        <ClientOnly>
          <VChart v-if="!isLoading" :option="chartOption" autoresize class="ahorro-view__chart" />
          <div v-else class="ahorro-view__chart ahorro-view__chart--loading">
            <div class="ahorro-view__chart-skeleton" />
          </div>
          <template #fallback>
            <div class="ahorro-view__chart ahorro-view__chart--loading">
              <div class="ahorro-view__chart-skeleton" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
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
    @apply flex items-start gap-3 rounded-xl border border-warning-100 bg-warning-50 p-4;
  }

  .ahorro-view__kpi-icon {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-100;
  }

  .ahorro-view__kpi-icon-svg {
    @apply text-xl leading-none text-warning-600;
  }

  .ahorro-view__kpi-content {
    @apply flex flex-col gap-0.5;
  }

  .ahorro-view__kpi-skeleton {
    @apply mt-1 h-7 w-36 animate-pulse rounded bg-slate-100;
  }

  .ahorro-view__chart-card {
    @apply rounded-xl border border-neutral-200 bg-white;
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
