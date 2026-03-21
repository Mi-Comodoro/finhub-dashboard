export type Currency = 'COP' | 'USD'

export interface FinancesData {
  currency: Currency
  profile?: 'employee' | 'freelancer' | 'business_owner'
  budgetFrequency?: 'monthly' | 'biweekly' | null
  monthPayment?: Date | null
  biweeklyPayments?: [Date | null, Date | null] | null
}

export interface FinancesDataFormProps {
  modelValue?: FinancesData
}

export interface FinancesDataFormEmits {
  'update:modelValue': [value: FinancesData]
  valid: [isValid: boolean]
}
