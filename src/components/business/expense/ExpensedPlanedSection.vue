<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'

  import type { Column, RowData } from '@/components/organisms'
  import { useExpenseSectionApplication } from '@/composables/application/useExpenseSectionApplication'

  const emit = defineEmits(['open-form', 'edit', 'remove', 'mark-as-payed'])

  const props = withDefaults(
    defineProps<{
      budgetId?: string
    }>(),
    {
      budgetId: ''
    }
  )

  const { setBudget, fetchExpenses, setSearch, setBucket, setPage, expenses, filters, meta } =
    useExpenseSectionApplication()

  // 🔍 search local (UI)
  const search = ref('')

  // 🪣 bucket filter
  const selectedBucket = ref<string>('')

  onMounted(() => {
    setBudget(props.budgetId)
    fetchExpenses()
  })

  const debouncedSearch = useDebounceFn(() => {
    // Simplemente enviamos el valor actual (sea texto o "")
    setSearch(search.value.trim())
    fetchExpenses()
  }, 400)

  watch(search, debouncedSearch)

  /* =========================
   🪣 BUCKET FILTER
========================= */
  watch(selectedBucket, value => {
    // 'value' ya es un array gracias al 'multiple' del Select
    setBucket(value)
    fetchExpenses()
  })

  /* =========================
   📄 PAGINATION
========================= */
  watch(
    () => filters.value.page,
    () => {
      fetchExpenses()
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
      <div class="flex gap-2">
        <Button variant="secondary" size="sm" icon="add" @click="openForm">Añadir Gastos</Button>
        <Button variant="secondary" size="sm" icon="add" @click="openForm">Añadir Facturas</Button>
      </div>
    </template>
    <template #default>
      <!-- 🔍 SEARCH -->
      <div class="expense-section">
        <div class="expense-section__filters">
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
        <DataTable :columns="columns" :data="expenses" :pagination="meta" @page-change="setPage">
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
            <div class="expense-section__actions">
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

<style scoped lang="postcss">
  .expense-section {
    @apply flex w-full flex-col space-y-2;
  }

  .expense-section__filters {
    @apply flex gap-2;
  }

  .expense-section__actions {
    @apply flex w-full justify-end gap-4;
  }
</style>
