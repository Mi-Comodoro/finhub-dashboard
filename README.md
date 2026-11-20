# Mi Comodoro Dashboard

Cliente web de Mi Comodoro (presupuestos, ingresos, gastos, ahorros y grupos), hecho con Nuxt 4. También es un BFF ligero: las rutas de `src/server/api/` hablan con la API NestJS del repo `mi-comodoro-server` y guardan la sesión en cookies httpOnly.

## Requisitos

- Node.js `>=26.13 <27` (`nvm use` lee `.nvmrc`)
- pnpm 11 (la versión exacta está en `packageManager`; `corepack enable` la activa)
- La API de Mi Comodoro en marcha (por defecto `http://localhost:3005`)

## Levantarlo

```bash
pnpm install
cp .env.example .env   # completa las variables FB_* de Firebase
pnpm dev
```

La URL de la API se define con `NUXT_PUBLIC_API_BASE` y `NUXT_PUBLIC_WS_BASE`. Todas las variables y sus valores de ejemplo están en `.env.example`.

## Probarlo

No hay pruebas automáticas. El CI (`.github/workflows/ci.yaml`) corre `pnpm exec eslint .` y `pnpm build`; ambos deben pasar para mergear un PR. En local: `pnpm lint` y `pnpm build`.

## Desplegar

- Un push a `develop` despliega la instancia de desarrollo (`deploy-develop.yaml`).
- Un push a `master` despliega producción (`deploy-production.yaml`).
- Ambos corren en un runner propio, copian `.output` al servidor y reinician el proceso con PM2.

## Más información

- [AGENTS.md](AGENTS.md): convenciones y reglas de trabajo.
- [Arquitectura](docs/ARCHITECTURE.md)
- [Flujo de autenticación con Google](docs/google-auth-flow.md)
