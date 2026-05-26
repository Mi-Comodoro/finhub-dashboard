<script setup lang="ts">
  import { ChevronDownIcon } from '@heroicons/vue/20/solid'
  import { parsePhoneNumberFromString } from 'libphonenumber-js'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  import CountryFlag from '@/components/atoms/country-flag/CountryFlag.vue'

  interface CountryOption {
    label: string
    value: string
    flagCode: string
  }

  const countryCodes: CountryOption[] = [
    { label: 'Colombia (+57)', value: '+57', flagCode: 'co' },
    { label: 'Venezuela (+58)', value: '+58', flagCode: 've' },
    { label: 'Argentina (+54)', value: '+54', flagCode: 'ar' },
    { label: 'Chile (+56)', value: '+56', flagCode: 'cl' },
    { label: 'Perú (+51)', value: '+51', flagCode: 'pe' },
    { label: 'Ecuador (+593)', value: '+593', flagCode: 'ec' },
    { label: 'Bolivia (+591)', value: '+591', flagCode: 'bo' },
    { label: 'Paraguay (+595)', value: '+595', flagCode: 'py' },
    { label: 'Uruguay (+598)', value: '+598', flagCode: 'uy' },
    { label: 'Brasil (+55)', value: '+55', flagCode: 'br' },
    { label: 'México (+52)', value: '+52', flagCode: 'mx' },
    { label: 'Costa Rica (+506)', value: '+506', flagCode: 'cr' },
    { label: 'Panamá (+507)', value: '+507', flagCode: 'pa' },
    { label: 'Guatemala (+502)', value: '+502', flagCode: 'gt' },
    { label: 'El Salvador (+503)', value: '+503', flagCode: 'sv' },
    { label: 'Honduras (+504)', value: '+504', flagCode: 'hn' },
    { label: 'Nicaragua (+505)', value: '+505', flagCode: 'ni' },
    { label: 'República Dominicana (+1)', value: '+1', flagCode: 'do' },
    { label: 'Puerto Rico (+1)', value: '+1', flagCode: 'pr' }
  ]

  const props = defineProps<{
    modelValue?: string
    label?: string
    required?: boolean
    error?: string
  }>()

  const emit = defineEmits(['update:modelValue'])

  const parseInitialValue = (value?: string) => {
    if (!value) return { code: '+57', number: '' }
    const matched = countryCodes.find(c => value.startsWith(c.value))
    if (matched) {
      const numberPart = value.slice(matched.value.length)
      return { code: matched.value, number: numberPart }
    }
    return { code: '+57', number: value || '' }
  }

  const { code: initialCode, number: initialNumber } = parseInitialValue(props.modelValue)

  const isOpen = ref(false)
  const selectedCode = ref(initialCode)
  const phoneNumber = ref(initialNumber)
  const numberTouched = ref(false)

  const selectedCountry = computed(() => {
    return countryCodes.find(c => c.value === selectedCode.value) || countryCodes[0]!
  })

  const isValid = ref(false)

  const isNumberValid = computed(() => {
    if (!phoneNumber.value) return false

    const fullNumber = `${selectedCode.value}${phoneNumber.value}`

    try {
      const phone = parsePhoneNumberFromString(fullNumber)
      return phone ? phone.isValid() : false
    } catch {
      return false
    }
  })

  const internalError = computed(() => {
    if (!numberTouched.value && !props.error) return ''
    if (props.required && !phoneNumber.value.trim()) return 'Número obligatorio'
    if (phoneNumber.value && !isValid.value) {
      return 'Número inválido para el país seleccionado'
    }
    return ''
  })

  function handleNumberInput(value: string) {
    return value.replace(/\D/g, '')
  }

  function toggleDropdown() {
    isOpen.value = !isOpen.value
  }

  function selectCode(code: string) {
    selectedCode.value = code
    isOpen.value = false
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.custom-select')) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  function onNumberBlur() {
    numberTouched.value = true
  }

  watch([selectedCode, phoneNumber], ([newCode, newNumber]) => {
    const digits = handleNumberInput(newNumber)

    if (digits !== newNumber) {
      phoneNumber.value = digits
      return
    }

    const fullNumber = digits ? `${newCode}${digits}` : ''
    emit('update:modelValue', fullNumber)

    // Update isValid after processing
    isValid.value = isNumberValid.value
  })
  defineExpose({ isValid })
</script>

<template>
  <div class="flex w-full flex-col">
    <Label
      v-if="label"
      class="mb-1.5 block text-sm font-medium text-gray-700"
      variant="form"
      size="sm"
      weight="medium"
      :required="required"
    >
      {{ label }}
    </Label>

    <!-- Wrapper UNIFICADO -->
    <div
      class="flex items-stretch rounded-md border bg-white transition-all duration-200"
      :class="[
        error || internalError
          ? 'border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500'
          : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 hover:border-gray-300'
      ]"
    >
      <!-- Prefijo (país) -->
      <div class="custom-select relative flex items-center pl-3 pr-2">
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-gray-500 focus:outline-none"
          @click="toggleDropdown"
        >
          <CountryFlag :country-code="selectedCountry.flagCode" :size="16" />

          <span class="text-gray-500">
            {{ selectedCode }}
          </span>

          <ChevronDownIcon
            class="h-3 w-3 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>

        <Transition name="dropdown">
          <ul
            v-if="isOpen"
            class="absolute left-0 z-20 mt-1 max-h-60 min-w-[220px] overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
          >
            <li
              v-for="option in countryCodes"
              :key="option.value"
              class="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              :class="{
                'bg-primary-50 font-medium text-primary-700': option.value === selectedCode
              }"
              @click="selectCode(option.value)"
            >
              <div class="flex w-5 justify-center">
                <CountryFlag :country-code="option.flagCode" :size="16" />
              </div>

              <span class="whitespace-nowrap">
                {{ option.label }}
              </span>
            </li>
          </ul>
        </Transition>
      </div>

      <!-- Input -->
      <input
        v-model="phoneNumber"
        type="tel"
        placeholder="Número"
        inputmode="numeric"
        class="min-w-0 flex-1 border-none bg-transparent py-2 pl-1 pr-3 text-sm outline-none ring-0"
        @blur="onNumberBlur"
      />
    </div>

    <!-- Error -->
    <span
      v-if="error || internalError"
      class="mt-1.5 text-xs font-medium text-red-600 transition-opacity duration-200"
    >
      {{ error || internalError }}
    </span>
  </div>
</template>

<style scoped>
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.15s ease;
  }
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
