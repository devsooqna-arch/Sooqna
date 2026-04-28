import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing in backend/sooqna-backend/.env");
    process.exit(1);
  }

  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    await client.query("select 1");
    console.log("Database check passed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`Database check failed: ${message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

void main();
