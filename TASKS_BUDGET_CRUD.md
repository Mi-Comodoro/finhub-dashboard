# TASKS_BUDGET_CRUD.md

## Contexto

Leer CONTEXT.md y .ai/rules/frontend-rules.md primero.

Arquitectura obligatoria:
UI → store → application → api → backend

PROHIBIDO:

- $fetch fuera de composables/api/
- Lógica de negocio en componentes o stores
- Componentes business/ en raíz — deben ir en su feature folder

## Lo que hay que implementar

1. Schema del formulario de presupuesto
2. Composable API para budget
3. Composable Application para las acciones
4. Formulario de crear/editar presupuesto
5. Formulario de clonar presupuesto
6. Conectar handlers en la página de listado

---

## TAREA 1 — Schema del formulario

Archivo: src/components/business/budget/forms/schema/budget.fields.schema.ts

Seguir el mismo patrón de:
src/components/business/forms/schema/expense.fields.schema.ts

El schema debe tener dos modos: 'create' y 'edit'.
En modo 'edit' el mes y año no son editables.

```ts
import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const budgetFieldsSchema = (
  monthOptions: { label: string; value: number }[],
  yearOptions: { label: string; value: number }[],
  mode: 'create' | 'edit' = 'create'
): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre del presupuesto',
      placeholder: 'Ej: Presupuesto Abril 2026',
      required: true,
      errorMessage: 'El nombre es requerido'
    },
    month: {
      type: 'select',
      label: 'Mes',
      required: true,
      options: monthOptions,
      errorMessage: 'Seleccioná un mes'
      // En modo edit deshabilitar
    },
    year: {
      type: 'select',
      label: 'Año',
      required: true,
      options: yearOptions,
      errorMessage: 'Seleccioná un año'
    },
    strategy: {
      type: 'radio-card',
      label: 'Estrategia de presupuesto',
      required: true,
      options: [
        {
          label: '50/30/20',
          value: 'BALANCED',
          description: 'Método de Elizabeth Warren: 50% necesidades, 30% gustos, 20% ahorro'
        },
        {
          label: 'Personalizada',
          value: 'CUSTOM',
          description: 'Definí tus propios porcentajes para cada categoría'
        }
      ]
    },
    needsLimit: {
      type: 'slider-percentage',
      label: 'Necesidades (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    },
    wantsLimit: {
      type: 'slider-percentage',
      label: 'Gustos (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    },
    savingsLimit: {
      type: 'slider-percentage',
      label: 'Ahorro (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'grid', columns: 2, fields: ['month', 'year'] },
    { type: 'row', fields: ['strategy'] },
    { type: 'grid', columns: 3, fields: ['needsLimit', 'wantsLimit', 'savingsLimit'] }
  ]
})
```

---

## TAREA 2 — Schema del formulario de clonar

Archivo: src/components/business/budget/forms/schema/budget-clone.fields.schema.ts

Solo necesita mes y año destino:

```ts
export const budgetCloneFieldsSchema = (
  monthOptions: { label: string; value: number }[],
  yearOptions: { label: string; value: number }[]
): FormSchema => ({
  fields: {
    month: {
      type: 'select',
      label: 'Mes destino',
      required: true,
      options: monthOptions,
      alertVariant: 'info',
      alertMessage: 'Se copiará la configuración del presupuesto seleccionado al nuevo mes.'
    },
    year: {
      type: 'select',
      label: 'Año destino',
      required: true,
      options: yearOptions
    }
  },
  layout: [{ type: 'grid', columns: 2, fields: ['month', 'year'] }]
})
```

---

## TAREA 3 — Composable API

Archivo: src/composables/api/useBudgetApi.ts

Leer primero composables/api/ para seguir el patrón existente.

```ts
export function useBudgetApi() {
  const createBudget = async (data: CreateBudgetPayload) =>
    $fetch('/api/budgets', { method: 'POST', body: data })

  const cloneBudget = async (sourceBudgetId: string, month: number, year: number) =>
    $fetch('/api/budgets', {
      method: 'POST',
      body: { mode: 'clone', sourceBudgetId, month, year }
    })

  const updateBudget = async (id: string, data: UpdateBudgetPayload) =>
    $fetch(`/api/budgets/${id}`, { method: 'PATCH', body: data })

  const deleteBudget = async (id: string) => $fetch(`/api/budgets/${id}`, { method: 'DELETE' })

  return { createBudget, cloneBudget, updateBudget, deleteBudget }
}
```

---

## TAREA 4 — Server routes

Crear si no existen:

### src/server/api/budgets/index.post.ts

