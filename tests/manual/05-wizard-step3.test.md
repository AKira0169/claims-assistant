# TEST: Claim Wizard - Step 3 (Incident Details)

## Feature: Enter incident details with type-specific fields

### TC-5.1: Step 3 loads with common fields
- **Steps**: Navigate from Step 2 to Step 3
- **Expected**: Shows Incident Date, Estimated Amount, Priority fields
- **Status**: [x] PASS

### TC-5.2: Incident Date picker
- **Steps**: Check date field pre-filled from AI extraction
- **Expected**: Shows "Oct 4, 2023 12:00 AM" with AI · MEDIUM badge
- **Status**: [x] PASS

### TC-5.3: Estimated Amount field
- **Steps**: Check amount field pre-filled from AI extraction
- **Expected**: Shows 5000 with AI · LOW badge
- **Status**: [x] PASS

### TC-5.4: Priority selector
- **Steps**: Check priority dropdown
- **Expected**: Shows LOW, MEDIUM, HIGH, URGENT options, defaults to MEDIUM
- **Status**: [x] PASS

### TC-5.5: AUTO type-specific fields
- **Steps**: With AUTO claim type, check for type-specific fields
- **Expected**: Shows vehicleMake, vehicleModel, vehicleYear, licensePlate, otherPartyName, otherPartyInsurance, policeReportNumber, accidentLocation
- **Status**: [x] PASS — all 8 fields displayed under "AUTO DETAILS" heading

### TC-5.6: PROPERTY type-specific fields
- **Steps**: With PROPERTY claim type, check for type-specific fields
- **Expected**: Shows propertyAddress, damageType, roomsAffected, propertyType
- **Status**: [ ] NOT TESTED

### TC-5.7: HEALTH type-specific fields
- **Steps**: With HEALTH claim type, check for type-specific fields
- **Expected**: Shows providerName, diagnosis, treatmentDate, treatmentType, facilityName
- **Status**: [ ] NOT TESTED

### TC-5.8: OTHER type-specific fields
- **Steps**: With OTHER claim type, check for type-specific fields
- **Expected**: Shows category, additionalInfo
- **Status**: [ ] NOT TESTED

### TC-5.9: AI-extracted details NOT pre-filled (BUG)
- **Steps**: After AI extraction in step 1 for AUTO type, check step 3 detail fields
- **Expected**: Type-specific fields should be pre-filled with extracted data (Honda, Civic, 2020, ABC-1234, etc.)
- **Actual**: All 8 AUTO detail fields are EMPTY despite description containing all data
- **Status**: [x] FAIL — AI extraction does not populate type-specific detail fields

### TC-5.10: Navigate back preserves data
- **Steps**: Fill fields, go back to step 2, return to step 3
- **Expected**: All entered data preserved (date, amount retained)
- **Status**: [x] PASS — common fields (date, amount) preserved on back/forward

### TC-5.11: Navigate to Step 4
- **Steps**: Click "Next →"
- **Expected**: Navigates to Step 4, step indicator shows ✓ DETAILS
- **Status**: [x] PASS
