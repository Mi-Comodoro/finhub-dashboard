<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { CategoriesData } from '@/types/api'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin']
  })

  const { fetchCategories, createCategory, updateCategory, deleteCategory, categories, isLoading } =
    useCategoryApplication()

  const { success: successToast, error: errorToast } = useFeedback()

  const showPanel = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const showDeleteModal = ref(false)
  const categoryToDelete = ref<CategoriesData | null>(null)

  const typeColorMap: Record<string, string> = {
    income: 'primary',
    expense: 'red',
    savings: 'warning'
  }

  const typeLabelMap: Record<string, string> = {
    income: 'Ingreso',
    expense: 'Gasto',
    savings: 'Ahorro'
  }

  const form = reactive({
    name: '',
    type: 'expense',
    bucket: 'needs',
    isSelectable: true
  })

  const resetForm = () => {
    form.name = ''
    form.type = 'expense'
    form.bucket = 'needs'
    form.isSelectable = true
    isEditing.value = false
    editingId.value = null
  }

  const openCreate = () => {
    resetForm()
    showPanel.value = true
  }

  const openEdit = (category: CategoriesData) => {
    form.name = category.name
    form.type = category.type
    form.bucket = category.bucket || 'needs'
    form.isSelectable = category.isSelectable
    isEditing.value = true
    editingId.value = category.id
    showPanel.value = true
  }

  const handlePanelClose = (val: boolean) => {
    if (!val) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      isSelectable: form.isSelectable
    }

    if (form.type === 'expense') {
      payload.bucket = form.bucket
    }

    if (isEditing.value && editingId.value) {
      const { success } = await updateCategory(editingId.value, payload)
      if (success) {
        successToast('Categoría actualizada', 'Los cambios se guardaron correctamente.')
        showPanel.value = false
        resetForm()
        await fetchCategories()
      } else {
        errorToast('Error al actualizar', 'No se pudo actualizar la categoría.')
      }
    } else {
      const { success } = await createCategory(payload)
      if (success) {
        successToast('Categoría creada', 'La categoría fue creada correctamente.')
        showPanel.value = false
        resetForm()
        await fetchCategories()
      } else {
        errorToast('Error al crear', 'No se pudo crear la categoría.')
      }
    }
  }

  const openDeleteModal = (category: CategoriesData) => {
    categoryToDelete.value = category
    showDeleteModal.value = true
  }

  const handleDelete = async () => {
    if (!categoryToDelete.value) return
    const { success } = await deleteCategory(categoryToDelete.value.id)
    if (success) {
      successToast('Categoría eliminada', 'La categoría fue eliminada correctamente.')
      showDeleteModal.value = false
      categoryToDelete.value = null
      await fetchCategories()
    } else {
      errorToast('Error al eliminar', 'No se pudo eliminar la categoría.')
    }
  }

  const cancelDelete = () => {
    showDeleteModal.value = false
    categoryToDelete.value = null
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  onMounted(async () => {
    await fetchCategories()
  })
</script>

<template>
  <div class="admin-categories-page">
    <div class="admin-categories-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Categorías</Heading>
        <Text size="xs" color="muted">Gestión de categorías del sistema</Text>
      </div>
      <Button size="sm" variant="primary" icon="add" @click="openCreate">
        Nueva categoría
      </Button>
    </div>

    <section class="admin-categories-page__table-section">
      <div class="admin-categories-page__table-header">
        <Heading level="h3" size="lg" weight="semibold">Listado de categorías</Heading>
        <Text size="xs" color="muted">{{ categories.length }} categorías en total</Text>
      </div>

      <div v-if="isLoading" class="admin-categories-page__skeleton" />

      <div v-else class="admin-categories-page__table-wrapper">
        <table class="admin-categories-page__table">
          <thead>
            <tr>
              <th class="admin-categories-page__th">Nombre</th>
              <th class="admin-categories-page__th">Tipo</th>
              <th class="admin-categories-page__th">Estado</th>
              <th class="admin-categories-page__th">Creado</th>
              <th class="admin-categories-page__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id" class="admin-categories-page__tr">
              <td class="admin-categories-page__td">
                <Text size="sm" weight="medium">{{ category.name }}</Text>
              </td>
              <td class="admin-categories-page__td">
                <UBadge
                  :color="typeColorMap[category.type] ?? 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ typeLabelMap[category.type] ?? category.type }}
                </UBadge>
              </td>
              <td class="admin-categories-page__td">
                <UBadge
                  :color="category.isSelectable ? 'green' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ category.isSelectable ? 'Activa' : 'Inactiva' }}
                </UBadge>
              </td>
              <td class="admin-categories-page__td">
                <Text size="sm" color="muted">{{ formatDate(category.createdAt) }}</Text>
              </td>
              <td class="admin-categories-page__td">
                <div class="admin-categories-page__actions">
                  <Button size="sm" variant="ghost" @click="openEdit(category)">Editar</Button>
                  <Button size="sm" variant="danger" @click="openDeleteModal(category)">
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="5" class="admin-categories-page__td--empty">
                <Text size="sm" color="muted">No hay categorías registradas</Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <USlideover
      v-model:open="showPanel"
      side="right"
      @update:open="handlePanelClose"
    >
      <template #header>
        <div class="admin-categories-page__panel-header">
          <Heading level="h3" size="lg" weight="semibold">
            {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
          </Heading>
        </div>
      </template>

      <div class="admin-categories-page__panel-body">
        <form class="cat-form" @submit.prevent="handleSubmit">
          <div class="cat-form__field">
            <label class="cat-form__label" for="cat-name">Nombre</label>
            <input
              id="cat-name"
              v-model="form.name"
              class="cat-form__input"
              type="text"
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <div class="cat-form__field">
            <label class="cat-form__label" for="cat-type">Tipo</label>
            <select id="cat-type" v-model="form.type" class="cat-form__select">
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
              <option value="savings">Ahorro</option>
            </select>
          </div>

          <div v-if="form.type === 'expense'" class="cat-form__field">
            <label class="cat-form__label" for="cat-bucket">Cubo</label>
            <select id="cat-bucket" v-model="form.bucket" class="cat-form__select">
              <option value="needs">Necesidades</option>
              <option value="wants">Gustos</option>
            </select>
          </div>

          <div class="cat-form__field cat-form__field--checkbox">
            <input
              id="cat-selectable"
              v-model="form.isSelectable"
              class="cat-form__checkbox"
              type="checkbox"
            />
            <label class="cat-form__label cat-form__label--inline" for="cat-selectable">
              Activa (seleccionable por usuarios)
            </label>
          </div>

          <div class="cat-form__actions">
            <Button type="submit" size="sm" variant="primary" :disabled="isLoading">
              {{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              @click="showPanel = false"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </USlideover>

    <UModal v-model:open="showDeleteModal">
      <template #header>
        <Heading level="h3" size="lg" weight="semibold">Eliminar categoría</Heading>
      </template>

      <div class="admin-categories-page__modal-body">
        <Text size="sm" color="muted">
          ¿Estás seguro de que deseas eliminar la categoría
          <strong>{{ categoryToDelete?.name }}</strong>? Esta acción no se puede deshacer.
        </Text>
      </div>

      <template #footer>
        <div class="admin-categories-page__modal-footer">
          <Button size="sm" variant="danger" :disabled="isLoading" @click="handleDelete">
            Eliminar
          </Button>
          <Button size="sm" variant="ghost" @click="cancelDelete">Cancelar</Button>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped lang="postcss">
  .admin-categories-page {
    @apply space-y-4 px-4 py-2;
  }

  .admin-categories-page__header {
    @apply flex items-center justify-between;
  }

  .admin-categories-page__table-section {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-categories-page__table-header {
    @apply flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  .admin-categories-page__skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-categories-page__table-wrapper {
    @apply overflow-x-auto;
  }

  .admin-categories-page__table {
    @apply w-full text-left;
  }

  .admin-categories-page__th {
    @apply border-b border-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400;
  }

  .admin-categories-page__tr {
    @apply border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .admin-categories-page__td {
    @apply px-5 py-3;
  }

  .admin-categories-page__td--empty {
    @apply px-5 py-12 text-center;
  }

  .admin-categories-page__actions {
    @apply flex items-center gap-2;
  }

  .admin-categories-page__panel-header {
    @apply p-4;
  }

  .admin-categories-page__panel-body {
    @apply p-4;
  }

  .admin-categories-page__modal-body {
    @apply px-4 py-2;
  }

  .admin-categories-page__modal-footer {
    @apply flex items-center gap-2 p-4;
  }

  .cat-form {
    @apply space-y-4;
  }

  .cat-form__field {
    @apply flex flex-col gap-1;
  }

  .cat-form__field--checkbox {
    @apply flex-row items-center gap-2;
  }

  .cat-form__label {
    @apply text-xs font-semibold text-neutral-600 dark:text-neutral-300;
  }

  .cat-form__label--inline {
    @apply cursor-pointer;
  }

  .cat-form__input {
    @apply w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 dark:focus:border-primary-400;
  }

  .cat-form__select {
    @apply w-full cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-primary-400;
  }

  .cat-form__checkbox {
    @apply h-4 w-4 cursor-pointer rounded border-neutral-300 accent-primary-500;
  }

  .cat-form__actions {
    @apply flex items-center gap-2 pt-2;
  }
</style>
