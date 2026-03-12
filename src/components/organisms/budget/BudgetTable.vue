<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Text } from '@/components/atoms'

  import type { BudgetTableProps } from './types/budget-table.types'

  const props = withDefaults(defineProps<BudgetTableProps>(), {
    pageSize: 10
  })

  /* const emit = defineEmits(['edit', 'duplicate', 'delete'] as const) */

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
      <!-- ...existing code... -->
    </table>
    <div class="budget-table__footer">
      <Text size="xs" color="muted">Mostrando {{ countLabel }}</Text>
      <div v-if="showPagination" class="budget-table__pagination">
        <!-- ...existing code... -->
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
