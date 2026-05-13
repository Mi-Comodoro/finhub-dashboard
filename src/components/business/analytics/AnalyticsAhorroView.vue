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

  import { Heading, Text } from '@/components/atoms'
  import { useAnalyticsSavingsTrendApplication } from '@/composables/application/useAnalyticsSavingsTrendApplication'
  import type { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    LineSeriesOption | GridComponentOption | TooltipComponentOption
  >

  const period = inject<ReturnType<typeof useAnalyticsPeriod>>('analyticsPeriod')!
  const { selectedYear } = period

  const { savingsByMonth, isLoading, totalSaved, bestMonth, monthlyAvg } =
    useAnalyticsSavingsTrendApplication(selectedYear)

  const chartOption = computed<EChartsOption>(() => ({
    grid: { left: '2%', right: '2%', top: 16, bottom: '2%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ axisValue: string; value: number }>) =>
        `${params[0].axisValue}: <strong>${formatCurrency(Number(params[0].value ?? 0), 'COP')}</strong>`
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
        formatter: (value: number) => formatCompactCurrency(value, 'COP')
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
          <UIcon name="i-material-symbols-savings" class="ahorro-view__kpi-icon-svg" />
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Total ahorrado en el año</Text>
          <USkeleton v-if="isLoading" class="ahorro-view__kpi-skeleton" />
          <Heading v-else level="h3" size="xl" weight="bold" color="black">
            {{ formatCurrency(totalSaved, 'COP') }}
          </Heading>
        </div>
      </div>

      <div class="ahorro-view__kpi-card">
        <div class="ahorro-view__kpi-icon">
          <UIcon name="i-material-symbols-star" class="ahorro-view__kpi-icon-svg" />
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Mejor mes</Text>
          <USkeleton v-if="isLoading" class="ahorro-view__kpi-skeleton" />
          <template v-else>
            <Heading level="h3" size="xl" weight="bold" color="black">
              {{ formatCurrency(bestMonth?.actual ?? 0, 'COP') }}
            </Heading>
            <Text size="xs" color="muted">{{ bestMonth?.label }}</Text>
          </template>
        </div>
      </div>

      <div class="ahorro-view__kpi-card">
        <div class="ahorro-view__kpi-icon">
          <UIcon name="i-material-symbols-query-stats" class="ahorro-view__kpi-icon-svg" />
        </div>
        <div class="ahorro-view__kpi-content">
          <Text size="xs" color="muted">Promedio mensual</Text>
          <USkeleton v-if="isLoading" class="ahorro-view__kpi-skeleton" />
          <Heading v-else level="h3" size="xl" weight="bold" color="black">
            {{ formatCurrency(monthlyAvg, 'COP') }}
          </Heading>
        </div>
      </div>
    </div>

    <div class="ahorro-view__chart-card">
      <div class="ahorro-view__chart-header">
        <Heading level="h3" size="lg" weight="semibold">Tendencia de ahorro</Heading>
        <Text size="xs" color="muted">Ahorro real mes a mes durante {{ selectedYear }}</Text>
      </div>

      <div class="ahorro-view__chart-body">
        <ClientOnly>
          <VChart v-if="!isLoading" :option="chartOption" autoresize class="ahorro-view__chart" />
          <div v-else class="ahorro-view__chart ahorro-view__chart--loading">
            <USkeleton class="ahorro-view__chart-skeleton" />
          </div>
          <template #fallback>
            <div class="ahorro-view__chart ahorro-view__chart--loading">
              <USkeleton class="ahorro-view__chart-skeleton" />
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
    @apply h-5 w-5 text-warning-600;
  }

  .ahorro-view__kpi-content {
    @apply flex flex-col gap-0.5;
  }

  .ahorro-view__kpi-skeleton {
    @apply mt-1 h-7 w-36 rounded;
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
    @apply h-full w-full rounded-lg;
  }
</style>
