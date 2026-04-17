# Arquitectura Frontend

Este proyecto usa Nuxt 4 como frontend y `src/server/api/` como capa BFF frente al backend de FinHub.

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
