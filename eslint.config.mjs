import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import prettierConfig from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfig from '@nuxt/eslint-config'

export default withNuxt([
  eslintConfig, // Reconoce auto-imports Nuxt 3
  prettierConfig, // Prettier
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
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'simple-import-sort/imports': [
        'error',
        { groups: [['^\\u0000'], ['^@?\\w'], ['^'], ['^\\.']] }
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['~/types/api/*.api', '@/types/api/*.api'],
              message: 'Importa types desde el barrel `~/types/api`.'
            },
            {
              group: ['~/types/domain/*.domain', '@/types/domain/*.domain'],
              message: 'Importa types desde el barrel `~/types/domain`.'
            },
            {
              group: ['~/types/ui/*.ui', '@/types/ui/*.ui'],
              message: 'Importa types desde el barrel `~/types/ui`.'
            },
            {
              group: ['../types', '../types/*'],
              message:
                'Evita imports relativos de types de componentes; usa `@/components/atoms` o `@/components/molecules` según la capa.'
            },
            {
              group: ['@/components/atoms/types', '@/components/atoms/types/*'],
              message: 'Importa los types de atoms desde `@/components/atoms`.'
            },
            {
              group: ['@/components/molecules/types', '@/components/molecules/types/*'],
              message: 'Importa los types de molecules desde `@/components/molecules`.'
            }
          ]
        }
      ],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error'
    }
  }
])
