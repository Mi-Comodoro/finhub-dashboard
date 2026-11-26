<script setup lang="ts">
  import { BarChart, type BarSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    LegendComponent,
    type LegendComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption, use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import type { Currency } from '@/utils/currency'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    BarSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption
  >

  interface GoalProgressItem {
    name: string
    accumulated: number
    target: number
  }

  interface Props {
    goals?: GoalProgressItem[]
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    goals: () => [],
    currency: 'COP'
  })

  const hasData = computed(() => props.goals.length > 0)

  const chartOption = computed<EChartsOption>(() => ({
    grid: {
      left: '2%',
      right: '2%',
      top: 20,
      bottom: '2%',
      containLabel: true
    },
    legend: {
      show: false
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        formatter: (value: number) => formatCompactCurrency(value, props.currency)
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: props.goals.map(goal => goal.name),
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#334155',
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: Array<{ color: string; seriesName: string; value: number }>) =>
        params
          .map(
            param => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background-color:${param.color};"></span>
                <span>${param.seriesName}:</span>
                <strong style="margin-left:auto;">${formatCurrency(Number(param.value || 0), props.currency)}</strong>
              </div>
            `
          )
          .join('')
    },
    series: [
      {
        name: 'Acumulado',
        type: 'bar',
        data: props.goals.map(goal => goal.accumulated),
        itemStyle: {
          color: CHART_COLORS.savings,
          borderRadius: [0, 8, 8, 0]
        },
        barMaxWidth: 24
      },
      {
        name: 'Objetivo',
        type: 'bar',
        data: props.goals.map(goal => goal.target),
        itemStyle: {
          color: CHART_COLORS.planned,
          borderRadius: [0, 8, 8, 0]
        },
        barMaxWidth: 24
      }
    ]
  }))
</script>

<template>
  <div class="saving-goal-progress-chart">
    <div class="saving-goal-progress-chart__header">
      <div>
        <Heading level="h3" size="lg" weight="semibold">Progreso de metas</Heading>
        <Text size="sm" color="muted" class="saving-goal-progress-chart__subtitle">
          Compara lo acumulado frente al objetivo de cada meta de ahorro.
        </Text>
      </div>
      <div class="saving-goal-progress-chart__legend">
        <div class="saving-goal-progress-chart__legend-item">
          <span
            class="saving-goal-progress-chart__swatch"
            :style="{ backgroundColor: CHART_COLORS.savings }"
          />
          <Text size="sm" color="muted">Acumulado</Text>
        </div>
        <div class="saving-goal-progress-chart__legend-item">
          <span
            class="saving-goal-progress-chart__swatch"
            :style="{ backgroundColor: CHART_COLORS.planned }"
          />
          <Text size="sm" color="muted">Objetivo</Text>
        </div>
      </div>
    </div>

    <div class="saving-goal-progress-chart__body">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="saving-goal-progress-chart__chart" />
        <template #fallback>
          <div class="saving-goal-progress-chart__skeleton" />
        </template>
      </ClientOnly>

      <div v-else class="saving-goal-progress-chart__empty">
        <Text size="sm" color="muted">No hay metas suficientes para mostrar esta grafica.</Text>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .saving-goal-progress-chart {
    @apply rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800;
  }

  .saving-goal-progress-chart__header {
    @apply flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }

  .saving-goal-progress-chart__subtitle {
    @apply mt-1;
  }

  .saving-goal-progress-chart__legend {
    @apply flex items-center gap-4;
  }

  .saving-goal-progress-chart__legend-item {
    @apply flex items-center gap-2;
  }

  .saving-goal-progress-chart__swatch {
    @apply h-3 w-3 rounded-sm;
  }

  .saving-goal-progress-chart__body {
    @apply p-5;
  }

  .saving-goal-progress-chart__chart {
    @apply h-80 w-full;
  }

  .saving-goal-progress-chart__skeleton {
    @apply h-80 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700;
  }

  .saving-goal-progress-chart__empty {
    @apply flex h-80 items-center justify-center;
  }
</style>
