const isProd = process.env.NODE_ENV === "production";

type LogLevel = "info" | "warn" | "error";

const COLORS: Record<LogLevel, string> = {
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (isProd) {
    const entry = JSON.stringify({ level, time: new Date().toISOString(), message, ...meta });
    process.stdout.write(entry + "\n");
  } else {
    const prefix = `${COLORS[level]}[${level.toUpperCase()}]${RESET}`;
    const metaStr = meta && Object.keys(meta).length > 0 ? " " + JSON.stringify(meta) : "";
    console[level](`${prefix} ${message}${metaStr}`);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
