import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const redirectsJsonPath = path.join(__dirname, "wp-redirects.json");

function readRedirectsFile() {
  const raw = readFileSync(redirectsJsonPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${redirectsJsonPath}: ${message}`);
  }
}

function assertTopLevelShape(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid redirects file: top-level must be an object.");
  }
  if (!("exact" in data) || !Array.isArray(data.exact)) {
    throw new Error("Invalid redirects file: `exact` must be an array.");
  }
  if (!("patterns" in data) || !Array.isArray(data.patterns)) {
    throw new Error("Invalid redirects file: `patterns` must be an array.");
  }
}

function normalizeSourceForCollision(source) {
  if (source === "/") return "/";
  return source.endsWith("/") ? source.slice(0, -1) : source;
}

function assertRedirectRule(rule, idx, group) {
  if (!rule || typeof rule !== "object") {
    throw new Error(`Invalid redirect rule at ${group}[${idx}] - expected object.`);
  }
  if (typeof rule.source !== "string" || !rule.source.startsWith("/")) {
    throw new Error(`Invalid source at ${group}[${idx}] - must start with '/'.`);
  }
  if (typeof rule.destination !== "string" || !rule.destination.startsWith("/")) {
    throw new Error(`Invalid destination at ${group}[${idx}] - must start with '/'.`);
  }
  if (typeof rule.permanent !== "boolean") {
    throw new Error(`Invalid permanent flag at ${group}[${idx}] - must be boolean.`);
  }
  if (rule.source.includes("://")) {
    throw new Error(
      `Invalid source at ${group}[${idx}] - must be a relative path, not a full URL.`
    );
  }
  if (rule.destination.includes("://")) {
    throw new Error(
      `Invalid destination at ${group}[${idx}] - must be a relative path, not a full URL.`
    );
  }

  if (group === "exact" && (rule.source.includes(":path*") || rule.source.includes(":slug"))) {
    throw new Error(
      `Invalid exact source at ${group}[${idx}] - dynamic tokens belong in \`patterns\`.`
    );
  }
  if (group === "patterns" && !rule.source.includes(":")) {
    throw new Error(
      `Invalid pattern source at ${group}[${idx}] - expected at least one dynamic token (:...).`
    );
  }
}

function validateRedirectGroups(exact, patterns) {
  const all = [...exact, ...patterns];
  const seenMapping = new Set();
  const seenSource = new Map();
  const seenNormalizedExactSource = new Map();

  exact.forEach((rule, idx) => assertRedirectRule(rule, idx, "exact"));
  patterns.forEach((rule, idx) => assertRedirectRule(rule, idx, "patterns"));

  for (const rule of all) {
    const key = `${rule.source}__${rule.destination}`;
    if (seenMapping.has(key)) {
      throw new Error(`Duplicate redirect mapping detected: ${rule.source} -> ${rule.destination}`);
    }
    seenMapping.add(key);

    if (seenSource.has(rule.source)) {
      const previous = seenSource.get(rule.source);
      throw new Error(
        `Duplicate redirect source detected: ${rule.source} (also used in ${previous.group}[${previous.idx}]).`
      );
    }
    seenSource.set(rule.source, { group: rule.group ?? "unknown", idx: rule.idx ?? -1 });
  }

  exact.forEach((rule, idx) => {
    const normalizedSource = normalizeSourceForCollision(rule.source);
    if (seenNormalizedExactSource.has(normalizedSource)) {
      const previous = seenNormalizedExactSource.get(normalizedSource);
      throw new Error(
        `Ambiguous exact source detected: "${rule.source}" collides with "${previous.source}" (trailing slash variant).`
      );
    }
    seenNormalizedExactSource.set(normalizedSource, { source: rule.source, idx });
  });
}

function withMeta(group, entries) {
  return entries.map((rule, idx) => ({ ...rule, group, idx }));
}

function stripMeta(entries) {
  return entries.map(({ source, destination, permanent }) => ({
    source,
    destination,
    permanent,
  }));
}

function validateRedirectDestinations(exact, patterns) {
  const all = [...exact, ...patterns];
  for (const rule of all) {
    if (rule.destination.startsWith("/api/")) {
      throw new Error(
        `Invalid destination "${rule.destination}" for source "${rule.source}" - redirecting to API routes is blocked.`
      );
    }
    if (rule.destination.includes("#")) {
      throw new Error(
        `Invalid destination "${rule.destination}" for source "${rule.source}" - hash fragments are not supported in redirects.`
      );
    }
  }
}

const fileData = readRedirectsFile();
assertTopLevelShape(fileData);
const exactWithMeta = withMeta("exact", fileData.exact);
const patternsWithMeta = withMeta("patterns", fileData.patterns);
validateRedirectGroups(exactWithMeta, patternsWithMeta);
validateRedirectDestinations(exactWithMeta, patternsWithMeta);

export const wpExactRedirects = stripMeta(exactWithMeta);
export const wpPatternRedirects = stripMeta(patternsWithMeta);
