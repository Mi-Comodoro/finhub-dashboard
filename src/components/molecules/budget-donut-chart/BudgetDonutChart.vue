<script setup lang="ts">
  import { PieChart } from 'echarts/charts'
  import { GraphicComponent, LegendComponent, TooltipComponent } from 'echarts/components'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import VueECharts from 'vue-echarts'

  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'

  import type { BudgetDonutChartProps, BudgetDonutItem } from './types/budget-donut-chart.types'

  // Registrar solo los componentes que usamos
  use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent, GraphicComponent])

  const props = withDefaults(defineProps<BudgetDonutChartProps>(), {
    items: () => [],
    total: 0,
    currency: 'COP',
    showLegend: true
  })

  // ─── Colors (one source of truth per segment type) ───────────────────────────
  const SEGMENT_COLOR: Record<BudgetDonutItem['type'], string> = {
    needs: '#14b8a6', // teal-500
    wants: '#6366f1', // indigo-500
    savings: '#eab308' // yellow-500
  }

  const DOT_CLASS: Record<BudgetDonutItem['type'], string> = {
    needs: 'bg-teal-500',
    wants: 'bg-indigo-500',
    savings: 'bg-yellow-500'
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const compactTotal = () => formatCompactCurrency(props.total, props.currency)
  const fullAmount = (amount: number) => formatCurrency(amount, props.currency)

  // ─── ECharts option (reactive) ───────────────────────────────────────────────
  const chartOption = computed(() => {
    // Cuando no hay items, mostramos un segmento gris al 100%
    const hasData = props.items.length > 0

    const seriesData = hasData
      ? props.items.map(item => ({
          name: item.name,
          value: item.percentage, // ya viene en porcentaje
          itemStyle: { color: SEGMENT_COLOR[item.type] }
        }))
      : [{ name: 'Sin datos', value: 100, itemStyle: { color: '#e2e8f0' } }]

    return {
      tooltip: {
        // Opcional: puedes habilitar tooltip si quieres, pero el original lo deshabilitaba
        show: false
      },
      legend: { show: false }, // La leyenda la dibujamos manualmente con <ul>
      series: [
        {
          type: 'pie',
          radius: ['74%', '90%'], // mismo efecto de dona gruesa (cutout: '74%')
          avoidLabelOverlap: false,
          silent: true, // sin interacciones (como el original)
          data: seriesData,
          label: { show: false },
          emphasis: { scale: false },
          startAngle: 90, // para que empiece arriba (opcional)
          itemStyle: {
            borderWidth: 4,
            borderColor: '#ffffff',
            borderRadius: 0
          }
        }
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: `TOTAL\n${compactTotal()}`,
            fill: '#1e293b', // slate-800
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 20,
            textAlign: 'center'
          },
          z: 100
        }
      ]
    }
  })
</script>

<template>
  <div
    :class="
      showLegend
        ? 'budget-donut-chart budget-donut-chart--with-legend'
        : 'budget-donut-chart budget-donut-chart--center'
    "
  >
    <!-- Donut + centre label -->
    <div class="budget-donut-chart__donut-wrapper" style="width: 180px; height: 180px">
      <VueECharts :option="chartOption" :autoresize="true" style="width: 100%; height: 100%" />
    </div>

    <!-- Legend (only when showLegend is true) -->
    <ul v-if="showLegend" class="budget-donut-chart__legend">
      <li v-for="item in items" :key="item.id" class="budget-donut-chart__legend-item">
        <div class="budget-donut-chart__legend-label">
          <span :class="['budget-donut-chart__legend-dot', DOT_CLASS[item.type]]" />
          <span class="budget-donut-chart__legend-text">
            {{ item.name }}
            <span class="budget-donut-chart__legend-percent">({{ item.percentage }}%)</span>
          </span>
        </div>
        <span class="budget-donut-chart__legend-amount">
          {{ fullAmount(item.budgeted) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
  .budget-donut-chart {
    @apply w-full;
  }
  .budget-donut-chart--with-legend {
    @apply flex items-center gap-6;
  }
  .budget-donut-chart--center {
    @apply flex justify-center;
  }
  .budget-donut-chart__donut-wrapper {
    @apply relative shrink-0;
  }
  .budget-donut-chart__legend {
    @apply flex-1 space-y-3;
  }
  .budget-donut-chart__legend-item {
    @apply flex items-center justify-between gap-3;
  }
  .budget-donut-chart__legend-label {
    @apply flex min-w-0 items-center gap-2;
  }
  .budget-donut-chart__legend-dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }
  .budget-donut-chart__legend-text {
    @apply truncate text-sm text-slate-700 dark:text-slate-300;
  }
  .budget-donut-chart__legend-percent {
    @apply text-slate-400;
  }
  .budget-donut-chart__legend-amount {
    @apply shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100;
  }
</style>
