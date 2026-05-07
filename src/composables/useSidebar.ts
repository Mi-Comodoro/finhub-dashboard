import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'sidebar-collapsed'

const isOpen = ref(false)
const isCollapsed = ref(false)
let hydrated = false

const persistCollapsed = (val: boolean) => {
  localStorage.setItem(STORAGE_KEY, String(val))
}

export const useSidebar = () => {
  onMounted(() => {
    if (!hydrated) {
      hydrated = true
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) isCollapsed.value = saved === 'true'

      watch(isCollapsed, persistCollapsed)
    }
  })

  return {
    isOpen,
    isCollapsed,
    toggle: () => (isOpen.value = !isOpen.value),
    close: () => (isOpen.value = false),
    toggleCollapse: () => (isCollapsed.value = !isCollapsed.value)
  }
}
