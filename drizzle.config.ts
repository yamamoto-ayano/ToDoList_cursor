import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'd1',
  dbCredentials: {
    url: process.env.D1_DATABASE_URL || '',
  },
} satisfies Config; 