// Prisma 7: Use Driver Adapter for PostgreSQL
import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Parse DATABASE_URL manually to ensure password is a string
const dbUrl = new URL(process.env.DATABASE_URL!);

// Create PostgreSQL pool with explicit config
const pool = new pg.Pool({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port),
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: String(dbUrl.password), // Ensure password is a string
});

// Create PostgreSQL adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
export const prisma = new PrismaClient({ adapter });

export default prisma;
