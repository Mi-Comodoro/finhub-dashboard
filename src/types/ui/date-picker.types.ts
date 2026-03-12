export interface DatePickerInputProps {
  modelValue: Date | null
  mode?: 'single' | 'range'
  locale?: string
  label?: string
  placeholder?: string
  inputClass?: string
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
}

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface CalendarDay {
  date: Date
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isDisabled: boolean
}

export interface DatePickerProps {
  modelValue: Date | DateRange | null
  mode?: 'single' | 'range'
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  locale?: string
  label?: string
  placeholder?: string
}
