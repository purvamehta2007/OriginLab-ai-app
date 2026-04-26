import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[v0] Testing full authentication flow...');
console.log('[v0] SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[v0] SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test email
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

console.log('\n--- STEP 1: Create user via admin API ---');
try {
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      created_via: 'admin_test',
    },
  });

  if (error) {
    console.error('[v0] ERROR creating user:', error.message);
    process.exit(1);
  }

  console.log('[v0] User created successfully');
  console.log('[v0] User ID:', data.user?.id);
  console.log('[v0] User Email:', data.user?.email);
  console.log('[v0] Email Confirmed:', data.user?.email_confirmed_at ? 'YES' : 'NO');
} catch (err) {
  console.error('[v0] Exception creating user:', err.message);
  process.exit(1);
}

console.log('\n--- STEP 2: Login with created user ---');
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.error('[v0] ERROR logging in:', error.message);
    process.exit(1);
  }

  console.log('[v0] Login successful');
  console.log('[v0] Session created:', data.session ? 'YES' : 'NO');
  console.log('[v0] User ID:', data.user?.id);
  console.log('[v0] User Email:', data.user?.email);
} catch (err) {
  console.error('[v0] Exception logging in:', err.message);
  process.exit(1);
}

console.log('\n--- STEP 3: List all users ---');
try {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('[v0] ERROR listing users:', error.message);
    process.exit(1);
  }

  console.log('[v0] Total users in database:', data.users?.length || 0);
  const recentUser = data.users?.find(u => u.email === testEmail);
  if (recentUser) {
    console.log('[v0] Test user found in database');
    console.log('[v0] Email confirmed:', recentUser.email_confirmed_at ? 'YES' : 'NO');
  }
} catch (err) {
  console.error('[v0] Exception listing users:', err.message);
  process.exit(1);
}

console.log('\n--- AUTHENTICATION FULLY WORKING ---');
console.log('[v0] ✓ All tests passed!');
process.exit(0);
