import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts", // Ensure this path is correct
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://finace_owner:9SGDxsF1IpjL@ep-twilight-water-a5s154rh-pooler.us-east-2.aws.neon.tech/finace?sslmode=require"
  },
  verbose: true,
  strict: true,
});