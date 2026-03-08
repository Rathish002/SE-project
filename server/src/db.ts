import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
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
