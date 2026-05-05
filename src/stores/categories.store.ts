import type { CategoriesData } from '~/types/api'

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [] as CategoriesData[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    selectableCategories: state => state.categories.filter(c => c.isSelectable),
    categoriesByType: state => (type: string) => state.categories.filter(c => c.type === type)
  },

  actions: {
    setCategories(categories: CategoriesData[]) {
      this.categories = categories
    },

    addCategory(category: CategoriesData) {
      this.categories.push(category)
    },

    updateCategoryData(id: string, data: Partial<CategoriesData>) {
      const index = this.categories.findIndex(c => c.id === id)
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...data }
      }
    },

    removeCategory(id: string) {
      this.categories = this.categories.filter(c => c.id !== id)
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    }
  }
})
