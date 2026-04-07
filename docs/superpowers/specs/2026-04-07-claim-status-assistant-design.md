# Claim Status Assistant — Design Spec

**Date:** 2026-04-07
**Status:** Draft

## Context

The claims-assistant app currently supports claim submission via a 5-step wizard, but has no way to view, search, or query existing claims. The "View Claims" feature on the homepage is marked "Coming Soon." Internal staff need a way to browse claims by status/type/priority and ask natural language questions about claim data — status lookups, analytics, and deep-dives into specific claims.

This spec adds a **unified claims page** with a filterable table and an AI-powered chat assistant that uses OpenAI function calling to query claim data from the database.

**Target users:** Internal staff (adjusters/agents) first. Architecture supports adding claimant-facing access with scoping later.

## Architecture Overview

**Approach:** Unified `/claims` page with a claims table (left ~70%) and a collapsible AI chat panel (right ~30%).

### Backend

1. **Enhanced `GET /claims`** — add filtering, search, sorting to the existing endpoint
2. **New `POST /ai/chat`** — AI chat endpoint using OpenAI function calling with predefined tools
3. **New `ChatToolsService`** — implements function tools that query Prisma

### Frontend

1. **New `/claims` page** — claims table + filter bar + inline row expansion + chat panel
2. **Chat panel** — message list, text input, loading states

### Shared

1. **New chat schemas** — Zod schemas for chat request/response in `packages/shared`

## Backend: Enhanced Claims List

**File:** `apps/api/src/claims/claims.controller.ts`, `claims.service.ts`

Enhanced `GET /claims` query params:

