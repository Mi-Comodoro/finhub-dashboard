# AGENTS.md

Dashboard web de Mi Comodoro: Nuxt 4, Pinia y Tailwind. Incluye un BFF en `src/server/api/` hacia la API NestJS (repo `mi-comodoro-server`).

## Comandos

- `pnpm install --frozen-lockfile` (Node `>=26.13 <27` según `.nvmrc`; pnpm fijado en `packageManager`)
- `pnpm dev` (necesita la API en `NUXT_PUBLIC_API_BASE`)
- `pnpm lint` · `pnpm lint:fix` · `pnpm format`
- `pnpm agents:check` (espejo `.agents`/`.claude`, frontmatter y tamaño de este archivo; corre en el CI)
- `pnpm build` (usa `--max-old-space-size=12288`; necesita las variables `FB_*`, aunque sean de relleno: ver `.github/workflows/ci.yaml`)
- No hay pruebas automáticas. El CI corre `eslint .` y `pnpm build`. El hook pre-commit (husky) corre eslint --fix y prettier sobre lo preparado.

## Entorno

Las variables están en `.env.example` (fuente única). Nunca valores reales en el repo.

## Flujo de trabajo

- Ramas desde `develop` y PR a `develop`; nunca push directo. `master` es producción: el push a `master` despliega (runner propio, PM2).
- Ramas `feat/`, `fix/`, `chore/`, `ci/`, `task/` + descripción corta. Commits Conventional Commits en español (`tipo(alcance): resumen`).
- El check `ci` es obligatorio en los PR.

## Notion

Tareas, estado, decisiones, hallazgos y roadmap van en Notion (MCP), nunca en el repo: página «🚀 Mi Comodoro — Project Tracker», base «Roadmap de tareas». Este repo solo guarda lo que no se deduce leyendo el código. Notion no se carga al empezar: consultarlo solo si la tarea lo toca (buscar la tarjeta del tema y abrir solo esa). Al cerrar una sesión de trabajo, aplicar la skill `session-compactor`.

## Arquitectura (obligatoria)

`pages/components → composables/application → stores → composables/api → server/api (BFF) → backend`

- `$fetch` solo en `composables/api/`. La lógica de negocio solo en `composables/application/` (devuelve `{ success, ... }`). `presenters/` son funciones puras. Los stores solo guardan estado: sin `$fetch` y sin llamar a otros stores.
- Páginas y componentes llaman a application, nunca a stores ni a `$fetch`.
- Los composables se desestructuran antes de usarse: `const { x } = useX()`, nunca `useX().x()`.
- BFF: cada ruta de `src/server/api/` pasa el motivo del backend a `validateError(event, status, message)`; si no, el usuario ve un mensaje genérico en lugar del motivo.
- El backend responde `{ success, data }`; el BFF devuelve `{ success, result }`.
- Detalle por capa en `docs/ARCHITECTURE.md`.

## Componentes y estilos

- Atomic design: `components/{atoms,molecules,organisms,business/<feature>}`. Nada en la raíz de `business/`. Props en `types/<nombre>.types.ts`.
- Estilos con `@apply` en `<style scoped lang="postcss">` y nombres BEM; sin clases Tailwind en los templates. Excepciones: `material-symbols-outlined` y las clases dinámicas (`:class`) se quedan en el template.
- Colores semánticos: ingresos y necesidades `primary`, gastos `danger`, ahorro `warning`, gustos `secondary`, metas cumplidas `success`. Gráficos: `CHART_COLORS` (`utils/design-tokens.ts`), siempre dentro de `<ClientOnly>` y con alto explícito.
- Formularios: `Form.vue` con schema en `components/business/<feature>/forms/schema/` (modelo: `ExpensePlannedForm.vue`). Modales: `ModalWizard`. Cabeceras: `CardInfo` con las props de `GoalsForm.vue`; el icono no cambia entre crear y editar.
- `@nuxt/ui` no está instalado: no usar componentes `U*` (`Badge`, `ModalWizard`, `ProgressBar` y `Button` son propios). Iconos: `<span class="material-symbols-outlined">` (fuente autohospedada; no añadir Google Fonts).
- Referencia visual: `pages/dashboard/{index,goals/index,budget/index}.vue`. Skeleton: `animate-pulse rounded-xl bg-slate-100`. Estados vacíos: `<EmptyStateIllustration>`. Confirmaciones de borrado: `ModalWizard`, nunca `confirm()`.

## Dinero

Siempre 2 decimales y código de moneda: `formatCurrency(value, currency)` (nunca `decimals=0`); en ejes de gráficos, `formatCompactCurrency`. Sin formateadores propios (`utils/currency.ts`). Utilidades de metas en `utils/goal-formatters.ts`.

## Idioma

Identificadores, tipos y constantes en inglés; textos de la interfaz en español.

## Trampas conocidas

- El store de ingresos planificados guarda los del último presupuesto cargado, no necesariamente el que se ve: comparar `budgetId`. `loadAllocationSummaryData` lo sobrescribe con el presupuesto actual.
- `.agents/` es la fuente de agentes y skills; `.claude/agents` y `.claude/skills` son copias ignoradas por git. Un `git pull` o cambio de rama NO las actualiza: correr `pnpm agents:sync` (y `pnpm agents:check` para verificar). No usar symlinks ni junctions.
- `plannedSavings` solo viene en `GET /goals/:id`, no en `GET /goals`.

## Dónde leer (solo si la tarea lo toca)

| Tema | Archivo |
| --- | --- |
| Capas, BFF, composables, convenciones | `docs/ARCHITECTURE.md` |
| Login con Google, consentimiento, invitación a la beta | `docs/google-auth-flow.md` |
| Agentes y skills (fuente y sincronización) | `.agents/`, `scripts/sync-claude-agents.mjs` |
| Variables de entorno | `.env.example` |

## Agentes

Usar un subagente solo si el autor lo pide; si no, aplicar la regla en la misma sesión. Flujo habitual: `frontend-dev` → `architect` + `design` → `review`.

| Si la tarea es… | Agente | Escribe código |
| --- | --- | --- |
| Implementar UI | `frontend-dev` | Sí |
| Revisar capas y flujo de datos | `architect` | No |
| Revisar estilos, colores y gráficos | `design` | No |
| Revisión final antes de integrar | `review` | No |
| Corregir violaciones de arquitectura | `refactor` | Sí |
