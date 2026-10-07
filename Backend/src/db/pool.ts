import pg from 'pg'
import { env } from '../config/env.js'

/** Shared PostgreSQL connection pool. */
export const pool = new pg.Pool({ connectionString: env.databaseUrl })