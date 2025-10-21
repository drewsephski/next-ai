import { drizzle } from 'drizzle-orm/neon-http';

// Validate that DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required but not set');
}

export const db = drizzle(databaseUrl);
