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
  modelValue: DateRange
  minDate?: Date
  maxDate?: Date
}
