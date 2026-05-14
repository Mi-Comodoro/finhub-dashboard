<script setup lang="ts">
  import VChart from 'vue-echarts'

  import { Card, Heading, Text } from '@/components/atoms'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import { useAnalyticsExpensesApplication } from '@/composables/application/useAnalyticsExpensesApplication'
  import { useExpensesPresenter } from '@/composables/presenters/useExpensesPresenter'
  import type { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCurrency } from '@/utils/currency'

  const period = inject<ReturnType<typeof useAnalyticsPeriod>>('analyticsPeriod')!
  const { selectedYear, selectedMonth } = period

  const { fetchExpensesByPeriod, currency } = useAnalyticsExpensesApplication()
  const { groupByBucket, groupByCategory } = useExpensesPresenter()

  const { data: expenses, pending } = await useAsyncData(
    'analytics-expenses',
    () => fetchExpensesByPeriod(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const currentLevel = ref<'bucket' | 'category'>('bucket')

  const byBucket = computed(() => groupByBucket(expenses.value ?? []))
  const byCategory = computed(() => groupByCategory(expenses.value ?? []))

  const chartData = computed(() =>
    currentLevel.value === 'bucket' ? byBucket.value : byCategory.value
  )

  const total = computed(() => chartData.value.reduce((sum, item) => sum + item.value, 0))

  const hasData = computed(() => (expenses.value ?? []).length > 0)

  const chartOption = computed(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${formatCurrency(params.value, currency.value)} (${params.percent}%)`
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data: chartData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.25)',
          },
        },
      },
    ],
  }))
</script>

<template>
  <div class="gastos-view">
    <div v-if="pending" class="gastos-view__skeleton" />

    <template v-else>
      <div v-if="!hasData" class="gastos-view__empty-wrapper">
        <EmptyStateIllustration type="no-transactions" class="gastos-view__empty-illustration" />
        <Heading level="h3" size="lg" weight="semibold">Sin gastos registrados</Heading>
        <Text size="sm" color="muted">
          No hay gastos para el período seleccionado.
        </Text>
      </div>

      <template v-else>
        <Card class="gastos-view__card">
          <div class="gastos-view__header">
            <Heading level="h3" size="lg" weight="semibold">Distribución de Gastos</Heading>

            <div class="gastos-view__toggle">
              <button
                :class="['gastos-toggle__btn', { 'gastos-toggle__btn--active': currentLevel === 'bucket' }]"
                @click="currentLevel = 'bucket'"
              >
                Por tipo
              </button>
              <button
                :class="['gastos-toggle__btn', { 'gastos-toggle__btn--active': currentLevel === 'category' }]"
                @click="currentLevel = 'category'"
              >
                Por categoría
              </button>
            </div>
          </div>

          <div class="gastos-view__body">
            <div class="gastos-view__chart-wrapper">
              <ClientOnly>
                <VChart :option="chartOption" autoresize class="gastos-view__chart" />
                <template #fallback>
                  <div class="gastos-view__chart-fallback">
                    <div class="gastos-view__chart-skeleton" />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <div class="gastos-view__table">
              <div class="gastos-table__header">
                <Text size="xs" weight="semibold" color="muted">Nombre</Text>
                <Text size="xs" weight="semibold" color="muted" class="gastos-table__cell--right">Monto</Text>
                <Text size="xs" weight="semibold" color="muted" class="gastos-table__cell--right">%</Text>
              </div>

              <div
                v-for="item in chartData"
                :key="item.name"
                class="gastos-table__row"
              >
                <div class="gastos-table__name">
                  <span class="gastos-table__dot" :style="{ backgroundColor: item.itemStyle.color }" />
                  <Text size="sm">{{ item.name }}</Text>
                </div>
                <Text size="sm" weight="medium" class="gastos-table__cell--right">
                  {{ formatCurrency(item.value, currency) }}
                </Text>
                <Text size="sm" color="muted" class="gastos-table__cell--right">
                  {{ total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0' }}%
                </Text>
              </div>

              <div class="gastos-table__footer">
                <Text size="sm" weight="semibold">Total</Text>
                <Text size="sm" weight="bold" class="gastos-table__cell--right">
                  {{ formatCurrency(total, currency) }}
                </Text>
                <Text size="sm" color="muted" class="gastos-table__cell--right">100%</Text>
              </div>
            </div>
          </div>
        </Card>
      </template>
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .gastos-view {
    @apply flex flex-col gap-4;
  }

  .gastos-view__skeleton {
    @apply h-96 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .gastos-view__empty-wrapper {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .gastos-view__empty-illustration {
    @apply h-32 w-32;
  }

  .gastos-view__card {
    @apply p-5;
  }

  .gastos-view__header {
    @apply mb-4 flex flex-wrap items-center justify-between gap-3;
  }

  .gastos-view__toggle {
    @apply flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1;
    @apply dark:border-neutral-700 dark:bg-neutral-900;
  }

  .gastos-toggle__btn {
    @apply rounded-md px-3 py-1.5 text-sm font-medium text-neutral-500 transition-all duration-150;
    @apply hover:bg-white hover:text-neutral-700 hover:shadow-sm;
    @apply dark:hover:bg-neutral-800 dark:hover:text-neutral-200;
  }

  .gastos-toggle__btn--active {
    @apply bg-white text-primary-700 shadow-sm;
    @apply dark:bg-neutral-800 dark:text-primary-400;
  }

  .gastos-view__body {
    @apply grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start;
  }

  .gastos-view__chart-wrapper {
    @apply flex items-center justify-center;
  }

  .gastos-view__chart {
    @apply h-64 w-full;
  }

  .gastos-view__chart-fallback {
    @apply flex h-64 items-center justify-center;
  }

  .gastos-view__chart-skeleton {
    @apply h-full w-full animate-pulse rounded-lg bg-slate-100;
  }

  .gastos-view__table {
    @apply flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800;
  }

  .gastos-table__header {
    @apply grid grid-cols-[1fr,auto,auto] gap-3 pb-2;
  }

  .gastos-table__row {
    @apply grid grid-cols-[1fr,auto,auto] items-center gap-3 py-2.5;
  }

  .gastos-table__footer {
    @apply grid grid-cols-[1fr,auto,auto] items-center gap-3 border-t border-neutral-200 pt-3;
    @apply dark:border-neutral-700;
  }

  .gastos-table__name {
    @apply flex items-center gap-2;
  }

  .gastos-table__dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }

  .gastos-table__cell--right {
    @apply text-right;
  }
</style>
