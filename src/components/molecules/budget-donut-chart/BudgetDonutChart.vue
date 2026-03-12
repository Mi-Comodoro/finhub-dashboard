<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'

  import type { BudgetDonutChartProps, BudgetDonutItem } from './types/budget-donut-chart.types'

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

  // ─── Canvas ref & Chart.js instance ──────────────────────────────────────────

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chartInstance: any = null

  function buildDataset() {
    if (props.items.length === 0) {
      return {
        data: [100],
        backgroundColor: ['#e2e8f0'],
        borderWidth: 0,
        hoverBackgroundColor: ['#e2e8f0']
      }
    }
    return {
      data: props.items.map(i => i.percentage),
      backgroundColor: props.items.map(i => SEGMENT_COLOR[i.type]),
      hoverBackgroundColor: props.items.map(i => SEGMENT_COLOR[i.type]),
      borderWidth: 4,
      borderColor: '#ffffff',
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff'
    }
  }

  // Dynamic import keeps Chart.js out of the SSR bundle
  onMounted(async () => {
    const { Chart, ArcElement, DoughnutController, Tooltip } = await import('chart.js')
    Chart.register(DoughnutController, ArcElement, Tooltip)

    if (!canvasRef.value) return

    chartInstance = new Chart(canvasRef.value, {
      type: 'doughnut',
      data: {
        labels: props.items.map(i => i.name),
        datasets: [buildDataset()]
      },
      options: {
        cutout: '74%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        animation: { animateRotate: true, duration: 700 }
      }
    })
  })

  watch(
    () => [props.items, props.total],
    () => {
      if (!chartInstance) return
      chartInstance.data.labels = props.items.map(i => i.name)
      chartInstance.data.datasets[0] = buildDataset()
      chartInstance.update()
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    chartInstance?.destroy()
    chartInstance = null
  })

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const compactTotal = () => formatCompactCurrency(props.total, props.currency)
  const fullAmount = (amount: number) => formatCurrency(amount, props.currency)
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
      <canvas ref="canvasRef" width="180" height="180" />

      <!-- Centre text overlay -->
      <div class="budget-donut-chart__center-label">
        <span class="budget-donut-chart__center-label-title">TOTAL</span>
        <span class="budget-donut-chart__center-label-value">
          {{ compactTotal() }}
        </span>
      </div>
    </div>

    <!-- Legend (only when showLegend is true) -->
    <ul v-if="showLegend" class="budget-donut-chart__legend">
      <li v-for="item in items" :key="item.id" class="budget-donut-chart__legend-item">
        <!-- Dot + label -->
        <div class="budget-donut-chart__legend-label">
          <span :class="['budget-donut-chart__legend-dot', DOT_CLASS[item.type]]" />
          <span class="budget-donut-chart__legend-text">
            {{ item.name }}
            <span class="budget-donut-chart__legend-percent">({{ item.percentage }}%)</span>
          </span>
        </div>
        <!-- Amount -->
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
  .budget-donut-chart__center-label {
    @apply pointer-events-none absolute inset-0 flex flex-col items-center justify-center;
  }
  .budget-donut-chart__center-label-title {
    @apply text-xs font-medium uppercase tracking-widest text-slate-400;
  }
  .budget-donut-chart__center-label-value {
    @apply mt-0.5 text-xl font-extrabold text-slate-800 dark:text-slate-100;
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
