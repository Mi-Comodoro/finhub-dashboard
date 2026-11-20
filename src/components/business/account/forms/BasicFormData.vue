<script lang="ts" setup>
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
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
      handle: '',
      email: '',
      phone: '',
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
    })
  })

  const formSchema = userBasicDataFieldsSchema()
  const formKey = ref(0)
  const isValid = ref(false)
  const handleTouched = ref(false)

  const prefillDisplayName =
    userStore.userInfo.name ?? userStore.displayName ?? props.modelValue?.displayName ?? ''
  const prefillEmail = userStore.userInfo.email
    ? userStore.userInfo.email
    : (props.modelValue?.email ?? '')

  const formData = ref<BasicInformationData>({
    displayName: prefillDisplayName,
    handle: props.modelValue?.handle ?? '',
    email: prefillEmail,
    phone: props.modelValue?.phone ?? '',
    gender: props.modelValue?.gender || 'prefer_not_to_say'
  })

  /* Auto-suggest handle desde displayName */
  function suggestHandle(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^[^a-z]+/, '')
      .slice(0, 20)
  }

  watch(
    () => formData.value.displayName,
    newName => {
      if (handleTouched.value) return
      const suggestion = suggestHandle(String(newName ?? ''))
      if (suggestion.length >= 1) {
        formData.value.handle = suggestion
      }
    }
  )

  /* Sanitizar handle a minúsculas cuando el Form lo cambia */
  watch(
    () => formData.value.handle,
    newHandle => {
      const cleaned = String(newHandle ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20)
      if (cleaned !== newHandle) {
        formData.value.handle = cleaned
      }
      if (newHandle) handleTouched.value = true
    }
  )

  watch(
    formData,
    newValue => {
      if (!newValue) return
      emit('update:modelValue', { ...newValue })
      emit('valid', isValid.value)
    },
    { deep: true }
  )
</script>

<template>
  <div class="basic-form-data">
    <CardInfo
      title="Información Personal"
      sub-title="Completa tus datos para comenzar."
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
        @update:is-valid="
          (v: boolean) => {
            isValid = v
            emit('valid', v)
          }
        "
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
