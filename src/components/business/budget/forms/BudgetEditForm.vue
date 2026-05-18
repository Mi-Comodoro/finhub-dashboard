<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { replaceUnderscoresWithSpaces } from '@/utils/strings'

  import { budgetEditFieldsSchema } from './schema/budget.edit.fields.schema'

  interface Props {
    budgetId: string
    initialData?: {
      name: string
      strategy: 'BALANCED' | 'CUSTOM'
      needsLimit: number
      wantsLimit: number
      savingsLimit: number
    }
  }

  const props = withDefaults(defineProps<Props>(), {
    initialData: undefined
  })
  const emit = defineEmits(['onClose'])

  const formSchema = budgetEditFieldsSchema()

  const formData = ref(
    props.initialData
      ? {
          ...props.initialData,
          name: replaceUnderscoresWithSpaces(props.initialData.name)
        }
      : {
          name: '',
          strategy: 'BALANCED' as 'BALANCED' | 'CUSTOM',
          needsLimit: 50,
          wantsLimit: 30,
          savingsLimit: 20
        }
  )

  const handleSubmit = async (data: {
    name: string
    strategy: 'BALANCED' | 'CUSTOM'
    needsLimit?: number
    wantsLimit?: number
    savingsLimit?: number
  }) => {
    const { handleUpdate } = useBudgetActions()

    const payload = {
      name: data.name.replace(/ /g, '_'),
      strategy: data.strategy,
      needsLimit: data.strategy === 'BALANCED' ? 50 : Number(data.needsLimit ?? 50),
      wantsLimit: data.strategy === 'BALANCED' ? 30 : Number(data.wantsLimit ?? 30),
      savingsLimit: data.strategy === 'BALANCED' ? 20 : Number(data.savingsLimit ?? 20)
    }

    const { success } = await handleUpdate(props.budgetId, payload)
    if (success) emit('onClose')
  }
</script>

<template>
  <div class="budget-edit-form">
    <CardInfo
      title="Editar Presupuesto"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Actualiza el nombre y la distribución de tu presupuesto."
      sub-title-size="xs"
      sub-title-color="muted"
      icon="account_balance_wallet"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="budget-edit-form__content">
      <Form v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="budget-edit-form__actions">
            <Button type="button" variant="ghost" size="sm" @click="emit('onClose')">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar cambios
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-edit-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .budget-edit-form__content {
    @apply w-full;
  }

  .budget-edit-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
