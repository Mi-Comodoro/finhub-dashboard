<script setup lang="ts">
  import type DataCell from '@/components/organisms/datatable/DataCell.vue'
  import type { Column, RowData } from '@/components/organisms/datatable/types'

  defineProps<{
    columns: Column[]
    data: RowData[]
    loading?: boolean
  }>()
</script>

<template>
  <div class="data-table">
    <div class="data-table__scroll">
      <table class="data-table__table">
        <!-- HEADER -->
        <thead class="data-table__head">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="data-table__th"
              :class="{
                'text-right': col.align === 'right',
                'text-center': col.align === 'center'
              }"
            >
              {{ col.label }}
            </th>

            <th v-if="$slots.actions" class="data-table__th-actions">Acciones</th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody>
          <!-- LOADING -->
          <tr v-if="loading">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="data-table__loading">
              <slot name="loading">Cargando...</slot>
            </td>
          </tr>

          <!-- DATA -->
          <tr v-for="row in data" :key="row.id as string" class="data-table__row">
            <td
              v-for="col in columns"
              :key="col.key"
              class="data-table__cell"
              :class="{
                'text-right': col.align === 'right',
                'text-left': col.align === 'left',
                'text-center': col.align === 'center',
                'font-bold': col.bold ? true : false
              }"
            >
              <DataCell :column="col" :row="row" currency="COP">
                <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
                  <slot :name="slotName" v-bind="slotProps" />
                </template>
              </DataCell>
            </td>

            <!-- ACTIONS -->
            <td v-if="$slots.actions" class="data-table__actions">
              <slot name="actions" :row="row" />
            </td>
          </tr>

          <!-- EMPTY -->
          <tr v-if="!loading && !data.length">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="data-table__empty">
              <slot name="empty">No hay datos</slot>
            </td>
          </tr>
        </tbody>
      </table>
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .data-table {
    @apply w-full overflow-hidden border bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .data-table__scroll {
    @apply overflow-x-auto;
  }

  .data-table__table {
    @apply w-full text-sm;
  }

  .data-table__head {
    @apply bg-gray-200 text-xs uppercase text-gray-700 dark:bg-neutral-700 dark:text-neutral-300;
  }

  .data-table__th {
    @apply p-3 text-left font-bold;
  }

  .data-table__th-actions {
    @apply p-3 text-right;
  }

  .data-table__loading {
    @apply p-6 text-center dark:text-neutral-300;
  }

  .data-table__row {
    @apply border-t transition hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .data-table__cell {
    @apply p-3 text-xs;
  }

  .data-table__actions {
    @apply flex gap-2 p-3 text-right;
  }

  .data-table__empty {
    @apply p-6 text-center text-gray-400 dark:text-neutral-500;
  }
</style>
