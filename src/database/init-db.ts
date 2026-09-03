import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { config } from '../config/index.js';

export async function initializeDatabase() {
  const isPostgres = config.database.client === 'postgres';
  const schemaFile = isPostgres ? 'schema-postgres.sql' : 'schema-mysql.sql';
  const schemaPath = path.resolve(process.cwd(), 'database', schemaFile);

  console.log('Reading schema from:', schemaPath);
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing database schema initialization for [' + config.database.client.toUpperCase() + ']...');
  await db.raw(sql);
  console.log('✅ Database schema and seed data loaded successfully!');
  await db.destroy();
}

if (process.argv[1] && process.argv[1].endsWith('init-db.ts')) {
  initializeDatabase().catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
}
