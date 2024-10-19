import { drizzle } from "drizzle-orm/neon-http"
import { Pool } from "pg"

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


