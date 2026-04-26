# ✅ Supabase Authentication Setup Checklist

Complete these steps in order to enable authentication in your app.

## Phase 1: Understand the Issue (2 minutes)
- [ ] **Read AUTH_README.md** to understand what needs to be fixed
- [ ] **Know:** Email rate limiting is blocking your login/signup

## Phase 2: Disable Supabase Rate Limiting (5 minutes)

### Step 1: Go to Supabase Dashboard
- [ ] Open: https://supabase.com/dashboard
- [ ] Log in to your account
- [ ] Find and select project: **OriginLab-ai-app**

### Step 2: Disable Email Rate Limiting
- [ ] Click **Authentication** in left sidebar
- [ ] Click **Providers** tab
- [ ] Find the **Email** provider section
- [ ] Look for "Email Rate Limiting" toggle
- [ ] Toggle it to **OFF** (switch should be gray/left)
- [ ] Click **Save** button at bottom

### Step 3: Disable Email Verification (Recommended)
- [ ] Still in the **Email** provider section
- [ ] Look for "Confirm email" toggle
- [ ] Toggle it to **OFF** (switch should be gray/left)
- [ ] Click **Save** button

### Step 4: Optional - Increase Auth Rate Limits
- [ ] Go to **Project Settings** (gear icon, bottom left)
- [ ] Click **Auth** tab
- [ ] Find **Rate Limiting** section
- [ ] Set "Email" to: **9999** (or remove limit)
- [ ] Set "SMS" to: **9999**
- [ ] Click **Save**

## Phase 3: Test Your Setup (3 minutes)

### Test 1: Check Auth Status
- [ ] Open your app: http://localhost:3000/auth/test
- [ ] Page should load without errors
- [ ] You should see either:
  - "You are logged in" with email address, OR
  - "You are not logged in"

### Test 2: Sign Up
- [ ] Go to: http://localhost:3000/auth/sign-up
- [ ] Enter a test email: `test1@example.com`
- [ ] Enter password: `Test123!@#`
- [ ] Repeat password: `Test123!@#`
- [ ] Click "Sign up"
- [ ] Should see success message: "Account Created"
- [ ] Should NOT see error message

### Test 3: Log In
- [ ] Go to: http://localhost:3000/auth/login
- [ ] Enter email: `test1@example.com`
- [ ] Enter password: `Test123!@#`
- [ ] Click "Login"
- [ ] Should log in successfully
- [ ] Should redirect to home page

### Test 4: Verify Status
- [ ] Go back to: http://localhost:3000/auth/test
- [ ] Should now show "You are logged in"
- [ ] Should display your email address
- [ ] Should show a logout button

### Test 5: Test Multiple Signups
- [ ] Go to: http://localhost:3000/auth/sign-up
- [ ] Try signing up with 3 different emails
- [ ] All 3 should succeed
- [ ] No "too many requests" errors

## Phase 4: Optional - Database Setup (5 minutes)

### Verify Environment Variables
- [ ] Open Vercel project settings
- [ ] Check **Vars** section
- [ ] Verify these exist:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] POSTGRES_URL

### Run Database Migrations
- [ ] Open terminal in project directory
- [ ] Run: `node scripts/check-auth-setup.mjs`
- [ ] Verify all checks pass (✅)
- [ ] Run: `node scripts/02_run_migration.mjs`
- [ ] Wait for script to complete
- [ ] Should see: "Migration completed successfully"

### Verify Database Tables
- [ ] Go to Supabase dashboard
- [ ] Click **SQL Editor**
- [ ] Run this query:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```
- [ ] Should see tables like: users, experiments, etc.

## Phase 5: Troubleshooting (if needed)

### ❌ "Invalid credentials" Error
- [ ] Check that you signed up first (don't skip Phase 3, Test 2)
- [ ] Go to Supabase → **Authentication** → **Users**
- [ ] Verify your test user exists
- [ ] Try signing up again

### ❌ "Too many requests" Error
- [ ] Email rate limiting is still enabled
- [ ] Go back to Phase 2, Step 2
- [ ] Make sure the toggle is **OFF** (gray)
- [ ] Click **Save** again
- [ ] Wait 1 minute and try again

### ❌ "Confirm email" Required
- [ ] "Confirm email" toggle is still ON
- [ ] Go back to Phase 2, Step 3
- [ ] Toggle it to **OFF**
- [ ] Click **Save**

### ❌ Database Tables Not Created
- [ ] Run: `node scripts/check-auth-setup.mjs`
- [ ] Check for error messages
- [ ] Run: `node scripts/02_run_migration.mjs` again
- [ ] If still failing, go to Supabase SQL Editor and run `scripts/01_create_schema.sql` manually

## Phase 6: Verify Complete Setup

- [ ] ✅ Can sign up without errors
- [ ] ✅ Can log in without errors
- [ ] ✅ Auth test page shows logged-in status
- [ ] ✅ Can send multiple emails without rate limit errors
- [ ] ✅ Database tables exist (if running migrations)

## 🎉 You're Done!

Once all tests pass, your authentication is fully functional!

### Next Steps:
1. **Build protected pages** for logged-in users
2. **Add user profiles** to store additional data
3. **Set up email templates** for notifications
4. **Deploy to production** when ready

### Useful Links:
- **Auth Test Page**: http://localhost:3000/auth/test
- **Sign Up Page**: http://localhost:3000/auth/sign-up
- **Login Page**: http://localhost:3000/auth/login
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Docs**: https://supabase.com/docs/guides/auth

### Quick Reference:
| Page | URL | Purpose |
|------|-----|---------|
| Test Auth | `/auth/test` | Check login status |
| Sign Up | `/auth/sign-up` | Create new account |
| Login | `/auth/login` | Log in to account |
| Signup Success | `/auth/sign-up-success` | After signup |
| Error Page | `/auth/error` | Authentication errors |

---

**Questions?** Check the guides:
- **AUTH_README.md** - Full setup guide
- **AUTHENTICATION_FIX.md** - Troubleshooting
- **FIX_SUMMARY.md** - What was changed
