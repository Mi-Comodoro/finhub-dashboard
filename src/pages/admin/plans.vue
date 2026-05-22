<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import MoneyInput from '@/components/molecules/input/MoneyInput.vue'
  import SearchInput from '@/components/molecules/input/SearchInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { ModalWizard } from '@/components/organisms'
  import { usePlansApplication } from '@/composables/application/usePlansApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { PlanData } from '@/types/api'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Planes',
    breadcrumb: 'Planes',
    parents: ['Admin']
  })

  const { fetchPlans, createPlan, updatePlan, deletePlan, plans, isLoading } = usePlansApplication()

  const { success: successToast, error: errorToast } = useFeedback()

  // ── Filters ────────────────────────────────────────────────────────────────
  const searchQuery = ref('')
  const filterStatus = ref('all')
  const filterVisibility = ref('all')

  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ]

  const visibilityFilterOptions = [
    { value: 'all', label: 'Toda la visibilidad' },
    { value: 'public', label: 'Público' },
    { value: 'private', label: 'Privado' }
  ]

  const filteredPlans = computed(() => {
    let result = plans.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    if (filterStatus.value !== 'all') {
      const active = filterStatus.value === 'active'
      result = result.filter(p => p.isActive === active)
    }
    if (filterVisibility.value !== 'all') {
      const isPublic = filterVisibility.value === 'public'
      result = result.filter(p => p.isPublic === isPublic)
    }

    return result
  })

  // ── Pagination ─────────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 15
  const currentPage = ref(1)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPlans.value.length / ITEMS_PER_PAGE))
  )

  const paginatedPlans = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE
    return filteredPlans.value.slice(start, start + ITEMS_PER_PAGE)
  })

  watch([searchQuery, filterStatus, filterVisibility], () => {
    currentPage.value = 1
  })

  // ── Form modal ─────────────────────────────────────────────────────────────
  const showFormModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<string | null>(null)

  const showDeleteModal = ref(false)
  const planToDelete = ref<PlanData | null>(null)

  const currencyOptions = [
    { value: 'COP', label: 'COP' },
    { value: 'USD', label: 'USD' }
  ]

  const form = reactive({
    name: '',
    price: 0,
    currency: 'COP',
    features: [] as string[],
    isActive: true,
    isPublic: false
  })

  const featureInput = ref('')

  const addFeature = () => {
    if (featureInput.value.trim()) {
      form.features.push(featureInput.value.trim())
      featureInput.value = ''
    }
  }

  const removeFeature = (i: number) => form.features.splice(i, 1)

  const resetForm = () => {
    form.name = ''
    form.price = 0
    form.currency = 'COP'
    form.features = []
    form.isActive = true
    form.isPublic = false
    featureInput.value = ''
    isEditing.value = false
    editingId.value = null
  }

  const openCreate = () => {
    resetForm()
    showFormModal.value = true
  }

  const openEdit = (plan: PlanData) => {
    form.name = plan.name
    form.price = plan.price
    form.currency = plan.currency
    form.features = [...plan.features]
    form.isActive = plan.isActive
    form.isPublic = plan.isPublic
    isEditing.value = true
    editingId.value = plan.id
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    resetForm()
  }

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      price: form.price,
      currency: form.currency,
      features: form.features,
      isActive: form.isActive,
      isPublic: form.isPublic
    }

    if (isEditing.value && editingId.value) {
      const { success } = await updatePlan(editingId.value, payload)
      if (success) {
        successToast('Plan actualizado', 'Los cambios se guardaron correctamente.')
        closeFormModal()
        await fetchPlans()
      } else {
        errorToast('Error al actualizar', 'No se pudo actualizar el plan.')
      }
    } else {
      const { success } = await createPlan(payload)
      if (success) {
        successToast('Plan creado', 'El plan fue creado correctamente.')
        closeFormModal()
        await fetchPlans()
      } else {
        errorToast('Error al crear', 'No se pudo crear el plan.')
      }
    }
  }

  const openDeleteModal = (plan: PlanData) => {
    planToDelete.value = plan
    showDeleteModal.value = true
  }

  const cancelDelete = () => {
    showDeleteModal.value = false
    planToDelete.value = null
  }

  const handleDelete = async () => {
    if (!planToDelete.value) return
    const { success } = await deletePlan(planToDelete.value.id)
    if (success) {
      successToast('Plan eliminado', 'El plan fue eliminado correctamente.')
      cancelDelete()
      await fetchPlans()
    } else {
      errorToast('Error al eliminar', 'No se pudo eliminar el plan.')
    }
  }

  const formatPrice = (plan: PlanData) => {
    return Number(plan.price).toLocaleString('es-CO', {
      style: 'currency',
      currency: plan.currency,
      minimumFractionDigits: 2
    })
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
    await fetchPlans()
  })
</script>

