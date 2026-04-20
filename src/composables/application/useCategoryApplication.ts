import { useCategoryApi } from '~/composables/api/useCategoryApi'
import { useCategoryStore } from '~/stores/categories.store'
import type { CategoriesResponse } from '~/types/api'

export const useCategoryApplication = () => {
  const categoryStore = useCategoryStore()
  const categoryApi = useCategoryApi()

  const fetchCategories = async () => {
    try {
      categoryStore.setLoading(true)
      categoryStore.setError(null)
      const { success, result } = await categoryApi.getCategories() as CategoriesResponse

      if (!success) {
        categoryStore.setError('Error al obtener categorías')
        return { success: false }
      }

      categoryStore.setCategories(result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener categorías'
      categoryStore.setError(errorMessage)
      return { success: false }
    } finally {
      categoryStore.setLoading(false)
    }
  }

  const createCategory = async (data: Record<string, unknown>) => {
    try {
      categoryStore.setLoading(true)
      categoryStore.setError(null)
      const { success, result } = await categoryApi.createCategory(data)

      if (!success || !result) {
        categoryStore.setError('Error al crear categoría')
        return { success: false }
      }

      categoryStore.addCategory(result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría'
      categoryStore.setError(errorMessage)
      return { success: false }
    } finally {
      categoryStore.setLoading(false)
    }
  }

  const updateCategory = async (id: string, data: Record<string, unknown>) => {
    try {
      categoryStore.setLoading(true)
      categoryStore.setError(null)
      const { success, result } = await categoryApi.updateCategory(id, data)

      if (!success || !result) {
        categoryStore.setError('Error al actualizar categoría')
        return { success: false }
      }

      categoryStore.updateCategoryData(id, result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría'
      categoryStore.setError(errorMessage)
      return { success: false }
    } finally {
      categoryStore.setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      categoryStore.setLoading(true)
      categoryStore.setError(null)
      const { success } = await categoryApi.deleteCategory(id)

      if (!success) {
        categoryStore.setError('Error al eliminar categoría')
        return { success: false }
      }

      categoryStore.removeCategory(id)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría'
      categoryStore.setError(errorMessage)
      return { success: false }
    } finally {
      categoryStore.setLoading(false)
    }
  }

  const categories = computed(() => categoryStore.categories)
  const isLoading = computed(() => categoryStore.isLoading)
  const error = computed(() => categoryStore.error)
  const selectableCategories = computed(() => categoryStore.selectableCategories)

  return {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    categories,
    selectableCategories,
    isLoading,
    error
  }
}
