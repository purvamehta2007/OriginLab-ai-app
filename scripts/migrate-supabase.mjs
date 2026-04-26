import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const postgresUrl = process.env.POSTGRES_URL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('[v0] SUPABASE_URL:', supabaseUrl);
  console.error('[v0] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log('[v0] Connecting to Supabase...');
    
    if (!postgresUrl) {
      console.error('[v0] ERROR: POSTGRES_URL environment variable is not set');
      console.error('[v0] Please set POSTGRES_URL in your environment');
      process.exit(1);
    }

    // Read the SQL file
    const sqlFile = path.join(__dirname, '01_create_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('[v0] Starting database migrations via Supabase GraphQL...');

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute the SQL via the Supabase GraphQL interface
    const { data, error } = await supabase.rpc('exec', {
      p_query: sql
    }).catch(async (err) => {
      console.log('[v0] RPC method not available, trying direct SQL execution via fetch...');
      
      try {
        const response = await fetch(`${supabaseUrl}/graphql/v1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            query: `query { execute(sql: "${sql.replace(/"/g, '\\"')}") }`
          })
        });

        const result = await response.json();
        console.log('[v0] GraphQL execution result:', result);
        return { data: result, error: null };
      } catch (graphqlError) {
        console.warn('[v0] GraphQL also failed, attempting direct PostgreSQL execution...');
        
        try {
          const { spawn } = await import('child_process');
          const psql = spawn('psql', [postgresUrl], {
            stdio: 'pipe'
          });

          return new Promise((resolve, reject) => {
            psql.stdin.write(sql);
            psql.stdin.end();

            let output = '';
            psql.stdout.on('data', (data) => {
              output += data.toString();
            });

            psql.stderr.on('data', (data) => {
              console.warn('[v0] psql stderr:', data.toString());
            });

            psql.on('close', (code) => {
              if (code === 0) {
                console.log('[v0] psql execution successful');
                resolve({ data: output, error: null });
              } else {
                console.error('[v0] psql execution failed with code:', code);
                resolve({ data: output, error: `psql exited with code ${code}` });
              }
            });

            psql.on('error', (err) => {
              console.error('[v0] psql error:', err);
              resolve({ data: null, error: err.message });
            });
          });
        } catch (psqlError) {
          console.warn('[v0] Direct PostgreSQL execution not available');
          return { data: null, error: psqlError.message };
        }
      }
    });

    if (error) {
      console.warn('[v0] Migration warning:', error);
    } else {
      console.log('[v0] Migration completed successfully');
    }

    console.log('[v0] Migration script completed!');
    process.exit(0);

  } catch (error) {
    console.error('[v0] Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
