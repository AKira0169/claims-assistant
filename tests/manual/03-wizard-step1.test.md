# TEST: Claim Wizard - Step 1 (Type & Description)

## Feature: Select claim type and enter description at `/claims/new`

### TC-3.1: Wizard page loads
- **Steps**: Navigate to `/claims/new`
- **Expected**: Step 1 shown with type selector and description field, step indicator shows step 1 active
- **Status**: [x] PASS

### TC-3.2: Step indicator displays 5 steps
- **Steps**: Check step indicator at top
- **Expected**: Shows 5 steps: TYPE, CLAIMANT, DETAILS, DOCS, SUBMIT — step 1 active, others disabled
- **Status**: [x] PASS

### TC-3.3: Claim type selection - AUTO
- **Steps**: Click "//01 AUTO" type option
- **Expected**: AUTO type selected, highlighted yellow
- **Status**: [x] PASS

### TC-3.4: Claim type selection - PROPERTY
- **Steps**: Click "//02 PROPERTY" type option
- **Expected**: PROPERTY type selected
- **Status**: [ ] NOT TESTED

### TC-3.5: Claim type selection - HEALTH
- **Steps**: Click "//03 HEALTH" type option
- **Expected**: HEALTH type selected
- **Status**: [ ] NOT TESTED

### TC-3.6: Claim type selection - OTHER
- **Steps**: Click "//04 OTHER" type option
- **Expected**: OTHER type selected
- **Status**: [ ] NOT TESTED

### TC-3.7: Description textarea
- **Steps**: Type a long description (200+ characters)
- **Expected**: Text accepted, no truncation
- **Status**: [x] PASS

### TC-3.8: Validation - buttons disabled without input
- **Steps**: Check "Extract with AI" and "Next" buttons before entering type+description
- **Expected**: Both buttons disabled
- **Status**: [x] PASS — buttons correctly disabled when description is empty

### TC-3.9: Buttons enable with type + description
- **Steps**: Select type and enter description
- **Expected**: Both "Extract with AI" and "Next" buttons become enabled
- **Status**: [x] PASS

### TC-3.10: AI Extract button
- **Steps**: Select AUTO type, enter detailed description with names/dates/amounts, click "Extract with AI"
- **Expected**: Loading state shown, then extraction results with confidence badges
- **Status**: [x] PASS — extracted with 95% overall confidence

### TC-3.11: AI Extract populates subsequent steps
- **Steps**: After AI extraction, proceed to step 2
- **Expected**: Claimant fields pre-filled with AI confidence badges
- **Status**: [x] PASS — firstName, lastName, email, phone, policyNumber all pre-filled

### TC-3.12: Navigate to Step 2
- **Steps**: Fill type and description, click "Next"
- **Expected**: Navigates to Step 2, step indicator updates (✓ TYPE)
- **Status**: [x] PASS
