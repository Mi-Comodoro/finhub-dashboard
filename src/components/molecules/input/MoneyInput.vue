<script setup lang="ts">
  import { ref, watch } from 'vue'

  import Input from './Input.vue'

  const props = withDefaults(
    defineProps<{
      modelValue?: number
      currency?: string
      label: string
    }>(),
    {
      modelValue: 0,
      currency: 'USD'
    }
  )

  const emit = defineEmits(['update:modelValue'])

  const internal = ref('')
  const formatter = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0
  })
  watch(
    () => props.modelValue,
    val => {
      if (val === null || val === undefined) {
        internal.value = ''
        return
      }

      internal.value = formatter.format(val)
    },
    { immediate: true }
  )

  function handleInput(value: string) {
    const valorLimpio = value.replace(/\D/g, '')

    if (!valorLimpio) {
      internal.value = '' // Vacío en lugar de '0' para mejor UX
      emit('update:modelValue', 0)
      return
    }

    const numero = parseInt(valorLimpio, 10)
    emit('update:modelValue', numero)

    // Esto ahora sí forzará el formato al 4to dígito
    internal.value = formatter.format(numero)
  }
</script>

<template>
  <Input
    :model-value="internal"
    :label="label"
    class="text-right"
    @update:model-value="handleInput"
  />
</template>
