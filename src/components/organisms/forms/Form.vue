<script setup lang="ts">
  import { reactive, watch } from 'vue'

  import {
    DatePickerInput,
    Input,
    MoneyInput,
    //NumberInput,
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
    label: string
    placeholder?: string
    required?: boolean
    pattern?: RegExp
    errorMessage?: string
    prefix?: string
    options?: FieldOption[]

    // eslint-disable-next-line no-unused-vars
    visibleWhen?: (form: Record<string, commonField>) => boolean
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
  function validateField(key: string, value: commonField) {
    const field = props.schema.fields[key]

    if (!field) return

    // required
    if (field.required && (!value || value === '')) {
      errors[key] = 'Este campo es obligatorio'
      return false
    }

    // pattern
    if (field.pattern && value) {
      const isValid = field.pattern.test(String(value))

      if (!isValid) {
        errors[key] = field.errorMessage || 'Formato inválido'
        return false
      }
    }

    errors[key] = ''
    return true
  }

  function validateForm() {
    let valid = true

    Object.entries(formData).forEach(([key, value]) => {
      const fieldValid = validateField(key, value)

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

      Object.entries(value).forEach(([key, val]) => {
        const fieldValid = validateField(key, val)
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
          <Input
            v-if="
              schema.fields[fieldKey]!.type === 'text' || schema.fields[fieldKey]!.type === 'number'
            "
            v-model="formData[fieldKey] as string | number"
            :type="schema.fields[fieldKey]!.type"
            :label="schema.fields[fieldKey]!.label"
            :placeholder="schema.fields[fieldKey]!.placeholder"
            :required="schema.fields[fieldKey]!.required"
            :pattern="schema.fields[fieldKey]!.pattern"
            :prefix="schema.fields[fieldKey]!.prefix"
            :error="errors[fieldKey]"
          />
          <MoneyInput
            v-else-if="schema.fields[fieldKey]!.type === 'money'"
            v-model="formData[fieldKey] as number"
            :label="schema.fields[fieldKey]!.label"
            :prefix="schema.fields[fieldKey]!.prefix"
            :required="schema.fields[fieldKey]!.required"
          />
          <Select
            v-else-if="schema.fields[fieldKey]!.type === 'select'"
            v-model="formData[fieldKey] as string"
            :name="fieldKey"
            v-bind="schema.fields[fieldKey]"
            :options="schema.fields[fieldKey]?.options!"
          />

          <div v-else-if="schema.fields[fieldKey]!.type === 'date'" class="flex-1 flex-col">
            <DatePickerInput
              v-model="formData[fieldKey]! as Date"
              mode="single"
              :label="schema.fields[fieldKey]!.label"
              :required="schema.fields[fieldKey]!.required"
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
            placeholder="Describe el gasto..."
            v-bind="schema.fields[fieldKey]"
          />
          <RangeSlider
            v-else-if="schema.fields[fieldKey]!.type === 'slider-percentage'"
            v-model="formData[fieldKey] as number"
            label="Porcentaje de Distribucion"
          />

          <RadioButton
            v-else-if="schema.fields[fieldKey]!.type === 'radio-card'"
            v-model="formData[fieldKey] as string"
            v-bind="schema.fields[fieldKey]"
            name="budgetFrequency"
            variant="card"
            direction="row"
            :options="schema.fields[fieldKey]?.options!"
          />
        </template>
      </div>
    </template>
    <slot name="fields" />
    <slot name="actions" />
  </form>
</template>
