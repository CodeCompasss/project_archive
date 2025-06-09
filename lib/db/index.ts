import "server-only";

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { createPool } from '@vercel/postgres';
import * as schema from './schema';

// Memoize the database connection to avoid re-creating it on every call
// This is good practice for performance in a serverless environment.
let cachedDb: DB | null = null;

export type DB = ReturnType<typeof drizzle<typeof schema>>; // Exporting the DB type

export function getDb(): DB {
  console.log("Attempting to get DB instance...");
  if (cachedDb) {
    console.log("Returning cached DB instance.");
    return cachedDb;
  }

  console.log("Loading environment variables for DB connection...");
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "LOADED" : "NOT_LOADED");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "LOADED" : "NOT_LOADED");

  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    console.error("FATAL: Database connection string not found in environment variables.");
    throw new Error('Database connection string not found. Please set either POSTGRES_URL or DATABASE_URL environment variable.');
  }

  const connectionString: string = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
  console.log("Using connection string (first 10 chars):", connectionString.substring(0, 10) + "...");

  const pool = createPool({
    connectionString: connectionString,
    ssl: true,
    max: 1
  });

  cachedDb = drizzle(pool, { schema });
  console.log("Drizzle DB instance created.");

  return cachedDb;
}
