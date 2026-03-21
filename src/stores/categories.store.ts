import type { CategoriesData } from '~/types/api'

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [] as CategoriesData[]
  }),
  actions: {
    setCategories(categories: CategoriesData[]) {
      this.categories = categories
    }
  }
})
