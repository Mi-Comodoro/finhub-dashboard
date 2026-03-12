Actúa como un arquitecto senior especializado en:

Nuxt 4
Vue 3
Typescript
Tailwind
Atomic Design
Design Systems

Analiza el proyecto completo.

Debes usar como referencia:

docs/component-classification.md

---

# Objetivo

Comparar los componentes existentes del proyecto contra la clasificación estándar.

Determinar:

1 qué componentes cumplen la clasificación
2 qué componentes están mal ubicados
3 qué componentes deberían moverse de capa
4 qué componentes deberían ser business components
5 qué componentes duplican funcionalidad

---

# Arquitectura esperada

components/

atoms/
molecules/
organisms/
templates/
business/

---

# Reglas

Design System layers:

atoms
molecules
organisms
templates

Contienen componentes **genéricos y reutilizables**.

NO deben contener lógica de negocio.

---

Business layer:

business/

Contiene componentes específicos del dominio.

Ejemplo:

UserSelect
RolePermissionTable
InvoiceSummary
UserSearchPanel

---

# Qué debes analizar

1 clasificación de cada componente
2 complejidad del componente
3 dependencias del componente
4 si contiene lógica de negocio
5 si debería moverse a business
6 si debería simplificarse

---

# Detectar problemas como:

atom usando molecules

molecule demasiado compleja

organism usado solo para un caso de negocio

componente genérico con muchas variantes

duplicación de componentes

---

# Resultado esperado

1 listado de todos los componentes
2 clasificación actual
3 clasificación recomendada
4 sugerencias de movimiento de carpeta
5 sugerencias de simplificación
6 componentes que deberían ir en business
