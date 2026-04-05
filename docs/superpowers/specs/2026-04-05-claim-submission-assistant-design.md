# Claim Submission Assistant — Design Spec

## Context

Insurance operators and support agents deal with manual, fragmented claim submission workflows across multiple systems. This creates an opportunity for an AI-powered guided intake tool that speeds up data entry, reduces errors, and catches inconsistencies before submission.

**Goal:** Build a Claim Submission Assistant — a multi-step wizard for internal agents that uses AI to extract structured claim data from free-text descriptions and validate submissions for completeness and anomalies.

## Decisions

- **Workflow:** Claim Submission Assistant (guided intake wizard)
- **Target user:** Internal agents/operators (not customer-facing)
- **Claim types:** Generic/multi-type (Auto, Property, Health, Other)
- **Stack:** Next.js 14 (App Router) + NestJS + Turborepo + TypeScript
- **AI provider:** OpenAI API (GPT-4) with structured outputs
- **Database:** PostgreSQL via Prisma ORM
- **Approach:** Wizard-first with AI sidebar — structured form flow, AI augments but doesn't replace manual entry

## Architecture

### Monorepo Structure

```
claims-assistant/
├── apps/
│   ├── web/              # Next.js 14 (App Router) — UI
│   └── api/              # NestJS — Backend API + Prisma
├── packages/
│   └── shared/           # Shared types, DTOs, Zod validation schemas
├── turbo.json
├── package.json
└── .env.example
```

### Responsibilities

- **web (Next.js):** UI only. Multi-step wizard, form state management, API calls to NestJS.
- **api (NestJS):** All business logic, OpenAI integration, PostgreSQL persistence, file uploads.
- **shared:** Zod schemas for claim data validation, TypeScript types/DTOs used by both apps.

### Data Flow

1. Agent opens wizard in `web`
2. UI calls REST endpoints on `api`
3. NestJS handles business logic, OpenAI calls, PostgreSQL persistence
4. Shared package ensures type safety across the boundary

## Data Model

### Claim
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| claimNumber | string | Auto-generated (CLM-2026-00001) |
| type | enum | AUTO, PROPERTY, HEALTH, OTHER |
| status | enum | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED |
| priority | enum | LOW, MEDIUM, HIGH, URGENT |
| description | text | Raw incident narrative |
| incidentDate | datetime | When the incident occurred |
| reportDate | datetime | When the claim was filed |
| estimatedAmount | decimal | Estimated claim value |
| createdBy | string | Agent identifier |
| createdAt / updatedAt | datetime | Timestamps |

### Claimant
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| claimId | UUID | FK to Claim (one-to-one) |
| firstName, lastName | string | |
| email, phone | string | Contact info |
| address | string | |
| policyNumber | string | |

### ClaimDetails
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| claimId | UUID | FK to Claim |
| detailType | enum | Matches claim type |
| data | JSONB | Type-specific structured fields |

JSONB `data` varies by type:
- **AUTO:** vehicles involved, other parties, police report number
- **PROPERTY:** property address, damage type, room affected
- **HEALTH:** provider, diagnosis, treatment dates

### ClaimDocument
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| claimId | UUID | FK to Claim |
| fileName | string | |
| fileType | string | MIME type |
| filePath | string | Local filesystem storage path (e.g., uploads/{claimId}/{fileName}) |
| uploadedAt | datetime | |

### AIExtractionLog
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| claimId | UUID | FK to Claim (nullable for pre-creation extractions) |
| inputText | text | The free-text input |
| extractedData | JSONB | Structured extraction result |
| confidence | float | Overall confidence score |
| model | string | OpenAI model used |
| createdAt | datetime | |

## Wizard Flow (5 Steps)

### Step 1: Claim Type & Description
- Agent selects claim type (Auto / Property / Health / Other)
- Agent enters free-text incident description
- **"Extract with AI"** button sends description to `POST /ai/extract`
- Extracted data pre-fills Steps 2 and 3

### Step 2: Claimant Information
- Name, email, phone, address, policy number
- AI-extracted fields pre-filled and highlighted (blue highlight + "AI" badge)
- Agent can override any AI-populated field

### Step 3: Incident Details
- Dynamic form based on claim type selected in Step 1
- Type-specific fields (vehicles for Auto, property details for Property, etc.)
- AI-extracted values pre-filled where applicable

### Step 4: Documents
- Drag-and-drop file upload
- Supports images, PDFs, common document formats
- Files uploaded to `POST /claims/:id/documents`

### Step 5: Review & Submit
- Full summary of all entered data
- **AI Validation** runs automatically via `POST /ai/validate`
- Returns **warnings** (can override) and **errors** (must fix)
- Each issue includes a human-readable explanation
- Agent can go back to fix issues or override warnings and submit

### UI Details
- Stepper/progress bar at top
- Back/Next navigation between steps
- Form state in React state (preserved across navigation)
- Desktop-optimized layout (agent workstation)

## AI Integration

### 1. Smart Extraction (Step 1)
- Input: free-text description + claim type
- Method: OpenAI GPT-4 with structured outputs (function calling)
- Output: JSON matching the claim schema with confidence scores per field
- Fields with low confidence left empty rather than filled with bad data
- Result logged to `AIExtractionLog` for audit

### 2. Validation & Anomaly Detection (Step 5)
- Input: complete claim data object
- Checks for:
  - Missing required fields
  - Logical inconsistencies (future incident dates, type/detail mismatches)
  - Unusual amounts (outlier detection by claim type)
  - Potential duplicate indicators
- Output: list of `{ type: 'warning' | 'error', field: string, message: string }`

### Error Handling
- **AI unavailable:** "Extract with AI" shows "AI unavailable, please fill manually" — form works fully without AI
- **Low confidence:** Fields left empty, agent fills manually
- **Rate limiting:** NestJS-side throttling to prevent abuse
- **API key security:** Environment variables only, never exposed to frontend

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/claims` | Create a new claim (draft) |
| GET | `/claims` | List claims (filtering, pagination) |
| GET | `/claims/:id` | Get claim by ID |
| PATCH | `/claims/:id` | Update claim data |
| POST | `/claims/:id/submit` | Submit claim (triggers validation) |
| POST | `/ai/extract` | Extract structured data from text |
| POST | `/ai/validate` | Validate claim data |
| POST | `/claims/:id/documents` | Upload document |
| GET | `/claims/:id/documents` | List claim documents |

## Testing Strategy

- **Unit tests:** Zod schema validation, AI prompt formatting, data transformations (Jest)
- **Integration tests:** NestJS endpoints with test database (Jest + Supertest)
- **E2E smoke test:** Full wizard flow — description to extraction to validation to submission
- **AI mocking:** OpenAI calls mocked with realistic fixture responses for deterministic, fast tests

## Verification Plan

1. Start Turborepo dev server (`turbo dev`)
2. Open Next.js app, navigate to new claim wizard
3. Paste a sample incident description, click "Extract with AI"
4. Verify fields auto-populate across wizard steps (check confidence indicators)
5. Complete wizard, observe AI validation warnings/errors on review step
6. Submit claim, verify it appears in PostgreSQL with correct data
7. Test graceful degradation: disable OpenAI API key, confirm manual flow works
8. Run full test suite (`turbo test`)
