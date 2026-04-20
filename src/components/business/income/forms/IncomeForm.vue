<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useIncomeApplication } from '@/composables/application/useIncomeApplication'

  import { incomeFieldsSchema } from './schema/income.fields.schema'

  const { createIncome, updateIncome } = useIncomeApplication()

  const props = defineProps<{
    budgetId: string
    incomeId?: string
    initialData?: Record<string, unknown>
  }>()

  const isEditMode = computed(() => !!props.incomeId)
  const formSchema = computed(() => incomeFieldsSchema())

  const emit = defineEmits(['onClose'])
  const close = () => {
    emit('onClose')
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditMode.value && props.incomeId) {
        const { success } = await updateIncome(props.incomeId, data)
        if (success) {
          emit('onClose')
        }
      } else {
        const buildData = {
          ...data,
          budgetId: props.budgetId,
          status: 'PENDING'
        }
        const { success } = await createIncome(buildData)
        if (success) {
          emit('onClose')
        }
      }
    } catch {
      // Error handling is done in the application layer
    }
  }
</script>

<template>
  <div class="income-form">
    <CardInfo
      :title="isEditMode ? 'Editar Ingreso Planificado' : 'Agregar Ingreso Planificado'"
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Actualiza la información de tu ingreso planificado.'
          : 'Registra tus ingresos esperados para planificar mejor tu presupuesto.'
      "
      sub-title-size="sm"
      sub-title-color="muted"
      :icon="isEditMode ? 'edit' : 'payments'"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="income-form__content">
      <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="income-form__actions">
            <Button type="button" variant="ghost" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary">
              {{ isEditMode ? 'Actualizar' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .income-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .income-form__content {
    @apply w-full;
  }

  .income-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
