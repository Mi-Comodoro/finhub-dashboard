<script setup lang="ts">
  import { computed } from 'vue'

  import type { ConsentCheckboxProps } from './types/consent-checkbox.types'

  const props = withDefaults(defineProps<ConsentCheckboxProps>(), {
    policyVersion: '',
    invalid: false,
    id: 'consent-checkbox'
  })

  const versionLabel = computed(() =>
    props.policyVersion ? ` (versión ${props.policyVersion})` : ''
  )

  const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

  const onChange = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).checked)
  }
</script>

<template>
  <div class="consent-checkbox" :class="{ 'consent-checkbox--invalid': invalid }">
    <input
      :id="id"
      type="checkbox"
      class="consent-checkbox__input"
      :checked="modelValue"
      :aria-invalid="invalid"
      @change="onChange"
    />
    <label :for="id" class="consent-checkbox__label">
      Soy mayor de 18 años y autorizo a Mi Comodoro a tratar mis datos personales para las
      finalidades de la
      <NuxtLink to="/privacy" target="_blank" class="consent-checkbox__link">
        Política de Tratamiento de Datos
      </NuxtLink>
      {{ versionLabel }}, incluida su transmisión a los proveedores indicados y su transferencia a
      Estados Unidos. Puedo revocar esta autorización y ejercer mis derechos en cualquier momento.
    </label>
  </div>
</template>

<style scoped lang="postcss">
  .consent-checkbox {
    @apply flex items-start gap-3 rounded-lg border border-neutral-200 p-3;
    @apply dark:border-neutral-700;
  }

  .consent-checkbox--invalid {
    @apply border-danger-400 bg-danger-50;
    @apply dark:border-danger-600 dark:bg-danger-900/20;
  }

  .consent-checkbox__input {
    @apply mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 text-primary-600;
    @apply focus:ring-2 focus:ring-primary-500;
  }

  .consent-checkbox__label {
    @apply cursor-pointer text-xs leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .consent-checkbox__link {
    @apply font-semibold text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
    @apply dark:text-primary-400;
  }
</style>
