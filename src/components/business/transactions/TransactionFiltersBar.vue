<!-- components/business/TransactionFiltersBar.vue -->
<script setup lang="ts">
  import type { TransactionType } from '~/types/api'

  type FilterType = TransactionType | 'all'

  defineProps<{
    categoryOptions: { label: string; value: string; disabled?: boolean }[]
    typeButtons: { label: string; value: FilterType }[]
    activeTypeBtn: FilterType
  }>()

  const filterCat = defineModel<string>('filterCat', { default: '' })
  const filterDateFrom = defineModel<Date | null>('filterDateFrom', { default: null })
  const filterDateTo = defineModel<Date | null>('filterDateTo', { default: null })

  const emit = defineEmits<{
    setType: [type: FilterType]
    clearFilters: []
  }>()
</script>

<template>
  <Card>
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <Button
          v-for="btn in typeButtons"
          :key="btn.value"
          :variant="activeTypeBtn === btn.value ? 'primary' : 'ghost'"
          size="sm"
          @click="emit('setType', btn.value)"
        >
          {{ btn.label }}
        </Button>
      </div>

      <div class="hidden h-5 w-px bg-slate-200 sm:block" />

      <Select
        v-model="filterCat"
        name="categoryId"
        :initial-option="{ label: 'Todas las categorías', value: '', disabled: false }"
        :options="[{ label: 'Todas', value: '' }, ...categoryOptions]"
      />

      <div class="hidden h-5 w-px bg-slate-200 sm:block" />

      <DatePickerInput v-model="filterDateFrom" label="Desde" />
      <DatePickerInput v-model="filterDateTo" label="Hasta" />

      <Button variant="ghost" size="sm" class="ml-auto" @click="emit('clearFilters')">
        Limpiar filtros
      </Button>
    </div>
  </Card>
</template>
