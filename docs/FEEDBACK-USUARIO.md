# Feedback de usuario registrado — recorrido completo

Fecha: 2026-11-16 · Rama probada: `integration/groups-transactions-budget` · Usuario: nuevo, registrado por correo.

## Veredicto: ¿es complejo el proceso?

**Sí, para un usuario nuevo es largo y poco guiado, aunque el producto en sí es coherente.**
Hasta registrar el primer gasto hay unas **14 interacciones principales**:

| Etapa | Pasos |
|---|---|
| Registro | 1 formulario con 6 campos (nombre, usuario, correo, teléfono, 2 contraseñas) |
| Asistente inicial | 4 pasos (cuenta, ingresos con fecha y monto, estrategia 50/30/20, confirmar) |
| Ahorro (obligatorio para activar) | crear 3 metas (3 formularios) + distribuir el 100% (3 pasadas con slider) |
| Activación | activar presupuesto |
| Uso | recibir el ingreso del mes → registrar gastos |

Lo bueno: la regla "primero el ahorro" está bien pensada, la pantalla de Metas tiene una tarjeta *Setup* con
los pasos, el aviso "Saldo disponible" es claro y los mensajes de bloqueo ya explican qué hacer.
Lo que cansa: formularios repetidos, campos que se piden aunque solo exista una opción, números que no coinciden
entre pantallas y errores que desaparecen al recargar.

## Validación de datos en pantalla contra las operaciones realizadas

Operaciones: ingreso recibido $3.000.000 · gasto Supermercado $45.000 · gasto planificado vinculado a un grupo
$500.000 · 3 metas con distribución 40/30/30 · aporte de $240.000 a Fondo de emergencia · grupo de viaje con
gastos de $500.000 y $300.000.

| Dato | Esperado | En pantalla | Estado |
|---|---|---|---|
| Ingresos (Dashboard, Transacciones, Presupuesto) | $3.000.000 | $3.00M / +$3.000.000,00 | OK |
| Total gastos (Transacciones, Analítica) | $45.000 | -$45.000,00 / $45.00K | OK |
| Total ahorros (Transacciones) | $240.000 | $240.000, 1 transacción | OK |
| Saldo disponible (formulario) | 3.000.000 − 45.000 − 240.000 = 2.715.000 | $ 2.715.000,00 | OK |
| Distribución por meta | 240K / 180K / 180K | 240K / 180K / 180K | OK |
| Salud financiera | igual en todas las pantallas | 75 en Dashboard y Analítica | OK |
| Grupo: aportado / % de la meta | 500.000 / 25% | $500.000 · 25% (tarjeta y donut) | OK |
| Grupo: gastos planificados | 800.000 en 2 gastos | $800.000 · 2 gastos | OK |
| Analítica: Total ingresos | $3.000.000 | **$0,00** (Flujo neto −$45.00K) | **ERROR** |
| Dashboard: Gastos ejecutados (fijos y variables) | incluir los $45.000 | **$0,00 ejecutado** | **ERROR** |
| Dashboard: Ahorro e Inversiones ejecutado | $240.000 (real) | **$840.000** (600K plan + 240K aporte) | **ERROR** |
| Presupuesto: Ahorro generado | 40% ejecutado | **−150% Ejecutado** | **ERROR** |
| "Libre sin comprometer" | un solo valor | **$1.90M** (Dashboard) vs **$2.26M** (Presupuesto) | **INCONSISTENTE** |
| Fecha del ingreso y del plan de ahorro | 16/11/2026 | **16/10/2026** | **ERROR** (backend) |
| Fecha del aporte | 16/11/2026 | 17/11 en la meta, 16/11 en Transacciones | **ERROR** (zona horaria) |
| Estado de la meta tras el primer aporte | Activa | sigue en **Programada**; avance 0% | **ERROR** |
| Mensaje "se activará cuando confirmes tu primer ingreso" | desaparece | sigue visible con el ingreso recibido | **ERROR** |
| "3 Pendientes" del plan de ahorro | 2 tras ejecutar Fondo de emergencia | sigue en 3 | **REVISAR** |
| Lista de grupos: miembros | 3 | **0 miembros** (el detalle dice 3 / 5) | **ERROR** |
| Posición neta · Activos fijos (Analítica) | explicar origen | $2.50M sin explicación | **REVISAR** |

