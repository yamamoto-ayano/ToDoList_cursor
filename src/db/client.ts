import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/d1';
import * as schema from './schema';

export function getDrizzleClient(db: D1Database) {
  return drizzle(db, { schema });
} 