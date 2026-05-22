export const useSidebarMode = () => {
  const mode = useCookie<'user' | 'admin'>('mc_sidebar_mode', {
    default: () => 'user'
  })

  const isAdminMode = computed({
    get: () => mode.value === 'admin',
    set: () => {
      mode.value = mode.value === 'admin' ? 'user' : 'admin'
    }
  })

  const toggle = () => {
    mode.value = mode.value === 'admin' ? 'user' : 'admin'
  }

  return { mode, isAdminMode, toggle }
}
