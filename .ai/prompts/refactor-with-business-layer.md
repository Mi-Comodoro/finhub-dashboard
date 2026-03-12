Refactoriza el proyecto respetando la arquitectura:

components/

atoms
molecules
organisms
templates
business

---

# Reglas

Design System components deben ser:

genéricos
reutilizables
sin lógica de negocio

Business components pueden:

usar composables
tener lógica específica
combinar múltiples organismos

---

# Objetivo

Reducir variantes innecesarias de componentes.

En lugar de crear múltiples versiones de un componente genérico:

crear un componente business.

Ejemplo:

NO hacer:

AdminSelect
UserSelect
RoleSelect

Hacer:

atoms/select
molecules/select-field

y luego

business/user-select
business/role-select

---

# Seguridad

NO romper funcionalidad actual.

Si un cambio es riesgoso:

NO aplicarlo.

Agregar comentario:

// SUGGESTED REFACTOR
