<script setup lang="ts">
  import { CategoryForm, CategoryList } from '@/components/business'
  import { ModalWizard } from '@/components/organisms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useSettingsApplication } from '@/composables/application/useSettingsApplication'
  import { useFeedback } from '@/composables/useFeedback'
  import type { BudgetDefaults, NotificationSettings } from '@/stores/settings.store'
  import type { CategoriesData } from '~/types/api'

  definePageMeta({
    layout: 'dashboard',
    title: 'Configuración',
    breadcrumb: 'Configuración'
  })

  const {
    notifications,
    budgetDefaults,
    currency,
    isLoading,
    error,
    loadSettings,
    updateNotifications,
    updateBudgetDefaults,
    updateCurrency
  } = useSettingsApplication()

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    deleteCategory
  } = useCategoryApplication()

  const { success: successToast } = useFeedback()

  // Local state for forms
  const notificationsForm = ref<NotificationSettings>({
    emailNotifications: false,
    budgetAlerts: false,
    savingsReminders: false,
    transactionUpdates: false
  })

  const budgetForm = ref<BudgetDefaults>({
    strategy: 'BALANCED',
    needsPercentage: 50,
    wantsPercentage: 30,
    savingsPercentage: 20
  })

  const currencyForm = ref('')

  // Category form state
  const showCategoryForm = ref(false)
  const editingCategory = ref<{ id: string; data: Record<string, unknown> } | null>(null)

  // Category delete confirmation state
  const categoryToDelete = ref<CategoriesData | null>(null)
  const showDeleteConfirmation = ref(false)

  // Currency options
  const currencyOptions = [
    { label: 'USD - Dólar Estadounidense', value: 'USD' },
    { label: 'MXN - Peso Mexicano', value: 'MXN' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'CAD - Dólar Canadiense', value: 'CAD' },
    { label: 'COP - Peso Colombiano', value: 'COP' },
    { label: 'ARS - Peso Argentino', value: 'ARS' },
    { label: 'CLP - Peso Chileno', value: 'CLP' },
    { label: 'PEN - Sol Peruano', value: 'PEN' }
  ]

  // Strategy options
  const strategyOptions = [
    { label: '50/30/20 (Regla Balanceada)', value: 'BALANCED' },
    { label: 'Personalizada', value: 'CUSTOM' }
  ]

  // Watch for changes in store and update forms
  watch(
    () => notifications.value,
    (newNotifications) => {
      notificationsForm.value = { ...newNotifications }
    },
    { immediate: true, deep: true }
  )

  watch(
    () => budgetDefaults.value,
    (newBudgetDefaults) => {
      budgetForm.value = { ...newBudgetDefaults }
    },
    { immediate: true, deep: true }
  )

  watch(
    () => currency.value,
    (newCurrency) => {
      currencyForm.value = newCurrency
    },
    { immediate: true }
  )

  // Handlers
  const handleSaveNotifications = async () => {
    const { success } = await updateNotifications(notificationsForm.value)
    if (success) {
      successToast('Notificaciones actualizadas', 'Tus preferencias de notificación han sido guardadas.')
    }
  }

  const handleSaveBudgetDefaults = async () => {
    // Validate percentages total 100%
    const total =
      budgetForm.value.needsPercentage +
      budgetForm.value.wantsPercentage +
      budgetForm.value.savingsPercentage

    if (total !== 100) {
      alert('Los porcentajes deben sumar 100%')
      return
    }

    const { success } = await updateBudgetDefaults(budgetForm.value)
    if (success) {
      successToast('Configuración de presupuesto actualizada', 'Tus valores predeterminados han sido guardados.')
    }
  }

  const handleSaveCurrency = async () => {
    const { success } = await updateCurrency(currencyForm.value)
    if (success) {
      successToast('Moneda actualizada', 'Tu moneda predeterminada ha sido cambiada.')
    }
  }

  const handleStrategyChange = () => {
    if (budgetForm.value.strategy === 'BALANCED') {
      budgetForm.value.needsPercentage = 50
      budgetForm.value.wantsPercentage = 30
      budgetForm.value.savingsPercentage = 20
    }
  }

  // Category handlers
  const handleAddCategory = () => {
    editingCategory.value = null
    showCategoryForm.value = true
  }

  const handleEditCategory = (category: CategoriesData) => {
    editingCategory.value = {
      id: category.id,
      data: {
        name: category.name,
        type: category.type
      }
    }
    showCategoryForm.value = true
  }

  const handleDeleteCategory = (category: CategoriesData) => {
    categoryToDelete.value = category
    showDeleteConfirmation.value = true
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete.value) return

    const { success } = await deleteCategory(categoryToDelete.value.id)
    if (success) {
      successToast('Categoría eliminada', 'La categoría fue eliminada correctamente.')
    }

    showDeleteConfirmation.value = false
    categoryToDelete.value = null
  }

  const cancelDeleteCategory = () => {
    showDeleteConfirmation.value = false
    categoryToDelete.value = null
  }

  const handleCloseCategoryForm = () => {
    showCategoryForm.value = false
    editingCategory.value = null
  }

  // Load settings on mount
  onMounted(async () => {
    await loadSettings()
    await fetchCategories()
  })
