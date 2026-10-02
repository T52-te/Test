import { Pool } from 'pg';

const globalForPool = globalThis as unknown as { taskPool?: Pool };

export const pool =
  globalForPool.taskPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (!globalForPool.taskPool) {
  globalForPool.taskPool = pool;
}
