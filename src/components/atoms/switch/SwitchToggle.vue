<script setup lang="ts">
  import Icon from '@/components/atoms/icons/Icon.vue'
  import Label from '@/components/atoms/typography/Label.vue'

  const props = defineProps<{
    modelValue: boolean
    label?: string
    disabled?: boolean
    labelPosition?: 'left' | 'right'
    icon: 'verified'
  }>()

  const emit = defineEmits(['update:modelValue'])

  function toggle() {
    if (props.disabled) return
    emit('update:modelValue', !props.modelValue)
  }
</script>

<template>
  <div
    class="input--readonly flex h-fit items-center justify-between p-2"
    :class="labelPosition === 'right' ? 'flex-row' : 'flex-row-reverse'"
  >
    <Label class="flex cursor-pointer select-none items-center gap-2" variant="form" color="muted">
      <Icon v-if="icon" :name="icon" size="md" class="text-primary-500" />
      {{ label }}
    </Label>
    <span v-if="label" class="text-sm font-medium">
      <button
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          modelValue ? 'bg-primary-500' : 'bg-gray-300 dark:bg-neutral-600'
        ]"
        @click="toggle"
      >
        <span
          :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            modelValue ? 'translate-x-6' : 'translate-x-1'
          ]"
        />
      </button>
    </span>
  </div>
</template>
<style lang="postcss" scoped>
  .input--readonly {
    @apply cursor-default rounded-md border-dashed border-slate-300 focus:border-dashed focus:ring-0 dark:border-slate-600 dark:bg-neutral-800 dark:text-slate-400;
  }
</style>
