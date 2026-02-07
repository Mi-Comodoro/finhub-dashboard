import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**']
  },
  js.configs.recommended,

  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Nuxt / Vue auto-imports
        defineNuxtConfig: 'readonly',
        definePageMeta: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useState: 'readonly',
        useAsyncData: 'readonly',
        useFetch: 'readonly',
        ref: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        process: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        Window: 'readonly',
        ClipboardEvent: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort
    },
    rules: {
      /* ---------- TypeScript ---------- */
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      /* ---------- Vue ---------- */
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',

      /* ---------- Imports ---------- */
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // Side-effects
            ['^@?\\w'], // Packages
            ['^'], // Relative imports
            ['^\\.']
          ]
        }
      ],
      'simple-import-sort/exports': 'error',

      /* ---------- General ---------- */
      'no-console': 'warn',
      'no-debugger': 'error'
    }
  },

  prettierConfig
]
