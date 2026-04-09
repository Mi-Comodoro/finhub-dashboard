<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'

  import type { Column, RowData } from '@/components/organisms'
  import { useExpensesStore } from '@/stores/expense.store'

  const emit = defineEmits(['open-form', 'edit', 'remove', 'mark-as-payed'])

  const props = defineProps<{
    budgetId: string
  }>()

  const expenseStore = useExpensesStore()

  // 🔍 search local (UI)
  const search = ref('')

  // 🪣 bucket filter
  const selectedBucket = ref<string>('')

  onMounted(() => {
    expenseStore.setBudget(props.budgetId)
    expenseStore.fetchExpenses()
  })

  const debouncedSearch = useDebounceFn(() => {
    // Simplemente enviamos el valor actual (sea texto o "")
    expenseStore.setSearch(search.value.trim())
    expenseStore.fetchExpenses()
  }, 400)

  watch(search, debouncedSearch)

  /* =========================
   🪣 BUCKET FILTER
========================= */
  watch(selectedBucket, value => {
    // 'value' ya es un array gracias al 'multiple' del Select
    expenseStore.setBucket(value)
    expenseStore.fetchExpenses()
  })

  /* =========================
   📄 PAGINATION
========================= */
  watch(
    () => expenseStore.filters.page,
    () => {
      expenseStore.fetchExpenses()
    }
  )

  /* =========================
   🎯 ACTIONS
========================= */
  const edit = (row: RowData) => emit('edit', row)
  const remove = (row: RowData) => emit('remove', row)
  const markAsPayed = (row: RowData) => emit('mark-as-payed', row)
  const openForm = () => emit('open-form')

  /* =========================
   🎨 HELPERS
========================= */
  const getBucketClassName = (value: string): string => {
    switch (value) {
      case 'needs':
        return '!bg-primary-100 !text-primary-600'
      case 'wants':
        return '!bg-secondary-100 !text-secondary-600'
      case 'savings':
        return '!bg-green-100 !text-green-600'
      default:
        return ''
    }
  }

  const getBucketName = (value: string): string => {
    switch (value) {
      case 'needs':
        return 'Obligaciones'
      case 'wants':
        return 'Opcionales'
      case 'savings':
        return 'Ahorro e Inversiones'
      default:
        return ''
    }
  }

  /* =========================
   📊 DATA
========================= */

  const expenses = computed(() => expenseStore.expenses)

  const bucket = ['needs', 'wants', 'savings']
  const bucketFilter = computed(() =>
    bucket.map(item => {
      return { label: getBucketName(item), value: item }
    })
  )

  /* =========================
   📋 COLUMNS
========================= */
  const columns: Column[] = [
    { key: 'name', label: 'Gasto', bold: true },
    { key: 'expectedAmount', label: 'Monto', type: 'currency', bold: true },
    { key: 'category', label: 'Categoría', type: 'badge' },
    { key: 'bucket', label: 'Grupo', type: 'badge' },
    { key: 'dueDate', label: 'Fecha', type: 'date' },
    { key: 'status', label: 'Estado', type: 'badge' }
  ]
</script>

<template>
  <SectionCard title="Gastos Planificados">
    <template #action>
      <Button variant="secondary" size="sm" icon="add" @click="openForm">Añadir Gastos</Button>
    </template>
    <template #default>
      <!-- 🔍 SEARCH -->
      <div class="flex w-full flex-col space-y-2">
        <div class="flex gap-2">
          <Input v-model="search" placeholder="Buscar..." search-icon />

          <!-- 🪣 BUCKET FILTER -->
          <Select
            v-model="selectedBucket"
            name="bucked"
            multiple
            :options="bucketFilter"
            placeholder="Filtrar por grupo"
          />
        </div>

        <!-- 📊 TABLE -->
        <DataTable
          :columns="columns"
          :data="expenses"
          :pagination="expenseStore.meta"
          @page-change="expenseStore.setPage"
        >
          <template #cell-category="{ value }">
            <Badge size="xs">{{ value }}</Badge>
          </template>

          <template #cell-bucket="{ value }">
            <Badge :class="getBucketClassName(value)" size="xs">
              {{ getBucketName(value) }}
            </Badge>
          </template>

          <template #cell-status="{ value }">
            <Badge variant="secondary" size="xs">
              {{ translate[value.toLowerCase()] || value.toLowerCase() }}
            </Badge>
          </template>

          <template #actions="{ row }">
            <div class="flex w-full justify-end gap-4">
              <Button
                v-if="row.status === 'PLANNED'"
                icon="check"
                icon-only
                variant="ghost"
                size="sm"
                @click="markAsPayed(row)"
              />
              <Button
                v-if="row.status === 'PAID'"
                icon="visibility"
                icon-only
                variant="secondary"
                size="sm"
                @click="edit(row)"
              />
              <Button
                v-if="row.status === 'PLANNED'"
                icon="edit"
                icon-only
                variant="secondary"
                size="sm"
                @click="edit(row)"
              />
              <Button
                v-if="row.status === 'PLANNED'"
                icon="delete"
                icon-only
                variant="danger"
                size="sm"
                @click="remove(row)"
              />
            </div>
          </template>

          <template #empty>No hay gastos aún 🚀</template>
        </DataTable>
      </div>
    </template>
    <template #footer></template>
  </SectionCard>
</template>
