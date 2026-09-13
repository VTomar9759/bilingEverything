import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '../migrations/drop_org_print_columns.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  connectionString: 'postgresql://postgres:VikasBiling@db.naqdqfycjmsbpmwqcnzm.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database...');
    console.log('Executing migration SQL:\n', sql);
    await client.query(sql);
    console.log('SUCCESS: Migration executed successfully! Columns invoice_footer and print_type dropped from organization table.');
  } catch (err) {
    console.error('ERROR: Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
