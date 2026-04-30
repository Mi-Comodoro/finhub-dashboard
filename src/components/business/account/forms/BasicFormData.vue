<script lang="ts" setup>
  import { CardInfo } from '@/components/molecules'
  import { useUserStore } from '@/stores/user.store'
  import type {
    BasicInformationData,
    BasicInformationFormProps
  } from '~/components/organisms/forms/types'

  import { userBasicDataFieldsSchema } from './schema/user-basic.fields.schema'

  const userStore = useUserStore()
  const emit = defineEmits(['update:modelValue', 'valid'])
  const props = withDefaults(defineProps<BasicInformationFormProps>(), {
    modelValue: () => ({
      displayName: '',
      email: '',
      phone: '',
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
    })
  })

  const formSchema = userBasicDataFieldsSchema()
  const formKey = ref(0)
  const isValid = ref(false)

  const prefillDisplayName =
    userStore.userInfo.name ?? userStore.displayName ?? props.modelValue?.displayName ?? ''

  const prefillEmail = userStore.userInfo.email
    ? userStore.userInfo.email
    : (props.modelValue?.email ?? '')
  const formData = ref<BasicInformationData>({
    displayName: prefillDisplayName,
    email: prefillEmail,
    phone: props.modelValue.phone,
    gender: props.modelValue.gender || 'prefer_not_to_say'
  })

  watch(
    () => formData.value,
    newValue => {
      if (!newValue) return

      emit('update:modelValue', newValue)
      emit('valid', isValid.value)
    },
    { deep: true }
  )
</script>
<template>
  <div class="basic-form-data">
    <CardInfo
      title="Información Personal"
      sub-title="Actualiza tus datos de perfil."
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="person"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="basic-form-data__content">
      <Form
        :key="formKey"
        v-model="formData"
        :schema="formSchema"
        @update:is-valid="isValid = $event"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .basic-form-data {
    @apply flex h-full w-full flex-col gap-6;
  }

  .basic-form-data__content {
    @apply w-full;
  }
</style>
