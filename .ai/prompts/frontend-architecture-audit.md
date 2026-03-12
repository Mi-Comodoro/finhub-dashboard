# MASTER FRONTEND ARCHITECTURE AUDIT

This is the primary architectural audit prompt for the repository.

Use this prompt when auditing or refactoring the frontend architecture.

Actúa como un arquitecto senior de frontend especializado en:

Nuxt 4
Vue 3
Typescript
Tailwind
PostCSS
Pinia
Atomic Design
Design Systems
BEM CSS

Debes analizar TODO el proyecto.

Usa como referencia obligatoria:

.github/copilot-instructions.md
docs/component-classification.md

---

# Objetivo

Realizar una auditoría completa del frontend para:

1 analizar todos los componentes
2 verificar su clasificación en Atomic Design
3 detectar violaciones del design system
4 identificar componentes que pertenecen a la capa business
5 detectar duplicación o variantes innecesarias
6 proponer refactorizaciones seguras

---

# Arquitectura esperada

components/

atoms/
molecules/
organisms/
templates/
business/

---

# Reglas del Design System

Atoms
componentes simples sin dependencias de otros componentes.

Molecules
combinación de atoms.

Organisms
combinación de atoms y molecules.

Templates
estructuras de layout.

Business
componentes con lógica específica del dominio.

---

# Reglas críticas

Los componentes en:

atoms
molecules
organisms
templates

deben ser:

genéricos
reutilizables
sin lógica de negocio
sin dependencias de API
sin dependencias de store de dominio

La lógica de negocio debe vivir en:

components/business/

---

# Reglas de estilos

BEM obligatorio

.block
.block\_\_element
.block--modifier

Tailwind solo puede usarse mediante @apply dentro del style.

No debe usarse Tailwind directamente en el template.

---

# Reglas de componentes

Todos los componentes deben usar:

<script setup lang="ts">

Orden obligatorio:

script
template
style

---

# Reglas de tipos

Las props deben definirse en:

types/component-name.types.ts

No deben definirse directamente en el componente.

---

# Flujo de datos obligatorio

page / component
→ composable
→ server/api
→ external backend request

---

# Qué debes analizar

Para cada componente:

1 nombre del componente
2 ubicación actual
3 capa actual
4 capa recomendada
5 dependencias
6 si contiene lógica de negocio
7 si viola el design system

---

# Detectar los siguientes problemas

Clasificación incorrecta

Ejemplo:
SelectField en atoms.

Componentes demasiado complejos para su capa.

Lógica de negocio dentro del design system.

Uso de API dentro de atoms o molecules.

Uso de stores dentro de design system.

Duplicación de componentes.

Ejemplo:

UserSelect
RoleSelect
ProductSelect

cuando debería existir:

atoms/select
molecules/select-field
business/user-select

---

# Detectar Business Components

Componentes que:

usan composables
usan stores
usan API
están ligados a entidades del dominio

deben ir en:

components/business/

---

# Refactorización

Solo puedes refactorizar automáticamente cuando:

NO se rompe funcionalidad
NO cambian imports externos
NO cambia la API pública del componente

Cambios seguros permitidos:

crear carpeta types
mover props a types
crear index.ts
mejorar tipado
organizar imports

---

# Cambios riesgosos

Si detectas cambios riesgosos debes escribir:

// SUGGESTED REFACTOR

Explicando:

problema
solución recomendada
impacto

---

# Formato obligatorio del reporte

Responde siempre en este formato:

---

# FRONTEND ARCHITECTURE AUDIT

## Project Summary

Total components:
Atoms:
Molecules:
Organisms:
Templates:
Business:

---

# Correctly Classified Components

Lista de componentes correctos.

---

# Misclassified Components

| Component | Current Layer | Recommended Layer | Reason |

---

# Components That Should Be Business Components

| Component | Reason |

---

# Duplicate or Variant Components

Lista de componentes duplicados o variantes innecesarias.

Propuesta de simplificación.

---

# Design System Violations

Lista de problemas detectados:

ejemplo:

Tailwind en template
props sin tipar
BEM inconsistente
lógica de negocio en design system

---

# Safe Refactors Applied

Lista de cambios seguros realizados.

---

# Suggested Refactors

Lista de refactors sugeridos que requieren validación manual.

---

# Design System Health Score

Evalúa el proyecto del 1 al 10 considerando:

arquitectura
organización
consistencia
mantenibilidad
