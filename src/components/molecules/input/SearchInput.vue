<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import { Input } from '@/components/molecules'

  import type { InputSize,SearchInputProps } from './types/input.types'

  const props = withDefaults(defineProps<SearchInputProps & { size?: InputSize }>(), {
    type: 'text',
    required: false,
    disabled: false,
    pattern: () => /.*/,
    error: '',
    errorMessage: '',
    placeholder: 'Buscar...',
    variant: 'column',
    size: 'default',
    readonly: false
  })

  const emit = defineEmits(['update:modelValue', 'blur'])

  const modelValue = ref(props.modelValue ?? '')

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const inputId = computed(() => props.id || props.name)

  function handleInput(value: string) {
    modelValue.value = value
    emit('update:modelValue', value)
  }

  function handleBlur() {
    emit('blur')
  }
</script>

<template>
  <div class="search-input-container">
    <div :class="[variant === 'row' ? 'input-row' : 'input-column']">
      <div v-if="label" class="input-label-row">
        <Label
          :html-for="inputId"
          variant="form"
          size="sm"
          color="black"
          weight="bold"
          :required="required"
          :class="variant === 'row' ? 'inline-label' : ''"
        >
          {{ label }}
        </Label>
      </div>

      <div class="input-field">
        <span class="search-input-icon material-symbols-outlined">search</span>

        <Input
          :id="inputId"
          :name="name"
          :type="type"
          :placeholder="placeholder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :error="error"
          :error-message="errorMessage"
          :pattern="pattern"
          :prefix="prefix"
          :size="size"
          :variant="variant"
          is-inside-group
          class="search-input"
          @update:model-value="handleInput"
          @blur="handleBlur"
        />
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .search-input-container {
    @apply relative;
  }

  .search-input-icon {
    @apply absolute left-3 top-1/2 z-10 -translate-y-1/2 text-neutral-400;
  }

  .search-input {
    @apply pl-10;
  }
</style>
