<script setup lang="ts">
  import { onMounted, reactive } from 'vue'

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
    type: 'text' | 'number' | 'select' | 'date' | 'switch' | 'textarea' | 'money'
    label: string
    placeholder?: string
    required?: boolean
    pattern?: RegExp
    errorMessage?: string
    prefix?: string
    options?: FieldOption[]
  }

  const props = defineProps<{ schema: FormSchema }>()
  const emit = defineEmits(['submit', 'update:modelValue'])
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
  // Inicializar formData con claves vacías
  onMounted(() => {
    Object.entries(props.schema.fields).forEach(([key, field]) => {
      switch (field.type) {
        case 'number':
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
    })
  })
  watch(
    formData,
    value => {
      Object.entries(value).forEach(([key, val]) => {
        validateField(key, val)
      })
      emit('update:modelValue', { ...value })
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
        </template>
      </div>
    </template>

    <slot name="actions" />
  </form>
</template>
