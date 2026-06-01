export type BillFrequency = 'monthly' | 'yearly'

export interface Bill {
  id: string
  userId: string
  categoryId: string
  name: string
  expectedAmount: number
  billingDay: number
  frequency: BillFrequency
  isActive: boolean
  isPaid: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBillDto {
  name: string
  categoryId: string
  expectedAmount: number
  billingDay: number
  frequency: BillFrequency
}

export type UpdateBillDto = Partial<CreateBillDto>

export interface ImportBillsDto {
  billIds: string[]
}
