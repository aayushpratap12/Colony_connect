import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

db.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export const connectDb = async () => {
  const client = await db.connect();
  client.release();
  console.log('[DB] PostgreSQL connected');
};
