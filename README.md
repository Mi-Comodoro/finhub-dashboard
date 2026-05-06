# Mi Comodoro Dashboard

Frontend de Mi Comodoro construido con Nuxt 4. La aplicación funciona como cliente web y BFF ligero para el backend, con enfoque en gestión de presupuesto, ingresos, gastos, ahorros y autenticación.

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS + PostCSS
- ECharts
- Firebase Authentication

## Requisitos

- Node.js `>=20.19 <23`
- npm
- Backend de Mi Comodoro disponible en `API_URL`

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo de entorno a partir de la plantilla:

```bash
cp .env.example .env
```

3. Ajusta las variables necesarias en `.env`.

4. Inicia el proyecto:

```bash
npm run dev
```

## Variables de entorno

El proyecto necesita estas variables:

```env
API_URL=
FB_API_KEY=
FB_AUTH_DOMAIN=
FB_PROJECT_ID=
FB_STORAGE_BUCKET=
FB_MESSAGING_SENDER_ID=
FB_APP_ID=
FB_MEASUREMENT_ID=
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm run format
```

## Arquitectura

La aplicación sigue un flujo estricto:

`pages/components -> composables/application -> stores -> composables/api -> server/api -> backend`

Reglas clave:

- `$fetch` solo se usa en `src/composables/api/`.
- La lógica de negocio vive en `src/composables/application/`.
- Los stores manejan estado; no deben contener llamadas HTTP directas.
- `src/server/api/` actúa como BFF para el backend externo.
- Los componentes de negocio viven dentro de `src/components/business/<feature>/`.

## Estructura principal

```text
src/
  components/
    atoms/
    molecules/
    organisms/
    business/
  composables/
    api/
    application/
    presenters/
  middleware/
  pages/
  plugins/
  server/api/
  stores/
  utils/
```

## Documentación útil

- [Arquitectura](docs/ARCHITECTURE.md)
- [Flujo de autenticación con Google](docs/google-auth-flow.md)

## Convenciones importantes

- El código debe escribirse en inglés; el texto de UI puede estar en español.
- Se prefiere `@apply` en estilos en lugar de clases utilitarias extensas en templates.
- Los cambios de arquitectura deben respetar las capas definidas arriba.
