# Supabase Authentication Setup Guide

## Issue Summary
Your Supabase project has email rate limiting and verification requirements enabled by default, which is preventing users from logging in and signing up.

## Fix Steps

### Step 1: Disable Email Rate Limiting
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **OriginLab-ai-app**
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Scroll down to **Email Rate Limiting**
5. **Turn OFF** the rate limiting toggle
6. Click **Save**

### Step 2: Disable Email Verification (Optional but Recommended for Development)
1. In the same **Authentication** → **Providers** → **Email** section
2. Look for **Confirm email** toggle
3. **Turn OFF** this toggle (users won't need to verify their email to log in)
4. Click **Save**

### Step 3: Disable SMTP Rate Limiting
1. Navigate to: **Project Settings** → **Auth**
2. Scroll to **Rate Limiting** section
3. Set the following values to very high (or disable):
   - **Email Rate Limit**: Set to 9999 per hour (or your desired limit)
   - **SMS Rate Limit**: Set to 9999 per hour
4. Click **Save**

### Step 4: Allow Multiple Signups with Same Email (Optional)
1. Go to: **Project Settings** → **Auth** → **Security**
2. Look for **Allow multiple signups** or **Duplicate email** settings
3. Enable this if you want to allow the same email to sign up multiple times
4. Click **Save**

### Step 5: Create Database Tables
Run the migration script to create all necessary tables:
```bash
cd /vercel/share/v0-project
node --env-file-if-exists=/vercel/share/.env.project scripts/02_run_migration.mjs
```

## Expected Behavior After Setup
- ✅ Users can sign up without email verification
- ✅ Users can log in immediately
- ✅ Multiple emails can be sent without rate limiting
- ✅ No restrictions on signup attempts

## Troubleshooting

### Still getting "Invalid credentials" error
- Ensure the user account exists: Check **Authentication** → **Users** in Supabase dashboard
- Check if email verification is still required

### "Too many requests" error
- Rate limiting is still enabled - follow Step 1 again
- Clear your browser cookies and try again

### Database tables not created
- Check that all environment variables are set correctly in Vercel project settings
- Run the migration script manually in Supabase SQL Editor:
  1. Go to **SQL Editor** in Supabase dashboard
  2. Create a new query
  3. Copy the content from `scripts/01_create_schema.sql`
  4. Run the query

## Environment Variables
Verify these are set in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`
- `POSTGRES_DATABASE`
- `POSTGRES_HOST`

All environment variables are already configured automatically via the Supabase integration in v0.
