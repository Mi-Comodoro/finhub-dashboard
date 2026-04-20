<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Heading, Icon } from '@/components/atoms'
  import { Form } from '@/components/organisms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useFeedback } from '@/composables/useFeedback'

  import { categoryFieldsSchema } from './schema/category.fields.schema'

  interface CategoryFormProps {
    categoryId?: string
    initialData?: Record<string, unknown>
  }

  interface CategoryFormEmits {
    'on-close': []
  }

  const props = defineProps<CategoryFormProps>()
  const emit = defineEmits<CategoryFormEmits>()

  const { createCategory, updateCategory } = useCategoryApplication()
  const { success: successToast, error: errorToast } = useFeedback()

  const isEditMode = computed(() => !!props.categoryId)
  const formTitle = computed(() => (isEditMode.value ? 'Editar Categoría' : 'Nueva Categoría'))

  const formData = ref<Record<string, unknown>>({})
  const isSubmitting = ref(false)

  watch(
    () => props.initialData,
    (newData) => {
      if (newData) {
        formData.value = { ...newData }
      }
    },
    { immediate: true }
  )

  const handleSubmit = async (data: Record<string, unknown>) => {
    isSubmitting.value = true

    try {
      const { success } = isEditMode.value
        ? await updateCategory(props.categoryId!, data)
        : await createCategory(data)

      if (success) {
        successToast(
          isEditMode.value ? 'Categoría actualizada' : 'Categoría creada',
          isEditMode.value
            ? 'La categoría fue actualizada correctamente.'
            : 'La nueva categoría fue creada correctamente.'
        )
        emit('on-close')
      } else {
        errorToast(
          'Error',
          isEditMode.value
            ? 'No se pudo actualizar la categoría.'
            : 'No se pudo crear la categoría.'
        )
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    emit('on-close')
  }
</script>

<template>
  <div class="category-form">
    <div class="category-form__header">
      <Icon name="category" size="lg" class="category-form__icon" />
      <Heading level="h2" size="xl" weight="bold">{{ formTitle }}</Heading>
    </div>

    <Form
      :fields="categoryFieldsSchema()"
      :initial-data="formData"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped lang="postcss">
  .category-form {
    @apply flex flex-col gap-6;
  }

  .category-form__header {
    @apply flex items-center gap-3 border-b border-neutral-200 pb-4;
  }

  .category-form__icon {
    @apply text-primary-600;
  }
</style>
