# FinHub — Contexto del proyecto

## Stack
- Backend: NestJS + TypeORM + TypeScript
- Frontend: Nuxt 3 + Pinia + $fetch (ofetch)

## Arquitectura backend
- Hexagonal: domain/ → application/ → infrastructure/
- Repositorios: interfaces en domain/repositories/,
  implementación en infrastructure/repositories/
- Mappers en infrastructure/mapper/
- Token de inyección siempre string: @Inject('NombreRepository')
- ResponseInterceptor wrappea respuestas en { success, data }
- GlobalHttpExceptionFilter maneja todos los errores
- Logs con LoggerProviderService, context = NombreClase.name
- Swagger con @ApiOperation, @ApiBearerAuth, @ApiOkResponse

## Arquitectura frontend
- Flujo: UI → store → application → api → backend
- Stores con options API: state, getters, actions
- Acciones retornan siempre { success, result }
- $fetch SOLO en composables/api/
- Lógica de negocio SOLO en composables/application/
- Lógica de UI/presentación en composables/presenters/
- Cookies manejadas server-side con getCookie(event, ACCESS_TOKEN)
- Atomic Design: atoms/ molecules/ organisms/ business/
- Componentes business/ van en su feature folder, nunca en raíz

## Colores semánticos (Tailwind)
- Ingresos/Necesidades → primary (teal)
- Gastos              → danger  (rojo)
- Ahorro              → warning (ámbar)
- Gustos              → secondary (índigo)
- Éxito/Completado    → success (verde)
- Neutral/Planificado → neutral (slate)

## Librería de gráficas
- ECharts + vue-echarts
- Colores en utils/design-tokens.ts → CHART_COLORS
- Siempre envolver VChart en ClientOnly

## Estado actual del proyecto
### Flujos implementados ✅
- markAsReceive → transaction income + planned_savings
- completePlannedSaving → transaction savings
- completePlannedExpense → transaction expense
- Vista /transactions con filtros, paginación y gráficas
- Plan de ahorro agrupado por ingreso
- Listado de presupuestos con cards
- Vista detalle de presupuesto con métricas reales
- Sistema de insights financieros contextuales
- Carrusel de tips educativos en metas

### Pendiente 🔜
- Editar/clonar presupuesto (forms creados, falta conectar)
- Ingreso y gasto no planificado
- Silent refresh del token
- Cuenta principal en onboarding
- Página de reportes históricos
- Sección de tasas financieras en metas
