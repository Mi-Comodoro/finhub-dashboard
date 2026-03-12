Create a component following the project architecture.

Stack:
Nuxt 4
Vue 3
Typescript
Tailwind
PostCSS
Atomic Design
BEM

Structure:

components/{layer}/{component-name}/

component-name/
ComponentName.vue
types/
component-name.types.ts
index.ts

Rules:

- script setup lang="ts"
- props defined in types
- BEM classes
- tailwind only via @apply
- style scoped lang="postcss"
