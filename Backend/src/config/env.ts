import 'dotenv/config'

export const env = {
  /** Port the API server listens on. */
  port: Number(process.env.PORT ?? 3000),
  /** PostgreSQL connection string. */
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/abadaglobal',
} as const