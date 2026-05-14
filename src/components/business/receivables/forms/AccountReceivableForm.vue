<script setup lang="ts">
  import { computed } from 'vue'

  import { Form } from '@/components/organisms/forms'
  import { useAccountsReceivableApplication } from '@/composables/application/useAccountsReceivableApplication'
  import type { CreateAccountReceivableDto } from '@/types/accounts-receivable.types'

  import { accountReceivableFieldsSchema } from './schema/account-receivable.fields.schema'

  const props = withDefaults(
    defineProps<{
      accountId?: string
      initialData?: Record<string, unknown>
    }>(),
    {
      accountId: undefined,
      initialData: undefined
    }
  )

  const emit = defineEmits(['onClose'])
  const close = () => emit('onClose')

  const { createAccount, updateAccount } = useAccountsReceivableApplication()
  const isEditMode = computed(() => !!props.accountId)
  const formSchema = computed(() => accountReceivableFieldsSchema())

  const handleSubmit = async (data: Record<string, unknown>) => {
    const dto = data as unknown as CreateAccountReceivableDto

    if (isEditMode.value && props.accountId) {
      const { success } = await updateAccount(props.accountId, dto)
      if (success) close()
    } else {
      const { success } = await createAccount(dto)
      if (success) close()
    }
  }
</script>

<template>
  <div class="account-receivable-form">
    <CardInfo
      :title="isEditMode ? 'Editar Cobro' : 'Agregar Cobro'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Actualiza la información de este cobro.'
          : 'Registra el dinero que te deben para hacer seguimiento.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="payments"
      icon-variant="primary"
      icon-size="md"
    />

    <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
      <template #actions>
        <div class="account-receivable-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm">
            {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .account-receivable-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .account-receivable-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