POST → backend /budgets
Leer token con getCookie(event, ACCESS_TOKEN)
Usar validateError en onResponseError
Retornar { success, result: data }

### src/server/api/budgets/[id].patch.ts

PATCH → backend /budgets/:id
Mismo patrón

### src/server/api/budgets/[id].delete.ts

DELETE → backend /budgets/:id
Mismo patrón

Seguir exactamente el patrón de server routes existentes.

---

## TAREA 5 — Composable Application

Archivo: src/composables/application/useBudgetActions.ts

Leer primero composables/application/ para seguir el patrón.

```ts
export function useBudgetActions() {
  const budgetStore = useBudgetStore()
  const { createBudget, cloneBudget, updateBudget, deleteBudget } = useBudgetApi()

  const handleCreate = async (data: CreateBudgetPayload) => {
    const { success, result } = await createBudget({
      ...data,
      mode: 'empty'
    })
    if (success && result) budgetStore.addBudget(result)
    return { success }
  }

  const handleClone = async (sourceBudgetId: string, month: number, year: number) => {
    const { success, result } = await cloneBudget(sourceBudgetId, month, year)
    if (success && result) budgetStore.addBudget(result)
    return { success }
  }

  const handleUpdate = async (id: string, data: UpdateBudgetPayload) => {
    const { success, result } = await updateBudget(id, data)
    if (success && result) budgetStore.updateBudget(result)
    return { success }
  }

  const handleDelete = async (id: string) => {
    const { success } = await deleteBudget(id)
    if (success) budgetStore.removeBudget(id)
    return { success }
  }

  return { handleCreate, handleClone, handleUpdate, handleDelete }
}
```

---

## TAREA 6 — BudgetForm.vue

Archivo: src/components/business/budget/forms/BudgetForm.vue

Seguir exactamente el patrón de ExpensePlannedForm.vue.

Props:

```ts
{
  mode: 'create' | 'edit'
  budgetId?: string        // requerido en modo edit
  initialData?: Partial<BudgetFormData>  // para pre-llenar en edit
}
```

Emits: ['onClose', 'onSuccess']

Lógica interna:

- En onMounted: calcular monthOptions y yearOptions
  monthOptions: meses del año con label en español
  yearOptions: año actual + 2 años siguientes
- formSchema: computed usando budgetFieldsSchema(monthOptions, yearOptions, mode)
- En modo 'edit' pre-llenar Form con initialData usando v-model
- Si strategy === 'BALANCED': forzar needs=50, wants=30, savings=20
  y ocultar los sliders (visibleWhen ya lo maneja)

handleSubmit:

```ts
const handleSubmit = async (data: BudgetFormData) => {
  const { handleCreate, handleUpdate } = useBudgetActions()

  const payload = {
    name: data.name,
    month: Number(data.month),
    year: Number(data.year),
    strategy: data.strategy,
    needsLimit: data.strategy === 'BALANCED' ? 50 : Number(data.needsLimit),
    wantsLimit: data.strategy === 'BALANCED' ? 30 : Number(data.wantsLimit),
    savingsLimit: data.strategy === 'BALANCED' ? 20 : Number(data.savingsLimit)
  }

  const { success } =
    props.mode === 'create'
      ? await handleCreate(payload)
      : await handleUpdate(props.budgetId!, payload)

  if (success) {
    emit('onSuccess')
    emit('onClose')
  }
}
```

Template:

```vue
<template>
  <div class="flex flex-col gap-6">
    <CardInfo
      :title="mode === 'create' ? 'Nuevo presupuesto' : 'Editar presupuesto'"
      :description="
        mode === 'create'
          ? 'Definí el período y la estrategia de distribución'
          : 'Modificá los datos del presupuesto'
      "
    />
    <Form :schema="formSchema" v-model="formData" @submit="handleSubmit">
      <template #actions>
        <Button variant="ghost" @click="emit('onClose')">Cancelar</Button>
        <Button type="submit" variant="primary">
          {{ mode === 'create' ? 'Crear presupuesto' : 'Guardar cambios' }}
        </Button>
      </template>
    </Form>
  </div>
</template>
```

---

## TAREA 7 — BudgetCloneForm.vue

Archivo: src/components/business/budget/forms/BudgetCloneForm.vue

Props:

```ts
{
  sourceBudgetId: string
  sourceBudgetName: string
}
```

Emits: ['onClose', 'onSuccess']

Lógica:

- formSchema: computed usando budgetCloneFieldsSchema
- handleSubmit llama handleClone del useBudgetActions

Template:

