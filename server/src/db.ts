import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Forcibly read .env bypassing system environment variable caches
try {
  const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  const dbMatch = envFile.match(/DATABASE_URL=(.+)/);
  if (dbMatch && dbMatch[1]) {
    process.env.DATABASE_URL = dbMatch[1].trim();
  }
} catch (e) {
  // Ignore error if file doesn't exist
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const isLocal = process.env.DATABASE_URL.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err: any) => {
  console.error("PostgreSQL error", err);
});

export default pool;