| Param | Type | Description |
|-------|------|-------------|
| `status` | string (comma-separated) | Filter by ClaimStatus values |
| `type` | string | Filter by ClaimType |
| `priority` | string | Filter by ClaimPriority |
| `search` | string | Text search: claimNumber, claimant name, description |
| `dateFrom` | ISO date string | Incident date range start |
| `dateTo` | ISO date string | Incident date range end |
| `sortBy` | string | Sort field (default: `createdAt`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response shape:**
```ts
{
  data: Claim[],        // with claimant relation included
  total: number,        // total matching count for pagination
  page: number,
  limit: number
}
```

## Backend: AI Chat Endpoint

**Endpoint:** `POST /ai/chat`

**Request:**
```ts
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>
}
```

**Flow:**
1. `AiController` receives request, validates with Zod schema
2. `AiService.chat()` calls OpenAI with:
   - System prompt: "You are a claims status assistant for internal insurance staff..."
   - Conversation history from request
   - Function tool definitions
   - Model: `gpt-4o`, temperature: `0.1`, response format: text
   - System prompt content: Role as internal claims assistant, instructions to use tools to look up real data before answering, format numbers/dates readably, reference claim numbers in responses, and never fabricate claim data
3. If OpenAI responds with tool calls:
   - Execute each tool via `ChatToolsService`
   - Send tool results back to OpenAI
   - Repeat until OpenAI returns a text response
4. Return final assistant message

**Response:**
```ts
{
  message: { role: 'assistant', content: string }
}
```

### Function Tools

Defined in `apps/api/src/ai/chat-tools.service.ts`:

#### `searchClaims`
- **Params:** `status?`, `type?`, `priority?`, `search?`, `dateFrom?`, `dateTo?`, `limit?` (max 20)
- **Returns:** Array of claim summaries (id, claimNumber, type, status, priority, claimant name, incidentDate, estimatedAmount)
- **Query:** `prisma.claim.findMany` with where clause + claimant include

#### `getClaimById`
- **Params:** `identifier` (UUID or claim number like CLM-2026-005)
- **Returns:** Full claim with claimant, claimDetails, documents, aiExtractionLogs
- **Query:** `prisma.claim.findUnique` or `findFirst` (by claimNumber) with all relations

#### `getClaimStats`
- **Params:** `groupBy` (`status` | `type` | `priority`)
- **Returns:** Array of `{ group: string, count: number, totalAmount: number }`
- **Query:** `prisma.claim.groupBy` with `_count` and `_sum`

#### `getRecentActivity`
- **Params:** `limit?` (default 10, max 20)
- **Returns:** Latest claims ordered by `updatedAt` desc
- **Query:** `prisma.claim.findMany` ordered by updatedAt

## Shared Package: Chat Schemas

**File:** `packages/shared/src/schemas/chat.schema.ts`

```ts
// Request
chatMessageSchema     // { role: 'user' | 'assistant', content: string }
chatRequestSchema     // { messages: chatMessageSchema[] }

// Response
chatResponseSchema    // { message: chatMessageSchema }
```

Export types: `ChatMessage`, `ChatRequest`, `ChatResponse`

## Frontend: Claims Page

**Route:** `/claims` (`apps/web/src/app/claims/page.tsx`)

### Layout
- Full-width page with a filter bar at top, claims table below, and a collapsible chat panel on the right
- Chat panel toggled via a floating button or header toggle
- When chat is open: table takes ~70% width, chat ~30%
- When chat is closed: table takes full width

### Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `ClaimsPage` | `app/claims/page.tsx` | Page layout, orchestrates table + chat |
| `ClaimFilters` | `components/ClaimFilters.tsx` | Filter bar: status chips, type/priority dropdowns, search input, date range |
| `ClaimsTable` | `components/ClaimsTable.tsx` | Table rendering, pagination, row click handling |
| `ClaimRow` | `components/ClaimRow.tsx` | Table row + expandable inline detail |
| `ClaimDetail` | `components/ClaimDetail.tsx` | Expanded detail: claimant info, incident details, documents, AI logs |
| `ChatPanel` | `components/ChatPanel.tsx` | Collapsible chat container |
| `ChatMessage` | `components/ChatMessage.tsx` | Individual message bubble (user/assistant) |

### Hooks

| Hook | File | Responsibility |
|------|------|----------------|
| `useClaims` | `hooks/useClaims.ts` | Fetch claims list, manage filter state, pagination, refetch on filter change |
| `useChat` | `hooks/useChat.ts` | Manage messages array, send message to `POST /ai/chat`, handle loading/error |

### Interaction Details

- **Filters:** Changing any filter triggers a refetch with updated query params
- **Pagination:** Page/limit controls at table bottom
- **Row expand:** Click toggles inline detail accordion. Only one row expanded at a time.
- **Chat input:** User types message, presses Enter or clicks Send. Messages array sent to backend. Assistant response appended to messages.
- **Chat loading:** Show typing indicator while waiting for AI response
- **Claim references in chat:** When AI mentions a claim number (CLM-XXXX-XXX), render as clickable — scrolls to and expands that row in the table

### Homepage Update

Update `apps/web/src/app/page.tsx`: change "View Claims" card from "Coming Soon" to link to `/claims`.

## Error Handling

- **Empty table:** "No claims found" or "No claims match your filters" message
- **Chat API errors:** Error message in chat bubble with retry option
- **Tool execution errors:** Tool returns error object → OpenAI responds naturally (e.g., "I couldn't find that claim")
- **Large results:** Function tools cap at 20 results per call. AI can indicate more results exist.

## Testing

- `apps/api/src/ai/chat-tools.service.spec.ts` — unit tests for each tool with mocked Prisma
- `apps/api/src/ai/ai.service.spec.ts` — add tests for `chat()` method with mocked OpenAI client
- `apps/api/src/claims/claims.service.spec.ts` — add tests for enhanced `findAll()` with filters
- Manual E2E: create sample claims, use chat to query them, verify filter combinations

## Files to Create

- `packages/shared/src/schemas/chat.schema.ts`
- `apps/api/src/ai/chat-tools.service.ts`
- `apps/api/src/ai/chat-tools.service.spec.ts`
- `apps/web/src/app/claims/page.tsx`
- `apps/web/src/app/claims/components/ClaimsTable.tsx`
- `apps/web/src/app/claims/components/ClaimFilters.tsx`
- `apps/web/src/app/claims/components/ClaimRow.tsx`
- `apps/web/src/app/claims/components/ClaimDetail.tsx`
- `apps/web/src/app/claims/components/ChatPanel.tsx`
- `apps/web/src/app/claims/components/ChatMessage.tsx`
- `apps/web/src/app/claims/hooks/useClaims.ts`
- `apps/web/src/app/claims/hooks/useChat.ts`

## Files to Modify

- `packages/shared/src/schemas/index.ts` — export chat schemas
- `packages/shared/src/types/index.ts` — export chat types
- `apps/api/src/ai/ai.service.ts` — add `chat()` method
- `apps/api/src/ai/ai.controller.ts` — add `POST /ai/chat` endpoint
- `apps/api/src/ai/ai.module.ts` — register `ChatToolsService`
- `apps/api/src/claims/claims.service.ts` — enhanced `findAll()` with filters
- `apps/api/src/claims/claims.controller.ts` — enhanced query params
- `apps/web/src/app/page.tsx` — update "View Claims" card
