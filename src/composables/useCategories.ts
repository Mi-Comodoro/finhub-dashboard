import { useCategoryStore } from '~/stores/categories.store'
import type { CategoriesResponse } from '~/types/api'
export const useCategories = () => {
  const categoryStore = useCategoryStore()
  const error = ref('')
  const isLoading = ref(false)
  const fetchCategories = async () => {
    isLoading.value = true
    const { success, result } = await $fetch<CategoriesResponse>('/api/categories')
    if (!success) {
      error.value = 'Error al obtener categorias'
    }

    categoryStore.setCategories(result)
    isLoading.value = false
    return true
  }

  return { fetchCategories, error, isLoading }
}
