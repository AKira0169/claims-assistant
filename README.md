# Claims Assistant

An AI-assisted insurance claims intake application. A multi-step wizard UI collects claim data, with OpenAI-powered extraction (auto-fill from free text) and validation (anomaly/completeness checks) integrated into the workflow.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | pnpm workspaces + Turborepo | pnpm 10.33, Turbo 2.9 |
| Backend | NestJS (REST API) | 11.1 |
| Frontend | Next.js (App Router) | 16.2 |
| Database | PostgreSQL via Prisma ORM | Prisma 7.6 |
| AI | OpenAI SDK (GPT-4o) | 6.33 |
| Validation | Zod (shared schemas) | 4.3 |
| Styling | Tailwind CSS | 4.2 |
| Language | TypeScript | 6.0 |

## Project Structure

```
claims-assistant/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   │   ├── src/
│   │   │   ├── ai/           # AI extraction, validation & chat
│   │   │   ├── claims/       # Claims CRUD module
│   │   │   ├── documents/    # File upload module
│   │   │   └── prisma/       # Database service
│   │   └── prisma/
│   │       └── schema.prisma # Database schema
│   └── web/          # Next.js frontend (port 3000)
│       └── src/app/
│           └── claims/
│               ├── new/      # 5-step claim wizard
│               └── hooks/    # useClaimWizard, useChat
├── packages/
│   └── shared/       # Zod schemas, enums & types
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (`npm install -g pnpm`)
- **PostgreSQL** database (local or hosted)
- **OpenAI API key** with access to GPT-4o

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/claims_assistant
OPENAI_API_KEY=sk-proj-your-key-here
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
```

Edit `apps/web/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Set up the database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations to create tables
```

### 4. Start development servers

```bash
pnpm dev            # Starts both API (port 3001) and Web (port 3000)
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

```bash
# Development
pnpm dev                          # Start all apps in watch mode
pnpm build                        # Build all packages
pnpm test                         # Run all tests
pnpm lint                         # Lint all packages

# Database
pnpm db:migrate                   # Run Prisma migrations
pnpm db:generate                  # Regenerate Prisma client
pnpm db:studio                    # Open Prisma Studio GUI

# Run specific app
pnpm --filter api run dev         # API only
pnpm --filter web run dev         # Web only

# Testing
pnpm --filter api run test        # API unit tests
pnpm --filter api run test:e2e    # API end-to-end tests
cd apps/api && npx jest --testPathPattern="claims.controller"  # Single test file
```

## Features

### Claim Submission Wizard (5 Steps)

1. **Type & Description** — Select claim type (Auto, Property, Health, Other) and describe the incident in free text. Click "Extract with AI" to auto-fill subsequent steps.
2. **Claimant Info** — Name, email, phone, address, policy number. Pre-filled by AI with confidence indicators.
3. **Incident Details** — Date, estimated amount, priority, plus type-specific fields (vehicle info, property details, medical info, etc.).
4. **Documents** — Upload supporting files and evidence.
5. **Review & Submit** — AI validation runs automatically. Errors block submission; warnings can be overridden.

### AI Capabilities

| Feature | Description |
|---------|-------------|
| **Extraction** | Converts free-text descriptions into structured claim data with per-field confidence scores (high/medium/low). Only medium+ confidence fields auto-fill the form. |
| **Validation** | Checks for missing fields, logical inconsistencies, unusual amounts, and potential duplicates. Issues classified as ERROR (blocking) or WARNING (overridable). |
| **Chat Assistant** | Natural language interface for internal staff to query claims — search, lookup by ID/claim number, view stats, and recent activity. Powered by OpenAI tool calling. |

### Claim Types & Fields

- **Auto** — Vehicle make/model/year, license plate, other party info, police report number, accident location
- **Property** — Property address, damage type, rooms affected, property type, estimated repair cost
- **Health** — Provider name, diagnosis, treatment date/type, facility name
- **Other** — Category, additional info

### Claim Lifecycle

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED
```

## Database Schema

| Model | Description |
|-------|-------------|
| **Claim** | Core entity — type, status, priority, description, incident date, estimated amount, claim number |
| **Claimant** | 1:1 with Claim — personal info and policy number |
| **ClaimDetails** | 1:1 with Claim — type-specific data stored as JSON |
| **ClaimDocument** | 1:many with Claim — uploaded file references |
| **AIExtractionLog** | Audit trail — input text, extracted data, confidence, model version |

## API Endpoints

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/claims` | Create a draft claim |
| `GET` | `/claims` | List claims (with filters) |
| `GET` | `/claims/:id` | Get claim by ID |
| `PATCH` | `/claims/:id` | Update claim fields |
| `PATCH` | `/claims/:id/claimant` | Update claimant info |
| `PATCH` | `/claims/:id/details` | Update type-specific details |
| `POST` | `/claims/:id/submit` | Submit claim for review |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/extract` | Extract structured data from free text |
| `POST` | `/ai/validate` | Validate claim for completeness/anomalies |
| `POST` | `/ai/chat` | Chat assistant for claims queries |

## Architecture Decisions

- **Shared Zod schemas** as the single source of truth for types between frontend and backend — no code generation or manual sync needed.
- **Confidence-gated pre-fill** — AI extraction returns per-field confidence. Low-confidence fields are excluded from auto-fill to prevent silent errors.
- **AI validation over hardcoded rules** — GPT-4o catches nuanced issues (future dates, amounts unusual for claim type) without maintaining a growing rule set.
- **Graceful degradation** — If AI services are unavailable, users can still complete and submit claims manually.
- **Draft-first persistence** — Claims are saved as drafts before document upload so files always attach to a real database record.
