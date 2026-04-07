# TEST: Claims List Page

## Feature: Filterable, sortable claims table at `/claims`

### TC-2.1: Page loads with empty state
- **Steps**: Navigate to `/claims` with no claims in DB
- **Expected**: Shows "NO CLAIMS FOUND" message with "Try adjusting your filters"
- **Status**: [x] PASS

### TC-2.2: Claims table displays data
- **Steps**: Navigate to `/claims` with claims in DB
- **Expected**: Table shows columns: Claim #, Type, Status, Priority, Claimant, Date, Amount
- **Status**: [x] PASS

### TC-2.3: Search filter
- **Steps**: Type a claim number or claimant name in search box
- **Expected**: Table filters after ~300ms debounce, shows matching results
- **Status**: [ ] NOT TESTED (requires multiple claims for meaningful test)

### TC-2.4: Status filter (multi-select)
- **Steps**: Toggle "DRAFT" status filter
- **Expected**: Table shows only claims with DRAFT status (none in this case)
- **Status**: [x] PASS — correctly showed "NO CLAIMS FOUND" when filtering by DRAFT

### TC-2.5: Type dropdown filter
- **Steps**: Select "AUTO" from type dropdown
- **Expected**: Table filters to show only AUTO claims
- **Status**: [x] PASS

### TC-2.6: Priority dropdown filter
- **Steps**: Select a priority level
- **Expected**: Table filters to show only that priority
- **Status**: [ ] NOT TESTED (needs multiple claims with different priorities)

### TC-2.7: Date range filter
- **Steps**: Set "From" and "To" dates
- **Expected**: Table shows only claims within date range
- **Status**: [ ] NOT TESTED

### TC-2.8: Clear all filters
- **Steps**: Apply multiple filters, then click "CLEAR ALL"
- **Expected**: All filters reset, full list shown
- **Status**: [x] PASS

### TC-2.9: Sorting
- **Steps**: Click column headers to sort
- **Expected**: Data sorts ascending/descending by clicked column
- **Status**: [ ] NOT TESTED (needs multiple claims)

### TC-2.10: Pagination
- **Steps**: With many claims, navigate between pages
- **Expected**: Page changes, correct data shown, page indicator updates
- **Status**: [ ] NOT TESTED (needs >20 claims)

### TC-2.11: Page size selector
- **Steps**: Change items per page (10/20/50)
- **Expected**: Dropdown shows 10/page, 20/page, 50/page options
- **Status**: [x] PASS — options visible and selectable

### TC-2.12: Expandable row - claim details
- **Steps**: Click a row to expand
- **Expected**: Shows claimant info, description, type-specific details
- **Status**: [x] PASS

### TC-2.13: Status color coding
- **Steps**: Check visual status badges
- **Expected**: SUBMITTED shown with color badge
- **Status**: [x] PASS

### TC-2.14: Priority color coding
- **Steps**: Check priority badges
- **Expected**: HIGH shown with color badge
- **Status**: [x] PASS

### TC-2.15: Detail field labels formatting (BUG)
- **Steps**: Expand a claim row and check AUTO DETAILS field labels
- **Expected**: Labels should be human-readable (e.g., "VEHICLE MAKE")
- **Actual**: Labels are camelCase without spaces (e.g., "VEHICLEMAKE")
- **Status**: [x] FAIL — field labels not formatted with spaces
