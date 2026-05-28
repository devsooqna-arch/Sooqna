import { execFileSync } from "node:child_process";
import path from "node:path";

if (process.platform !== "win32") {
  process.exit(0);
}

const appDir = process.cwd().toLowerCase();
const output = execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'node(\\.exe)?' } | Select-Object -ExpandProperty CommandLine",
  ],
  { encoding: "utf8" }
);

const conflictingProcess = output
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => {
    const normalized = line.toLowerCase();
    return normalized.includes(`${path.sep}next`) && normalized.includes(" dev") && normalized.includes(appDir);
  });

if (conflictingProcess) {
  console.error("[build] Refusing to run next build while next dev is running for this app.");
  console.error("[build] Stop the local dev server first, then run npm run build again.");
  process.exit(1);
}
