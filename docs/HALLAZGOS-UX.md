# Hallazgos de uso (recorrido como usuario nuevo)

Recorrido hecho el 2026-11-16 con un usuario nuevo: registro, asistente inicial, presupuesto, metas,
transacciones y grupos. El ahorro es el eje del proceso: **un presupuesto solo se activa cuando hay
una cuenta, al menos 3 metas y el 100% del ahorro distribuido entre ellas**. Sin presupuesto activo no
se puede recibir un ingreso ni registrar un gasto.

Flujo correcto para un usuario nuevo:

1. Registro y asistente inicial (presupuesto queda en estado *Planificado*).
2. Metas de Ahorro: crear cuenta → crear 3 metas → distribuir el 100% del ahorro.
3. Activar el presupuesto.
4. Recibir el ingreso del mes.
5. Registrar gastos (solo si hay saldo disponible).

## Corregido en `fix/budget-activation-flow`

| # | Problema visto | Corrección |
|---|---|---|
| 1 | El botón **Activar** del presupuesto no hacía nada: solo mostraba el toast "Gasto Registrado" (`budgetStart` era un stub). | Ahora activa de verdad (`PATCH /budgets/:id/active`) y solo si se cumple `canActive`. Si no, lleva a Metas de Ahorro. |
| 2 | Nada explicaba por qué no se podía recibir ni gastar: errores técnicos en inglés ("Budget is not active", "budgetId should not be empty"). | Banner `BudgetSetupBanner` con los 3 pasos en el detalle del presupuesto y en Transacciones. "Nueva transacción" se deshabilita mientras el presupuesto no esté activo. |
| 3 | El BFF escondía el mensaje real del backend ("Solicitud inválida"). | `validateError` traduce los mensajes conocidos al español y `planned-incomes/[id].patch.ts` los propaga. |
| 4 | El formulario de transacciones mostraba siempre "Inténtalo de nuevo". | `createTransaction` devuelve el motivo y el formulario lo muestra. |
| 5 | Guardar un gasto enviaba `budgetId: ""` (el formulario usaba el presupuesto del store, vacío). | La página pasa el presupuesto elegido (rama `fix/transactions-expense-balance`). |
| 6 | Se podía registrar un gasto sin ingresos o por encima del saldo. | Regla en la capa de aplicación: saldo = ingresos − gastos − ahorros; bloquea sin ingresos o si el monto lo supera. Se muestra "Saldo disponible". También aplica a ahorros fuera de plan. |
| 7 | La categoría del gasto venía preseleccionada ("Alquiler") sin que el usuario la eligiera. | Ya no se preselecciona; es obligatoria. |
| 8 | Al crear una meta había que elegir la cuenta aunque solo existiera una. | Se preselecciona cuando hay una sola cuenta activa. |
| 9 | Año fijo (`2026`) en la carga de presupuestos de Transacciones. | Usa el año actual. |
| 10 | Voseo mezclado con tuteo ("Administrá", "Creá", "¿Querés?", "Seleccioná") y título "Propositos". | Unificado en tuteo; "Propósitos" con tilde. |

## Pendiente: backend (`finhub-server`)

| # | Problema | Dónde |
|---|---|---|
| B1 | La fecha de pago del ingreso sale **un mes antes** (se eligió 16/11 y queda "Vence: 16/10"). | `incomes-planned.repository.impl.ts:53`: `new Date(year, month - 1, paymentDays[0])`; probablemente `month` ya llega en base 0. |
| B2 | `budgetService.active()` no valida nada: la regla "3 metas + 100% distribuido" solo existe en el frontend. | `budget.service.ts:247`. Debe validarse también en el servidor. |
| B3 | La regla de saldo para gastos solo existe en el frontend. | Módulo de transacciones. |
| B4 | Mensajes de error en inglés. | Varios servicios. |

## Pendiente: propuestas de mejora (no implementadas)

- **Distribución del ahorro**: hoy se hace meta por meta con un slider (3 pasadas para llegar a 100%). Propuesta: un solo formulario con todas las metas y un botón "Repartir en partes iguales".
- **Campo de monto**: funciona desde los centavos (`45000` → `450,00`) y no se puede vaciar con "seleccionar todo + borrar". Propuesta: escritura natural con separadores o una ayuda visible.
- **Modales**: un clic fuera cierra el modal y se pierde lo escrito.
- **Montos sin código de moneda** (`$ 3.000.000,00`): `formatCurrency` usa `Intl` con `es-CO`; AGENTS.md exige el código COP.
- **Cuentas**: `/accounts`, `/debts` y `/receivables` abren la misma pantalla y "Cuentas" significa cobrar/pagar, no cuentas bancarias.
- **Salud financiera**: un usuario sin movimientos ve "50 · En riesgo".
- **Alta**: registro con 6 campos (incluido teléfono y usuario) más 5 pasos de asistente.
- **Sesión**: el token de acceso dura 15 min; una carga directa de URL después de ese tiempo vuelve al login (la cookie de refresco solo viaja a `/api/auth/refresh`).
- **Hidratación de Vue**: avisos "Hydration node mismatch" al pasar de login a dashboard.
- **Aportes a metas** desde la pantalla de Metas no validan saldo.
