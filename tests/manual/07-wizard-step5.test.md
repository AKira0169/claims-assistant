# TEST: Claim Wizard - Step 5 (Review & Submit)

## Feature: Review claim summary, AI validation, and submit

### TC-7.1: Step 5 loads with claim summary
- **Steps**: Navigate from Step 4 to Step 5
- **Expected**: Shows complete claim summary: claim info, claimant details, description
- **Status**: [x] PASS — shows CLAIM INFO (type, priority, date, amount), CLAIMANT (name, policy, email, phone), DESCRIPTION

### TC-7.2: AI validation auto-runs
- **Steps**: Arrive at Step 5
- **Expected**: Shows "/// RUNNING AI VALIDATION..." then results appear
- **Status**: [x] PASS

### TC-7.3: Validation - no errors (with complete data)
- **Steps**: Submit a complete, valid claim (all fields filled)
- **Expected**: Green "OK" indicator, submit button enabled
- **Status**: [ ] NOT TESTED (couldn't fill detail fields via automation)

### TC-7.4: Validation - warnings shown
- **Steps**: Submit a claim with minor issues
- **Expected**: Yellow warning badges shown, submit still possible
- **Status**: [ ] NOT TESTED

### TC-7.5: Validation - errors block submit
- **Steps**: Submit claim with missing AUTO detail fields
- **Expected**: Red "ERR" badges shown per field, submit button disabled, "FIX ERRORS TO SUBMIT" shown
- **Status**: [x] PASS — 8 ERR items shown for missing auto detail fields, submit disabled

### TC-7.6: Submit claim (via API)
- **Steps**: Submit via API: POST /claims/:id/submit
- **Expected**: Status changes from DRAFT to SUBMITTED
- **Status**: [x] PASS — tested via API, status changed correctly

### TC-7.7: Success screen
- **Steps**: After successful UI submission
- **Expected**: Shows success message and link back to dashboard
- **Status**: [ ] NOT TESTED (submission tested via API only)

### TC-7.8: Claim status changes to SUBMITTED
- **Steps**: After submission, check claim in claims list
- **Expected**: Claim shows SUBMITTED status
- **Status**: [x] PASS — verified in claims list

### TC-7.9: Navigate back from review
- **Steps**: Click "← BACK" from step 5
- **Expected**: Returns to Step 4 with data preserved
- **Status**: [x] PASS
