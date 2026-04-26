# How to Disable Email Rate Limiting in Supabase

## Problem
Your authentication is failing with this error:
```
email rate limit exceeded
code: over_email_send_rate_limit
```

This means **Supabase has email rate limiting enabled**, which blocks signup and login attempts.

## Solution - 3 Simple Steps

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Log in with your account

### Step 2: Select Your Project
1. Click on project: **tttvpngbysnohadjqkjn** (OriginLab-ai-app)

### Step 3: Disable Email Rate Limiting
1. In left sidebar, click: **Authentication**
2. Click tab: **Providers**
3. Find: **Email** provider
4. Click on **Email** to expand settings
5. Look for toggle: **"Email rate limiting"** or **"Rate limit"**
6. Toggle it **OFF** (should turn gray)
7. Click **Save** button
8. Wait 30 seconds for changes to take effect

## Verify It's Fixed

Run this command to test:
```bash
node scripts/test-auth.mjs
```

You should see: `[v0] Sign up SUCCESS`

## Still Not Working?

If you still see the rate limit error:

1. **Check the setting again**
   - Make sure you toggled the RIGHT setting
   - Some versions have "Email Rate Limiting" others have "Rate limit"
   
2. **Clear Supabase cache**
   - Refresh the page: F5
   - Wait another 30 seconds
   - Try again

3. **Check if it's a different limit**
   - In Authentication → Providers → Email
   - Also disable: "Max confirmations" or similar limits
   - Save all changes

4. **Check project status**
   - Go to: Settings → General
   - Make sure project is "Active"
   - Not paused or limited

## Test After Fixing

Once disabled, try:

1. **Web UI Test:**
   - Go to: http://localhost:3000/auth/test
   - Click "Test Sign Up"
   - You should see success message

2. **Command Line Test:**
   ```bash
   node scripts/test-auth.mjs
   ```
   Should show: `[v0] Sign up SUCCESS`

3. **Manual Test:**
   - Go to: http://localhost:3000/auth/sign-up
   - Email: anything@example.com
   - Password: Test123!@#
   - Repeat: Test123!@#
   - Click "Sign up"
   - Should work!

## Screenshots Location

If you need visual help, the Supabase documentation has screenshots:
https://supabase.com/docs/guides/auth/rate-limits

Look for section: "Disabling rate limits"

## Common Issues

**"I don't see the toggle"**
- You might be in wrong section
- Must be: Authentication → Providers → Email (not Settings)

**"I toggled it but still getting error"**
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 1 minute for Supabase to sync
- Try from incognito window

**"Email rate limiting toggle is grayed out"**
- Might need to enable something else first
- Check other toggles in Email provider section
- Contact Supabase support if still stuck

## Still Stuck?

Contact Supabase support:
- Dashboard → Help → Contact Support
- Include error: "over_email_send_rate_limit"
- Include project: tttvpngbysnohadjqkjn
