# IMPORTANT FOR COPILOT

This repository uses a strict frontend architecture.

Copilot MUST follow the architecture described in this document when:

- generating components
- refactoring code
- creating composables
- writing styles
- organizing files

If a request conflicts with these rules, Copilot must prioritize these rules.

# Copilot Instructions – Frontend Architecture

This project uses Nuxt 4 with the following stack:

- Nuxt 4
- Vue 3
- Typescript
- TailwindCSS
- PostCSS
- Pinia
- Firebase
- External backend APIs

The project follows **Atomic Design** and **BEM CSS methodology**.

IMPORTANT: Copilot must respect the existing design and functionality.  
Refactoring must be **non-breaking** and **transparent to the current system**.

---

# Component Structure Rules

Components are organized using **Atomic Design**:

components/
atoms/
molecules/
organisms/
templates/

Definitions:

Atoms  
Smallest UI components.

Examples:
Button
Input
Label
Icon

Molecules  
Combination of atoms.

Example:
Input + Label

Organisms  
Combination of atoms and molecules.

Example:
Form section, Navbar, Table.

Templates  
Components composed of organisms and other layout logic.  
Templates are used for **specific page layouts**.

---

# Folder Structure Standard

Every component MUST follow this structure:

atoms/
button/
Button.vue
types/
button.types.ts
index.ts

Rules:

- Each component has its own folder
- Each component has a `types` folder
- Props MUST be defined in `types`
- Props must NOT be defined directly in the component

Example:

types/button.types.ts

export interface ButtonProps {
label: string
variant?: 'primary' | 'secondary'
}

Component:

<script setup lang="ts">
import type { ButtonProps } from './types/button.types'

const props = defineProps<ButtonProps>()
</script>

---

# Vue Component Rules

All components MUST follow this order:

1 script
2 template
3 style

Example:

<script setup lang="ts">
</script>

<template>
</template>

<style scoped lang="postcss">
</style>

---

# Styling Rules

This project uses:

Tailwind + PostCSS + BEM

Tailwind utilities MUST NOT be used directly in the template.

Instead use:

<div class="select"></div>

and apply Tailwind with @apply in the style block.

Example:

.select {
@apply flex items-center gap-2;
}

BEM naming rules:

.block
.block\_\_element
.block--modifier

Example:

card
card**header
card**title
card--active

---

# Tailwind Usage Rules

Allowed:

@apply inside style

Not allowed:

<div class="flex gap-2">

Correct approach:

<div class="card"></div>

<style scoped lang="postcss">
.card {
  @apply flex gap-2;
}
</style>

---

# Script Rules

All components MUST use:

<script setup lang="ts">

Props must be typed using external types.

Use withDefaults ONLY if defaults exist.

Example:

const props = withDefaults(defineProps<SelectProps>(), {
  required: false
})

---

# Emits Rules

Use typed emits when possible.

Example:

const emit = defineEmits<{
 (e:'update:modelValue', value:string):void
}>()

---

# Backend Request Flow

All data requests follow this architecture:

page or component
   ↓
composable
   ↓
server/api
   ↓
external backend request

Example:

pages/users.vue
composables/useUsers.ts
server/api/users.get.ts

server/api example:

export default defineEventHandler(async () => {
  return await $fetch('https://external-api.com/users')
})

---

# Composable Rules

Composables must start with `use`.

Examples:

useUsers.ts
useAuth.ts

---

# Store Rules

Pinia stores are located in:

stores/

Example:

stores/user.store.ts

Stores must not contain UI logic.

---

# Refactor Safety Rules

Copilot MUST NOT:

- change existing HTML structure
- rename BEM classes
- modify visual layout
- change component public API
- remove existing props
- break functionality

Copilot MAY:

- move types to types folder
- add missing types
- create index.ts exports
- improve typing
- organize code
- add comments suggesting improvements
