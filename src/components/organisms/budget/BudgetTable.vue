<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Badge, Icon, IconBadge, Text } from '@/components/atoms'
  import type { BudgetStatus } from '@/composables/useBudgetPeriod'
  import { getBudgetStatus, monthFull, STATUS_LABEL } from '@/composables/useBudgetPeriod'
  import type { CurrentBudgetPlan } from '@/types/domain'

  type PlanRow = CurrentBudgetPlan & { status: BudgetStatus }
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'

  // ─── Props & emits ────────────────────────────────────
  interface Props {
    plans: CurrentBudgetPlan[]
    currency: Currency
    selectedYear: number
    pageSize?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    pageSize: 10
  })

  const emit = defineEmits<{
    edit: [id: string]
    duplicate: [id: string]
    delete: [id: string]
  }>()

  // ─── Pagination ───────────────────────────────────────────────────────────────
  const currentPage = ref(1)

  watch(
    () => props.plans,
    () => {
      currentPage.value = 1
    }
  )

  const totalPages = computed(() => Math.ceil(props.plans.length / props.pageSize))
  const showPagination = computed(() => totalPages.value > 1)

  const pagedPlans = computed(() => {
    if (!showPagination.value) return props.plans
    const start = (currentPage.value - 1) * props.pageSize
    return props.plans.slice(start, start + props.pageSize)
  })

  const countLabel = computed(() => {
    const total = props.plans.length
    const unit = `periodo${total !== 1 ? 's' : ''}`
    if (!showPagination.value) return `${total} ${unit}`
    const from = (currentPage.value - 1) * props.pageSize + 1
    const to = Math.min(currentPage.value * props.pageSize, total)
    return `${from}–${to} de ${total} ${unit}`
  })

  const STATUS_VARIANT: Record<BudgetStatus, 'warning' | 'success' | 'default'> = {
    upcoming: 'warning',
    active: 'success',
    closed: 'default'
  }

  const STATUS_ICON_CLASS: Record<BudgetStatus, string> = {
    active: 'bg-primary-50 text-primary-700',
    upcoming: 'bg-secondary-50 text-secondary-700',
    closed: 'bg-gray-100 text-gray-500'
  }

  const plansWithStatus = computed<PlanRow[]>(() =>
    pagedPlans.value.map(p => ({ ...p, status: getBudgetStatus(p.year, p.month) }))
  )
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
  >
    <table class="w-full text-left text-sm">
      <!-- ── Head ─────────────────────────────────────────────────────────── -->
      <thead>
        <tr class="border-b border-slate-200 dark:border-slate-700">
          <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Periodo
          </th>
          <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estado
          </th>
          <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estrategia
          </th>
          <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monto Total ({{ currency }})
          </th>
          <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            % Ejecutado
          </th>
          <th
            class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Acciones
          </th>
        </tr>
      </thead>

      <!-- ── Body ─────────────────────────────────────────────────────────── -->
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
        <tr
          v-for="plan in plansWithStatus"
          :key="plan.id"
          class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
        >
          <!-- Periodo -->
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <IconBadge
                icon="calendar_month"
                size="md"
                :icon-class="STATUS_ICON_CLASS[plan.status]"
              />
              <span class="font-medium text-slate-800 dark:text-slate-100">
                {{ monthFull(plan.month) }} {{ plan.year }}
              </span>
            </div>
          </td>

          <!-- Estado -->
          <td class="px-5 py-4">
            <Badge
              :variant="STATUS_VARIANT[plan.status]"
              :text="STATUS_LABEL[plan.status]"
              size="sm"
            />
          </td>

          <!-- Estrategia -->
          <td class="px-5 py-4">
            <Badge
              :variant="plan.strategy === 'BALANCED' ? 'secondary' : 'default'"
              :text="plan.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada'"
              size="sm"
            />
          </td>

          <!-- Monto -->
          <td class="px-5 py-4">
            <span class="font-semibold text-primary-600 dark:text-primary-400">
              {{ formatCurrency(plan.totalIncome, currency) }}
            </span>
          </td>

          <!-- % Ejecutado -->
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <!-- TODO: replace 0 with real execution % from transactions -->
                <div class="h-full w-0 rounded-full bg-teal-500 transition-all duration-500" />
              </div>
              <span class="text-xs text-slate-500">0%</span>
            </div>
          </td>

          <!-- Acciones -->
          <td class="px-5 py-4 text-right">
            <div class="inline-flex items-center gap-3">
              <!-- VER — siempre visible -->
              <NuxtLink
                :to="`/dashboard/budget/${plan.id}`"
                class="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                VER
              </NuxtLink>

              <!-- EDITAR — activo y próximo -->
              <template v-if="plan.status !== 'closed'">
                <span class="text-slate-200 dark:text-slate-600">|</span>
                <button
                  class="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  @click="emit('edit', plan.id)"
                >
                  EDITAR
                </button>
              </template>

              <!-- DUPLICAR — solo activo -->
              <template v-if="plan.status === 'active'">
                <span class="text-slate-200 dark:text-slate-600">|</span>
                <button
                  class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  @click="emit('duplicate', plan.id)"
                >
                  <Icon name="content_copy" size="xs" />
                  DUPLICAR
                </button>
              </template>

              <!-- ELIMINAR — solo próximo -->
              <template v-if="plan.status === 'upcoming'">
                <span class="text-slate-200 dark:text-slate-600">|</span>
                <button
                  class="dark:text-danger-400 dark:hover:text-danger-300 inline-flex items-center gap-1 text-xs font-medium text-danger-500 hover:text-danger-700"
                  @click="emit('delete', plan.id)"
                >
                  <Icon name="delete_outline" size="xs" />
                  ELIMINAR
                </button>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ── Footer / Pagination ───────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 dark:border-slate-700"
    >
      <Text size="xs" color="muted">Mostrando {{ countLabel }}</Text>

      <div v-if="showPagination" class="flex items-center gap-1">
        <button
          :disabled="currentPage === 1"
          class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
          @click="currentPage--"
        >
          <Icon name="chevron_left" size="sm" />
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          :class="[
            'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
            p === currentPage
              ? 'bg-primary-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          ]"
          @click="currentPage = p"
        >
          {{ p }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
          @click="currentPage++"
        >
          <Icon name="chevron_right" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>
