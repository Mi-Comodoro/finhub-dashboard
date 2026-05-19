<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import SearchInput from '@/components/molecules/input/SearchInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
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

  // ── Filters ────────────────────────────────────────────────────────────────
  const searchQuery = ref('')
  const filterType = ref('all')
  const filterStatus = ref('all')

  const typeFilterOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'income', label: 'Ingreso' },
    { value: 'expense', label: 'Gasto' },
    { value: 'savings', label: 'Ahorro' }
  ]

  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activa' },
    { value: 'inactive', label: 'Inactiva' }
  ]

  const filteredCategories = computed(() => {
    let result = categories.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q))
    }

    if (filterType.value !== 'all') {
      result = result.filter(c => c.type === filterType.value)
    }

    if (filterStatus.value !== 'all') {
      const active = filterStatus.value === 'active'
      result = result.filter(c => c.isSelectable === active)
    }

    return result
  })

  // ── Panel / form ───────────────────────────────────────────────────────────
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

  const bucketLabelMap: Record<string, string> = {
    needs: 'Necesidades',
    wants: 'Gustos'
  }

  const typeFormOptions = [
    { value: 'income', label: 'Ingreso' },
    { value: 'expense', label: 'Gasto' },
    { value: 'savings', label: 'Ahorro' }
  ]

  const bucketFormOptions = [
    { value: 'needs', label: 'Necesidades' },
    { value: 'wants', label: 'Gustos' }
  ]

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
    if (!val) resetForm()
  }

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      isSelectable: form.isSelectable
    }
    if (form.type === 'expense') payload.bucket = form.bucket

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
        <div>
          <Heading level="h3" size="lg" weight="semibold">Listado de categorías</Heading>
          <Text size="xs" color="muted">
            {{ filteredCategories.length }} de {{ categories.length }} categorías
          </Text>
        </div>
      </div>

      <div class="admin-categories-page__filters">
        <div class="admin-categories-page__search">
          <SearchInput
            name="category-search"
            :model-value="searchQuery"
            placeholder="Buscar por nombre..."
            @update:model-value="val => (searchQuery = val)"
          />
        </div>
        <div class="admin-categories-page__filter-selects">
          <Select
            name="filter-type"
            :model-value="filterType"
            :options="typeFilterOptions"
            @update:model-value="val => (filterType = String(val))"
          />
          <Select
            name="filter-status"
            :model-value="filterStatus"
            :options="statusFilterOptions"
            @update:model-value="val => (filterStatus = String(val))"
          />
        </div>
      </div>

      <div v-if="isLoading" class="admin-categories-page__skeleton" />

      <div v-else class="admin-categories-page__table-wrapper">
        <table class="admin-categories-page__table">
          <thead>
            <tr>
              <th class="admin-categories-page__th">Nombre</th>
              <th class="admin-categories-page__th">Tipo</th>
              <th class="admin-categories-page__th">Cubo</th>
              <th class="admin-categories-page__th">Estado</th>
              <th class="admin-categories-page__th">Creado</th>
              <th class="admin-categories-page__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in filteredCategories"
              :key="category.id"
              class="admin-categories-page__tr"
            >
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
                <Text v-if="category.bucket" size="sm" color="muted">
                  {{ bucketLabelMap[category.bucket] ?? category.bucket }}
                </Text>
                <Text v-else size="sm" color="muted">—</Text>
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
            <tr v-if="filteredCategories.length === 0">
              <td colspan="6" class="admin-categories-page__td--empty">
                <Text size="sm" color="muted">
                  {{ searchQuery || filterType !== 'all' || filterStatus !== 'all' ? 'Sin resultados para los filtros aplicados' : 'No hay categorías registradas' }}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Panel crear/editar ─────────────────────────────────────── -->
    <USlideover v-model:open="showPanel" side="right" @update:open="handlePanelClose">
      <template #header>
        <div class="admin-categories-page__panel-header">
          <Heading level="h3" size="lg" weight="semibold">
            {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
          </Heading>
        </div>
      </template>

      <div class="admin-categories-page__panel-body">
        <form class="cat-form" @submit.prevent="handleSubmit">
          <Input
            name="cat-name"
            label="Nombre"
            placeholder="Nombre de la categoría"
            :model-value="form.name"
            required
            @update:model-value="val => (form.name = String(val))"
          />

          <Select
            name="cat-type"
            label="Tipo"
            :model-value="form.type"
            :options="typeFormOptions"
            required
            @update:model-value="val => (form.type = String(val))"
          />

          <Select
            v-if="form.type === 'expense'"
            name="cat-bucket"
            label="Cubo"
            :model-value="form.bucket"
            :options="bucketFormOptions"
            @update:model-value="val => (form.bucket = String(val))"
          />

          <div class="cat-form__toggle-field">
            <Text size="xs" weight="bold" color="default">Activa</Text>
            <div class="cat-form__toggle-row">
              <button
                type="button"
                role="switch"
                :aria-checked="form.isSelectable"
                class="cat-form__toggle"
                :class="{ 'cat-form__toggle--on': form.isSelectable }"
                @click="form.isSelectable = !form.isSelectable"
              >
                <span class="cat-form__toggle-thumb" />
              </button>
              <Text size="xs" color="muted">
                {{ form.isSelectable ? 'Visible para usuarios' : 'Oculta para usuarios' }}
              </Text>
            </div>
          </div>

          <div class="cat-form__actions">
            <Button type="submit" size="sm" variant="primary" :disabled="isLoading">
              {{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}
            </Button>
            <Button type="button" size="sm" variant="ghost" @click="showPanel = false">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </USlideover>

    <!-- ── Modal eliminar ─────────────────────────────────────────── -->
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <Heading level="h3" size="lg" weight="semibold">Eliminar categoría</Heading>
      </template>

      <div class="admin-categories-page__modal-body">
        <Text size="sm" color="muted">
          ¿Estás seguro de que deseas eliminar
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

  .admin-categories-page__filters {
    @apply flex flex-wrap items-end gap-3 border-b border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  .admin-categories-page__search {
    @apply flex-1 min-w-48;
  }

  .admin-categories-page__filter-selects {
    @apply flex items-end gap-3;
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

  /* ── Form ─────────────────────────────────────────────────────── */
  .cat-form {
    @apply space-y-4;
  }

  .cat-form__toggle-field {
    @apply flex flex-col gap-2;
  }

  .cat-form__toggle-row {
    @apply flex items-center gap-3;
  }

  .cat-form__toggle {
    @apply relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-neutral-300 transition-colors duration-200 focus:outline-none dark:bg-neutral-600;
  }

  .cat-form__toggle--on {
    @apply bg-primary-600 dark:bg-primary-500;
  }

  .cat-form__toggle-thumb {
    @apply pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200;
  }

  .cat-form__toggle--on .cat-form__toggle-thumb {
    @apply translate-x-5;
  }

  .cat-form__actions {
    @apply flex items-center gap-2 pt-2;
  }
</style>
