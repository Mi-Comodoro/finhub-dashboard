<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'

  import { budgetFieldsSchema } from './schema/budget.fields.schema'

  interface Props {
    mode?: 'create' | 'edit'
    budgetId?: string
    initialData?: Partial<{
      name: string
      month: number
      year: number
      strategy: 'BALANCED' | 'CUSTOM'
      needsLimit: number
      wantsLimit: number
      savingsLimit: number
    }>
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'create',
    budgetId: undefined,
    initialData: undefined
  })
  const emit = defineEmits(['onClose', 'onSuccess'])

  // Opciones de mes y año
  const monthOptions = computed(() => [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ])

  const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear()
    return [
      { label: String(currentYear), value: currentYear },
      { label: String(currentYear + 1), value: currentYear + 1 },
      { label: String(currentYear + 2), value: currentYear + 2 }
    ]
  })

  // Schema dinámico
  const formSchema = computed(() => budgetFieldsSchema(monthOptions.value, yearOptions.value))

  // Datos del formulario
  const formData = ref(
    props.initialData || {
      name: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      strategy: 'BALANCED',
      needsLimit: 50,
      wantsLimit: 30,
      savingsLimit: 20
    }
  )

  // Submit handler
  const handleSubmit = async (data: {
    name: string
    month: number
    year: number
    strategy: 'BALANCED' | 'CUSTOM'
    needsLimit?: number
    wantsLimit?: number
    savingsLimit?: number
  }) => {
    const { handleCreate, handleUpdate } = useBudgetActions()

    const payload = {
      name: data.name,
      month: Number(data.month),
      year: Number(data.year),
      strategy: data.strategy,
      needsLimit: data.strategy === 'BALANCED' ? 50 : Number(data.needsLimit || 50),
      wantsLimit: data.strategy === 'BALANCED' ? 30 : Number(data.wantsLimit || 30),
      savingsLimit: data.strategy === 'BALANCED' ? 20 : Number(data.savingsLimit || 20)
    }

    const { success } =
      props.mode === 'create'
        ? await handleCreate(payload)
        : await handleUpdate(props.budgetId!, payload)

    if (success) {
      emit('onSuccess')
      emit('onClose')
    }
  }
</script>

<template>
  <div class="budget-form">
    <CardInfo
      :title="mode === 'create' ? 'Crear Presupuesto' : 'Editar Presupuesto'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        mode === 'create'
          ? 'Define los límites para cada categoría de gasto.'
          : 'Actualiza los límites de tu presupuesto.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="account_balance_wallet"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="budget-form__content">
      <Form v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="budget-form__actions">
            <Button type="button" variant="ghost" size="sm" @click="emit('onClose')">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {{ mode === 'create' ? 'Crear presupuesto' : 'Guardar cambios' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .budget-form__content {
    @apply w-full;
  }

  .budget-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
