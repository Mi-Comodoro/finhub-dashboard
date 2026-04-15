import { useCategoryApi } from '~/composables/api/useCategoryApi'
import { useCategoryStore } from '~/stores/categories.store'
import type { CategoriesResponse } from '~/types/api'
export const useCategoryApplication = () => {
  const categoryStore = useCategoryStore()
  const categoryApi = useCategoryApi()
  const error = ref('')
  const isLoading = ref(false)
  const fetchCategories = async () => {
    isLoading.value = true
    const { success, result } = await categoryApi.getCategories() as CategoriesResponse
    if (!success) {
      error.value = 'Error al obtener categorias'
    }

    categoryStore.setCategories(result)
    isLoading.value = false
    return true
  }

  const categories = computed(() => categoryStore.categories)

  return { fetchCategories, error, isLoading, categories }
}
