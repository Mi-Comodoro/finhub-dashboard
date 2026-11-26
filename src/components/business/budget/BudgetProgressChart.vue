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

  interface BudgetProgressCategory {
    name: string
    planned: number
    paid: number
  }

  interface Props {
    categories?: BudgetProgressCategory[]
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    categories: () => [],
    currency: 'COP'
  })

  const hasData = computed(() => props.categories.length > 0)

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
      data: props.categories.map(category => category.name),
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
                <strong style="margin-left:auto;">${formatCurrency(param.value, props.currency)}</strong>
              </div>
            `
          )
          .join('')
    },
    series: [
      {
        name: 'Planificado',
        type: 'bar',
        data: props.categories.map(category => category.planned),
        itemStyle: {
          color: CHART_COLORS.planned,
          borderRadius: [0, 8, 8, 0]
        },
        barMaxWidth: 24
      },
      {
        name: 'Pagado',
        type: 'bar',
        data: props.categories.map(category => category.paid),
        itemStyle: {
          color: CHART_COLORS.wants,
          borderRadius: [0, 8, 8, 0]
        },
        barMaxWidth: 24
      }
    ]
  }))
</script>

<template>
  <div class="budget-progress-chart">
    <div class="budget-progress-chart__header">
      <div>
        <Heading level="h3" size="lg" weight="semibold">Progreso por categoria</Heading>
        <Text size="sm" color="muted" class="budget-progress-chart__subtitle">
          Compara lo planificado frente a lo pagado para cada categoria de gasto.
        </Text>
      </div>
      <div class="budget-progress-chart__legend">
        <div class="budget-progress-chart__legend-item">
          <span
            class="budget-progress-chart__swatch"
            :style="{ backgroundColor: CHART_COLORS.planned }"
          />
          <Text size="sm" color="muted">Planificado</Text>
        </div>
        <div class="budget-progress-chart__legend-item">
          <span
            class="budget-progress-chart__swatch"
            :style="{ backgroundColor: CHART_COLORS.wants }"
          />
          <Text size="sm" color="muted">Pagado</Text>
        </div>
      </div>
    </div>

    <div class="budget-progress-chart__body">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="budget-progress-chart__chart" />
        <template #fallback>
          <div class="budget-progress-chart__fallback">
            <div class="budget-progress-chart__skeleton" />
          </div>
        </template>
      </ClientOnly>

      <div v-else class="budget-progress-chart__empty">
        <Text size="sm" color="muted">No hay gastos suficientes para mostrar esta grafica.</Text>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-progress-chart {
    @apply rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800;
  }

  .budget-progress-chart__header {
    @apply flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }

  .budget-progress-chart__subtitle {
    @apply mt-1;
  }

  .budget-progress-chart__legend {
    @apply flex items-center gap-4;
  }

  .budget-progress-chart__legend-item {
    @apply flex items-center gap-2;
  }

  .budget-progress-chart__swatch {
    @apply h-3 w-3 rounded-sm;
  }

  .budget-progress-chart__body {
    @apply p-5;
  }

  .budget-progress-chart__chart {
    @apply h-80 w-full;
  }

  .budget-progress-chart__fallback {
    @apply flex h-80 w-full items-center justify-center;
  }

  .budget-progress-chart__skeleton {
    @apply h-full w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700;
  }

  .budget-progress-chart__empty {
    @apply flex h-80 items-center justify-center text-center;
  }
</style>
