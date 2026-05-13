<script setup lang="ts">
  import {
    AnalyticsAhorroView,
    AnalyticsFlujoCajaView,
    AnalyticsGastosView,
    AnalyticsSaludView
  } from '@/components/business'
  import { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'

  definePageMeta({
    layout: 'dashboard',
    title: 'Analítica',
    breadcrumb: 'Analítica'
  })

  const period = useAnalyticsPeriod()
  const { selectedYear, selectedMonth, availableYears, availableMonths } = period
  provide('analyticsPeriod', period)

  const activeTab = ref('salud')

  const tabs = [
    { key: 'salud', label: 'Salud Financiera', icon: 'favorite' },
    { key: 'flujo', label: 'Flujo de Caja', icon: 'waterfall_chart' },
    { key: 'gastos', label: 'Gastos', icon: 'pie_chart' },
    { key: 'ahorro', label: 'Ahorro', icon: 'savings' }
  ]
</script>

<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <div class="analytics-page__title-block">
        <Heading level="h1" size="2xl" weight="extrabold">Analítica</Heading>
        <Text size="xs" color="muted">
          Estadísticas financieras y tendencias de gasto por período.
        </Text>
      </div>

      <div class="analytics-page__period">
        <select v-model="selectedMonth" class="analytics-page__select">
          <option v-for="m in availableMonths" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
        <select v-model="selectedYear" class="analytics-page__select">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="analytics-page__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['analytics-tab', { 'analytics-tab--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span class="material-symbols-outlined analytics-tab__icon">{{ tab.icon }}</span>
        <span class="analytics-tab__label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="analytics-page__content">
      <AnalyticsSaludView v-if="activeTab === 'salud'" />
      <AnalyticsFlujoCajaView v-if="activeTab === 'flujo'" />
      <AnalyticsGastosView v-if="activeTab === 'gastos'" />
      <AnalyticsAhorroView v-if="activeTab === 'ahorro'" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .analytics-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .analytics-page__header {
    @apply flex flex-wrap items-start justify-between gap-4;
  }

  .analytics-page__title-block {
    @apply flex flex-col gap-1;
  }

  .analytics-page__period {
    @apply flex items-center gap-2;
  }

  .analytics-page__select {
    @apply rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 outline-none transition-colors;
    @apply hover:border-primary-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100;
    @apply dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200;
  }

  .analytics-page__tabs {
    @apply flex flex-wrap gap-1 rounded-xl border border-neutral-100 bg-neutral-50 p-1;
    @apply dark:border-neutral-800 dark:bg-neutral-900;
  }

  .analytics-tab {
    @apply flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 transition-all duration-150;
    @apply hover:bg-white hover:text-neutral-700 hover:shadow-sm;
    @apply dark:hover:bg-neutral-800 dark:hover:text-neutral-200;
  }

  .analytics-tab--active {
    @apply bg-white text-primary-700 shadow-sm;
    @apply dark:bg-neutral-800 dark:text-primary-400;
  }

  .analytics-tab__icon {
    @apply flex-shrink-0 text-base leading-none;
  }

  .analytics-tab__label {
    @apply hidden sm:inline;
  }

  .analytics-page__content {
    @apply w-full;
  }
</style>
