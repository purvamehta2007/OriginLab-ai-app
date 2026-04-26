# 🔐 Authentication Fix Guide

Your app's authentication is almost ready! You just need to disable a few Supabase settings that are blocking logins and signups.

## The Problem
Supabase has email rate limiting and verification enabled by default, preventing users from:
- Signing up
- Logging in
- Sending multiple emails

## The Solution (5 minutes)

### Quick Setup Steps

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `OriginLab-ai-app`

2. **Disable Email Rate Limiting**
   - Left menu → `Authentication`
   - Click on `Providers` tab
   - Find `Email` provider
   - Toggle **OFF**: "Email Rate Limiting"
   - Click `Save`

3. **Disable Email Verification (Recommended for Development)**
   - Still in `Email` provider settings
   - Toggle **OFF**: "Confirm email"
   - Click `Save`

4. **Disable Auth Rate Limiting**
   - Go to `Project Settings` (bottom left gear icon)
   - Click `Auth`
   - Find `Rate Limiting` section
   - Change `Email` limit to: `9999` (or remove limit)
   - Change `SMS` limit to: `9999`
   - Click `Save`

5. **Test Authentication**
   - Go back to your app
   - Try signing up with any email
   - Try logging in

## What Changes

| Setting | Before | After |
|---------|--------|-------|
| Email Rate Limit | 10 per hour | Unlimited |
| Email Verification | Required | Optional |
| Multiple Signups | Blocked | Allowed |
| Login Attempts | Rate limited | Unlimited |

## Testing the Fix

### Sign Up Test
1. Go to `/auth/sign-up`
2. Enter any email (e.g., `test@example.com`)
3. Enter password
4. Click "Sign up"
5. Should see success message immediately

### Login Test
1. Go to `/auth/login`
2. Enter the email you just signed up with
3. Enter password
4. Click "Login"
5. Should log in successfully

## Still Having Issues?

### "Invalid credentials" error
- Make sure you signed up first before trying to log in
- Check Supabase dashboard → `Authentication` → `Users` to confirm the user exists

### "Too many requests" error  
- Email rate limiting is still enabled
- Go back and toggle it OFF again
- Clear browser cookies and try again

### Email not sending
- Check that you've disabled "Confirm email" toggle
- Or set email limit very high if you need email verification

## Environment Variables
All required environment variables are already configured automatically:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Database credentials

## Next Steps
After authentication works:
1. Run database migrations: `node scripts/02_run_migration.mjs`
2. Create user profiles for new signups
3. Implement protected routes

## Need Help?
- Check the full setup guide: `SUPABASE_SETUP.md`
- Supabase Docs: https://supabase.com/docs/guides/auth
- GitHub Issues: https://github.com/supabase/supabase/issues
