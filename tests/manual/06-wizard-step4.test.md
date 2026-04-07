# TEST: Claim Wizard - Step 4 (Documents)

## Feature: Upload documents for the claim

### TC-6.1: Step 4 loads
- **Steps**: Navigate from Step 3 to Step 4
- **Expected**: Shows upload area with drag-and-drop zone and browse button
- **Status**: [x] PASS — shows drop zone with "↑", "BROWSE FILES", file type/size limits

### TC-6.2: File upload via browse button
- **Steps**: Click browse button, select a file
- **Expected**: File uploaded, appears in file list with type badge
- **Status**: [ ] NOT TESTED (requires file dialog interaction)

### TC-6.3: Drag and drop upload
- **Steps**: Drag a file onto the drop zone
- **Expected**: File uploaded, appears in file list
- **Status**: [ ] NOT TESTED (requires drag interaction)

### TC-6.4: File size limit (10MB)
- **Steps**: Try to upload a file > 10MB
- **Expected**: Error message shown, file not uploaded
- **Status**: [ ] NOT TESTED

### TC-6.5: Accepted file types
- **Steps**: Upload image, PDF, and document files
- **Expected**: All accepted file types upload successfully
- **Status**: [ ] NOT TESTED

### TC-6.6: Rejected file types
- **Steps**: Try to upload an unsupported file type
- **Expected**: Error message or rejection
- **Status**: [ ] NOT TESTED

### TC-6.7: Multiple file uploads
- **Steps**: Upload multiple files sequentially
- **Expected**: All files listed with type badges
- **Status**: [ ] NOT TESTED

### TC-6.8: Skip step (optional)
- **Steps**: Click "NEXT: REVIEW →" without uploading any files
- **Expected**: Allowed to proceed to Step 5 (documents are optional)
- **Status**: [x] PASS — "OPTIONAL STEP" label shown, can proceed without uploads

### TC-6.9: Navigate to Step 5
- **Steps**: Click "NEXT: REVIEW →"
- **Expected**: Navigates to Step 5 (Review), step indicator shows ✓ DOCS
- **Status**: [x] PASS
