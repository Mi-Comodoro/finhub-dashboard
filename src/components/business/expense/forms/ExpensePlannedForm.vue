<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { formatCurrency } from '@/utils/currency'
  import type { Currency } from '@/utils/currency'
  import type { ExpenseData } from '~/types/domain'

  import { expensedPlannedFieldsSchema } from './schema/expense.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { addExpense, updateExpense } = useExpenseApplication()

  const props = withDefaults(
    defineProps<{
      budgetId?: string
      expenseId?: string
      initialData?: Partial<ExpenseData> & { category?: string; bucket?: string; status?: string }
      mode?: 'create' | 'edit' | 'view'
      currency?: Currency
    }>(),
    {
      budgetId: '',
      expenseId: undefined,
      initialData: undefined,
      mode: 'create',
      currency: 'COP'
    }
  )

  const isEditMode = computed(() => props.mode === 'edit' || (props.mode === 'create' && !!props.expenseId))
  const isViewMode = computed(() => props.mode === 'view')

  onMounted(async () => {
    if (!isViewMode.value) {
      await fetchCategories()
    }
  })

  const selectOptions = computed(() =>
    categories.value.map(item => ({
      label: item.isSelectable ? `${item.name}` : ` ${item.name.toUpperCase()}`,
      value: item.id,
      disabled: !item.isSelectable
    }))
  )

  const formSchema = computed(() => expensedPlannedFieldsSchema(selectOptions.value))
  const emit = defineEmits(['success', 'close'])
  const close = () => {
    emit('close')
  }

  const handleSubmit = async (data: ExpenseData) => {
    if (!props.budgetId) {
      console.warn('[ExpensePlannedForm] budgetId is required but was not provided')
      return
    }
    try {
      if (isEditMode.value && props.expenseId) {
        const { success } = await updateExpense(props.expenseId, data)
        if (success) {
          emit('success')
        }
      } else {
        const buildData = {
          ...data,
          budgetId: props.budgetId,
          status: 'PLANNED'
        }
        const { success } = await addExpense(buildData)
        if (success) {
          emit('success')
        }
      }
    } catch (error) {
      console.error('Error completo:', error)
    }
  }

  const statusLabels: Record<string, string> = {
    planned: 'Planificado',
    paid: 'Pagado',
    canceled: 'Cancelado',
    skipped: 'Omitido'
  }

  const bucketLabels: Record<string, string> = {
    needs: 'Obligaciones',
    wants: 'Opcionales',
    savings: 'Ahorro e Inversiones'
  }
</script>
<template>
  <div class="expense-planned-form">
    <CardInfo
      :title="isViewMode ? 'Detalle del Gasto' : isEditMode ? 'Editar Gasto' : 'Registrar Gasto'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isViewMode
          ? 'Información del gasto planificado.'
          : isEditMode
            ? 'Actualiza los detalles del gasto.'
            : 'Registra un gasto dentro de tu presupuesto.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="receipt_long"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="expense-planned-form__content">
      <!-- View mode: readonly display -->
      <div v-if="isViewMode" class="expense-planned-form__view">
        <div class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Nombre</span>
          <span class="expense-planned-form__view-value">{{ initialData?.name ?? '—' }}</span>
        </div>
        <div class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Monto</span>
          <span class="expense-planned-form__view-value">
            {{ initialData?.expectedAmount != null ? formatCurrency(initialData.expectedAmount, props.currency) : '—' }}
          </span>
        </div>
        <div class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Fecha</span>
          <span class="expense-planned-form__view-value">
            {{ initialData?.dueDate ? new Date(initialData.dueDate as string).toLocaleDateString('es-CO') : '—' }}
          </span>
        </div>
        <div v-if="initialData?.category" class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Categoría</span>
          <span class="expense-planned-form__view-value">{{ initialData.category }}</span>
        </div>
        <div v-if="initialData?.bucket" class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Grupo</span>
          <span class="expense-planned-form__view-value">
            {{ bucketLabels[initialData.bucket.toLowerCase()] ?? initialData.bucket }}
          </span>
        </div>
        <div v-if="initialData?.status" class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Estado</span>
          <span class="expense-planned-form__view-value">
            {{ statusLabels[initialData.status.toLowerCase()] ?? initialData.status }}
          </span>
        </div>
        <div v-if="initialData?.isEssential != null" class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Es esencial</span>
          <span class="expense-planned-form__view-value">{{ initialData.isEssential ? 'Sí' : 'No' }}</span>
        </div>
        <div v-if="initialData?.notes" class="expense-planned-form__view-row">
          <span class="expense-planned-form__view-label">Notas</span>
          <span class="expense-planned-form__view-value">{{ initialData.notes }}</span>
        </div>
        <div class="expense-planned-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="close">Cerrar</Button>
        </div>
      </div>

      <!-- Create / Edit mode: form -->
      <Form v-else :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="expense-planned-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">
              {{ isEditMode ? 'Actualizar' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .expense-planned-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .expense-planned-form__content {
    @apply w-full;
  }

  .expense-planned-form__actions {
    @apply flex justify-end gap-2;
  }

  .expense-planned-form__view {
    @apply flex flex-col gap-3;
  }

  .expense-planned-form__view-row {
    @apply flex items-start justify-between gap-4 border-b border-neutral-100 pb-2;
  }

  .expense-planned-form__view-label {
    @apply text-sm font-medium text-neutral-500;
  }

  .expense-planned-form__view-value {
    @apply text-sm font-semibold text-neutral-900;
  }
</style>
