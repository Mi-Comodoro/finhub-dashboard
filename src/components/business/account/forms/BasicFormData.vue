<script lang="ts" setup>
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
      phone: ''
    })
  })

  const formSchema = computed(() => userBasicDataFieldsSchema())
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
    phone: props.modelValue.phone
  })

  watch(
    () => formData.value,
    newValue => {
      if (!newValue) return

      Object.entries(newValue).forEach(([key, value]) => {
        formData.value[key] = value
      })

      emit('update:modelValue', newValue)
      if (isValid.value) {
        emit('valid', isValid.value)
      }
    },
    { deep: true }
  )
</script>
<template>
  <div class="flex h-full w-full flex-col gap-6">
    <div class="w-full">
      <Form
        :key="formKey"
        v-model="formData"
        :schema="formSchema"
        @update:is-valid="isValid = $event"
      />
    </div>
  </div>
</template>
<style></style>
