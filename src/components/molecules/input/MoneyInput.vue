<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'

  const props = withDefaults(
    defineProps<{
      modelValue?: number
      currency?: string
      label: string
      required?: boolean
    }>(),
    {
      required: false,
      modelValue: 0,
      currency: 'COP'
    }
  )

  const emit = defineEmits(['update:modelValue'])

  // Estado interno en centavos — evita float errors
  const cents = ref(Math.round((props.modelValue ?? 0) * 100))

  // Sincronizar si el prop cambia externamente
  watch(
    () => props.modelValue,
    val => {
      const incoming = Math.round((val ?? 0) * 100)
      if (incoming !== cents.value) {
        cents.value = incoming
        updateInput()
      }
    }
  )

  // Referencia directa al DOM — sin v-model
  const inputRef = ref<HTMLInputElement | null>(null)

  function format(c: number): string {
    const int = Math.floor(c / 100)
    const dec = c % 100
    const thousands = new Intl.NumberFormat('es-CO').format(int)
    return `${thousands},${String(dec).padStart(2, '0')}`
  }

  function updateInput() {
    if (inputRef.value) {
      inputRef.value.value = format(cents.value)
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    const nav = ['ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter']
    if (nav.includes(e.key)) return

    e.preventDefault()

    if (e.key >= '0' && e.key <= '9') {
      if (cents.value >= 999_999_999_99) return
      cents.value = cents.value * 10 + Number(e.key)
      updateInput()
      emit('update:modelValue', cents.value / 100)
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      cents.value = Math.floor(cents.value / 10)
      updateInput()
      emit('update:modelValue', cents.value / 100)
    }
  }

  function handleFocus() {
    // Asegurar que el input muestra el valor al obtener foco
    updateInput()
  }

  onMounted(() => {
    updateInput()
  })
</script>

<template>
  <div class="money-input">
    <Label v-if="label" variant="form" size="sm" weight="bold" color="black" :required="required">
      {{ label }}
    </Label>

    <div class="money-input__field">
      <span class="money-input__prefix">{{ currency }}</span>
      <input
        ref="inputRef"
        class="money-input__input"
        type="text"
        inputmode="decimal"
        :required="required"
        @keydown="handleKeydown"
        @focus="handleFocus"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .money-input {
    @apply flex w-full flex-col gap-1;
  }
  .money-input__field {
    @apply flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 transition-all duration-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:focus-within:border-primary-400;
  }
  .money-input__prefix {
    @apply mr-2 shrink-0 select-none text-sm font-medium text-neutral-500 dark:text-neutral-400;
  }
  .money-input__input {
    @apply flex-1 border-none bg-transparent text-right font-mono text-sm text-neutral-900 outline-none dark:text-neutral-100;
  }
</style>
