# TEST: Claim Wizard - Step 2 (Claimant Info)

## Feature: Enter/confirm claimant information

### TC-4.1: Step 2 loads
- **Steps**: Navigate from Step 1 to Step 2
- **Expected**: Shows claimant form fields, step indicator shows step 2 active
- **Status**: [x] PASS

### TC-4.2: AI-extracted fields show confidence badges
- **Steps**: After AI extraction in step 1, check step 2 fields
- **Expected**: Pre-filled fields show "AI · HIGH" confidence badges
- **Status**: [x] PASS — all extracted fields show "AI · HIGH"

### TC-4.3: First Name field (required)
- **Steps**: Check first name pre-filled as "Jane"
- **Expected**: Value accepted, field marked with *
- **Status**: [x] PASS

### TC-4.4: Last Name field (required)
- **Steps**: Check last name pre-filled as "Doe"
- **Expected**: Value accepted, field marked with *
- **Status**: [x] PASS

### TC-4.5: Email field (optional)
- **Steps**: Check email pre-filled as "jane.doe@example.com"
- **Expected**: Value accepted, no * marker
- **Status**: [x] PASS

### TC-4.6: Phone field (optional)
- **Steps**: Check phone pre-filled as "555-0123"
- **Expected**: Value accepted
- **Status**: [x] PASS

### TC-4.7: Address field (optional)
- **Steps**: Check address field
- **Expected**: Empty (not in description), no AI badge
- **Status**: [x] PASS

### TC-4.8: Policy Number field (required)
- **Steps**: Check policy number pre-filled as "POL-2024-789"
- **Expected**: Value accepted, field marked with *
- **Status**: [x] PASS

### TC-4.9: Validation - missing required fields
- **Steps**: Leave firstName, lastName, or policyNumber empty, click "Next"
- **Expected**: Cannot proceed, shows validation errors
- **Status**: [ ] NOT TESTED

### TC-4.10: Navigate back to Step 1
- **Steps**: Click "← BACK" button
- **Expected**: Returns to Step 1 with previous data preserved
- **Status**: [ ] NOT TESTED

### TC-4.11: Navigate to Step 3
- **Steps**: Fill all required fields, click "Next →"
- **Expected**: Navigates to Step 3, step indicator shows ✓ CLAIMANT
- **Status**: [x] PASS

### TC-4.12: Data persistence on back/forward
- **Steps**: Fill fields, go back to step 1, return to step 2
- **Expected**: All entered data preserved
- **Status**: [ ] NOT TESTED
