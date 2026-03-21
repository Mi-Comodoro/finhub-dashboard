<script setup lang="ts">
  import { ref, watch } from 'vue'

  import Input from './Input.vue'

  const props = defineProps<{ modelValue: number; label: string; placeholder: string }>()

  const emit = defineEmits(['update:modelValue'])

  const internal = ref('')

  const formatter = new Intl.NumberFormat('en-US')

  watch(
    () => props.modelValue,
    val => {
      if (val === undefined || val === null) {
        internal.value = ''
        return
      }

      internal.value = formatter.format(val)
    },
    { immediate: true }
  )

  function parseNumber(value: string) {
    return value.replace(/[^\d.-]/g, '')
  }

  function handleInput(value: string) {
    const raw = parseNumber(value)

    const number = raw === '' ? null : Number(raw)

    emit('update:modelValue', number)

    internal.value = number ? formatter.format(number) : ''
  }
</script>

<template>
  <Input
    :model-value="internal"
    :label="label"
    :placeholder="placeholder"
    class="text-right"
    @update:model-value="handleInput"
  />
</template>
