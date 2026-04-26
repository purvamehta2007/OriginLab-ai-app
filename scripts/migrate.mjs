import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('[v0] ERROR: Missing POSTGRES_URL environment variable');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    console.log('[v0] Connecting to database...');
    await client.connect();
    console.log('[v0] Connected successfully');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '01_create_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('[v0] Starting database migrations...');
    
    // Execute the entire SQL file
    try {
      await client.query(sql);
      console.log('[v0] Migration executed successfully');
    } catch (err) {
      console.error('[v0] Migration error:', err.message);
      throw err;
    }
    
    // Verify tables were created
    console.log('[v0] Verifying tables...');
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`[v0] Created tables: ${result.rows.map(r => r.table_name).join(', ')}`);
    console.log('[v0] All migrations completed successfully!');
    
  } catch (error) {
    console.error('[v0] Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
