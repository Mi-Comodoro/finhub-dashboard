export interface PlanData {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  isActive: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface PlansApiResponse {
  readonly success: boolean
  readonly data: PlanData[]
}
