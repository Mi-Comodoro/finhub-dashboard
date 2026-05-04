<script setup lang="ts">
  import { Badge, Button, Icon, Text } from '@/components/atoms'
  import { useCategoryPresenter } from '@/composables/presenters/useCategoryPresenter'
  import type { CategoriesData } from '~/types/api'

  interface CategoryListProps {
    categories: CategoriesData[]
    isLoading?: boolean
  }

  withDefaults(defineProps<CategoryListProps>(), {
    isLoading: false
  })

  const emit = defineEmits<{
    edit: [category: CategoriesData]
    delete: [category: CategoriesData]
    add: []
  }>()

  const { getCategoryTypeLabel, getCategoryTypeVariant, getCategoryColorClasses } =
    useCategoryPresenter()
</script>

<template>
  <div class="category-list">
    <div class="category-list__header">
      <Text size="sm" color="muted" weight="medium">Categorías personalizadas</Text>
      <Button variant="primary" size="xs" icon="add" @click="emit('add')">Agregar</Button>
    </div>

    <div v-if="isLoading" class="category-list__loading">
      <Text size="xs" color="muted">Cargando categorías...</Text>
    </div>

    <div v-else-if="categories.length === 0" class="category-list__empty">
      <Icon name="category" size="md" class="category-list__empty-icon" />
      <Text size="xs" color="muted">No hay categorías personalizadas</Text>
      <Text size="xs" color="muted">Agrega categorías para organizar tus gastos</Text>
    </div>

    <div v-else class="category-list__items">
      <div v-for="category in categories" :key="category.id" class="category-list__item">
        <div
          class="category-list__item-indicator"
          :class="getCategoryColorClasses(category.type).bg"
        ></div>

        <div class="category-list__item-info">
          <div class="category-list__item-header">
            <Text size="sm" weight="medium">{{ category.name }}</Text>
            <Badge :variant="getCategoryTypeVariant(category.type)" size="xs">
              {{ getCategoryTypeLabel(category.type) }}
            </Badge>
          </div>
          <div v-if="category.bucket" class="category-list__item-meta">
            <Text size="xs" color="muted">Grupo: {{ category.bucket }}</Text>
          </div>
        </div>

        <div class="category-list__item-actions">
          <Button variant="ghost" size="xs" icon="edit" @click="emit('edit', category)" />
          <Button variant="ghost" size="xs" icon="delete" @click="emit('delete', category)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .category-list {
    @apply space-y-4;
  }

  .category-list__header {
    @apply flex items-center justify-between;
  }

  .category-list__loading {
    @apply rounded-lg border border-slate-100 p-6 text-center;
  }

  .category-list__empty {
    @apply flex flex-col items-center gap-2 rounded-lg border border-slate-100 p-6 text-center;
  }

  .category-list__empty-icon {
    @apply text-slate-400;
  }

  .category-list__items {
    @apply space-y-2;
  }

  .category-list__item {
    @apply relative flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-4 pl-6 transition-colors hover:bg-slate-50;
  }

  .category-list__item-indicator {
    @apply absolute left-0 top-0 h-full w-1 rounded-l-lg;
  }

  .category-list__item-info {
    @apply flex flex-1 flex-col gap-1;
  }

  .category-list__item-header {
    @apply flex items-center gap-2;
  }

  .category-list__item-meta {
    @apply flex items-center gap-2;
  }

  .category-list__item-actions {
    @apply flex items-center gap-1;
  }
</style>
