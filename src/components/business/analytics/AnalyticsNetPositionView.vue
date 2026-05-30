<script setup lang="ts">
  import { BarChart, type BarSeriesOption, LineChart, type LineSeriesOption } from 'echarts/charts'
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
  import { useAnalyticsApplication } from '@/composables/application/useAnalyticsApplication'
  import { useAnalyticsNetPositionApplication } from '@/composables/application/useAnalyticsNetPositionApplication'
  import { useTheme } from '@/composables/useTheme'
  import { useFinancesStore } from '@/stores/finances.store'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    LineSeriesOption | BarSeriesOption | GridComponentOption | TooltipComponentOption
  >

  const { netPosition, loadingPosition, debtProjection, loadingProjection, netPositionColor } =
    useAnalyticsNetPositionApplication()

  const { healthScore } = useAnalyticsApplication()

  const debtRatio = computed(() => healthScore.value?.debtRatio ?? null)

  const hasPaymentHistory = computed(() => debtProjection.value?.hasPaymentHistory ?? false)

  const isLoading = computed(() => loadingPosition.value || loadingProjection.value)

  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.profile?.currency || 'COP')

  function kpiValueClass(amount: number): string {
    const formatted = formatCompactCurrency(amount, currency.value)
    if (formatted.length > 16) return 'net-position-view__kpi-value--xs'
    if (formatted.length > 12) return 'net-position-view__kpi-value--sm'
    return ''
  }

  const { isDark } = useTheme()
  const chartAxisColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
  const chartGridColor = computed(() => (isDark.value ? '#334155' : '#e2e8f0'))

  const chartOption = computed<EChartsOption>(() => ({
    grid: { left: '2%', right: '2%', top: 16, bottom: '2%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ seriesName: string; value: number }>) =>
        params
          .map(
            p =>
              `${p.seriesName}: <strong>${formatCurrency(Number(p.value ?? 0), currency.value)}</strong>`
          )
          .join('<br/>')
    },
    xAxis: {
      type: 'category',
      data: debtProjection.value?.projection.map(p => p.month) ?? [],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: chartGridColor.value } },
      axisLabel: { color: chartAxisColor.value, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: chartAxisColor.value,
        fontSize: 11,
        formatter: (value: number) => formatCompactCurrency(value, currency.value)
      },
      splitLine: { lineStyle: { color: chartGridColor.value, type: 'dashed' } }
    },
    series: [
      {
        name: 'Balance proyectado',
        type: 'line',
        smooth: true,
        data: debtProjection.value?.projection.map(p => p.projectedBalance) ?? [],
        areaStyle: { opacity: 0.2, color: CHART_COLORS.expense },
        itemStyle: { color: CHART_COLORS.expense },
        lineStyle: { color: CHART_COLORS.expense, width: 3 }
      },
      {
        name: 'Pagos mínimos',
        type: 'bar',
        data: debtProjection.value?.projection.map(p => p.minimumPayments) ?? [],
        itemStyle: { color: CHART_COLORS.savings }
      }
    ]
  }))
</script>

