<script setup lang="ts">
  import { Form } from '@/components/organisms'
  import { AlertBanner } from '~/components/atoms'
  import { useAccountSavingsApplication } from '~/composables/application/useAccountSavingsApplication'
  import type { CompoundingFrequency } from '~/types/api'

  import { accountFieldsSchema } from './schema/account.fields.schema'
  const emit = defineEmits(['onClose'])
  const close = () => {
    emit('onClose')
  }

  const { addAccount } = useAccountSavingsApplication()

  const formSchema = computed(() => accountFieldsSchema())

  const handleSubmit = async (data: {
    name: string
    description: string
    interestRate: string
    compoundingFrequency: CompoundingFrequency
    isActive: boolean
  }) => {
    try {
      const buildData = {
        ...data,
        interestRate: parseFloat(data.interestRate)
      }
      const success = await addAccount(buildData)
      emit('onClose', success)
    } catch (error) {
      emit('onClose', error)
      console.error('Error completo:', error)
    }
  }
</script>

<template>
  <div class="account-saving-form">
    <CardInfo
      title="Registro de Cuenta Bancaria para Referencia"
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Registro informativo de cuenta de destino."
      sub-title-size="sm"
      sub-title-color="muted"
      icon="account_balance"
      icon-variant="primary"
      icon-size="md"
    />

    <AlertBanner
      title="Registra tus cuentas solo como referencia. La información es para tu uso manual y no se conecta con tu entidad bancaria."
      variant="warning"
      icon="info"
    />

    <div class="account-saving-form__content">
      <Form :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="account-saving-form__actions">
            <Button type="button" variant="ghost" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.account-saving-form {
  @apply flex h-full w-full flex-col gap-6;
}

.account-saving-form__content {
  @apply w-full;
}

.account-saving-form__actions {
  @apply flex justify-end gap-2;
}
</style>
