<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import Label from '@/components/atoms/typography/Label.vue'
  import { type Currency, getCurrencyDecimals } from '@/utils/currency'

  import type { InputSize } from './types/input.types'

  defineOptions({
    inheritAttrs: false
  })

  const props = withDefaults(
    defineProps<{
      modelValue?: number
      currency?: string
      label: string
      required?: boolean
      size?: InputSize
    }>(),
    {
      required: false,
      modelValue: 0,
      currency: 'COP',
      size: 'sm'
    }
  )

  const fieldSizeClass = computed(() => {
    const map: Record<InputSize, string> = {
      sm: 'money-input__field--sm',
      md: 'money-input__field--md',
      lg: 'money-input__field--lg'
    }
    return map[props.size] ?? map.sm
  })

  const textSizeClass = computed(() => {
    const map: Record<InputSize, string> = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
    return map[props.size] ?? map.sm
  })

  const emit = defineEmits(['update:modelValue'])

  const MAX_INTEGER_DIGITS = 11

  const decimals = computed(() => {
    try {
      return getCurrencyDecimals(props.currency as Currency) ?? 2
    } catch {
      return 2
    }
  })

  // Referencia directa al DOM — el texto visible se controla manualmente (caret + separadores)
  const inputRef = ref<HTMLInputElement | null>(null)
  const isFocused = ref(false)
  // Ultimo valor numerico emitido/recibido, para ignorar ecos del v-model
  let lastValue = props.modelValue ?? 0

  /** Texto visible a partir de un numero (escritura natural: 45000 -> 45.000,00). */
  function formatFromNumber(value: number): string {
    if (!value) return ''
    const fixed = Math.abs(value).toFixed(decimals.value)
    const [int = '0', dec = ''] = fixed.split('.')
    const thousands = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return decimals.value > 0 ? `${thousands},${dec}` : thousands
  }

  /** Normaliza lo tecleado: solo digitos y una coma decimal; miles con punto en vivo. */
  function normalize(raw: string): { text: string; value: number } {
    const commaIndex = raw.indexOf(',')
    const hasComma = commaIndex >= 0 && decimals.value > 0
    const intRaw = hasComma ? raw.slice(0, commaIndex) : raw
    const decRaw = hasComma ? raw.slice(commaIndex + 1) : ''
    const intDigits = intRaw
      .replace(/\D/g, '')
      .replace(/^0+(?=\d)/g, '')
      .slice(0, MAX_INTEGER_DIGITS)
    const decDigits = decRaw.replace(/\D/g, '').slice(0, decimals.value)
    const thousands = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const text = hasComma ? `${thousands || '0'},${decDigits}` : thousands
    const value = Number(`${intDigits || '0'}.${decDigits || '0'}`)
    return { text, value }
  }

  function setDisplay(text: string) {
    if (inputRef.value && inputRef.value.value !== text) inputRef.value.value = text
  }

  function handleInput(e: Event) {
    const el = e.target as HTMLInputElement
    let caret = el.selectionStart ?? el.value.length
    // Un punto tecleado (el punto de miles lo inserta el componente) es el separador decimal
    if (
      (e as InputEvent).data === '.' &&
      decimals.value > 0 &&
      caret > 0 &&
      el.value[caret - 1] === '.' &&
      !el.value.includes(',')
    ) {
      el.value = `${el.value.slice(0, caret - 1)},${el.value.slice(caret)}`
      caret = Math.min(caret, el.value.length)
    }
    // Cuantos caracteres significativos (digitos/coma) hay antes del cursor
    const significantBefore = el.value.slice(0, caret).replace(/[^\d,]/g, '').length

    const { text, value } = normalize(el.value)
    el.value = text

    // Restaurar el cursor en la misma posicion logica
    let seen = 0
    let pos = 0
    while (pos < text.length && seen < significantBefore) {
      if (/[\d,]/.test(text.charAt(pos))) seen++
      pos++
    }
    el.setSelectionRange(pos, pos)

    lastValue = value
    emit('update:modelValue', value)
  }

  /**
   * Texto pegado: si el ultimo separador es un punto seguido de 1-2 digitos no puede ser un grupo
   * de miles, asi que es un decimal (45000.5 -> 45000,5; 1,250.50 -> 1250,50).
   */
  function normalizePasted(text: string): string {
    const t = text.trim().replace(/[^\d.,]/g, '')
    const lastDot = t.lastIndexOf('.')
    if (lastDot > t.lastIndexOf(',') && /\.\d{1,2}$/.test(t)) {
      const intPart = t.slice(0, lastDot).replace(/[.,]/g, '')
      return decimals.value > 0 ? `${intPart},${t.slice(lastDot + 1)}` : intPart
    }
    return t
  }

  function handlePaste(e: ClipboardEvent) {
    const pasted = e.clipboardData?.getData('text')
    if (!pasted) return
    e.preventDefault()
    const el = e.target as HTMLInputElement
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    el.value = el.value.slice(0, start) + normalizePasted(pasted) + el.value.slice(end)
    handleInput({ target: el } as unknown as Event)
  }

  function handleBlur() {
    isFocused.value = false
    // Completar decimales al salir (45.000 -> 45.000,00); vacio se mantiene vacio
    setDisplay(formatFromNumber(lastValue))
  }

  function handleFocus() {
    isFocused.value = true
  }

  // Sincronizar si el prop cambia externamente (reset, edicion, precarga)
  watch(
    () => props.modelValue,
    val => {
      const incoming = val ?? 0
      if (incoming === lastValue) return
      lastValue = incoming
      setDisplay(formatFromNumber(incoming))
    }
  )

  onMounted(() => {
    setDisplay(formatFromNumber(lastValue))
  })
</script>

<template>
  <div class="money-input">
    <Label v-if="label" variant="form" size="sm" weight="bold" color="black" :required="required">
      {{ label }}
    </Label>

    <div :class="['money-input__field', fieldSizeClass]">
      <span :class="['money-input__prefix', textSizeClass]">{{ currency }}</span>
      <input
        ref="inputRef"
        :class="['money-input__input', textSizeClass]"
        type="text"
        inputmode="decimal"
        placeholder="0,00"
        autocomplete="off"
        :aria-required="required"
        @input="handleInput"
        @paste="handlePaste"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .money-input {
    @apply flex w-full flex-col gap-1;
  }
  .money-input__field {
    @apply flex items-center rounded-md border border-neutral-300 bg-white transition-all duration-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:focus-within:border-primary-400;
  }

  .money-input__field--sm {
    @apply h-8 px-2 py-0;
  }

  .money-input__field--md {
    @apply px-3 py-2;
  }

  .money-input__field--lg {
    @apply px-4 py-3;
  }

  .money-input__prefix {
    @apply mr-2 shrink-0 select-none font-medium text-neutral-500 dark:text-neutral-400;
  }
  .money-input__input {
    @apply flex-1 border-none bg-transparent text-right font-mono text-neutral-900 outline-none dark:text-neutral-100;
  }
</style>
