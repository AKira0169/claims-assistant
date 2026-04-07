# TEST: API Endpoints

## Feature: REST API at http://localhost:3001

### TC-11.1: POST /claims - Create claim
- **Steps**: `POST /claims` with `{"type": "AUTO", "description": "Test claim", "createdBy": "tester"}`
- **Expected**: Returns 201 with claim object including claimNumber, status=DRAFT
- **Status**: [x] PASS — returned CLM-2026-00001, status=DRAFT

### TC-11.2: GET /claims - List claims
- **Steps**: `GET /claims?page=1&limit=10`
- **Expected**: Returns 200 with `{data: [], total, page, limit}`
- **Status**: [x] PASS

### TC-11.3: GET /claims/:id - Get single claim
- **Steps**: `GET /claims/{id}` with valid UUID
- **Expected**: Returns 200 with full claim including claimant, details, documents
- **Status**: [x] PASS — returns claim with all relations

### TC-11.4: PATCH /claims/:id - Update claim
- **Steps**: `PATCH /claims/{id}` with `{"priority": "HIGH", "estimatedAmount": 5000}`
- **Expected**: Returns 200 with updated claim
- **Status**: [x] PASS

### TC-11.5: PATCH /claims/:id/claimant - Update claimant
- **Steps**: `PATCH /claims/{id}/claimant` with claimant data
- **Expected**: Returns 200 with claimant data (upsert)
- **Status**: [x] PASS

### TC-11.6: PATCH /claims/:id/details - Update details
- **Steps**: `PATCH /claims/{id}/details` with `{"detailType": "AUTO", "data": {...}}`
- **Expected**: Returns 200 with details data (upsert)
- **Status**: [x] PASS

### TC-11.7: POST /claims/:id/submit - Submit claim
- **Steps**: `POST /claims/{id}/submit` on a DRAFT claim
- **Expected**: Returns 200, status changed to SUBMITTED
- **Status**: [x] PASS

### TC-11.8: POST /claims/:id/submit - Already submitted (BUG)
- **Steps**: `POST /claims/{id}/submit` on a SUBMITTED claim
- **Expected**: Returns 400 with descriptive error message
- **Actual**: Returns `{"statusCode":500,"message":"Internal server error"}`
- **Status**: [x] FAIL — returns 500 instead of proper 400 error with descriptive message

### TC-11.9: POST /ai/extract - AI extraction
- **Steps**: `POST /ai/extract` with description and claimType
- **Expected**: Returns extraction response with fields and confidence
- **Status**: [x] PASS (tested via UI)

### TC-11.10: POST /ai/validate - AI validation
- **Steps**: `POST /ai/validate` with claim/claimant/details objects
- **Expected**: Returns validation response with issues and summary
- **Status**: [x] PASS (tested via UI)

### TC-11.11: POST /ai/chat - Chat
- **Steps**: `POST /ai/chat` with messages array
- **Expected**: Returns assistant message response with tool-calling support
- **Status**: [x] PASS (tested via UI)

### TC-11.12: POST /claims/:claimId/documents - Upload
- **Steps**: `POST /claims/{id}/documents` with multipart file
- **Expected**: Returns 201 with document metadata
- **Status**: [ ] NOT TESTED

### TC-11.13: GET /claims/:claimId/documents - List documents
- **Steps**: `GET /claims/{id}/documents`
- **Expected**: Returns array of document objects (empty if none)
- **Status**: [x] PASS — returns `[]` for claim with no documents
