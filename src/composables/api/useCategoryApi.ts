export function useCategoryApi() {

  const getCategories = async () =>
    $fetch<{ success: boolean; result: unknown }>(
      '/api/categories'
    )

  return {
    getCategories
  }
}
