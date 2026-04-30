<!-- components/business/TransactionFiltersBar.vue -->
<script setup lang="ts">
  import type { TransactionType } from '~/types/api'

  type FilterType = TransactionType | 'all'

  withDefaults(defineProps<{
    categoryOptions?: { label: string; value: string; disabled?: boolean }[]
    typeButtons?: { label: string; value: FilterType }[]
    activeTypeBtn?: FilterType
  }>(), {
    categoryOptions: () => [],
    typeButtons: () => [],
    activeTypeBtn: 'all'
  })

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
    <div class="filters-bar">
      <div class="filters-bar__type-buttons">
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

      <div class="filters-bar__separator" />

      <Select
        v-model="filterCat"
        name="categoryId"
        :initial-option="{ label: 'Todas las categorías', value: '', disabled: false }"
        :options="[{ label: 'Todas', value: '' }, ...categoryOptions]"
      />

      <div class="filters-bar__separator" />

      <DatePickerInput v-model="filterDateFrom" label="Desde" />
      <DatePickerInput v-model="filterDateTo" label="Hasta" />

      <Button variant="ghost" size="sm" class="filters-bar__clear-button" @click="emit('clearFilters')">
        Limpiar filtros
      </Button>
    </div>
  </Card>
</template>

<style scoped lang="postcss">
.filters-bar {
  @apply flex flex-wrap items-center gap-3;
}

.filters-bar__type-buttons {
  @apply flex items-center gap-2;
}

.filters-bar__separator {
  @apply hidden h-5 w-px bg-slate-200 sm:block;
}

.filters-bar__clear-button {
  @apply ml-auto;
}
</style>