</script>

<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="settings-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="settings-page__title">Configuración</Heading>
        <Text size="sm" color="muted">Personaliza tu experiencia en FinHub</Text>
      </div>
    </div>

    <!-- Error State -->
    <Card v-if="error" class="settings-page__error">
      <Text color="danger" size="sm">{{ error }}</Text>
    </Card>

    <!-- Loading State -->
    <div v-if="isLoading && !notifications" class="settings-page__loading">
      <Text size="sm" color="muted">Cargando configuración...</Text>
    </div>

    <!-- Settings Sections -->
    <div v-else class="settings-page__sections">
      <!-- Notifications Section -->
      <Card class="settings-page__section">
        <div class="settings-page__section-header">
          <div class="settings-page__section-title">
            <Icon name="notifications" size="md" class="settings-page__section-icon" />
            <div>
              <Heading level="h2" size="lg" weight="bold">Notificaciones</Heading>
              <Text size="xs" color="muted">Gestiona cómo quieres recibir actualizaciones</Text>
            </div>
          </div>
        </div>

        <div class="settings-page__section-content">
          <div class="settings-page__switch-group">
            <div class="settings-page__switch-item">
              <div>
                <Text size="sm" weight="medium">Notificaciones por correo</Text>
                <Text size="xs" color="muted">Recibe resúmenes semanales y actualizaciones importantes</Text>
              </div>
              <input
                v-model="notificationsForm.emailNotifications"
                type="checkbox"
                class="settings-page__switch"
              />
            </div>

            <div class="settings-page__switch-item">
              <div>
                <Text size="sm" weight="medium">Alertas de presupuesto</Text>
                <Text size="xs" color="muted">Te avisamos cuando te acerques a tus límites</Text>
              </div>
              <input v-model="notificationsForm.budgetAlerts" type="checkbox" class="settings-page__switch" />
            </div>

            <div class="settings-page__switch-item">
              <div>
                <Text size="sm" weight="medium">Recordatorios de ahorro</Text>
                <Text size="xs" color="muted">Mantente motivado con recordatorios de tus metas</Text>
              </div>
              <input
                v-model="notificationsForm.savingsReminders"
                type="checkbox"
                class="settings-page__switch"
              />
            </div>

            <div class="settings-page__switch-item">
              <div>
                <Text size="sm" weight="medium">Actualizaciones de transacciones</Text>
                <Text size="xs" color="muted">Notificaciones en tiempo real de movimientos</Text>
              </div>
              <input
                v-model="notificationsForm.transactionUpdates"
                type="checkbox"
                class="settings-page__switch"
              />
            </div>
          </div>

          <div class="settings-page__section-actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveNotifications">
              Guardar Notificaciones
            </Button>
          </div>
        </div>
      </Card>

      <!-- Budget Defaults Section -->
      <Card class="settings-page__section">
        <div class="settings-page__section-header">
          <div class="settings-page__section-title">
            <Icon name="account_balance_wallet" size="md" class="settings-page__section-icon--primary" />
            <div>
              <Heading level="h2" size="lg" weight="bold">Presupuesto Predeterminado</Heading>
              <Text size="xs" color="muted">Define los valores por defecto para nuevos presupuestos</Text>
            </div>
          </div>
        </div>

        <div class="settings-page__section-content">
          <div class="settings-page__form">
            <Select
              v-model="budgetForm.strategy"
              name="strategy"
              label="Estrategia de Presupuesto"
              :options="strategyOptions"
              @update:model-value="handleStrategyChange"
            />

            <div class="settings-page__percentages">
              <div class="settings-page__percentage-item">
                <Text size="xs" color="muted" weight="medium">Necesidades</Text>
                <Input
                  v-model.number="budgetForm.needsPercentage"
                  type="number"
                  name="needs"
                  :disabled="budgetForm.strategy === 'BALANCED'"
                  min="0"
                  max="100"
                />
                <Text size="xs" color="muted">%</Text>
              </div>

              <div class="settings-page__percentage-item">
                <Text size="xs" color="muted" weight="medium">Deseos</Text>
                <Input
                  v-model.number="budgetForm.wantsPercentage"
                  type="number"
                  name="wants"
                  :disabled="budgetForm.strategy === 'BALANCED'"
                  min="0"
                  max="100"
                />
                <Text size="xs" color="muted">%</Text>
              </div>

              <div class="settings-page__percentage-item">
                <Text size="xs" color="muted" weight="medium">Ahorros</Text>
                <Input
                  v-model.number="budgetForm.savingsPercentage"
                  type="number"
                  name="savings"
                  :disabled="budgetForm.strategy === 'BALANCED'"
                  min="0"
                  max="100"
                />
                <Text size="xs" color="muted">%</Text>
              </div>
            </div>

            <Text
              size="xs"
              :color="
                budgetForm.needsPercentage + budgetForm.wantsPercentage + budgetForm.savingsPercentage === 100
                  ? 'success'
                  : 'danger'
              "
              weight="medium"
            >
              Total:
              {{ budgetForm.needsPercentage + budgetForm.wantsPercentage + budgetForm.savingsPercentage }}%
              {{
                budgetForm.needsPercentage + budgetForm.wantsPercentage + budgetForm.savingsPercentage === 100
                  ? '✓'
                  : '(Debe sumar 100%)'
              }}
            </Text>
          </div>

          <div class="settings-page__section-actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveBudgetDefaults">
              Guardar Configuración
            </Button>
          </div>
        </div>
      </Card>

      <!-- Currency Section -->
      <Card class="settings-page__section">
        <div class="settings-page__section-header">
          <div class="settings-page__section-title">
            <Icon name="attach_money" size="md" class="settings-page__section-icon--success" />
            <div>
              <Heading level="h2" size="lg" weight="bold">Moneda Predeterminada</Heading>
              <Text size="xs" color="muted">Selecciona tu moneda principal</Text>
            </div>
          </div>
        </div>

        <div class="settings-page__section-content">
          <div class="settings-page__form">
            <Select
              v-model="currencyForm"
              name="currency"
              label="Moneda"
              :options="currencyOptions"
            />
          </div>

          <div class="settings-page__section-actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveCurrency">
              Guardar Moneda
            </Button>
          </div>
        </div>
      </Card>

      <!-- Category Management Section -->
      <Card class="settings-page__section">
        <div class="settings-page__section-header">
          <div class="settings-page__section-title">
            <Icon name="category" size="md" class="settings-page__section-icon--primary" />
            <div>
              <Heading level="h2" size="lg" weight="bold">Gestión de Categorías</Heading>
              <Text size="xs" color="muted">Administra tus categorías personalizadas</Text>
            </div>
          </div>
        </div>

        <div class="settings-page__section-content">
          <Card v-if="categoriesError" class="settings-page__error">
            <Text color="danger" size="sm">{{ categoriesError }}</Text>
          </Card>

          <CategoryList
            :categories="categories"
            :is-loading="categoriesLoading"
            @add="handleAddCategory"
            @edit="handleEditCategory"
            @delete="handleDeleteCategory"
          />
        </div>
      </Card>
    </div>

    <!-- Category Form Modal -->
    <ModalWizard v-model:show="showCategoryForm">
      <CategoryForm
        :category-id="editingCategory?.id"
        :initial-data="editingCategory?.data"
        @on-close="handleCloseCategoryForm"
      />
    </ModalWizard>

    <!-- Delete Confirmation Modal -->
    <ModalWizard v-model:show="showDeleteConfirmation">
      <div class="delete-confirmation">
        <div class="delete-confirmation__header">
          <Icon name="warning" size="lg" class="delete-confirmation__icon" />
          <Heading level="h2" size="xl" weight="bold">Confirmar eliminación</Heading>
        </div>

        <div class="delete-confirmation__content">
          <Text size="sm" color="muted">
            ¿Estás seguro de que deseas eliminar la categoría
            <strong>"{{ categoryToDelete?.name }}"</strong>?
          </Text>
          <Text size="sm" color="muted">Esta acción no se puede deshacer.</Text>
        </div>

        <div class="delete-confirmation__actions">
          <Button variant="ghost" size="sm" @click="cancelDeleteCategory"> Cancelar </Button>
          <Button variant="danger" size="sm" icon="delete" @click="confirmDeleteCategory">
            Eliminar categoría
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .settings-page {
    @apply space-y-4;
  }

  .settings-page__header {
    @apply mb-2;
  }

  .settings-page__title {
    @apply mb-1;
  }

  .settings-page__error {
    @apply !border-danger-200 !bg-danger-50 !p-4;
  }

  .settings-page__loading {
    @apply p-8 text-center;
  }

  .settings-page__sections {
    @apply space-y-4;
  }

  .settings-page__section {
    @apply !p-6;
  }

  .settings-page__section-header {
    @apply mb-4 border-b border-slate-100 pb-4;
  }

  .settings-page__section-title {
    @apply flex items-start gap-3;
  }

  .settings-page__section-icon {
    @apply text-slate-600;
  }

  .settings-page__section-icon--primary {
    @apply text-primary-600;
  }

  .settings-page__section-icon--success {
    @apply text-success-600;
  }

  .settings-page__section-content {
    @apply space-y-4;
  }

  .settings-page__switch-group {
    @apply space-y-4;
  }

  .settings-page__switch-item {
    @apply flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50;
  }

  .settings-page__switch {
    @apply h-6 w-11 appearance-none rounded-full bg-slate-300 transition-colors checked:bg-primary-600;
    @apply relative cursor-pointer;
  }

  .settings-page__switch::after {
    @apply absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform content-[''];
  }

  .settings-page__switch:checked::after {
    @apply translate-x-5;
  }

  .settings-page__form {
    @apply space-y-4;
  }

  .settings-page__percentages {
    @apply grid grid-cols-3 gap-4;
  }

  .settings-page__percentage-item {
    @apply flex flex-col gap-2;
  }

  .settings-page__section-actions {
    @apply flex justify-end border-t border-slate-100 pt-4;
  }

  .delete-confirmation {
    @apply flex flex-col gap-6;
  }

  .delete-confirmation__header {
    @apply flex items-center gap-3 border-b border-neutral-200 pb-4;
  }

  .delete-confirmation__icon {
    @apply text-danger-600;
  }

  .delete-confirmation__content {
    @apply space-y-2;
  }

  .delete-confirmation__actions {
    @apply flex items-center justify-end gap-2 border-t border-neutral-200 pt-4;
  }
</style>
