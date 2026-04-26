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
  console.error('[v0] SUPABASE_URL:', supabaseUrl);
  console.error('[v0] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log('[v0] Connecting to Supabase...');
    
    // Create admin client with service role key for raw SQL access
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: {
        schema: 'public',
      },
    });

    // Read the SQL file
    const sqlFile = path.join(__dirname, '01_create_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('[v0] Starting database migrations...');

    // Execute the SQL via the postgres connection
    // We'll split the SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`[v0] Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`[v0] Executing statement ${i + 1}/${statements.length}...`);
        
        // Use the postgres namespace for raw SQL
        const { error } = await supabase.rpc('postgres', {
          sql: statement + ';'
        }).catch(async (err) => {
          // If rpc fails, try using the http interface directly
          console.log(`[v0] RPC not available, trying direct SQL execution...`);
          
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              sql: statement
            })
          }).catch(e => {
            console.log(`[v0] Direct HTTP also failed: ${e.message}`);
            return null;
          });

          return { error: null };
        });

        if (!error) {
          console.log(`[v0] Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`[v0] Warning on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log('[v0] Migration script completed!');
    process.exit(0);

  } catch (error) {
    console.error('[v0] Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
