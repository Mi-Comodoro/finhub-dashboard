<script lang="ts" setup>
  import { Form } from '@/components/organisms'
  import { useAccountStore } from '@/stores/account.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import type { GoalsData } from '~/types/api'

  import { goalsFieldsSchema } from './schema/goals.fiels.schema'

  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()

  const emit = defineEmits(['onSuccess', 'onError'])

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
  <div class="flex h-full w-full flex-col gap-6 rounded-md bg-white p-4">
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

    <div v-if="accounts.length > 0" class="w-full">
      <Form :key="formKey" v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <Button type="submit" variant="primary">Guardar</Button>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
