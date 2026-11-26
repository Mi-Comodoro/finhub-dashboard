# Arquitectura Frontend

Este proyecto usa Nuxt 4 como frontend y `src/server/api/` como capa BFF frente al backend de Mi Comodoro.

## Flujo obligatorio

`UI -> application -> store -> api -> server/api -> backend`

## Responsabilidades por capa

### `src/pages` y `src/components`

- Renderizan UI y manejan interacción.
- Consumen composables de aplicación.
- No deben contener lógica de negocio ni llamadas HTTP directas.

### `src/composables/application`

- Orquesta casos de uso y reglas de negocio.
- Coordina stores y capa API.

### `src/stores`

- Mantiene estado, getters y acciones de actualización.
- No debe hacer llamadas HTTP directas.

### `src/composables/api`

- Es la única capa donde se usa `$fetch`.
- Encapsula acceso a server routes.

### `src/server/api`

- Expone endpoints internos para el frontend.
- Reenvía peticiones al backend externo.
- Maneja cookies y normalización de respuestas cuando aplica.

## Convenciones estructurales

- Componentes base en `atoms`, `molecules` y `organisms`.
- Componentes de dominio en `components/business/<feature>/`.
- Lógica de presentación en `src/composables/presenters`.

## Reglas de diseño técnico

- TypeScript estricto.
- Código en inglés; textos de UI pueden estar en español.
- Mantener separación clara entre presentación, estado y negocio.

## Detalle de las capas (reglas completas)

- `$fetch` solo en `composables/api/`. La lógica de negocio solo en `composables/application/`, que devuelve `{ success, ... }`.
- `presenters/` son funciones puras. Los stores solo guardan estado: sin `$fetch` y sin llamar a otros stores.
- Páginas y componentes llaman a application, nunca a stores ni a `$fetch`.
- Los composables se desestructuran antes de usarse: `const { x } = useX()`, nunca `useX().x()`.

### BFF (`src/server/api/`)

- Cada ruta pasa el motivo del backend a `validateError(event, status, message)`; si no, el usuario ve un mensaje genérico en lugar del motivo.
- El backend responde `{ success, data }`; el BFF devuelve `{ success, result }`.
- Las sesiones viajan en cookies httpOnly; el navegador nunca ve los tokens del backend.

### Estilos y componentes

- Atomic design: `components/{atoms,molecules,organisms,business/<feature>}`. Nada en la raíz de `business/`. Props en `types/<nombre>.types.ts`.
- Estilos con `@apply` en `<style scoped lang="postcss">` y nombres BEM; sin clases Tailwind en los templates.
