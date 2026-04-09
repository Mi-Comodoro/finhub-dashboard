<script setup lang="ts">
import type { PieSeriesOption } from 'echarts/charts'
import type { ComposeOption } from 'echarts/core'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'

import type { BudgetDonutChartEnhancedProps } from './types/budget-donut-chart-enhanced.types'
import {
  formatUtilization,
  getEmphasisScale,
  getHealthRingColor,
  getSegmentBorderWidth,
  getSegmentColor,
  getTooltipData
} from './utils/donut-chart.utils'
import { useBudgetComparisonApplication } from '@/composables/application/useBudgetComparisonApplication'
import { useBudgetDonutPresenter } from '@/composables/presenters/useBudgetDonutPresenter'
import { formatCompactCurrency, formatCurrency } from '@/utils/currency'

type EChartsOption = ComposeOption<PieSeriesOption>

const props = withDefaults(defineProps<BudgetDonutChartEnhancedProps>(), {
  items: () => [],
  total: 0,
  currency: 'COP',
  showLegend: true,
  showTrends: true,
  showHealthIndicators: true,
  enableHoverDetails: true,
  comparisonEnabled: false
})

// ─── Composables ─────────────────────────────────────────────────────────────

const { enhanceItems, getTrendIcon, getTrendColor, getHealthColor } = useBudgetDonutPresenter()
const { loadComparisonData, isLoading } = useBudgetComparisonApplication()

// ─── State ───────────────────────────────────────────────────────────────────

const enhancedItems = ref(props.items)

// ─── Load comparison data ────────────────────────────────────────────────────

onMounted(async () => {
  if (props.comparisonEnabled && props.items.length > 0) {
    const { currentSpent, previousSpent } = await loadComparisonData(props.items)
    enhancedItems.value = enhanceItems(props.items, currentSpent, previousSpent)
  } else {
    // If no comparison, just show spent from props (items should already have spent)
    const spentData = props.items.reduce(
      (acc, item) => {
        acc[item.id] = 'spent' in item ? (item as any).spent : 0
        return acc
      },
      {} as Record<string, number>
    )
    enhancedItems.value = enhanceItems(props.items, spentData)
  }
})

// ─── Chart option ────────────────────────────────────────────────────────────

