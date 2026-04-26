import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('[v0] Reading migration SQL...');
    const sqlFile = path.join(__dirname, '01_create_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('[v0] Connecting to Supabase...');
    
    // Split SQL into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`[v0] Found ${statements.length} statements to execute`);

    // Execute via Supabase's RPC endpoint
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const stmtNum = i + 1;
      
      try {
        console.log(`[v0] Executing ${stmtNum}/${statements.length}...`);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql_exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({ sql: stmt })
        });

        if (response.ok) {
          console.log(`[v0] Statement ${stmtNum} executed`);
        } else {
          const text = await response.text();
          console.log(`[v0] Statement ${stmtNum} status: ${response.status}`);
          if (text) console.log(`[v0] Response: ${text.substring(0, 200)}`);
        }
      } catch (err) {
        console.error(`[v0] Error executing statement ${stmtNum}: ${err.message}`);
      }
    }

    console.log('[v0] Database setup attempt completed');
    process.exit(0);

  } catch (error) {
    console.error('[v0] Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
