import { ref } from 'vue'

const isOpen = ref(false)
const isCollapsed = ref(false)

export const useSidebar = () => ({
  isOpen,
  isCollapsed,
  toggle: () => (isOpen.value = !isOpen.value),
  close: () => (isOpen.value = false),
  toggleCollapse: () => (isCollapsed.value = !isCollapsed.value)
})
