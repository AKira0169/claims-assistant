# TEST: Homepage / Dashboard

## Feature: Landing page with navigation and stats

### TC-1.1: Page loads correctly
- **Steps**: Navigate to `http://localhost:3000`
- **Expected**: Page loads with headline, stats cards, and CTA buttons
- **Status**: [x] PASS

### TC-1.2: Stats cards display
- **Steps**: Check the 3 stats cards on homepage
- **Expected**: Shows "< 3MIN", "95%+", "12+" stats
- **Status**: [x] PASS

### TC-1.3: "File a New Claim" button navigates
- **Steps**: Click "NEW CLAIM" / "START FILING" CTA
- **Expected**: Navigates to `/claims/new`
- **Status**: [x] PASS

### TC-1.4: "View Claims" button navigates
- **Steps**: Click "VIEW CLAIMS" / "BROWSE CLAIMS" CTA
- **Expected**: Navigates to `/claims`
- **Status**: [x] PASS

### TC-1.5: Responsive layout
- **Steps**: Resize browser to mobile width (~375px)
- **Expected**: Layout adjusts, no horizontal overflow, buttons remain accessible
- **Status**: [ ] NOT TESTED (manual resize needed)
