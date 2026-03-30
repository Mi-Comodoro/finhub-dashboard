<script lang="ts" setup>
  import { Form } from '@/components/organisms'
  import { useAccountStore } from '@/stores/account.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import type { GoalsData } from '~/types/api'

  import { goalsFieldsSchema } from './schema/goals.fiels.schema'

  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()

  const emit = defineEmits(['onSuccess', 'onError', 'onClose'])

  const accounts = computed(() =>
    accountStore.accounts.map(item => ({
      label: item.name,
      value: item.id,
      disabled: !item.isActive
    }))
  )
  const formSchema = computed(() => goalsFieldsSchema(accounts.value))

  const formKey = ref(0)
  const formData = ref({})

  const handleSubmit = async () => {
    const buildData = {
      ...formData.value,
      isActive: true
    } as GoalsData
    await goalsStore.addSavingGoals(buildData)
    formData.value = {}
    formKey.value++

    if (!goalsStore.error) {
      emit('onSuccess')
    } else {
      emit('onError', goalsStore.error)
    }
  }
</script>

<template>
  <div class="flex h-full w-full flex-col gap-2 rounded-md bg-white">
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

    <div class="relative z-10 mt-2 flex flex-col">
      <AlertBanner title="Cuentas de Alta Rentabilidad > 10% EA" variant="warning" icon="info">
        <Text size="xs" class="flex items-start gap-1 text-yellow-900">
          <strong>
            Uso:
            <span class="font-normal">
              Fondo de emergencia, ahorro a la vista y metas a corto plazo.
            </span>
          </strong>
        </Text>
      </AlertBanner>
    </div>

    <div v-if="accounts.length > 0" class="w-full">
      <Form :key="formKey" v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
