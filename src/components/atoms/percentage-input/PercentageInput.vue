<script setup lang="ts">
  import { Label } from '@/components/atoms'

  defineOptions({ inheritAttrs: false })

  withDefaults(
    defineProps<{
      modelValue: number | null
      label?: string
      required?: boolean
      placeholder?: string
    }>(),
    {
      label: '',
      required: false,
      placeholder: '0'
    }
  )

  defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<template>
  <div class="percentage-input">
    <Label
      v-if="label"
      variant="form"
      size="sm"
      weight="bold"
      color="black"
      :required="required"
    >
      {{ label }}
    </Label>

    <div class="percentage-input__field">
      <input
        v-bind="$attrs"
        class="percentage-input__input"
        type="number"
        min="0"
        max="100"
        step="0.01"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :required="required"
        @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value) || 0)"
      />
      <span class="percentage-input__suffix">%EA</span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .percentage-input {
    @apply flex w-full flex-col gap-1;
  }

  .percentage-input__field {
    @apply flex items-center overflow-hidden rounded-md border border-neutral-300 bg-white transition-all duration-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900;
  }

  .percentage-input__input {
    @apply h-8 flex-1 bg-transparent px-2 text-xs text-neutral-900 outline-none dark:text-neutral-100;
  }

  .percentage-input__suffix {
    @apply flex h-8 shrink-0 select-none items-center border-l border-neutral-300 bg-neutral-50 px-2 text-xs font-medium text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400;
  }
</style>
