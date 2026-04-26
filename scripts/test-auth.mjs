import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tttvpngbysnohadjqkjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dHZwbmdieXNub2hhZGpxa2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTAyMDksImV4cCI6MjA5MjcyNjIwOX0.QouJXH0pqqFMM8sez0MdnBZ9rOiaWVFMuGMa5Q8Dh6U';

console.log('[v0] Testing Supabase connection...');
console.log('[v0] URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Sign up
console.log('\n[v0] Test 1: Signing up test user...');
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: 'test' + Math.random().toString().slice(2, 8) + '@test.com',
  password: 'Test123!@#',
});

if (signUpError) {
  console.error('[v0] Sign up ERROR:', signUpError.message);
  console.error('[v0] Error details:', signUpError);
} else {
  console.log('[v0] Sign up SUCCESS');
  console.log('[v0] User created:', signUpData.user?.id);
  console.log('[v0] Session:', signUpData.session ? 'YES' : 'NO');
  console.log('[v0] User confirmed:', signUpData.user?.confirmed_at ? 'YES' : 'NO');
}

// Test 2: Check authentication settings
console.log('\n[v0] Test 2: Checking auth configuration...');
const { data: settings, error: settingsError } = await supabase
  .from('auth.audit_log_entries')
  .select('*')
  .limit(1)
  .catch(e => ({ data: null, error: e }));

if (settingsError) {
  console.log('[v0] Auth config check note:', settingsError.message);
} else {
  console.log('[v0] Auth system is accessible');
}

// Test 3: Get all users
console.log('\n[v0] Test 3: Listing auth users...');
const { data: users, error: usersError } = await supabase.auth.admin.listUsers().catch(e => ({ 
  data: null, 
  error: e 
}));

if (usersError) {
  console.error('[v0] Cannot list users:', usersError.message);
} else {
  console.log('[v0] Total users in system:', users?.users?.length || 0);
  if (users?.users) {
    users.users.slice(0, 3).forEach(u => {
      console.log(`  - ${u.email} (confirmed: ${!!u.confirmed_at})`);
    });
  }
}

console.log('\n[v0] Test complete!');
