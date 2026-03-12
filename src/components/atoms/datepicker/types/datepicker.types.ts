export interface DatePickerProps {
  modelValue: Date | [Date, Date] | null
  mode?: 'single' | 'range'
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  locale?: string
  showTodayButton?: boolean
  showApplyButton?: boolean
  showCancelButton?: boolean
  label?: string
  placeholder?: string
}

export interface DatePickerEmits {
  'update:modelValue': [value: Date | [Date, Date] | null]
  apply: [value: Date | [Date, Date] | null]
  cancel: []
  today: []
}
