export function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

