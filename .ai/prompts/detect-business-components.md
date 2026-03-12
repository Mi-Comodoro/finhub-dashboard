Analiza los componentes del proyecto e identifica cuáles deberían pertenecer a la capa:

components/business/

Un Business Component es aquel que:

- usa composables de negocio
- está ligado a un modelo del dominio
- tiene lógica específica de la aplicación
- no es reutilizable fuera del dominio

Ejemplos típicos:

UserSelect
UserTable
RolePermissionMatrix
InvoiceSummary
DashboardStats
OrderList
ProductFilterPanel

---

# Resultado esperado

Generar:

1 lista de business components existentes
2 componentes que deberían moverse a business
3 componentes que deberían separarse en design system + business wrapper
