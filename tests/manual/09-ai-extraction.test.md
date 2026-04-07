# TEST: AI Extraction Feature

## Feature: Extract structured data from free-text description

### TC-9.1: AUTO claim extraction - claimant fields
- **Steps**: In step 1, select AUTO, enter description with name/email/phone/policy, click "Extract with AI"
- **Expected**: Extracts firstName, lastName, email, phone, policyNumber
- **Actual**: All claimant fields extracted correctly with HIGH confidence
- **Status**: [x] PASS

### TC-9.2: AUTO claim extraction - claim fields
- **Steps**: Same description with amount and date info
- **Expected**: Extracts estimatedAmount, incidentDate, priority
- **Actual**: Amount=5000, incidentDate=Oct 4 2023, priority=MEDIUM extracted
- **Status**: [x] PASS

### TC-9.3: AUTO claim extraction - detail fields (BUG)
- **Steps**: Description contains vehicleMake, vehicleModel, licensePlate, otherPartyName, etc.
- **Expected**: Type-specific detail fields should be pre-filled in Step 3
- **Actual**: ALL auto detail fields are EMPTY in Step 3 despite data being in description
- **Status**: [x] FAIL — AI extraction does not populate type-specific detail fields in the wizard

### TC-9.4: PROPERTY claim extraction
- **Steps**: Select PROPERTY, enter property damage description
- **Expected**: Extracts property-specific fields
- **Status**: [ ] NOT TESTED

### TC-9.5: HEALTH claim extraction
- **Steps**: Select HEALTH, enter medical treatment description
- **Expected**: Extracts health-specific fields
- **Status**: [ ] NOT TESTED

### TC-9.6: Confidence levels shown
- **Steps**: After extraction, check confidence badges in step 2
- **Expected**: Each field shows high/medium/low confidence indicator
- **Status**: [x] PASS — "AI · HIGH" badges on claimant fields, "AI · MEDIUM" on date, "AI · LOW" on amount

### TC-9.7: Overall confidence score
- **Steps**: After extraction, check confirmation message in step 1
- **Expected**: Shows overall confidence percentage
- **Status**: [x] PASS — "Data extracted with 95% overall confidence"

### TC-9.8: Extracted fields editable
- **Steps**: After extraction, modify a pre-filled field
- **Expected**: User can override AI-extracted values
- **Status**: [ ] NOT TESTED (automation limitation with React state)

### TC-9.9: Extraction loading state
- **Steps**: Click "Extract with AI" and watch
- **Expected**: Button text changes to "/// Extracting..."
- **Status**: [x] PASS

### TC-9.10: Extraction error handling
- **Steps**: Trigger extraction failure
- **Expected**: Error message shown in yellow banner
- **Status**: [ ] NOT TESTED
