import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// DIAGNOSTICO TEMPORAL: confirmar que hostname/puerto lee Node en runtime
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL)
    console.log('[db] connecting to host:', url.hostname, 'port:', url.port)
  } catch {
    console.log('[db] DATABASE_URL no parseable como URL')
  }
} else {
  console.log('[db] DATABASE_URL no esta definida')
}

const globalParaDb = globalThis as unknown as { pool: Pool | undefined }

const pool =
  globalParaDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

if (process.env.NODE_ENV !== 'production') globalParaDb.pool = pool

export const db = drizzle(pool, { schema })
