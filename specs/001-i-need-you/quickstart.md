# Quickstart Guide: Stock Trading Learning Platform

**Purpose**: Validate the implementation meets requirements through manual testing  
**Duration**: ~30 minutes  
**Prerequisites**: Application running locally with test data

## Setup Requirements

Before starting:
1. Supabase project created and running
2. Frontend application running on localhost:3000
3. Test class created with invite code: `TEST01`
4. Alpha Vantage API key configured
5. At least 5 TSX stocks in database

## Test Scenarios

### Scenario 1: New Student Registration (5 min)

**Goal**: Verify account creation and initial balance

1. Navigate to homepage
2. Click "Sign Up" button
3. Enter test email: `student1@test.edu`
4. Enter password: `TestPass123!`
5. Click "Create Account"

**Expected Results**:
- [ ] Confirmation email sent
- [ ] Redirected to email verification page
- [ ] After verification, redirected to dashboard
- [ ] $100,000 virtual balance displayed

### Scenario 2: Join Class (3 min)

**Goal**: Verify class enrollment process

1. From dashboard, click "Join Class"
2. Enter invite code: `TEST01`
3. Click "Join"

**Expected Results**:
- [ ] Success message displayed
- [ ] Class name shown in header
- [ ] Leaderboard becomes accessible
- [ ] Other class members visible

### Scenario 3: Browse and Select Stock (5 min)

**Goal**: Verify stock listing and search

1. Click "Browse Stocks" from dashboard
2. View list of available TSX stocks
3. Search for "SHOP" in search bar
4. Click on Shopify (SHOP.TO)

**Expected Results**:
- [ ] At least 20 TSX stocks displayed
- [ ] Search filters results in real-time
- [ ] Stock details show current price
- [ ] Company name displayed correctly
- [ ] Market status indicator visible

### Scenario 4: Make Investment (5 min)

**Goal**: Verify one-time investment process

1. From stock details page, click "Invest All Funds"
2. Review investment preview:
   - Stock: SHOP.TO
   - Current Price: $XX.XX
   - Shares to Purchase: XXX
   - Total Cost: $100,000
3. Click "Confirm Investment"

**Expected Results**:
- [ ] Investment confirmed message
- [ ] Portfolio page shows investment
- [ ] Invest button disabled/hidden
- [ ] Balance shows $0 remaining
- [ ] Cannot make another investment

### Scenario 5: View Portfolio Performance (3 min)

**Goal**: Verify portfolio tracking

1. Navigate to "My Portfolio"
2. View investment details
3. Note current value and return

**Expected Results**:
- [ ] Stock symbol and company name shown
- [ ] Purchase price displayed
- [ ] Number of shares shown
- [ ] Current value calculated correctly
- [ ] Return percentage displayed (positive/negative)
- [ ] Day change shown if market open

### Scenario 6: Check Leaderboard (3 min)

**Goal**: Verify competitive features

1. Click "Leaderboard" in navigation
2. View class rankings
3. Click on another student's name

**Expected Results**:
- [ ] All class members listed
- [ ] Ranked by return percentage
- [ ] Your position highlighted
- [ ] Can view others' stock picks
- [ ] Cannot see others' email addresses (privacy)

### Scenario 7: Mid-Semester Join (5 min)

**Goal**: Verify late enrollment handling

1. Sign up with new account: `student2@test.edu`
2. Join same class with code: `TEST01`
3. Make investment in different stock

**Expected Results**:
- [ ] Receives full $100,000
- [ ] Can invest at current market prices
- [ ] Join date shown on leaderboard
- [ ] Ranked fairly with others

### Scenario 8: Market Hours Handling (3 min)

**Goal**: Verify closed market behavior

Test during market closed hours (after 4 PM ET or weekends):

1. View stock prices
2. Check portfolio value
3. View leaderboard

**Expected Results**:
- [ ] "Market Closed" indicator shown
- [ ] Last closing price displayed
- [ ] Timestamp shows last update
- [ ] Can still make investment
- [ ] Portfolio uses closing prices

## Performance Validation

### Load Time Targets
- [ ] Homepage loads in <2 seconds
- [ ] Stock list loads in <3 seconds
- [ ] Leaderboard updates in <1 second
- [ ] Portfolio refresh in <1 second

### Concurrent User Test
1. Open 5 browser tabs
2. Sign in with different accounts
3. View leaderboard simultaneously

**Expected Results**:
- [ ] All tabs show same leaderboard
- [ ] Real-time updates work
- [ ] No performance degradation

## Error Handling

### Test Invalid Operations

1. **Duplicate Investment Attempt**:
   - Try to invest again after first investment
   - Expected: Error message "You already have a portfolio"

2. **Invalid Invite Code**:
   - Try joining with code: `INVALID`
   - Expected: Error "Invalid invite code"

3. **Insufficient Funds**:
   - Try to buy stock worth >$100,000
   - Expected: System calculates maximum shares affordable

4. **Invalid Stock Symbol**:
   - Search for "INVALID.TO"
   - Expected: No results found

## Security Validation

1. **Portfolio Protection**:
   - Try to modify another user's portfolio via API
   - Expected: 403 Forbidden

2. **Authentication Required**:
   - Access dashboard without login
   - Expected: Redirect to login page

3. **SQL Injection Test**:
   - Enter `'; DROP TABLE--` in search
   - Expected: Safely escaped, no error

## Mobile Responsiveness

Test on mobile device or responsive mode:

1. [ ] Navigation menu collapses to hamburger
2. [ ] Stock list scrollable
3. [ ] Leaderboard readable
4. [ ] Investment flow works on touch
5. [ ] Charts/graphs scale properly

## Data Persistence

1. Make investment
2. Log out completely
3. Clear browser cache
4. Log back in

**Expected Results**:
- [ ] Portfolio still exists
- [ ] Investment details unchanged
- [ ] Position on leaderboard maintained

## Cleanup

After testing:
1. Document any issues found
2. Note performance bottlenecks
3. List UI/UX improvements needed
4. Save test account credentials

## Success Criteria

**All Core Features Working**:
- [ ] User registration and authentication
- [ ] One-time investment enforcement
- [ ] Real-time price updates
- [ ] Leaderboard rankings
- [ ] Portfolio performance tracking

**No Critical Bugs**:
- [ ] No data loss
- [ ] No security vulnerabilities
- [ ] No crashes or freezes
- [ ] No calculation errors

**Performance Acceptable**:
- [ ] Page loads under targets
- [ ] Handles 30+ concurrent users
- [ ] Real-time updates working

## Report Template

```markdown
## Test Execution Report

**Date**: [DATE]
**Tester**: [NAME]
**Environment**: [Local/Staging/Production]

### Test Results
- Passed: X/8 scenarios
- Failed: X/8 scenarios
- Blocked: X/8 scenarios

### Issues Found
1. [Issue description, severity, steps to reproduce]

### Performance Metrics
- Homepage load: Xs
- Stock list load: Xs
- Leaderboard update: Xs

### Recommendations
1. [Priority fixes needed]
2. [Nice-to-have improvements]

### Sign-off
- [ ] Ready for production
- [ ] Needs fixes (list below)
```

---
*Quickstart guide created: 2025-09-07*