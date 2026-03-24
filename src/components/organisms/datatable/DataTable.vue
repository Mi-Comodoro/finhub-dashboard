<script setup lang="ts">
  import type { Column, DataCell, RowData } from '@/components/organisms'

  defineProps<{
    columns: Column[]
    data: RowData[]
    loading?: boolean
  }>()
</script>

<template>
  <div class="w-full overflow-hidden border bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <!-- HEADER -->
        <thead class="bg-gray-50 uppercase text-gray-500">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="p-3 text-left font-bold"
              :class="{
                'text-right': col.align === 'right',
                'text-center': col.align === 'center'
              }"
            >
              {{ col.label }}
            </th>

            <th v-if="$slots.actions" class="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody>
          <!-- LOADING -->
          <tr v-if="loading">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="p-6 text-center">
              <slot name="loading">Cargando...</slot>
            </td>
          </tr>

          <!-- DATA -->
          <tr
            v-for="row in data"
            :key="row.id as string"
            class="border-t transition hover:bg-gray-50"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="p-3"
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
            <td v-if="$slots.actions" class="flex gap-2 p-3 text-right">
              <slot name="actions" :row="row" />
            </td>
          </tr>

          <!-- EMPTY -->
          <tr v-if="!loading && !data.length">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="p-6 text-center text-gray-400"
            >
              <slot name="empty">No hay datos</slot>
            </td>
          </tr>
        </tbody>
      </table>
      <slot name="footer" />
    </div>
  </div>
</template>
