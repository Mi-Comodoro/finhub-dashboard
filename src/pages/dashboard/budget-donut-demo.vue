<script setup lang="ts">
  import { computed, ref } from 'vue'

  import { Heading, Text } from '@/components/atoms'
  import type {
    BudgetDonutItem,
    BudgetDonutItemEnhanced
  } from '@/components/molecules/budget-donut-chart'
  import {
    BudgetDonutChart,
    BudgetDonutChartEnhanced
  } from '@/components/molecules/budget-donut-chart'
  import { useExpenseSectionApplication } from '@/composables/application/useExpenseSectionApplication'
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useCommon } from '@/composables/useCommon'
  import { percentOf } from '@/utils/currency'

  definePageMeta({
    layout: 'dashboard',
    title: 'Budget Donut Comparison Demo',
    breadcrumb: 'Demo'
  })

  const { currentBudget, currency } = useCommon()
  const { expectedAmount } = usePlannedIncomeApplication()
  const { expenses } = useExpenseSectionApplication()
  const { totalSavingGenerated } = usePlannedSavingApplication()

  // Base items for both charts
  const baseItems = computed((): BudgetDonutItem[] => {
    if (!currentBudget.value || !expectedAmount.value) return []

    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(expectedAmount.value, currentBudget.value.limits.needs, currency.value),
        percentage: currentBudget.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables',
        type: 'wants' as const,
        budgeted: percentOf(expectedAmount.value, currentBudget.value.limits.wants, currency.value),
        percentage: currentBudget.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(
          expectedAmount.value,
          currentBudget.value.limits.savings,
          currency.value
        ),
        percentage: currentBudget.value.limits.savings
      }
    ]
  })

  // Enhanced items with spent data
  const enhancedItems = computed((): BudgetDonutItemEnhanced[] => {
    const budgetExpenses = expenses.value ?? []

    const needsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'needs')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const wantsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'wants')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const savingsSpent = totalSavingGenerated.value || 0

    return baseItems.value.map(item => ({
      ...item,
      spent: item.type === 'needs' ? needsSpent : item.type === 'wants' ? wantsSpent : savingsSpent
    }))
  })

  const showComparison = ref(false)
</script>

<template>
  <div class="space-y-6 p-4">
    <div>
      <Heading level="h1" size="2xl" weight="extrabold" class="mb-2">
        Budget Donut Chart - Comparison Demo
      </Heading>
      <Text size="sm" color="muted">
        Comparing the original (v1) and enhanced (v2) versions of the BudgetDonutChart component
      </Text>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <label class="flex items-center gap-2">
        <input v-model="showComparison" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
        <Text size="sm">Enable comparison mode (fetch previous period data)</Text>
      </label>
    </div>

    <!-- Comparison Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- V1 - Original -->
      <div
        class="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <Heading level="h2" size="lg" weight="semibold">Version 1 (Original)</Heading>
          <span
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            BudgetDonutChart
          </span>
        </div>
        <div class="flex justify-center">
          <BudgetDonutChart
            v-if="baseItems.length > 0"
            :items="baseItems"
            :total="expectedAmount"
            :currency="currency"
            :show-legend="true"
          />
          <div v-else class="py-8">
            <Text size="sm" color="muted">No budget data available</Text>
          </div>
        </div>
        <div class="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <Text size="xs" weight="semibold" class="uppercase text-slate-500">Features:</Text>
          <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>✓ Basic donut chart</li>
            <li>✓ Category breakdown</li>
            <li>✓ Percentage display</li>
            <li>✓ Simple legend</li>
          </ul>
        </div>
      </div>

      <!-- V2 - Enhanced -->
      <div class="rounded-lg border-2 border-primary-500 bg-white p-6 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <Heading level="h2" size="lg" weight="semibold">Version 2 (Enhanced)</Heading>
          <span
            class="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
          >
            BudgetDonutChartEnhanced
          </span>
        </div>
        <div class="flex justify-center">
          <BudgetDonutChartEnhanced
            v-if="enhancedItems.length > 0"
            :items="enhancedItems"
            :total="expectedAmount"
            :currency="currency"
            :show-legend="true"
            :show-trends="true"
            :show-health-indicators="true"
            :enable-hover-details="true"
            :comparison-enabled="showComparison"
          />
          <div v-else class="py-8">
            <Text size="sm" color="muted">No budget data available</Text>
          </div>
        </div>
        <div class="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <Text size="xs" weight="semibold" class="uppercase text-slate-500">Features:</Text>
          <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>✓ All v1 features</li>
            <li>✓ Enhanced tooltips (budgeted/spent/remaining)</li>
            <li>✓ Trend indicators (↑↓→)</li>
            <li>✓ Health status rings</li>
            <li>✓ Utilization bars</li>
            <li>✓ Month-over-month comparison</li>
            <li>✓ Hover animations</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Technical Details -->
    <div
      class="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800"
    >
      <Heading level="h3" size="md" weight="semibold" class="mb-3">
        Technical Implementation
      </Heading>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Text size="xs" weight="semibold" class="mb-2 uppercase text-slate-500">
            Architecture
          </Text>
          <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>• Hexagonal architecture</li>
            <li>• Presentation composables</li>
            <li>• Application composables</li>
            <li>• Visual utils</li>
          </ul>
        </div>
        <div>
          <Text size="xs" weight="semibold" class="mb-2 uppercase text-slate-500">Analytics</Text>
          <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>• Health calculation</li>
            <li>• Trend analysis</li>
            <li>• Utilization metrics</li>
            <li>• Period comparison</li>
          </ul>
        </div>
        <div>
          <Text size="xs" weight="semibold" class="mb-2 uppercase text-slate-500">
            Compatibility
          </Text>
          <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>• Backward compatible</li>
            <li>• Parallel versions</li>
            <li>• Same design tokens</li>
            <li>• Opt-in features</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
