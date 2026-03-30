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
    // Permitir solo números, coma y punto
    let clean = value.replace(/[^\d.,]/g, '')

    // Quitar separadores de miles (.)
    clean = clean.replace(/\./g, '')

    // Convertir coma a punto decimal
    clean = clean.replace(',', '.')

    // Evitar múltiples puntos decimales
    const parts = clean.split('.')
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('')
    }

    if (!clean) {
      internal.value = ''
      emit('update:modelValue', null)
      return
    }

    const [integerPart, decimalPart] = clean.split('.')

    // Formatear miles correctamente
    const formattedInteger = Number(integerPart || 0).toLocaleString('es-CO')

    let formatted = formattedInteger

    if (decimalPart !== undefined) {
      formatted += ',' + decimalPart
    }

    const number = parseFloat(clean)

    if (!isNaN(number)) {
      emit('update:modelValue', number)
    }

    internal.value = formatted
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
