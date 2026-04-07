# Manual Test Results Summary

**Date**: 2026-04-07
**Environment**: localhost (API :3001, Web :3000)
**Tester**: Claude Code (automated via Chrome DevTools)

---

## Overall Results

| Category | Pass | Fail | Not Tested | Total |
|----------|------|------|------------|-------|
| Homepage | 4 | 0 | 1 | 5 |
| Claims List | 8 | 1 | 5 | 14 |
| Wizard Step 1 | 9 | 0 | 3 | 12 |
| Wizard Step 2 | 7 | 0 | 3 | 10 |
| Wizard Step 3 | 7 | 1 | 3 | 11 |
| Wizard Step 4 | 2 | 0 | 6 | 8 |
| Wizard Step 5 | 5 | 0 | 3 | 8 |
| Chat Assistant | 5 | 0 | 6 | 11 |
| AI Extraction | 5 | 1 | 4 | 10 |
| AI Validation | 4 | 0 | 4 | 8 |
| API Endpoints | 10 | 1 | 1 | 12 |
| **TOTAL** | **66** | **4** | **39** | **109** |

---

## Bugs Found

### BUG-1: AI extraction doesn't pre-fill type-specific detail fields (HIGH)
- **Location**: Wizard Step 3 / AI Extraction
- **Test**: TC-5.9, TC-9.3
- **Description**: When AI extracts data from a description containing vehicle info (make, model, year, plate, etc.), the claimant fields and common fields (amount, date) are pre-filled, but ALL type-specific detail fields remain empty. The description "2020 Honda Civic plate ABC-1234, John Smith, StateFarm, police report PR-2024-567" should populate vehicleMake=Honda, vehicleModel=Civic, etc.
- **Impact**: Users must manually re-enter data that the AI should have extracted, defeating the purpose of AI extraction for the most detailed fields.

### BUG-2: Claim detail labels displayed as camelCase (LOW)
- **Location**: Claims List / Expandable Row
- **Test**: TC-2.15
- **Description**: In the expanded claim detail view, field labels from the JSON data are shown as camelCase without spaces (e.g., "VEHICLEMAKE" instead of "VEHICLE MAKE", "OTHERPARTYNAME" instead of "OTHER PARTY NAME").
- **Impact**: Poor readability for users viewing claim details.

### BUG-3: Double-submit returns 500 instead of proper error (MEDIUM)
- **Location**: API / POST /claims/:id/submit
- **Test**: TC-11.8
- **Description**: Attempting to submit an already-submitted claim returns `{"statusCode":500,"message":"Internal server error"}` instead of a 400-level error with a descriptive message like "Claim has already been submitted".
- **Impact**: Poor error handling — client receives generic 500 error instead of actionable feedback.

### BUG-4: AI extraction date accuracy (LOW)
- **Location**: AI Extraction
- **Description**: The description said "yesterday" but AI extracted "Oct 4, 2023" — the date is fabricated rather than relative to the current date. The AI prompt now includes the current date, but the extraction still picked an incorrect absolute date.
- **Impact**: Users need to verify and correct AI-extracted dates.

---

## Features Working Well

1. **Homepage** — Clean brutalist design, all navigation works
2. **Claims List** — Table, filters (status, type), pagination, expandable rows all functional
3. **Wizard Navigation** — Step indicator, back/forward, data preservation between steps
4. **AI Extraction (Claimant)** — Excellent extraction of name, email, phone, policy with HIGH confidence
5. **AI Validation** — Correctly identifies missing fields as ERR, blocks submission
6. **Chat Assistant** — Tool-calling works (getClaimById), clickable claim numbers, contextual responses
7. **API CRUD** — All create/read/update endpoints working correctly
8. **Claim Submission** — Full flow from DRAFT to SUBMITTED works

---

## Not Tested (Requires Manual Interaction)

- File upload (drag-and-drop, browse button, file size limits)
- Responsive/mobile layout
- Multiple claims (sorting, pagination, search with results)
- PROPERTY/HEALTH/OTHER claim types through wizard
- Chat: clear, retry, multi-turn, close panel
- Validation with warnings only (no errors)
- Field editability after AI extraction

---

## Screenshots

Located in `tests/manual/screenshots/`:
- `01-homepage.png` — Homepage/dashboard
- `02-claims-list-empty.png` — Claims list empty state
- `03-step1-filled.png` — Wizard step 1 with type and description
- `04-step1-extracted.png` — After AI extraction (95% confidence)
- `05-step2-prefilled.png` — Step 2 with AI-prefilled claimant data
- `06-step3-details-top.png` — Step 3 incident details (top)
- `06b-step3-details-bottom.png` — Step 3 auto details (bottom, empty)
- `07-step4-documents.png` — Step 4 document upload
- `08-step5-validation-errors.png` — Step 5 with validation errors
- `09-claims-list-with-data.png` — Claims list with submitted claim
- `10-claim-expanded.png` — Expanded claim detail row
- `11-chat-panel-open.png` — Chat assistant panel
- `12-chat-response.png` — Chat response with claim details
