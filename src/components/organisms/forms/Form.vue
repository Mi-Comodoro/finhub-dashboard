<script setup lang="ts">
  import { parsePhoneNumberFromString } from 'libphonenumber-js'
  import { reactive, watch } from 'vue'

  import {
    DatePickerInput,
    Input,
    MoneyInput,
    PhoneInput,
    Select,
    TextArea
  } from '@/components/molecules'

  interface FormRow {
    type: 'row' | 'grid'
    columns?: number
    fields: string[]
  }

  export interface FormSchema {
    fields: Record<string, FieldSchema>
    layout: FormRow[]
  }

  // Tipado para el schema
  interface FieldOption {
    label: string
    value: string | number
    description?: string
    title?: string
    badge?: string
    icon?: string
  }
  type commonField = string | number | boolean | Date | null
  interface FieldSchema {
    type:
      | 'text'
      | 'number'
      | 'select'
      | 'date'
      | 'switch'
      | 'textarea'
      | 'money'
      | 'slider-percentage'
      | 'radio-card'
      | 'phone'
    label: string
    placeholder?: string
    required?: boolean | ((_form: Record<string, commonField>) => boolean)
    pattern?: RegExp
    errorMessage?: string
    prefix?: string
    options?: FieldOption[]

    validate?: (_value: unknown) => true | string
    visibleWhen?: (_form: Record<string, commonField>) => boolean
    // Nuevas propiedades para campos compuestos
    groupFields?: {
      firstDate: FieldSchema
      secondDate: FieldSchema
    }
    alertVariant?: 'info' | 'warning' | 'success' | 'error'
    alertMessage?: string
    summaryTitle?: string
    summaryAction?: string
  }

  const props = defineProps<{ schema: FormSchema; modelValue?: Record<string, commonField> }>()
  const emit = defineEmits(['submit', 'update:modelValue', 'update:isValid'])
  const formData = reactive<Record<string, commonField>>({})
  const errors = reactive<Record<string, string>>({})

  function isFieldVisible(key: string) {
    const field = props.schema.fields[key]

    if (!field?.visibleWhen) return true

    return field.visibleWhen(formData)
  }

  function isFieldRequired(key: string) {
    const field = props.schema.fields[key]

    if (!field) return false
    if (typeof field.required === 'function') return field.required(formData)

    return !!field.required
  }

  function validateField(key: string, value: commonField) {
    const field = props.schema.fields[key]

    if (!field) return
    if (!isFieldVisible(key)) {
      errors[key] = ''
      return true
    }

    // Required validation
    if (isFieldRequired(key) && (value === null || value === undefined || value === '')) {
      errors[key] = 'Este campo es obligatorio'
      return false
    }
    // PHONE SPECIAL CASE 🔥
    if (field.type === 'phone') {
      const phoneValue = typeof value === 'string' ? value.trim() : ''

      if (isFieldRequired(key) && !phoneValue) {
        errors[key] = 'Este campo es obligatorio'
        return false
      }

      if (phoneValue) {
        const phone = parsePhoneNumberFromString(phoneValue)
        const isValidPhone = phone ? phone.isValid() : false

        if (!isValidPhone) {
          errors[key] = 'Número de teléfono inválido'
          return false
        }
      }

      errors[key] = ''
      return true
    }

    // Pattern validation - only validate if value exists
    if (field.pattern && value && String(value).trim() !== '') {
      const isValid = field.pattern.test(String(value))

      if (!isValid) {
        errors[key] = field.errorMessage || 'Formato inválido'
        return false
      }
    }

    // Custom validation
    if (field.validate) {
      const result = field.validate(value)

      if (result !== true) {
        errors[key] = result
        return false
      }
    }

    errors[key] = ''
    return true
  }

  function validateForm() {
    let valid = true

    Object.keys(props.schema.fields).forEach(key => {
      const fieldValid = validateField(key, formData[key]!)

      if (!fieldValid) valid = false
    })

    return valid
  }

  watch(
    () => props.modelValue,
    newValue => {
      Object.entries(props.schema.fields).forEach(([key, field]) => {
        const incomingValue = newValue?.[key]

        if (incomingValue !== undefined) {
          formData[key] = incomingValue
        } else if (!(key in formData)) {
          // solo si no existe aún
          switch (field.type) {
            case 'slider-percentage':
            case 'money':
              formData[key] = 0
              break
            case 'date':
              formData[key] = null
              break
            case 'switch':
              formData[key] = false
              break
            default:
              formData[key] = ''
          }
        }
      })
    },
    { immediate: true, deep: true }
  )
  watch(
    formData,
    value => {
      let valid = true

      Object.keys(props.schema.fields).forEach(key => {
        const fieldValid = validateField(key, value[key]!)
        if (!fieldValid) valid = false
      })

      emit('update:modelValue', { ...value })
      emit('update:isValid', valid)
    },
    { deep: true }
  )

  function handleSubmit() {
    if (!validateForm()) return

    emit('submit', { ...formData })
  }
