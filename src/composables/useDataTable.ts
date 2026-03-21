/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref } from 'vue'

export const useDataTable = (initialData: any[]) => {
  const search = ref('')
  const sortKey = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const filteredData = computed(() => {
    return initialData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(search.value.toLowerCase())
    )
  })

  const sortedData = computed(() => {
    if (!sortKey.value) return filteredData.value

    return [...filteredData.value].sort((a, b) => {
      const aVal = a[sortKey.value!]
      const bVal = b[sortKey.value!]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  })

  const toggleSort = (key: string) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  return {
    search,
    sortKey,
    sortOrder,
    data: sortedData,
    toggleSort
  }
}
