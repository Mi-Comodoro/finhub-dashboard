import { computed, ref } from 'vue'

// 1. Definimos la referencia FUERA de la función.
// Esto hace que sea un estado global compartido por todos los componentes.
const _isOpen = ref(false)

export const useSidebar = () => {
  const isCollapsed = useCookie<boolean>('sidebar-collapsed', {
    default: () => false,
    sameSite: 'lax'
  })

  // 2. Computado con get y set para que el v-model del layout pueda escribir
  const isOpen = computed({
    get: () => _isOpen.value,
    set: (value: boolean) => {
      _isOpen.value = value
    }
  })

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isOpen,
    isCollapsed,
    toggle: () => {
      _isOpen.value = !_isOpen.value
    },
    close: () => {
      _isOpen.value = false
    },
    toggleCollapse
  }
}