```vue
<template>
  <div class="flex flex-col gap-6">
    <CardInfo
      title="Clonar presupuesto"
      :description="`Se copiará la configuración de '${sourceBudgetName}' al nuevo período`"
    />
    <Form :schema="cloneSchema" @submit="handleSubmit">
      <template #actions>
        <Button variant="ghost" @click="emit('onClose')">Cancelar</Button>
        <Button type="submit" variant="primary">Clonar presupuesto</Button>
      </template>
    </Form>
  </div>
</template>
```

---

## TAREA 8 — Conectar handlers en la página

Archivo: src/pages/dashboard/budget/index.vue

Importar:

- BudgetForm desde components/business/budget/forms/BudgetForm.vue
- BudgetCloneForm desde components/business/budget/forms/BudgetCloneForm.vue
- ModalWizard para envolver los forms
- useBudgetActions para el delete
- useFeedback para toasts

Agregar estado local:

```ts
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showCloneModal = ref(false)
const selectedBudgetId = ref<string | null>(null)
const selectedBudget = ref<CurrentBudgetPlan | null>(null)
```

Reemplazar los console.log por handlers reales:

```ts
const { handleDelete } = useBudgetActions()
const { success: successToast, error: errorToast } = useFeedback()

const createBudget = () => {
  showCreateModal.value = true
}

const editBudget = (budget: CurrentBudgetPlan) => {
  selectedBudget.value = budget
  showEditModal.value = true
}

const duplicateBudget = (budget: CurrentBudgetPlan) => {
  selectedBudget.value = budget
  showCloneModal.value = true
}

const deleteBudget = async (budgetId: string) => {
  const { success } = await handleDelete(budgetId)
  if (success) {
    successToast('Presupuesto eliminado', 'El presupuesto fue eliminado correctamente')
  } else {
    errorToast('Error', 'No se pudo eliminar el presupuesto')
  }
}

const onFormSuccess = async () => {
  showCreateModal.value = false
  showEditModal.value = false
  showCloneModal.value = false
  await budgetStore.fetchBudgets(financeId.value, selectedYear.value)
}
```

Agregar modales al template al final del div principal:

```vue
<ModalWizard v-model:show="showCreateModal">
  <BudgetForm
    mode="create"
    @on-close="showCreateModal = false"
    @on-success="onFormSuccess"
  />
</ModalWizard>

<ModalWizard v-model:show="showEditModal">
  <BudgetForm
    v-if="selectedBudget"
    mode="edit"
    :budget-id="selectedBudget.id"
    :initial-data="selectedBudget"
    @on-close="showEditModal = false"
    @on-success="onFormSuccess"
  />
</ModalWizard>

<ModalWizard v-model:show="showCloneModal">
  <BudgetCloneForm
    v-if="selectedBudget"
    :source-budget-id="selectedBudget.id"
    :source-budget-name="selectedBudget.name"
    @on-close="showCloneModal = false"
    @on-success="onFormSuccess"
  />
</ModalWizard>
```

Actualizar las llamadas en las cards para pasar el objeto completo:

```vue
<Button @click="editBudget(budget)">Editar</Button>
<Button @click="duplicateBudget(budget)">Duplicar</Button>
<Button @click="deleteBudget(budget.id)">Eliminar</Button>
```

---

## TAREA 9 — Mover componentes sueltos de business/ raíz

Los siguientes archivos están en la raíz de business/
pero deben moverse a su feature folder:

```
BalanceHistoryChart.vue      → business/dashboard/
BudgetProgressChart.vue      → business/budget/
DashboardBalanceChart.vue    → ya está en business/dashboard/ ✅
FinancialTipCarousel.vue     → business/savings/
IncomesTrendChart.vue        → business/dashboard/
InsightCard.vue              → business/insights/
InsightList.vue              → business/insights/
SavingGoalProgressChart.vue  → business/savings/
SavingsRateChart.vue         → business/savings/
TransactionCategoryChart.vue → business/transactions/ (ya existe la carpeta)
TransactionTypeChart.vue     → business/transactions/
```

Por cada archivo:

1. Mover al nuevo path
2. Actualizar todos los imports en el proyecto
3. Verificar que compila

---

## Verificación final

1. Los tres modales abren y cierran correctamente
2. Crear presupuesto llama POST /api/budgets con mode: 'empty'
3. Clonar presupuesto llama POST /api/budgets con mode: 'clone'
4. Editar actualiza el store con updateBudget
5. Eliminar solo disponible en status PLANNED
6. Después de cualquier acción se recarga la lista
7. Ningún componente tiene $fetch directo
8. Ninguna lógica de negocio en componentes
9. TypeScript compila sin errores
10. Componentes en su feature folder correspondiente
