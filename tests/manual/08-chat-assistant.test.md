# TEST: Chat Assistant

## Feature: AI chat panel on claims list page

### TC-8.1: Chat panel toggle
- **Steps**: Click "AI ASSISTANT" button on `/claims` page
- **Expected**: Chat panel opens in sidebar, button changes to "CLOSE AI"
- **Status**: [x] PASS

### TC-8.2: Empty state suggestions
- **Steps**: Check chat panel before sending any message
- **Expected**: Shows "ASK ABOUT CLAIMS" with 3 suggestion prompts
- **Status**: [x] PASS — shows "How many claims are under review?", "Show me recent activity", "What is the status of CLM-2026-00001?"

### TC-8.3: Suggestion prompt click
- **Steps**: Click "What is the status of CLM-2026-00001?"
- **Expected**: Message sent, user message and assistant response appear
- **Status**: [x] PASS

### TC-8.4: Chat response with claim data
- **Steps**: Check response to status query
- **Expected**: Assistant returns claim details using getClaimById tool
- **Status**: [x] PASS — returned status=SUBMITTED, type, priority, amount, claimant, vehicle details, police report

### TC-8.5: Clickable claim numbers
- **Steps**: Check CLM-2026-00001 in assistant response
- **Expected**: Rendered as clickable button
- **Status**: [x] PASS

### TC-8.6: Search claims via chat
- **Steps**: Type "Search for auto claims"
- **Expected**: Assistant uses searchClaims tool and returns results
- **Status**: [ ] NOT TESTED

### TC-8.7: Get claim stats via chat
- **Steps**: Type "What are the claim statistics by status?"
- **Expected**: Assistant uses getClaimStats tool
- **Status**: [ ] NOT TESTED

### TC-8.8: Get recent activity via chat
- **Steps**: Type "Show me recent activity"
- **Expected**: Assistant uses getRecentActivity tool
- **Status**: [ ] NOT TESTED

### TC-8.9: Clear chat
- **Steps**: Click "CLEAR" button
- **Expected**: All messages removed, returns to empty state
- **Status**: [ ] NOT TESTED

### TC-8.10: Retry last message
- **Steps**: Click "Retry" button after a response
- **Expected**: Last user message re-sent, new response generated
- **Status**: [ ] NOT TESTED

### TC-8.11: Multi-turn conversation
- **Steps**: Send multiple messages building on context
- **Expected**: Assistant maintains conversation context
- **Status**: [ ] NOT TESTED

### TC-8.12: Close chat panel
- **Steps**: Click "×" or "CLOSE AI" button
- **Expected**: Chat panel closes
- **Status**: [ ] NOT TESTED