</script>
<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <template v-for="(row, i) in schema.layout" :key="i">
      <div
        :class="row.type === 'grid' ? `grid gap-4 grid-cols-${row.columns}` : 'flex flex-col gap-4'"
      >
        <template v-for="fieldKey in row.fields" :key="fieldKey">
          <template v-if="isFieldVisible(fieldKey)">
            <Input
              v-if="
                schema.fields[fieldKey]!.type === 'text' ||
                schema.fields[fieldKey]!.type === 'number'
              "
              v-model="formData[fieldKey] as string | number"
              :type="schema.fields[fieldKey]!.type"
              :label="schema.fields[fieldKey]!.label"
              :placeholder="schema.fields[fieldKey]!.placeholder"
              :required="isFieldRequired(fieldKey)"
              :pattern="schema.fields[fieldKey]!.pattern"
              :prefix="schema.fields[fieldKey]!.prefix"
              :error="errors[fieldKey]"
            />

            <MoneyInput
              v-else-if="schema.fields[fieldKey]!.type === 'money'"
              v-model="formData[fieldKey] as number"
              :label="schema.fields[fieldKey]!.label"
              :prefix="schema.fields[fieldKey]!.prefix"
              :required="isFieldRequired(fieldKey)"
            />
            <Select
              v-else-if="schema.fields[fieldKey]!.type === 'select'"
              v-model="formData[fieldKey] as string"
              :name="fieldKey"
              v-bind="schema.fields[fieldKey]"
              :required="isFieldRequired(fieldKey)"
              :options="schema.fields[fieldKey]?.options!"
            />

            <div v-else-if="schema.fields[fieldKey]!.type === 'date'" class="flex-1 flex-col">
              <DatePickerInput
                v-model="formData[fieldKey]! as Date"
                mode="single"
                :label="schema.fields[fieldKey]!.label"
                :required="isFieldRequired(fieldKey)"
              />
            </div>

            <div v-else-if="schema.fields[fieldKey]!.type === 'switch'" class="pt-5">
              <SwitchToggle
                v-model="formData[fieldKey] as boolean"
                :label="schema.fields[fieldKey]!.label"
                icon="verified"
                label-position="right"
              />
            </div>

            <TextArea
              v-else-if="schema.fields[fieldKey]!.type === 'textarea'"
              :id="fieldKey"
              v-model="formData[fieldKey] as string"
              :name="fieldKey"
              :label="schema.fields[fieldKey]!.label"
              :required="isFieldRequired(fieldKey)"
              :pattern="schema.fields[fieldKey]!.pattern"
              :error="errors[fieldKey]"
              :error-message="schema.fields[fieldKey]!.errorMessage"
              placeholder="Describe el gasto..."
            />
            <RangeSlider
              v-else-if="schema.fields[fieldKey]!.type === 'slider-percentage'"
              v-model="formData[fieldKey] as number"
              label="Porcentaje de Distribucion"
            />

            <RadioButton
              v-else-if="schema.fields[fieldKey]!.type === 'radio-card'"
              v-model="formData[fieldKey] as string"
              name="budgetFrequency"
              :label="schema.fields[fieldKey]!.label"
              :required="isFieldRequired(fieldKey)"
              variant="card"
              direction="row"
              :options="schema.fields[fieldKey]?.options!"
            />

            <PhoneInput
              v-else-if="schema.fields[fieldKey]!.type === 'phone'"
              v-model="formData[fieldKey] as string"
              :label="schema.fields[fieldKey]!.label"
              :required="isFieldRequired(fieldKey)"
              :error="errors[fieldKey]"
            />
          </template>
        </template>
      </div>
    </template>
    <slot name="fields" />
    <slot name="actions" />
  </form>
</template>
