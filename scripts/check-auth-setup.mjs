#!/usr/bin/env node
/**
 * Authentication Setup Checker
 * Verifies that Supabase is configured correctly for authentication
 */

console.log('\n🔐 Authentication Setup Checker\n');
console.log('=' .repeat(50));

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'POSTGRES_URL',
];

console.log('\n📋 Environment Variables:\n');

let allEnvVarsSet = true;
requiredEnvVars.forEach((envVar) => {
  const isSet = !!process.env[envVar];
  const status = isSet ? '✅' : '❌';
  console.log(`${status} ${envVar}: ${isSet ? 'SET' : 'MISSING'}`);
  if (!isSet) allEnvVarsSet = false;
});

// Check file structure
console.log('\n📁 Project Structure:\n');

const requiredFiles = [
  '/vercel/share/v0-project/app/auth/login/page.tsx',
  '/vercel/share/v0-project/app/auth/sign-up/page.tsx',
  '/vercel/share/v0-project/app/auth/callback/route.ts',
  '/vercel/share/v0-project/lib/supabase/client.ts',
  '/vercel/share/v0-project/lib/supabase/server.ts',
];

import fs from 'fs';

let allFilesExist = true;
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  const fileName = file.split('/').pop();
  console.log(`${status} ${fileName}`);
  if (!exists) allFilesExist = false;
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (allEnvVarsSet && allFilesExist) {
  console.log('✅ All checks passed!\n');
  console.log('Your authentication setup is complete.');
  console.log('\n📝 Next steps:');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select project: OriginLab-ai-app');
  console.log('3. Go to Authentication → Providers → Email');
  console.log('4. Toggle OFF: Email Rate Limiting');
  console.log('5. Toggle OFF: Confirm email');
  console.log('6. Click Save');
  console.log('7. Test at: http://localhost:3000/auth/test\n');
} else {
  console.log('⚠️  Some checks failed!\n');
  if (!allEnvVarsSet) {
    console.log('❌ Missing environment variables. Please set them in Vercel.');
  }
  if (!allFilesExist) {
    console.log('❌ Missing authentication files. Please check your project.');
  }
  console.log();
}

console.log('📖 For more info: see AUTH_README.md or AUTHENTICATION_FIX.md\n');
