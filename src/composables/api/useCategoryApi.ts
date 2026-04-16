import type { CategoriesData } from '@/types/api/categories.api'

export function useCategoryApi() {

  const getCategories = async () =>
    $fetch<{ success: boolean; result: CategoriesData[] }>(
      '/api/categories'
    )

  const createCategory = async (data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: CategoriesData }>(
      '/api/categories',
      {
        method: 'POST',
        body: data
      }
    )

  const updateCategory = async (id: string, data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: CategoriesData }>(
      `/api/categories/${id}`,
      {
        method: 'PUT',
        body: data
      }
    )

  const deleteCategory = async (id: string) =>
    $fetch<{ success: boolean; result: { id: string } }>(
      `/api/categories/${id}`,
      {
        method: 'DELETE'
      }
    )

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