<template>
  <div class="net-position-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="net-position-view__loading">
      <div class="net-position-view__kpis-skeleton">
        <div v-for="i in 4" :key="i" class="net-position-view__kpi-skeleton" />
      </div>
      <div class="net-position-view__ratio-skeleton" />
      <div class="net-position-view__chart-skeleton" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!netPosition" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Sin datos de posición neta</p>
      <p class="analytics-view__empty-description">
        Registra tus deudas para ver tu posición financiera
      </p>
    </div>

    <!-- Content -->
    <div v-else class="net-position-view__content">
      <!-- KPI cards -->
      <div class="net-position-view__kpis">
        <!-- Activos libres -->
        <div class="net-position-view__kpi-card net-position-view__kpi-card--primary">
          <div class="net-position-view__kpi-icon net-position-view__kpi-icon--primary">
            <span class="material-symbols-outlined net-position-view__kpi-icon-svg">
              account_balance_wallet
            </span>
          </div>
          <div class="net-position-view__kpi-body">
            <Text size="xs" color="muted">Activos fijos</Text>
            <p
              :class="['net-position-view__kpi-value', kpiValueClass(netPosition.totalAssets)]"
              :title="formatCurrency(netPosition.totalAssets, currency)"
            >
              {{ formatCompactCurrency(netPosition.totalAssets, currency) }}
            </p>
          </div>
        </div>

        <!-- Deudas totales -->
        <div class="net-position-view__kpi-card net-position-view__kpi-card--danger">
          <div class="net-position-view__kpi-icon net-position-view__kpi-icon--danger">
            <span class="material-symbols-outlined net-position-view__kpi-icon-svg">
              credit_card
            </span>
          </div>
          <div class="net-position-view__kpi-body">
            <Text size="xs" color="muted">Deudas totales</Text>
            <p
              :class="['net-position-view__kpi-value', kpiValueClass(netPosition.totalDebts)]"
              :title="formatCurrency(netPosition.totalDebts, currency)"
            >
              {{ formatCompactCurrency(netPosition.totalDebts, currency) }}
            </p>
          </div>
        </div>

        <!-- Por cobrar -->
        <div class="net-position-view__kpi-card net-position-view__kpi-card--warning">
          <div class="net-position-view__kpi-icon net-position-view__kpi-icon--warning">
            <span class="material-symbols-outlined net-position-view__kpi-icon-svg">payments</span>
          </div>
          <div class="net-position-view__kpi-body">
            <Text size="xs" color="muted">Por cobrar</Text>
            <p
              :class="['net-position-view__kpi-value', kpiValueClass(netPosition.totalReceivable)]"
              :title="formatCurrency(netPosition.totalReceivable, currency)"
            >
              {{ formatCompactCurrency(netPosition.totalReceivable, currency) }}
            </p>
          </div>
        </div>

        <!-- Posición neta (dynamic color) -->
        <div
          :class="[
            'net-position-view__kpi-card',
            `net-position-view__kpi-card--${netPositionColor}`
          ]"
        >
          <div
            :class="[
              'net-position-view__kpi-icon',
              `net-position-view__kpi-icon--${netPositionColor}`
            ]"
          >
            <span class="material-symbols-outlined net-position-view__kpi-icon-svg">balance</span>
          </div>
          <div class="net-position-view__kpi-body">
            <Text size="xs" color="muted">Posición neta</Text>
            <p
              :class="['net-position-view__kpi-value', kpiValueClass(netPosition.netPosition)]"
              :title="formatCurrency(netPosition.netPosition, currency)"
            >
              {{ formatCompactCurrency(netPosition.netPosition, currency) }}
            </p>
            <p class="net-position-view__kpi-hint">Activos + Por cobrar − Deudas</p>
          </div>
        </div>
      </div>

      <!-- Debt ratio -->
      <div v-if="debtRatio && debtRatio.totalDebt === 0" class="net-position-view__no-debts">
        <span class="material-symbols-outlined net-position-view__no-debts-icon">check_circle</span>
        <Text size="sm" color="muted">Sin deudas registradas.</Text>
      </div>

      <template v-else-if="debtRatio && debtRatio.totalDebt > 0">
        <div class="net-position-view__ratio-card">
          <div class="net-position-view__ratio-header">
            <Heading level="h3" size="lg" weight="semibold">Ratio deuda / ingreso</Heading>
            <span
              :class="[
                'net-position-view__ratio-badge',
                `net-position-view__ratio-badge--${debtRatio.badge}`
              ]"
            >
              {{ debtRatio.label }}
            </span>
          </div>

          <div class="net-position-view__ratio-track">
            <div
              :class="[
                'net-position-view__ratio-bar',
                `net-position-view__ratio-bar--${debtRatio.badge}`
              ]"
              :style="{ width: `${Math.min(debtRatio.ratio, 100)}%` }"
            />
          </div>

          <div class="net-position-view__ratio-meta">
            <Text size="sm" weight="semibold">{{ debtRatio.ratio.toFixed(1) }}%</Text>
          </div>
          <p class="net-position-view__ratio-hint">Deuda total sobre ingreso anual estimado.</p>
        </div>

        <!-- Debt projection chart (only when there's actual payment history) -->
        <div v-if="hasPaymentHistory" class="net-position-view__chart-card">
          <div class="net-position-view__chart-header">
            <Heading level="h3" size="lg" weight="semibold">Proyección de deuda</Heading>
            <Text size="xs" color="muted">Balance proyectado y pagos mínimos mensuales</Text>
          </div>
          <div v-if="debtProjection?.simplified" class="net-position-view__simplified-note">
            <span class="material-symbols-outlined net-position-view__simplified-icon">info</span>
            <Text size="xs" color="muted">
              Proyección lineal simplificada. No incluye interés compuesto.
            </Text>
          </div>
          <div class="net-position-view__chart-body">
            <ClientOnly>
              <VChart
                v-if="debtProjection && (debtProjection.projection?.length ?? 0) > 0"
                :option="chartOption"
                autoresize
                class="net-position-view__chart"
              />
              <div v-else class="net-position-view__chart-empty">
                <Text size="sm" color="muted">Sin datos de proyección disponibles.</Text>
              </div>
              <template #fallback>
                <div class="net-position-view__chart net-position-view__chart--loading">
                  <div class="net-position-view__chart-inner-skeleton" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .net-position-view {
    @apply flex flex-col gap-4;
  }

  /* Loading */
  .net-position-view__loading {
    @apply flex flex-col gap-4;
  }

  .net-position-view__kpis-skeleton {
    @apply grid grid-cols-2 gap-3 sm:grid-cols-4;
  }

  .net-position-view__kpi-skeleton {
    @apply h-24 animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  .net-position-view__ratio-skeleton {
    @apply h-24 animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  .net-position-view__chart-skeleton {
    @apply h-72 animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  /* Empty */
  .analytics-view__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .analytics-view__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  .analytics-view__empty-title {
    @apply text-base font-semibold text-neutral-800;
    @apply dark:text-neutral-200;
  }

  .analytics-view__empty-description {
    @apply max-w-xs text-sm text-neutral-500;
    @apply dark:text-neutral-400;
  }

  /* Content */
  .net-position-view__content {
    @apply flex flex-col gap-4;
  }

  /* KPI grid */
  .net-position-view__kpis {
    @apply grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4;
  }

  .net-position-view__kpi-card {
    @apply flex min-w-0 items-start gap-3 rounded-xl border p-4;
  }

  .net-position-view__kpi-card--primary {
    @apply border-primary-100 bg-primary-50;
    @apply dark:border-primary-800 dark:bg-primary-900/20;
  }

  .net-position-view__kpi-card--danger {
    @apply border-danger-100 bg-danger-50;
    @apply dark:border-danger-800 dark:bg-danger-900/20;
  }

  .net-position-view__kpi-card--warning {
    @apply border-warning-100 bg-warning-50;
    @apply dark:border-warning-800 dark:bg-warning-900/20;
  }

  .net-position-view__kpi-card--success {
    @apply border-success-100 bg-success-50;
    @apply dark:border-success-800 dark:bg-success-900/20;
  }

  .net-position-view__kpi-icon {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-lg;
  }

  .net-position-view__kpi-icon--primary {
    @apply bg-primary-100 dark:bg-primary-800;
  }

  .net-position-view__kpi-icon--danger {
    @apply bg-danger-100 dark:bg-danger-800;
  }

  .net-position-view__kpi-icon--warning {
    @apply bg-warning-100 dark:bg-warning-800;
  }

  .net-position-view__kpi-icon--success {
    @apply bg-success-100 dark:bg-success-800;
  }

  .net-position-view__kpi-icon-svg {
    @apply text-xl leading-none;
  }

  .net-position-view__kpi-icon--primary .net-position-view__kpi-icon-svg {
    @apply text-primary-600 dark:text-primary-400;
  }

  .net-position-view__kpi-icon--danger .net-position-view__kpi-icon-svg {
    @apply text-danger-600 dark:text-danger-400;
  }

  .net-position-view__kpi-icon--warning .net-position-view__kpi-icon-svg {
    @apply text-warning-600 dark:text-warning-400;
  }

  .net-position-view__kpi-icon--success .net-position-view__kpi-icon-svg {
    @apply text-success-600 dark:text-success-400;
  }

  .net-position-view__kpi-body {
    @apply flex min-w-0 flex-col gap-0.5;
    overflow-wrap: anywhere;
  }

  .net-position-view__kpi-value {
    @apply font-sans text-lg font-bold leading-snug text-black;
    @apply dark:text-neutral-100;
  }

  .net-position-view__kpi-value--sm {
    @apply text-base;
  }

  .net-position-view__kpi-value--xs {
    @apply text-sm;
  }

  .net-position-view__kpi-hint {
    @apply text-[11px] leading-tight text-neutral-400;
  }

  /* Ratio card */
  .net-position-view__ratio-card {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .net-position-view__ratio-header {
    @apply flex items-center justify-between gap-3;
  }

  .net-position-view__ratio-track {
    @apply h-3 overflow-hidden rounded-full bg-neutral-100;
    @apply dark:bg-neutral-700;
  }

  .net-position-view__ratio-bar {
    @apply h-full rounded-full transition-all duration-700;
  }

  .net-position-view__ratio-bar--primary {
    @apply bg-primary-500;
  }

  .net-position-view__ratio-bar--warning {
    @apply bg-warning-500;
  }

  .net-position-view__ratio-bar--danger {
    @apply bg-danger-500;
  }

  .net-position-view__ratio-badge {
    @apply inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold;
  }

  .net-position-view__ratio-badge--primary {
    @apply bg-primary-100 text-primary-700;
    @apply dark:bg-primary-900/30 dark:text-primary-400;
  }

  .net-position-view__ratio-badge--warning {
    @apply bg-warning-100 text-warning-700;
    @apply dark:bg-warning-900/30 dark:text-warning-400;
  }

  .net-position-view__ratio-badge--danger {
    @apply bg-danger-100 text-danger-700;
    @apply dark:bg-danger-900/30 dark:text-danger-400;
  }

  .net-position-view__ratio-badge--success {
    @apply bg-success-100 text-success-700;
    @apply dark:bg-success-900/30 dark:text-success-400;
  }

  .net-position-view__ratio-bar--success {
    @apply bg-success-500;
  }

  .net-position-view__ratio-meta {
    @apply flex items-center justify-between gap-2;
  }

  .net-position-view__ratio-hint {
    @apply text-xs text-neutral-500 dark:text-neutral-400;
  }

  /* Chart card */
  .net-position-view__chart-card {
    @apply rounded-xl border border-neutral-200 bg-white;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .net-position-view__chart-header {
    @apply flex flex-col gap-0.5 border-b border-neutral-100 px-5 py-4;
    @apply dark:border-neutral-700;
  }

  .net-position-view__simplified-note {
    @apply flex items-center gap-1.5 border-b border-neutral-100 px-5 py-3;
    @apply dark:border-neutral-700;
  }

  .net-position-view__simplified-icon {
    @apply text-sm leading-none text-neutral-400;
  }

  .net-position-view__chart-body {
    @apply p-5;
  }

  .net-position-view__chart {
    @apply h-80 w-full;
  }

  .net-position-view__chart--loading {
    @apply flex items-center justify-center;
  }

  .net-position-view__chart-inner-skeleton {
    @apply h-full w-full animate-pulse rounded-lg bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  .net-position-view__chart-empty {
    @apply flex h-40 items-center justify-center;
  }

  .net-position-view__no-debts {
    @apply flex items-center gap-2 rounded-lg bg-success-50 px-3 py-3;
    @apply dark:bg-success-900/20;
  }

  .net-position-view__no-debts-icon {
    @apply shrink-0 text-base leading-none text-success-600;
  }
</style>
