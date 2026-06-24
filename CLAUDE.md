# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

NestJS 11 API (npm) con TypeORM 0.3 sobre PostgreSQL + PostGIS (consultas geoespaciales), caché en Redis (ioredis), email con Nodemailer, y telemetría/logs vía Azure Application Insights + Winston.

## Comandos

- Dev: `npm run start:dev` (watch). La API se sirve bajo el prefijo global `/api`.
- Test único: `npm run test -- --testNamePattern="<nombre>"`
- E2E: `npm run test:e2e` (usa `./test/jest-e2e.json`)
- Lint: `npm run lint` (corre con `--fix`); Format: `npm run format`

## Migraciones (TypeORM)

`migration:generate` / `migration:run` compilan primero a `dist/` y operan sobre `dist/core/db/dataSource.js` (ver el script `typeorm`). No corras `npx typeorm` directo sobre los `.ts`.

- Generar: `npm run migration:generate -- src/core/db/migrations/<Nombre>`
- Aplicar: `npm run migration:run`
- `synchronize: false` — los cambios de esquema NO se aplican solos; siempre vía migración.

## Estilo

- Prettier: comillas simples, `trailingComma: all`. `prettier/prettier` es error en ESLint.
- ESLint (flat config en `eslint.config.mjs`): `no-explicit-any` off; `no-floating-promises` y `no-unsafe-argument` en warn. TS con `noImplicitAny: false`.

## Entorno

No hay `.env.example`; las variables requeridas se validan en `src/config/env.ts`: `PORT`, `MAPBOX_TOKEN`, `MAILER_EMAIL`/`MAILER_PASSWORD`/`MAILER_SERVICE`, `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`, `REDIS_HOST`/`REDIS_PORT`, `APPINSIGHTS_CONNECTION_STRING`. Levanta postgres y redis con `docker compose up`.

## CI

Push a `master` dispara `.github/workflows/build.yml`, que construye y publica la imagen Docker a GHCR.
