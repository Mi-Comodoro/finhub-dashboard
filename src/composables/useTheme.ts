import { computed, ref, watch } from 'vue'

import { useCookie } from '#app'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
const isInitialized = ref(false)

export const useTheme = () => {
  const themeCookie = useCookie<Theme>('theme', {
    default: () => 'light',
    sameSite: 'lax'
  })

  // Initialize theme from cookie or system preference
  const initTheme = () => {
    if (isInitialized.value) return

    if (import.meta.client) {
      // Check if we have a saved preference
      const saved = themeCookie.value
      if (saved) {
        theme.value = saved
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
      }

      // Apply theme to document
      applyTheme(theme.value)
    }

    isInitialized.value = true
  }

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (import.meta.client) {
      const html = document.documentElement

      if (newTheme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Set specific theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    themeCookie.value = newTheme
    applyTheme(newTheme)
  }

  // Computed properties
  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  // Watch for theme changes
  watch(theme, newTheme => {
    applyTheme(newTheme)
  })

  // Listen to system theme changes
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', e => {
      if (!themeCookie.value) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    theme: computed(() => theme.value),
    isDark,
    isLight,
    toggleTheme,
    setTheme,
    initTheme
  }
}
