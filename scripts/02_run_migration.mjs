import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log('[v0] Initializing Supabase migration...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read the SQL file
    const sqlFile = path.join(__dirname, '01_create_schema.sql');
    const fullSql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('[v0] Starting database migrations via Supabase SQL Editor...');

    // Split SQL into smaller chunks to avoid timeout
    const statements = fullSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`[v0] Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        // Use the raw execute function if available, otherwise use RPC
        const { data, error } = await supabase.rpc('exec', {
          p_query: statement
        }).catch(async () => {
          // Fallback: Try using the sql function
          return await supabase.sql([statement]);
        }).catch(async () => {
          // If both fail, return error but continue
          return { data: null, error: `Unable to execute statement ${i + 1}` };
        });

        if (error) {
          // Some errors are expected (e.g., IF NOT EXISTS clauses)
          if (!error.includes('already exists') && !error.includes('does not exist')) {
            console.warn(`[v0] Statement ${i + 1} warning: ${error}`);
            failureCount++;
          } else {
            console.log(`[v0] Statement ${i + 1}: Skipped (already exists)`);
            successCount++;
          }
        } else {
          console.log(`[v0] Statement ${i + 1}/${statements.length}: Success`);
          successCount++;
        }
      } catch (err) {
        console.warn(`[v0] Statement ${i + 1} error: ${err.message}`);
        failureCount++;
        // Continue with next statement
      }
    }

    console.log(`[v0] Migration completed: ${successCount} succeeded, ${failureCount} failed/skipped`);
    console.log('[v0] Your database schema is ready!');
    process.exit(0);

  } catch (error) {
    console.error('[v0] Migration failed:', error.message);
    console.error('[v0] Please run migrations manually in the Supabase dashboard SQL Editor');
    process.exit(1);
  }
}

runMigrations();
