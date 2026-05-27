<script setup lang="ts">
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'

  const AnalyticsSaludView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsSaludView.vue')
  )
  const AnalyticsFlujoCajaView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsFlujoCajaView.vue')
  )
  const AnalyticsGastosView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsGastosView.vue')
  )
  const AnalyticsAhorroView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsAhorroView.vue')
  )
  const AnalyticsNetPositionView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsNetPositionView.vue')
  )

  definePageMeta({
    layout: 'dashboard',
    title: 'Analítica',
    breadcrumb: 'Analítica'
  })

  const period = useAnalyticsPeriod()
  const { selectedYear, selectedMonth, availableYears, availableMonths, periodLabel } = period
  provide('analyticsPeriod', period)

  const FINANCIAL_TIP =
    'El ahorro mensual constante genera más impacto que un ahorro esporádico grande.'

  const navGroups = [
    {
      label: 'Visión General',
      items: [
        { id: 'salud', label: 'Salud Financiera' },
        { id: 'flujo', label: 'Flujo de Caja' },
        { id: 'gastos', label: 'Gastos' }
      ]
    },
    {
      label: 'Tendencias',
      items: [
        { id: 'ahorro', label: 'Ahorro' },
        { id: 'posicion', label: 'Posición Neta' }
      ]
    }
  ]

  const scrollTo = (id: string) => {
    if (import.meta.client) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
</script>

<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <div class="analytics-page__title-block">
        <Heading level="h1" size="2xl" weight="extrabold">Analítica</Heading>
        <Text size="xs" color="muted">
          Entiende en detalle a dónde y cómo evolucionan tus finanzas.
        </Text>
      </div>
      <div class="analytics-page__period">
        <Select
          v-model="selectedMonth"
          name="month"
          :options="availableMonths.map(m => ({ label: m.label, value: m.value }))"
        />
        <Select
          v-model="selectedYear"
          name="year"
          :options="availableYears.map(y => ({ label: String(y), value: y }))"
        />
      </div>
    </div>

    <div class="analytics-page__body">
      <!-- ── Main content ── -->
      <div class="analytics-page__main">
        <!-- Salud Financiera -->
        <section id="salud" class="analytics-section">
          <p class="analytics-section__group-label">VISIÓN GENERAL</p>
          <Heading level="h2" size="xl" weight="bold">Salud Financiera</Heading>
          <Text size="sm" color="muted">
            Sabiendo en dónde te ubicas y cómo evolucionan tus finanzas.
          </Text>
          <div class="analytics-section__content">
            <AnalyticsSaludView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <!-- Flujo de Caja -->
        <section id="flujo" class="analytics-section">
          <p class="analytics-section__group-label">MOVIMIENTOS DEL PERÍODO</p>
          <Heading level="h2" size="xl" weight="bold">Flujo de Caja</Heading>
          <Text size="sm" color="muted">Ingresos, gastos y excedente.</Text>
          <div class="analytics-section__content">
            <AnalyticsFlujoCajaView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <!-- Gastos -->
        <section id="gastos" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Gastos</Heading>
          <Text size="sm" color="muted">Por tipo y categoría.</Text>
          <div class="analytics-section__content">
            <AnalyticsGastosView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <!-- Ahorro -->
        <section id="ahorro" class="analytics-section">
          <p class="analytics-section__group-label">TENDENCIAS</p>
          <Heading level="h2" size="xl" weight="bold">Ahorro</Heading>
          <Text size="sm" color="muted">Neto libre a meta.</Text>
          <div class="analytics-section__content">
            <AnalyticsAhorroView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <!-- Posición Neta -->
        <section id="posicion" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Posición Neta</Heading>
          <Text size="sm" color="muted">Activos fijos + Por cobrar.</Text>
          <div class="analytics-section__content">
            <AnalyticsNetPositionView />
          </div>
        </section>
      </div>

      <!-- ── Sidebar ── -->
      <aside class="analytics-page__sidebar">
        <div class="analytics-sidebar">
          <!-- Period badge -->
          <div class="analytics-sidebar__period">
            <span class="material-symbols-outlined analytics-sidebar__period-icon">
              calendar_today
            </span>
            <span class="analytics-sidebar__period-text">Período activo: {{ periodLabel }}</span>
          </div>

          <!-- Anchor navigation -->
          <nav class="analytics-sidebar__nav">
            <template v-for="group in navGroups" :key="group.label">
              <p class="analytics-sidebar__group">› {{ group.label }}</p>
              <button
                v-for="item in group.items"
                :key="item.id"
                class="analytics-sidebar__link"
                @click="scrollTo(item.id)"
              >
                {{ item.label }}
              </button>
            </template>
          </nav>

          <!-- Financial tip -->
          <div class="analytics-sidebar__tip">
            <span class="material-symbols-outlined analytics-sidebar__tip-icon">lightbulb</span>
            <Text size="xs" color="muted">{{ FINANCIAL_TIP }}</Text>
          </div>
        </div>
      </aside>
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

  /* Body: 2-column grid on large screens */
  .analytics-page__body {
    @apply grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px];
  }

  .analytics-page__main {
    @apply flex min-w-0 flex-col gap-10;
  }

  /* Sidebar hidden on mobile */
  .analytics-page__sidebar {
    @apply hidden lg:block;
  }

  /* ── Sections ── */
  .analytics-section {
    @apply flex scroll-mt-4 flex-col gap-2;
  }

  .analytics-section__group-label {
    @apply text-xs font-bold uppercase tracking-widest text-neutral-400;
  }

  .analytics-section__content {
    @apply mt-2;
  }

  .analytics-section__divider {
    @apply border-t border-neutral-100;
  }

  /* ── Sidebar ── */
  .analytics-sidebar {
    @apply sticky top-4 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .analytics-sidebar__period {
    @apply flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2;
    @apply dark:bg-primary-900;
  }

  .analytics-sidebar__period-icon {
    @apply shrink-0 text-sm leading-none text-primary-600 dark:text-primary-400;
  }

  .analytics-sidebar__period-text {
    @apply text-xs font-semibold text-primary-700 dark:text-primary-300;
  }

  .analytics-sidebar__nav {
    @apply flex flex-col gap-0.5;
  }

  .analytics-sidebar__group {
    @apply mt-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500;
  }

  .analytics-sidebar__link {
    @apply w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-600 transition-colors;
    @apply hover:bg-neutral-50 hover:text-primary-700;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-primary-400;
  }

  .analytics-sidebar__tip {
    @apply flex items-start gap-2 rounded-lg bg-warning-50 p-3;
    @apply dark:bg-warning-900;
  }

  .analytics-sidebar__tip-icon {
    @apply shrink-0 text-base leading-none text-warning-500;
  }
</style>
