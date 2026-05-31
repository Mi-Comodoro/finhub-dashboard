<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'

  import type { Column, RowData } from '@/components/organisms/datatable/types'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { useExpenseSectionApplication } from '@/composables/application/useExpenseSectionApplication'
  import { useFeedback } from '@/composables/useFeedBack'

  const emit = defineEmits([
    'open-form',
    'open-bill-import',
    'edit',
    'view',
    'remove',
    'mark-as-payed'
  ])

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
  const { completeExpense } = useExpenseApplication()
  const { error: errorToast } = useFeedback()

  // 🔍 search local (UI)
  const search = ref('')

  // 🪣 bucket filter
  const selectedBucket = ref<string>('')

  // loading id for mark-as-paid button
  const markingAsPaidId = ref<string | null>(null)

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
  const view = (row: RowData) => emit('view', row)
  const remove = (row: RowData) => emit('remove', row)
  const openForm = () => emit('open-form')
  const openBillImport = () => emit('open-bill-import')

  const markAsPayed = async (row: RowData) => {
    if (markingAsPaidId.value) return
    markingAsPaidId.value = row.id as string
    try {
      const { success } = await completeExpense(row.id as string)
      if (success) emit('mark-as-payed', row)
      else errorToast('Error al pagar', 'No se pudo marcar el gasto como pagado.')
    } finally {
      markingAsPaidId.value = null
    }
  }

  /* =========================
   🎨 HELPERS
========================= */
  const statusLabels: Record<string, string> = {
    planned: 'Planificado',
    paid: 'Pagado',
    canceled: 'Cancelado',
    skipped: 'Omitido'
  }

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
        <Button variant="secondary" size="sm" icon="sync" @click="openBillImport">
          Importar Facturas
        </Button>
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
          <template #cell-name="{ value, row }">
            <span class="expense-section__name-cell">
              {{ value }}
              <span
                v-if="row.billsId"
                class="material-symbols-outlined expense-section__bill-icon"
                title="Importado de factura recurrente"
              >
                sync
              </span>
            </span>
          </template>

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
              {{ statusLabels[value.toLowerCase()] ?? value.toLowerCase() }}
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
                :disabled="markingAsPaidId === row.id"
                @click="markAsPayed(row)"
              />
              <Button
                v-if="row.status === 'PAID'"
                icon="visibility"
                icon-only
                variant="secondary"
                size="sm"
                @click="view(row)"
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

  .expense-section__name-cell {
    @apply flex items-center gap-1 font-semibold;
  }

  .expense-section__bill-icon {
    @apply text-xs text-primary-500;
  }
</style>
