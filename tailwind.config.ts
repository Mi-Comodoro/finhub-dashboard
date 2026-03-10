import type { Config } from 'tailwindcss'
export default {
  content: [
    './app.vue',
    './error.vue',
    './src/components/**/*.{vue,js,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue'
  ],
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },

        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
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

        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81'
        },

        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          400: '#facc15',
          500: '#eab308'
        },

        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          600: '#9333ea',
          800: '#6b21a8',
          900: '#581c87'
        },

        /* === SURFACES === */
        background: {
          light: '#f1f5f9'
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
