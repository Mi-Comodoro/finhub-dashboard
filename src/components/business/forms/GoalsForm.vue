<script lang="ts" setup>
  import { Form } from '@/components/organisms'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import type { GoalsData } from '~/types/api'

  import { goalsFieldsSchema } from './schema/goals.fiels.schema'

  const { accounts: accountsData } = useAccountSavingsApplication()
  const { addGoal, error } = useGoalsApplication()

  const emit = defineEmits(['onSuccess', 'onError', 'onClose'])

  const accounts = computed(() =>
    accountsData.value?.map(item => ({
      label: item.name,
      value: item.id,
      disabled: !item.isActive
    })) ?? []
  )
  const formSchema = computed(() => goalsFieldsSchema(accounts.value))

  const formKey = ref(0)
  const formData = ref({})

  const handleSubmit = async () => {
    const buildData = {
      ...formData.value,
      isActive: true
    } as GoalsData

    const { success } = await addGoal(buildData)
    formData.value = {}
    formKey.value++

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error.value)
    }
  }
</script>

<template>
  <div class="goals-form">
    <CardInfo
      title="Nueva Meta"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Ponle fecha a tus metas"
      sub-title-size="sm"
      sub-title-color="muted"
      icon="add_task"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="goals-form__alert">
      <AlertBanner title="Cuentas de Alta Rentabilidad > 10% EA" variant="warning" icon="info">
        <Text size="xs" class="goals-form__alert-text">
          <strong>
            Uso:
            <span class="goals-form__alert-text--normal">
              Fondo de emergencia, ahorro a la vista y metas a corto plazo.
            </span>
          </strong>
        </Text>
      </AlertBanner>
    </div>

    <div v-if="accounts.length > 0" class="goals-form__content">
      <Form :key="formKey" v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="goals-form__actions">
            <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.goals-form {
  @apply flex h-full w-full flex-col gap-2 rounded-md bg-white;
}

.goals-form__alert {
  @apply relative z-10 mt-2 flex flex-col;
}

.goals-form__alert-text {
  @apply flex items-start gap-1 text-yellow-900;
}

.goals-form__alert-text--normal {
  @apply font-normal;
}

.goals-form__content {
  @apply w-full;
}

.goals-form__actions {
  @apply flex justify-end gap-2;
}
</style>
