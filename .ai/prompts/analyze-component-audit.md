# Component Architecture Audit

Actúa como un arquitecto senior especializado en:

- Nuxt 4
- Vue 3
- Typescript
- Tailwind
- Atomic Design
- Design Systems
- BEM CSS

Debes analizar TODO el proyecto.

Usa como referencia obligatoria:

docs/component-classification.md  
.github/copilot-instructions.md

---

# Objetivo

Auditar todos los componentes del proyecto para determinar:

1. si están correctamente clasificados en Atomic Design
2. si cumplen las reglas del design system
3. si contienen lógica de negocio indebida
4. si deberían moverse a business layer
5. si hay duplicación de componentes
6. si existen variantes innecesarias

---

# Arquitectura esperada

components/

atoms/  
molecules/  
organisms/  
templates/  
business/

---

# Reglas de clasificación

Atoms
Componentes simples que no dependen de otros componentes.

Molecules
Combinación de atoms.

Organisms
Combinación de atoms y molecules.

Templates
Estructuras de layout de página.

Business
Componentes con lógica específica del dominio del negocio.

---

# Qué debes analizar por componente

Para cada componente debes determinar:

- ubicación actual
- tipo actual
- tipo recomendado
- dependencias
- si usa composables
- si contiene lógica de negocio
- si viola reglas del design system

---

# Problemas que debes detectar

Clasificación incorrecta

Ejemplo:
SelectField dentro de atoms.

Componente demasiado complejo para su capa

Ejemplo:
Un molecule que contiene múltiples organisms.

Lógica de negocio en el design system

Ejemplo:
Select que llama API directamente.

Duplicación de componentes

Ejemplo:
UserSelect
RoleSelect
ProductSelect

cuando debería existir

Select + business wrapper.

---

# Business Layer Detection

Detectar componentes que deberían moverse a:

components/business/

Ejemplos:

UserSelect  
RolePermissionTable  
InvoiceSummary  
DashboardStats  
ProductFilterPanel

---

# Evaluación del Design System

Analiza también:

- consistencia BEM
- uso correcto de Tailwind
- props tipadas
- estructura de carpetas
- index.ts exports

---

# Formato obligatorio del reporte

Genera el reporte en este formato exacto:

---

# COMPONENT ARCHITECTURE AUDIT

## Project Summary

Total components:  
Atoms:  
Molecules:  
Organisms:  
Templates:  
Business:

---

# Correctly Classified Components

Lista de componentes que cumplen las reglas.

---

# Misclassified Components

| Component | Current Layer | Recommended Layer | Reason |
| --------- | ------------- | ----------------- | ------ |

---

# Components That Should Become Business Components

| Component | Reason |
| --------- | ------ |

---

# Duplicate or Variant Components

Componentes que podrían unificarse.

Ejemplo:

AdminSelect  
UserSelect  
RoleSelect

Sugerencia:

atoms/select  
molecules/select-field  
business/user-select

---

# Design System Violations

Lista de problemas detectados:

- Tailwind usado en template
- props sin tipar
- estilos fuera de BEM
- lógica de negocio en UI

---

# Refactor Recommendations

Lista priorizada de mejoras:

Priority 1 – problemas arquitectónicos graves  
Priority 2 – organización  
Priority 3 – mejoras de mantenibilidad
