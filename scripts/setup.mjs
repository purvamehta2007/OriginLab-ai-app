import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

// Get connection string from environment
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('[v0] ERROR: POSTGRES_URL environment variable is not set');
  console.error('[v0] Please ensure Supabase is properly configured with POSTGRES_URL in your environment');
  process.exit(1);
}

async function setupDatabase() {
  const pool = new Pool({ connectionString });

  try {
    console.log('[v0] Connecting to database...');
    const client = await pool.connect();
    console.log('[v0] Connected successfully');

    // Read SQL file
    const sqlPath = path.join(__dirname, '01_create_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('[v0] Executing database migrations...');

    // Execute the entire SQL file
    await client.query(sql);

    console.log('[v0] Database setup completed successfully!');

    // Verify tables
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = result.rows.map(r => r.table_name);
    console.log(`[v0] Created tables: ${tables.join(', ')}`);

    client.release();
  } catch (error) {
    console.error('[v0] ERROR:', error.message);
    if (error.detail) console.error('[v0] Details:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