Causa raíz probable de varios errores: la fecha del ingreso queda un mes antes (`incomes-planned.repository.impl.ts:53`,
`new Date(year, month - 1, día)`), por eso Analítica no ve el ingreso en noviembre.

## Hallazgos por severidad

### Críticos (bloquean o muestran datos falsos)
1. Fecha del ingreso/plan de ahorro un mes antes → Analítica con ingresos $0 y flujo negativo (backend).
2. Analítica al recargar (F5) muestra "No se pudo cargar la salud financiera" y "Sin movimientos" (el `$fetch` de SSR no reenvía la cookie; entrando por el menú sí carga).
3. Cifras contradictorias entre Dashboard, Presupuesto y Metas (tabla anterior).
4. Reglas de negocio (activar con 3 metas + 100%, saldo para gastar) solo existen en el frontend.

### Importantes (fricción diaria)
5. Distribuir el ahorro: 3 pasadas, una por meta, con slider. Falta "repartir en partes iguales".
6. Campo de monto "desde centavos" (`45000` → `450,00`); no se puede vaciar con seleccionar-todo + borrar.
7. Un clic fuera de un modal lo cierra y se pierde lo escrito.
8. Meta sin monto objetivo: avance siempre 0% aunque tenga aportes; el Dashboard dice "3 en progreso · 0%".
9. Meta no pasa a "Activa" tras el primer aporte.
10. Aportes: la nota dice "Describe el gasto..."; el detalle de la meta no dice cuánto toca aportar este mes (ya existe el plan de 240K).
11. Sesión de 15 min: una recarga después vuelve al login sin aviso.
12. Fechas en UTC en la meta (aporte nocturno aparece al día siguiente).
13. Grupos: el listado dice "0 miembros"; en la lista de contribuciones se ven usuarios (`@qa_organizer`) y en participantes nombres ("QA Organizer"); no hay botón visible para aportar a la meta del grupo.

### Menores
14. Montos sin código de moneda (`$ 3.000.000,00`), contra AGENTS.md.
15. "Cuentas" significa cobrar/pagar, no cuentas bancarias; `/accounts`, `/debts` y `/receivables` son la misma pantalla.
16. Salud financiera 50 "En riesgo" para un usuario sin datos.
17. Textos: "Nueva Transaccion" sin tilde en el Dashboard; menú "Analitica" sin tilde; aviso de consola `[GoalProgressBar] savedAmount is 0`.
18. Avisos de hidratación de Vue al pasar de login a dashboard.
19. Alta larga: teléfono y usuario obligatorios en el registro.

## Qué haría el producto más ameno

1. **Un solo "asistente de ahorro"**: crear las 3 metas sugeridas (Emergencia, Retiro, una a elegir) y repartirlas 40/30/30 en una pantalla, con montos en pesos al lado del porcentaje.
2. **Un solo concepto de saldo**: "Disponible" = ingresos − gastos − ahorros, igual en Dashboard, Presupuesto y formularios; "Comprometido" separado.
3. **Estados que se explican solos**: banner de pasos pendientes siempre visible (ya existe), la meta pasa a Activa con el primer aporte y muestra "te toca aportar $240.000 este mes".
4. **Monto escrito de forma natural** y modales que no pierden datos (confirmar antes de cerrar).
5. **Primer ingreso guiado**: tras activar, ofrecer "Recibir tu salario ahora" en un clic.
6. **Alta corta**: pedir solo correo, nombre y contraseña; teléfono y usuario después.
7. **Errores amables y recargas seguras**: sin pantallas de error al recargar; aviso antes de expirar la sesión.

## Tareas delegadas

Ver [docs/HALLAZGOS-UX.md](HALLAZGOS-UX.md) para lo ya corregido. Las tareas de esta ronda están en el tablero de Notion
(proyecto FinHub) y se asignaron a agentes en ramas separadas `task/...`, creadas desde
`integration/groups-transactions-budget`.
