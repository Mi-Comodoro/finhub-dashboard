<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import SearchInput from '@/components/molecules/input/SearchInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { ModalWizard } from '@/components/organisms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { CategoriesData } from '@/types/api'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin']
  })

  const { fetchCategories, createCategory, updateCategory, categories, isLoading } =
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

  // ── Pagination ─────────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 15
  const currentPage = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredCategories.value.length / ITEMS_PER_PAGE)))

  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE
    return filteredCategories.value.slice(start, start + ITEMS_PER_PAGE)
  })

  watch([searchQuery, filterType, filterStatus], () => {
    currentPage.value = 1
  })

  // ── Form modal ─────────────────────────────────────────────────────────────
  const showFormModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const showDeleteModal = ref(false)
  const categoryToDelete = ref<CategoriesData | null>(null)

  const typeVariantMap: Record<string, string> = {
    income: 'primary',
    expense: 'danger',
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
    showFormModal.value = true
  }

  const openEdit = (category: CategoriesData) => {
    form.name = category.name
    form.type = category.type
    form.bucket = category.bucket || 'needs'
    form.isSelectable = category.isSelectable
    isEditing.value = true
    editingId.value = category.id
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    resetForm()
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
        closeFormModal()
        await fetchCategories()
      } else {
        errorToast('Error al actualizar', 'No se pudo actualizar la categoría.')
      }
    } else {
      const { success } = await createCategory(payload)
      if (success) {
        successToast('Categoría creada', 'La categoría fue creada correctamente.')
        closeFormModal()
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
              v-for="category in paginatedCategories"
              :key="category.id"
              class="admin-categories-page__tr"
            >
              <td class="admin-categories-page__td">
                <Text size="sm" weight="medium">{{ category.name }}</Text>
              </td>
              <td class="admin-categories-page__td">
                <Badge :variant="typeVariantMap[category.type] ?? 'default'">
                  {{ typeLabelMap[category.type] ?? category.type }}
                </Badge>
              </td>
              <td class="admin-categories-page__td">
                <Badge v-if="category.bucket" variant="default">
                  {{ bucketLabelMap[category.bucket] ?? category.bucket }}
                </Badge>
                <Text v-else size="xs" color="muted">—</Text>
              </td>
              <td class="admin-categories-page__td">
                <Badge :variant="category.isSelectable ? 'success' : 'default'">
                  {{ category.isSelectable ? 'Activa' : 'Inactiva' }}
                </Badge>
              </td>
              <td class="admin-categories-page__td">
                <Text size="sm" color="muted">{{ formatDate(category.createdAt) }}</Text>
              </td>
              <td class="admin-categories-page__td">
                <div class="admin-categories-page__actions">
                  <Button size="sm" variant="ghost" @click="openEdit(category)">Editar</Button>
                  <Button size="sm" variant="danger" disabled @click="openDeleteModal(category)">
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedCategories.length === 0">
              <td colspan="6" class="admin-categories-page__td--empty">
                <Text size="sm" color="muted">
                  {{
                    searchQuery || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Sin resultados para los filtros aplicados'
                      : 'No hay categorías registradas'
                  }}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="admin-categories-page__pagination">
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_left"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          Anterior
        </Button>
        <Text size="sm" color="muted">Página {{ currentPage }} de {{ totalPages }}</Text>
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_right"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Siguiente
        </Button>
      </div>
    </section>

    <!-- ── Modal crear / editar ───────────────────────────────────────── -->
    <ModalWizard :show="showFormModal">
      <div class="cat-modal">
        <div class="cat-modal__header">
          <Heading level="h3" size="lg" weight="semibold">
            {{ isEditing ? 'Editar categoría' : 'Nueva categoría' }}
          </Heading>
          <button type="button" class="cat-modal__close" @click="closeFormModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form class="cat-modal__form" @submit.prevent="handleSubmit">
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

          <div class="cat-modal__toggle-field">
            <Text size="xs" weight="bold" color="default">Activa</Text>
            <div class="cat-modal__toggle-row">
              <button
                type="button"
                role="switch"
                :aria-checked="form.isSelectable"
                class="cat-modal__toggle"
                :class="{ 'cat-modal__toggle--on': form.isSelectable }"
                @click="form.isSelectable = !form.isSelectable"
              >
                <span class="cat-modal__toggle-thumb" />
              </button>
              <Text size="xs" color="muted">
                {{ form.isSelectable ? 'Visible para usuarios' : 'Oculta para usuarios' }}
              </Text>
            </div>
          </div>

          <div class="cat-modal__actions">
            <Button type="submit" size="sm" variant="primary" :disabled="isLoading">
              {{ isEditing ? 'Guardar cambios' : 'Crear categoría' }}
            </Button>
            <Button type="button" size="sm" variant="ghost" @click="closeFormModal">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </ModalWizard>

    <!-- ── Modal eliminar ─────────────────────────────────────────────── -->
    <ModalWizard :show="showDeleteModal">
      <div class="cat-modal">
        <div class="cat-modal__header">
          <Heading level="h3" size="lg" weight="semibold">Eliminar categoría</Heading>
          <button type="button" class="cat-modal__close" @click="cancelDelete">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <Text size="sm" color="muted">
          ¿Estás seguro de que deseas eliminar
          <strong>{{ categoryToDelete?.name }}</strong>? Esta acción no se puede deshacer.
        </Text>
        <div class="cat-modal__actions">
          <Button size="sm" variant="ghost" @click="cancelDelete">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>
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
    @apply min-w-48 flex-1;
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

  .admin-categories-page__pagination {
    @apply flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  /* ── Modal content ──────────────────────────────────────────────── */
  .cat-modal {
    @apply flex flex-col gap-5;
  }

  .cat-modal__header {
    @apply flex items-center justify-between;
  }

  .cat-modal__close {
    @apply flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .cat-modal__form {
    @apply flex flex-col gap-4;
  }

  .cat-modal__toggle-field {
    @apply flex flex-col gap-2;
  }

  .cat-modal__toggle-row {
    @apply flex items-center gap-3;
  }

  .cat-modal__toggle {
    @apply relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-neutral-300 transition-colors duration-200 focus:outline-none dark:bg-neutral-600;
  }

  .cat-modal__toggle--on {
    @apply bg-primary-600 dark:bg-primary-500;
  }

  .cat-modal__toggle-thumb {
    @apply pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200;
  }

  .cat-modal__toggle--on .cat-modal__toggle-thumb {
    @apply translate-x-5;
  }

  .cat-modal__actions {
    @apply flex items-center gap-2 pt-1;
  }
</style>
