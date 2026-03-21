export interface CategoriesData {
  id: string
  name: string
  type: string
  isSelectable: boolean
  bucket: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}
export interface CategoriesApiResponse {
  readonly success: boolean
  readonly data: CategoriesData[]
}

export interface CategoriesResponse {
  readonly success: boolean
  readonly result: CategoriesData[]
}
