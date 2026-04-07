# TEST: AI Validation Feature

## Feature: Validate claim data for completeness and anomalies

### TC-10.1: Validation runs on Step 5
- **Steps**: Complete steps 1-4 and arrive at step 5
- **Expected**: Shows "/// RUNNING AI VALIDATION..." then results
- **Status**: [x] PASS

### TC-10.2: Valid claim - no issues
- **Steps**: Submit a fully complete claim with all fields filled
- **Expected**: Green "OK" status, no errors or warnings
- **Status**: [ ] NOT TESTED

### TC-10.3: Missing detail fields trigger errors
- **Steps**: Leave AUTO detail fields empty and reach step 5
- **Expected**: ERROR-type issues listed for each missing field
- **Status**: [x] PASS — 8 ERR items for missing vehicleMake, vehicleModel, vehicleYear, licensePlate, otherPartyName, otherPartyInsurance, policeReportNumber, accidentLocation

### TC-10.4: Unusual amount triggers warning
- **Steps**: Enter an unusually high amount
- **Expected**: WARNING-type issue about unusual amount
- **Status**: [ ] NOT TESTED

### TC-10.5: Future incident date
- **Steps**: Set incident date to a future date
- **Expected**: WARNING or ERROR about future date
- **Status**: [ ] NOT TESTED

### TC-10.6: Validation summary
- **Steps**: Check validation output format
- **Expected**: Each issue shows type (ERR/WARN), message, and field name
- **Status**: [x] PASS — format: "ERR" badge + message + "(field: details.fieldName)"

### TC-10.7: Error blocks submission
- **Steps**: With ERROR-type validation issues
- **Expected**: Submit button disabled, "FIX ERRORS TO SUBMIT" shown
- **Status**: [x] PASS

### TC-10.8: Warning allows submission
- **Steps**: With only WARNING-type issues (no errors)
- **Expected**: Submit button remains enabled
- **Status**: [ ] NOT TESTED