const chartOption = computed<EChartsOption>(() => {
  // Empty state
  if (enhancedItems.value.length === 0) {
    return {
      animation: false,
      series: [
        {
          type: 'pie',
          radius: ['56%', '78%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderWidth: 0
          },
          label: {
            show: false
          },
          data: [
            {
              value: 100,
              itemStyle: {
                color: '#e2e8f0'
              }
            }
          ]
        }
      ]
    }
  }

  // Enhanced state with health indicators
  return {
    animation: {
      duration: 700,
      easing: 'cubicOut'
    },
    tooltip: props.enableHoverDetails
      ? {
          trigger: 'item',
          formatter: (params: any) => {
            const item = enhancedItems.value.find(i => i.name === params.name)
            if (!item) return params.name

            const tooltipData = getTooltipData(item, props.currency)
            const statusText = tooltipData.isOverBudget ? 'Excedido' : 'Disponible'
            const statusColor = tooltipData.isOverBudget ? '#ef4444' : '#22c55e'

            return `
              <div style="padding: 8px;">
                <div style="font-weight: 600; margin-bottom: 8px;">${tooltipData.name}</div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px;">
                  <span style="color: #64748b;">Presupuestado:</span>
                  <span style="font-weight: 500;">${formatCurrency(tooltipData.budgeted, tooltipData.currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px;">
                  <span style="color: #64748b;">Gastado:</span>
                  <span style="font-weight: 500;">${formatCurrency(tooltipData.spent, tooltipData.currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 8px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
                  <span style="color: #64748b;">${statusText}:</span>
                  <span style="font-weight: 600; color: ${statusColor};">${formatCurrency(tooltipData.remaining, tooltipData.currency)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: #64748b;">Utilización:</span>
                  <span style="font-weight: 500;">${formatUtilization(tooltipData.utilization)}</span>
                </div>
                ${
                  tooltipData.trend && props.showTrends
                    ? `
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 4px;">
                  <span style="color: #64748b;">Tendencia:</span>
                  <span style="font-weight: 500;">${tooltipData.trend.direction === 'up' ? '↑' : tooltipData.trend.direction === 'down' ? '↓' : '→'} ${Math.round(tooltipData.trend.percentageChange)}%</span>
                </div>
                `
                    : ''
                }
              </div>
            `
          }
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: ['56%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderWidth: 4,
          borderColor: '#ffffff'
        },
        emphasis: {
          itemStyle: {
            borderWidth: 4,
            borderColor: '#ffffff',
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          },
          scale: true,
          scaleSize: 8
        },
        label: {
          show: false
        },
        data: enhancedItems.value.map(item => {
          const baseColor = getSegmentColor(item.type)
          const health = item.health || 'neutral'
          const borderWidth = props.showHealthIndicators
            ? getSegmentBorderWidth(health)
            : 4

          return {
            name: item.name,
            value: item.percentage,
            itemStyle: {
              color: baseColor,
              borderWidth,
              borderColor:
                props.showHealthIndicators && health !== 'neutral'
                  ? getHealthRingColor(health)
                  : '#ffffff'
            },
            emphasis: {
              scale: true,
              scaleSize: getEmphasisScale(health)
            }
          }
        })
      }
    ]
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const compactTotal = () => formatCompactCurrency(props.total, props.currency)
const fullAmount = (amount: number) => formatCurrency(amount, props.currency)
</script>

<template>
  <div
    :class="
      showLegend
        ? 'budget-donut-chart-enhanced budget-donut-chart-enhanced--with-legend'
        : 'budget-donut-chart-enhanced budget-donut-chart-enhanced--center'
    "
  >
    <!-- Donut + center label -->
    <div
      class="budget-donut-chart-enhanced__donut-wrapper"
      style="width: 180px; height: 180px"
    >
      <ClientOnly>
        <VChart
          :option="chartOption"
          autoresize
          style="width: 180px; height: 180px"
          :loading="isLoading"
        />
        <template #fallback>
          <div class="h-full w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
        </template>
      </ClientOnly>

      <!-- Center text overlay -->
      <div class="budget-donut-chart-enhanced__center-label">
        <span class="budget-donut-chart-enhanced__center-label-title">TOTAL</span>
        <span class="budget-donut-chart-enhanced__center-label-value">
          {{ compactTotal() }}
        </span>
      </div>
    </div>

    <!-- Enhanced Legend -->
    <ul v-if="showLegend" class="budget-donut-chart-enhanced__legend">
      <li
        v-for="item in enhancedItems"
        :key="item.id"
        class="budget-donut-chart-enhanced__legend-item"
      >
        <!-- Dot + label with trend -->
        <div class="budget-donut-chart-enhanced__legend-label">
          <span
            class="budget-donut-chart-enhanced__legend-dot"
            :style="{ backgroundColor: getSegmentColor(item.type) }"
          />
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-1.5">
              <span class="budget-donut-chart-enhanced__legend-text">
                {{ item.name }}
                <span class="budget-donut-chart-enhanced__legend-percent"
                  >({{ item.percentage }}%)</span
                >
              </span>
              <!-- Trend indicator -->
              <span
                v-if="showTrends && item.trend && item.trend.direction !== 'new'"
                :class="[
                  'material-icons text-xs',
                  getTrendColor(item.trend.direction, item.type)
                ]"
              >
                {{ getTrendIcon(item.trend.direction) }}
              </span>
            </div>
            <!-- Utilization bar -->
            <div
              v-if="item.utilization !== undefined"
              class="budget-donut-chart-enhanced__utilization"
            >
              <div class="budget-donut-chart-enhanced__utilization-bar">
                <div
                  class="budget-donut-chart-enhanced__utilization-fill"
                  :style="{
                    width: `${Math.min(item.utilization, 100)}%`,
                    backgroundColor: getSegmentColor(item.type)
                  }"
                />
              </div>
              <span
                v-if="showHealthIndicators"
                :class="[
                  'budget-donut-chart-enhanced__utilization-text',
                  getHealthColor(item.health || 'neutral')
                ]"
              >
                {{ formatUtilization(item.utilization) }}
              </span>
            </div>
          </div>
        </div>
        <!-- Amount -->
        <div class="flex flex-col items-end gap-0.5">
          <span class="budget-donut-chart-enhanced__legend-amount">
            {{ fullAmount(item.budgeted) }}
          </span>
          <span class="text-xs text-slate-500">
            {{ fullAmount(item.spent) }} gastado
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
  .budget-donut-chart-enhanced {
    @apply w-full;
  }
  .budget-donut-chart-enhanced--with-legend {
    @apply flex items-center gap-6;
  }
  .budget-donut-chart-enhanced--center {
    @apply flex justify-center;
  }
  .budget-donut-chart-enhanced__donut-wrapper {
    @apply relative shrink-0;
  }
  .budget-donut-chart-enhanced__center-label {
    @apply pointer-events-none absolute inset-0 flex flex-col items-center justify-center;
  }
  .budget-donut-chart-enhanced__center-label-title {
    @apply text-xs font-medium uppercase tracking-widest text-slate-400;
  }
  .budget-donut-chart-enhanced__center-label-value {
    @apply mt-0.5 text-xl font-extrabold text-slate-800 dark:text-slate-100;
  }
  .budget-donut-chart-enhanced__legend {
    @apply flex-1 space-y-3;
  }
  .budget-donut-chart-enhanced__legend-item {
    @apply flex items-start justify-between gap-3;
  }
  .budget-donut-chart-enhanced__legend-label {
    @apply flex min-w-0 items-start gap-2;
  }
  .budget-donut-chart-enhanced__legend-dot {
    @apply mt-1 h-3 w-3 shrink-0 rounded-full;
  }
  .budget-donut-chart-enhanced__legend-text {
    @apply text-sm text-slate-700 dark:text-slate-300;
  }
  .budget-donut-chart-enhanced__legend-percent {
    @apply text-slate-400;
  }
  .budget-donut-chart-enhanced__legend-amount {
    @apply shrink-0 text-sm font-semibold text-slate-800 dark:text-slate-100;
  }
  .budget-donut-chart-enhanced__utilization {
    @apply flex items-center gap-2;
  }
  .budget-donut-chart-enhanced__utilization-bar {
    @apply h-1 w-20 overflow-hidden rounded-full bg-neutral-100;
  }
  .budget-donut-chart-enhanced__utilization-fill {
    @apply h-full rounded-full transition-all duration-500;
  }
  .budget-donut-chart-enhanced__utilization-text {
    @apply text-xs font-medium;
  }
</style>
