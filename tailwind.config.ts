import type { Config } from 'tailwindcss'
export default {
  content: [
    './app.vue',
    './error.vue',
    './src/components/**/*.{vue,js,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue'
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf9',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        },

        secondary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        },

        success: {
          50: '#ecfdf5',
          500: '#22c55e',
          700: '#15803d'
        },

        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309'
        },

        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c'
        },

        /* === SURFACES === */
        background: {
          light: '#f8fafc'
        },

        card: {
          light: '#ffffff'
        },

        /* === BORDERS === */
        border: {
          light: '#e2e8f0' // slate-200
        }
      }
    }
  },

  plugins: []
} satisfies Config
