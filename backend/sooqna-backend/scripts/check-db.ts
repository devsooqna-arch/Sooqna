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
    const tables = await client.query<{
      report_table: string | null;
      audit_log_table: string | null;
      engagement_event_table: string | null;
    }>(
      "select to_regclass('public.\"Report\"') as report_table, to_regclass('public.\"AuditLog\"') as audit_log_table, to_regclass('public.\"EngagementEvent\"') as engagement_event_table"
    );
    const row = tables.rows[0];
    if (!row?.report_table || !row.audit_log_table || !row.engagement_event_table) {
      throw new Error("Required moderation/analytics tables are missing. Run Prisma migrations.");
    }
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
