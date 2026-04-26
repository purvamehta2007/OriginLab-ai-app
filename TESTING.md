# LabGenius AI - Testing Guide

## Pre-Deployment Testing Checklist

### 1. Authentication & Authorization
- [ ] User can sign up with email and password
- [ ] Email validation works (invalid emails rejected)
- [ ] Password strength requirements enforced
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect password
- [ ] Logged-in user cannot access login page (redirects to dashboard)
- [ ] Unauthenticated user cannot access dashboard (redirects to login)
- [ ] Logout works correctly
- [ ] Session persists on page refresh

### 2. Dashboard & Navigation
- [ ] Dashboard displays user's email
- [ ] Sidebar navigation works on desktop
- [ ] Mobile menu toggle works
- [ ] All navigation links lead to correct pages
- [ ] User info displays correctly
- [ ] Credits display properly

### 3. Experiment Management
- [ ] User can create new experiment
- [ ] Experiment creation form validates required fields
- [ ] Created experiment appears in experiments list
- [ ] Experiments list shows all user's experiments
- [ ] Experiment details display correctly
- [ ] Experiment status updates work

### 4. AI Planning API
- [ ] Generate plan request accepts valid input
- [ ] Plan generation fails gracefully with invalid experiment ID
- [ ] Plan generation fails with unauthorized user
- [ ] Plan generation returns proper error messages
- [ ] Request validation catches missing fields
- [ ] Response contains valid JSON structure

### 5. AI Analysis API
- [ ] Analysis request with valid data succeeds
- [ ] Analysis fails with invalid experiment ID
- [ ] Analysis fails with unauthorized access
- [ ] Error messages are descriptive
- [ ] Partial data (missing fields) handled gracefully

### 6. Progress API
- [ ] Update progress requires valid status
- [ ] Invalid progress percentages rejected (>100, <0)
- [ ] Progress update fails with non-existent experiment
- [ ] Unauthorized users cannot update progress
- [ ] Fetching progress returns correct data
- [ ] Completed status sets completion timestamp

### 7. Error Handling
- [ ] Invalid JSON in request body returns 400
- [ ] Missing required fields return 400 with details
- [ ] Unauthorized requests return 401
- [ ] Non-existent resources return 404
- [ ] Server errors return 500 with message
- [ ] Validation errors include field information
- [ ] Error responses are consistent in format

### 8. Security
- [ ] CORS headers are properly set
- [ ] User can only access their own experiments
- [ ] User cannot access other users' experiments
- [ ] API rate limiting works (if implemented)
- [ ] Authentication tokens expire properly
- [ ] No sensitive data in error messages

### 9. Database
- [ ] Database migrations ran successfully
- [ ] Tables created with correct structure
- [ ] Indexes created for performance
- [ ] RLS policies enforced
- [ ] Foreign key constraints working
- [ ] Data persists across sessions

### 10. UI/UX
- [ ] Buttons are accessible (keyboard navigation)
- [ ] Forms have proper labels
- [ ] Error messages display clearly
- [ ] Loading states show during operations
- [ ] Success notifications appear after actions
- [ ] Design is responsive on mobile

### 11. Performance
- [ ] Pages load within 3 seconds
- [ ] API responses are under 2 seconds
- [ ] No console errors on page load
- [ ] No memory leaks with repeated actions
- [ ] Images load properly

### 12. Edge Cases & Error Scenarios
- [ ] Empty experiments list displays properly
- [ ] Very long experiment titles display correctly (with truncation)
- [ ] Network request fails gracefully
- [ ] User logs out during API request
- [ ] Navigating back uses browser cache appropriately
- [ ] Rapidly clicking buttons doesn't cause duplicates

## Automated Testing Setup

### Unit Tests
```bash
npm test
```

### Integration Tests
Tests for API routes, database operations, and authentication flows.

### E2E Tests (Manual for now)
1. Create experiment → View details → Update status → Delete
2. Login → Dashboard → Experiments → Settings → Logout
3. Plan generation → Analysis → Result viewing

## Manual Testing Procedures

### Test Experiment Creation
1. Login with test account
2. Click "New Experiment"
3. Fill in all fields
4. Click "Create Experiment"
5. Verify redirect to experiment details
6. Verify in experiments list

### Test API Plan Generation
```bash
curl -X POST http://localhost:3000/api/experiments/plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "experimentId": "test-id",
    "title": "Test Experiment",
    "description": "Test description",
    "hypothesis": "Test hypothesis"
  }'
```

### Test Error Handling
1. Send request with invalid JSON
2. Send request without required fields
3. Use invalid experiment ID
4. Use unauthorized user's experiment ID
5. Send extremely large payloads

## Known Issues & Limitations

### Current Limitations
- [ ] Real-time updates not yet implemented
- [ ] File upload not yet implemented
- [ ] Export results not yet implemented
- [ ] Collaboration features not yet implemented

### Known Issues
- [ ] (None at time of writing)

## Testing Environment Setup

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
POSTGRES_URL=<your-postgres-url>
```

### Test Data
Use test@example.com / testpassword123 for testing.

## Deployment Verification

Before deploying to production:

1. All tests pass ✓
2. No console errors ✓
3. Error handling covers all endpoints ✓
4. Security measures in place ✓
5. Environment variables configured ✓
6. Database migrations run ✓
7. RLS policies enabled ✓
8. Rate limiting configured ✓
9. Error logging enabled ✓
10. Performance acceptable ✓

## Post-Deployment Monitoring

- Monitor error logs regularly
- Track API response times
- Check user feedback
- Monitor database performance
- Watch for security issues
- Review usage patterns
