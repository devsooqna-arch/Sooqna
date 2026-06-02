import { cleanupOrphanUploads } from "../src/modules/uploads/uploads.cleanup";

function readNumberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function main(): Promise<void> {
  const result = await cleanupOrphanUploads({
    olderThanHours: readNumberEnv("UPLOAD_ORPHAN_TTL_HOURS", 24),
    limit: readNumberEnv("UPLOAD_ORPHAN_CLEANUP_LIMIT", 100),
    dryRun: process.env.DRY_RUN === "true",
  });

  console.log(JSON.stringify({ success: true, result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
