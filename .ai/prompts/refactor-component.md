# Refactor Component Prompt

Actúa como un arquitecto senior de frontend especializado en:

- Nuxt 4
- Vue 3
- Typescript
- TailwindCSS
- PostCSS
- Atomic Design
- BEM CSS
- Pinia

Este proyecto sigue una arquitectura estricta definida en:

.github/copilot-instructions.md

Antes de realizar cualquier cambio debes leer y respetar esas reglas.

---

# Objetivo

Refactorizar el componente actual mejorando su calidad sin romper:

- funcionalidad
- diseño
- comportamiento
- API pública del componente

Los cambios deben ser **transparentes al sistema actual**.

---

# Reglas de seguridad (obligatorias)

NO debes:

- cambiar la estructura HTML existente
- modificar clases BEM existentes
- alterar estilos visuales actuales
- eliminar props existentes
- cambiar nombres de eventos emitidos
- romper imports actuales

---

# Cambios permitidos

Puedes:

- mover props a `types/component.types.ts`
- mejorar el tipado de Typescript
- aplicar `defineEmits` tipado
- mejorar organización del script
- separar lógica en `computed`
- agregar comentarios útiles
- crear `index.ts` si no existe

---

# Arquitectura esperada

components/{layer}/{component-name}/

component-name/
ComponentName.vue
types/
component-name.types.ts
index.ts

---

# Reglas de Vue

Todos los componentes deben usar:

<script setup lang="ts">

Orden obligatorio del componente:

1 script
2 template
3 style

---

# Reglas de estilos

Este proyecto usa:

BEM + Tailwind + PostCSS

Tailwind utilities NO deben usarse en el template.

Incorrecto:

<div class="flex gap-2">

Correcto:

<div class="card">

<style scoped lang="postcss">
.card {
  @apply flex gap-2;
}
</style>

---

# Reglas de Props

Las props deben estar en:

types/component.types.ts

Ejemplo:

export interface SelectProps {
modelValue?: string
disabled?: boolean
}

En el componente:

import type { SelectProps } from './types/select.types'

const props = defineProps<SelectProps>()

---

# Si detectas mejoras riesgosas

NO implementarlas.

Agregar comentario:

// SUGGESTED IMPROVEMENT:

Explicando:

- problema detectado
- posible solución
- impacto

---

# Resultado esperado

1 análisis breve del componente
2 refactor seguro
3 sugerencias de mejora opcionales
