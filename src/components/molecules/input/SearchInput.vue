<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import Icon from '@/components/atoms/icons/Icon.vue'
  import Label from '@/components/atoms/typography/Label.vue'

  import type { InputSize, SearchInputProps } from './types/input.types'

  const props = withDefaults(defineProps<SearchInputProps & { size?: InputSize }>(), {
    type: 'text',
    required: false,
    disabled: false,
    pattern: () => /.*/,
    error: '',
    errorMessage: '',
    placeholder: 'Buscar...',
    variant: 'column',
    size: 'sm',
    readonly: false
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: []
  }>()

  const modelValue = ref(props.modelValue ?? '')

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const inputId = computed(() => props.id || props.name)

  const inputSizeClass = computed(() => {
    const map: Record<InputSize, string> = {
      sm: 'search-input__input--sm',
      md: 'search-input__input--md',
      lg: 'search-input__input--lg'
    }
    return map[props.size] ?? map.sm
  })

  const iconSize = computed(() => {
    const map: Record<InputSize, string> = { sm: 'sm', md: 'md', lg: 'lg' }
    return map[props.size] ?? 'sm'
  })

  function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    modelValue.value = value
    emit('update:modelValue', value)
  }

  function handleBlur() {
    emit('blur')
  }
</script>

<template>
  <div class="search-input">
    <Label
      v-if="label"
      :html-for="inputId"
      variant="form"
      size="sm"
      color="black"
      weight="bold"
      :required="required"
    >
      {{ label }}
    </Label>

    <div class="search-input__field" :class="{ 'search-input__field--disabled': disabled }">
      <div class="search-input__icon">
        <Icon name="search" :size="iconSize" />
      </div>

      <input
        :id="inputId"
        :name="name"
        type="text"
        :class="['search-input__input', inputSizeClass]"
        :placeholder="placeholder"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        autocomplete="off"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .search-input {
    @apply flex w-full flex-col gap-1;
  }

  .search-input__field {
    @apply flex items-center rounded-md border border-neutral-300 bg-white transition-all duration-200;
  }

  .search-input__field:hover {
    @apply border-primary-400;
  }

  .search-input__field:focus-within {
    @apply border-primary-500 ring-1 ring-primary-500;
  }

  .search-input__field--disabled {
    @apply cursor-not-allowed bg-neutral-100;
  }

  .search-input__icon {
    @apply flex items-center justify-center pl-3 text-neutral-400;
  }

  .search-input__input {
    @apply flex-1 border-none bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400;
  }

  .search-input__input--sm {
    @apply h-8 px-2 py-0 text-xs;
  }

  .search-input__input--md {
    @apply px-3 py-2 text-sm;
  }

  .search-input__input--lg {
    @apply px-4 py-3 text-base;
  }

  .search-input__input:disabled {
    @apply cursor-not-allowed text-neutral-400;
  }
</style>
