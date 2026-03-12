export interface DatePickerInputProps {
  modelValue: Date | [Date, Date] | null
  mode?: 'single' | 'range'
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  locale?: string
  label?: string
  placeholder?: string
  inputClass?: string
}

export interface DatePickerInputEmits {
  'update:modelValue': [value: Date | [Date, Date] | null]
}
