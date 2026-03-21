<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Text } from '@/components/atoms'

  import type { BudgetTableProps } from './types/budget-table.types'

  const props = withDefaults(defineProps<BudgetTableProps>(), {
    pageSize: 10
  })

  defineEmits(['view', 'duplicate', 'delete'] as const)

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

  /*   const pagedPlans = computed(() => {
    if (!showPagination.value) return props.plans
    const start = (currentPage.value - 1) * props.pageSize
    return props.plans.slice(start, start + props.pageSize)
  }) */

  const countLabel = computed(() => {
    const total = props.plans.length
    const unit = `periodo${total !== 1 ? 's' : ''}`
    if (!showPagination.value) return `${total} ${unit}`
    const from = (currentPage.value - 1) * props.pageSize + 1
    const to = Math.min(currentPage.value * props.pageSize, total)
    return `${from}–${to} de ${total} ${unit}`
  })
</script>

<template>
  <div class="budget-table">
    <table class="budget-table__table">
      <thead>
        <tr>
          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Periodo
          </th>
          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Estado Actual
          </th>

          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Total Presupuestado
          </th>
          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            % Ejecutado
          </th>
          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Próximo Cierre
          </th>
          <th
            class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="plan in props.plans"
          :key="plan.id"
          class="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
        >
          <td class="whitespace-nowrap px-5 py-4">{{ plan.month }} / {{ plan.year }}</td>
          <td class="whitespace-nowrap px-5 py-4">
            <span
              :class="[
                'inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium',
                plan.status === 'PLANNED'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              ]"
            >
              {{ plan.status === 'PLANNED' ? 'Planificado' : 'En Progreso' }}
            </span>
          </td>
          <td class="whitespace-nowrap px-5 py-4">
            {{ formatCurrency(10000000, currency) }}
          </td>
          <td class="whitespace-nowrap px-5 py-4">{{ avgExecution }}%</td>
          <td class="whitespace-nowrap px-5 py-4">
            {{ nextClosingDate ?? 'N/A' }}
          </td>
          <td class="flex gap-3">
            <Button variant="primary" icon="visibility" icon-only @click="$emit('view', plan.id)">
              Ver
            </Button>
            <Button
              variant="secondary"
              icon="content_copy"
              icon-only
              @click="$emit('duplicate', plan.id)"
            >
              Duplicar
            </Button>
            <Button variant="danger" icon="delete" icon-only @click="$emit('delete', plan.id)">
              Eliminar
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="budget-table__footer">
      <Text size="xs" color="muted">Mostrando {{ countLabel }}</Text>
      <div v-if="showPagination" class="budget-table__pagination">
        <Button size="sm" variant="outline" :disabled="currentPage === 1" @click="currentPage--">
          Anterior
        </Button>
        <Button
          size="sm"
          variant="outline"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Siguiente
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-table {
    @apply overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800;
  }
  .budget-table__table {
    @apply w-full text-left text-sm;
  }
  .budget-table__footer {
    @apply flex items-center justify-between border-t border-slate-100 px-5 py-3.5 dark:border-slate-700;
  }
  .budget-table__pagination {
    @apply flex items-center gap-1;
  }
</style>
