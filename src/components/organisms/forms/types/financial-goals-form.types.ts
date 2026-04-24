export type Currency = 'COP' | 'USD'

export interface FinancesData {
  currency: Currency
  profile: 'employee' | 'freelancer' | 'business_owner'
  accountName: string
  interestRate: number
}

export interface FinancesDataFormProps {
  modelValue?: FinancesData
}

export interface FinancesDataFormEmits {
  'update:modelValue': [value: FinancesData]
  valid: [isValid: boolean]
}
