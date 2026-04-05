# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**claims-assistant** — an AI-assisted insurance claims intake application. A multi-step wizard UI collects claim data, with OpenAI-powered extraction (auto-fill from free text) and validation (anomaly/completeness checks) integrated into the workflow.

## Monorepo Structure

pnpm workspaces + Turborepo. Three packages:

- **apps/api** — NestJS 10 backend (REST). Modules: `claims`, `ai`, `documents`, `prisma`. Runs on port 3001 by default.
- **apps/web** — Next.js 14 frontend (App Router). Main feature is a 5-step claim submission wizard at `/claims/new`. Uses Tailwind CSS.
- **packages/shared** — Zod schemas, TypeScript enums, and inferred types shared between api and web. Imported as `@claims-assistant/shared`. Published as raw `.ts` (no build step needed for consumers, but `pnpm build` runs `tsc`).

## Commands

```bash
# Root-level (runs via Turborepo across all workspaces)
pnpm dev          # start all apps in watch mode
pnpm build        # build all
pnpm test         # run all tests
pnpm lint         # lint all (currently no-op in web and shared)

# API-specific
pnpm --filter api run test              # unit tests (Jest, *.spec.ts in src/)
pnpm --filter api run test:e2e          # e2e tests (Jest, test/*.e2e-spec.ts)
pnpm --filter api run dev               # nest start --watch

# Database (Prisma, routed through root scripts)
pnpm db:migrate   # prisma migrate dev
pnpm db:generate  # prisma generate
pnpm db:studio    # prisma studio

# Web-specific
pnpm --filter web run dev               # next dev (port 3000)
```

Run a single API unit test:
```bash
cd apps/api && npx jest --testPathPattern="claims.controller" 
```

## Architecture Notes

- **Database**: PostgreSQL via Prisma. Schema at `apps/api/prisma/schema.prisma`. Core models: `Claim`, `Claimant`, `ClaimDetails`, `ClaimDocument`, `AIExtractionLog`. All tables use `@@map` to snake_case table names.
- **AI integration**: `apps/api/src/ai/ai.service.ts` uses the OpenAI SDK (`gpt-4o`) for two operations: `extract` (free-text → structured claim data with per-field confidence) and `validate` (completeness/anomaly checks). Responses are validated with Zod schemas from shared package. Extraction results are logged to `AIExtractionLog`.
- **Shared package contract**: Zod schemas in `packages/shared/src/schemas/` are the source of truth for API request/response shapes. Types are inferred from schemas via `z.infer`. Both api and web import from `@claims-assistant/shared`.
- **Frontend wizard flow**: 5 steps — (1) type & description, (2) claimant info, (3) incident details, (4) documents, (5) review & submit. State managed by `useClaimWizard` hook. AI extraction runs after step 1 to pre-fill subsequent steps.
- **API endpoints pattern**: `POST /claims` creates draft → `PATCH /claims/:id/claimant`, `PATCH /claims/:id/details`, `PATCH /claims/:id` update parts → `POST /claims/:id/submit` finalizes. AI endpoints: `POST /ai/extract`, `POST /ai/validate`.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required by Prisma)
- `OPENAI_API_KEY` — for AI extraction/validation
- `CORS_ORIGIN` — API CORS origin (defaults to `http://localhost:3000`)
- `API_PORT` — API port (defaults to `3001`)
- `NEXT_PUBLIC_API_URL` — web app's API base URL (defaults to `http://localhost:3001`)

## Testing

- API unit tests: Jest with ts-jest, files matching `*.spec.ts` under `apps/api/src/`. Module mapper aliases `@claims-assistant/shared` to the shared package source.
- API e2e tests: separate Jest config at `apps/api/test/jest-e2e.json`, files matching `*.e2e-spec.ts`.
- Web: no tests configured yet.
