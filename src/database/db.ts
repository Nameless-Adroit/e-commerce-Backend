import knex, { Knex } from 'knex';
import { config } from '../config/index.js';

const isPostgres = config.database.client === 'postgres';

const knexConfig: Knex.Config = {
  client: isPostgres ? 'pg' : 'mysql2',
  connection: isPostgres
    ? {
        host: config.database.postgres.host,
        port: config.database.postgres.port,
        database: config.database.postgres.database,
        user: config.database.postgres.user,
        password: config.database.postgres.password,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: config.database.mysql.host,
        port: config.database.mysql.port,
        database: config.database.mysql.database,
        user: config.database.mysql.user,
        password: config.database.mysql.password,
      },
  pool: {
    min: 2,
    max: 10,
  },
};

export const db = knex(knexConfig);

export async function testDatabaseConnection(): Promise<void> {
  try {
    if (isPostgres) {
      await db.raw('SELECT 1+1 AS result');
      console.log('✅ PostgreSQL connection successfully established.');
    } else {
      await db.raw('SELECT 1+1 AS result');
      console.log('✅ MySQL connection successfully established.');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.warn('⚠️ Please ensure database service is running or check .env configuration.');
  }
}