<template>
  <div class="admin-plans-page">
    <div class="admin-plans-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Planes</Heading>
        <Text size="xs" color="muted">Gestión de planes del sistema</Text>
      </div>
      <Button size="sm" variant="primary" icon="add" @click="openCreate">Nuevo plan</Button>
    </div>

    <section class="admin-plans-page__table-section">
      <div class="admin-plans-page__table-header">
        <div>
          <Heading level="h3" size="lg" weight="semibold">Listado de planes</Heading>
          <Text size="xs" color="muted">
            {{ filteredPlans.length }} de {{ plans.length }} planes
          </Text>
        </div>
      </div>

      <div class="admin-plans-page__filters">
        <div class="admin-plans-page__search">
          <SearchInput
            name="plan-search"
            :model-value="searchQuery"
            placeholder="Buscar por nombre..."
            @update:model-value="val => (searchQuery = val)"
          />
        </div>
        <div class="admin-plans-page__filter-selects">
          <Select
            name="filter-status"
            :model-value="filterStatus"
            :options="statusFilterOptions"
            @update:model-value="val => (filterStatus = String(val))"
          />
          <Select
            name="filter-visibility"
            :model-value="filterVisibility"
            :options="visibilityFilterOptions"
            @update:model-value="val => (filterVisibility = String(val))"
          />
        </div>
      </div>

      <div v-if="isLoading" class="admin-plans-page__skeleton" />

      <div v-else class="admin-plans-page__table-wrapper">
        <table class="admin-plans-page__table">
          <thead>
            <tr>
              <th class="admin-plans-page__th">Nombre</th>
              <th class="admin-plans-page__th">Precio</th>
              <th class="admin-plans-page__th">Moneda</th>
              <th class="admin-plans-page__th">Activo</th>
              <th class="admin-plans-page__th">Público</th>
              <th class="admin-plans-page__th">Creado</th>
              <th class="admin-plans-page__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in paginatedPlans" :key="plan.id" class="admin-plans-page__tr">
              <td class="admin-plans-page__td">
                <Text size="sm" weight="medium">{{ plan.name }}</Text>
              </td>
              <td class="admin-plans-page__td">
                <Text size="sm" color="muted">{{ formatPrice(plan) }}</Text>
              </td>
              <td class="admin-plans-page__td">
                <Text size="sm" color="muted">{{ plan.currency }}</Text>
              </td>
              <td class="admin-plans-page__td">
                <Badge :variant="plan.isActive ? 'success' : 'default'">
                  {{ plan.isActive ? 'Activo' : 'Inactivo' }}
                </Badge>
              </td>
              <td class="admin-plans-page__td">
                <Badge :variant="plan.isPublic ? 'primary' : 'default'">
                  {{ plan.isPublic ? 'Público' : 'Privado' }}
                </Badge>
              </td>
              <td class="admin-plans-page__td">
                <Text size="sm" color="muted">{{ formatDate(plan.createdAt) }}</Text>
              </td>
              <td class="admin-plans-page__td">
                <div class="admin-plans-page__actions">
                  <Button size="sm" variant="ghost" @click="openEdit(plan)">Editar</Button>
                  <Button size="sm" variant="danger" disabled @click="openDeleteModal(plan)">
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedPlans.length === 0">
              <td colspan="7" class="admin-plans-page__td--empty">
                <Text size="sm" color="muted">
                  {{
                    searchQuery || filterStatus !== 'all' || filterVisibility !== 'all'
                      ? 'Sin resultados para los filtros aplicados'
                      : 'No hay planes registrados'
                  }}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="admin-plans-page__pagination">
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
      <div class="plans-modal">
        <div class="plans-modal__header">
          <Heading level="h3" size="lg" weight="semibold">
            {{ isEditing ? 'Editar plan' : 'Nuevo plan' }}
          </Heading>
          <button type="button" class="plans-modal__close" @click="closeFormModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form class="plans-modal__form" @submit.prevent="handleSubmit">
          <Input
            name="plan-name"
            label="Nombre"
            placeholder="Nombre del plan"
            :model-value="form.name"
            required
            @update:model-value="val => (form.name = String(val))"
          />

          <MoneyInput
            label="Precio"
            :model-value="form.price"
            :currency="form.currency"
            required
            size="sm"
            @update:model-value="val => (form.price = val)"
          />

          <Select
            name="plan-currency"
            label="Moneda"
            :model-value="form.currency"
            :options="currencyOptions"
            @update:model-value="val => (form.currency = String(val))"
          />

          <div class="plans-modal__features">
            <Text size="xs" weight="bold" color="default">Características</Text>
            <div class="plans-modal__feature-input-row">
              <Input
                name="feature-input"
                label=""
                placeholder="Nueva característica"
                :model-value="featureInput"
                @update:model-value="val => (featureInput = String(val))"
              />
              <Button type="button" size="sm" variant="primary" @click="addFeature">Agregar</Button>
            </div>
            <ul v-if="form.features.length > 0" class="plans-modal__feature-list">
              <li
                v-for="(feature, index) in form.features"
                :key="index"
                class="plans-modal__feature-item"
              >
                <Text size="xs">{{ feature }}</Text>
                <button
                  type="button"
                  class="plans-modal__feature-remove"
                  @click="removeFeature(index)"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </li>
            </ul>
          </div>

          <div class="plans-modal__toggle-field">
            <Text size="xs" weight="bold" color="default">Activo</Text>
            <div class="plans-modal__toggle-row">
              <button
                type="button"
                role="switch"
                :aria-checked="form.isActive"
                class="plans-modal__toggle"
                :class="{ 'plans-modal__toggle--on': form.isActive }"
                @click="form.isActive = !form.isActive"
              >
                <span class="plans-modal__toggle-thumb" />
              </button>
              <Text size="xs" color="muted">
                {{ form.isActive ? 'Plan activo' : 'Plan inactivo' }}
              </Text>
            </div>
          </div>

          <div class="plans-modal__toggle-field">
            <Text size="xs" weight="bold" color="default">Público</Text>
            <div class="plans-modal__toggle-row">
              <button
                type="button"
                role="switch"
                :aria-checked="form.isPublic"
                class="plans-modal__toggle"
                :class="{ 'plans-modal__toggle--on': form.isPublic }"
                @click="form.isPublic = !form.isPublic"
              >
                <span class="plans-modal__toggle-thumb" />
              </button>
              <Text size="xs" color="muted">
                {{ form.isPublic ? 'Visible para todos' : 'Solo para administradores' }}
              </Text>
            </div>
          </div>

          <div class="plans-modal__actions">
            <Button type="submit" size="sm" variant="primary" :disabled="isLoading">
              {{ isEditing ? 'Guardar cambios' : 'Crear plan' }}
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
      <div class="plans-modal">
        <div class="plans-modal__header">
          <Heading level="h3" size="lg" weight="semibold">Eliminar plan</Heading>
          <button type="button" class="plans-modal__close" @click="cancelDelete">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <Text size="sm" color="muted">
          ¿Estás seguro de que deseas eliminar
          <strong>{{ planToDelete?.name }}</strong>
          ? Esta acción no se puede deshacer.
        </Text>
        <div class="plans-modal__actions">
          <Button size="sm" variant="danger" :disabled="isLoading" @click="handleDelete">
            Eliminar
          </Button>
          <Button size="sm" variant="ghost" @click="cancelDelete">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .admin-plans-page {
    @apply space-y-4 px-4 py-2;
  }

  .admin-plans-page__header {
    @apply flex items-center justify-between;
  }

  .admin-plans-page__table-section {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-plans-page__table-header {
    @apply flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  .admin-plans-page__filters {
    @apply flex flex-wrap items-end gap-3 border-b border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  .admin-plans-page__search {
    @apply min-w-48 flex-1;
  }

  .admin-plans-page__filter-selects {
    @apply flex items-end gap-3;
  }

  .admin-plans-page__skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-plans-page__table-wrapper {
    @apply overflow-x-auto;
  }

  .admin-plans-page__table {
    @apply w-full text-left;
  }

  .admin-plans-page__th {
    @apply border-b border-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400;
  }

  .admin-plans-page__tr {
    @apply border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .admin-plans-page__td {
    @apply px-5 py-3;
  }

  .admin-plans-page__td--empty {
    @apply px-5 py-12 text-center;
  }

  .admin-plans-page__actions {
    @apply flex items-center gap-2;
  }

  .admin-plans-page__pagination {
    @apply flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  /* ── Modal content ──────────────────────────────────────────────── */
  .plans-modal {
    @apply flex flex-col gap-5;
  }

  .plans-modal__header {
    @apply flex items-center justify-between;
  }

  .plans-modal__close {
    @apply flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .plans-modal__form {
    @apply flex flex-col gap-4;
  }

  .plans-modal__features {
    @apply flex flex-col gap-2;
  }

  .plans-modal__feature-input-row {
    @apply flex items-end gap-2;
  }

  .plans-modal__feature-list {
    @apply flex flex-col gap-1;
  }

  .plans-modal__feature-item {
    @apply flex items-center justify-between rounded-md border border-neutral-100 px-3 py-1.5 dark:border-neutral-700;
  }

  .plans-modal__feature-remove {
    @apply flex h-6 w-6 cursor-pointer items-center justify-center rounded text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .plans-modal__toggle-field {
    @apply flex flex-col gap-2;
  }

  .plans-modal__toggle-row {
    @apply flex items-center gap-3;
  }

  .plans-modal__toggle {
    @apply relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-neutral-300 transition-colors duration-200 focus:outline-none dark:bg-neutral-600;
  }

  .plans-modal__toggle--on {
    @apply bg-primary-600 dark:bg-primary-500;
  }

  .plans-modal__toggle-thumb {
    @apply pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200;
  }

  .plans-modal__toggle--on .plans-modal__toggle-thumb {
    @apply translate-x-5;
  }

  .plans-modal__actions {
    @apply flex items-center gap-2 pt-1;
  }
</style>
