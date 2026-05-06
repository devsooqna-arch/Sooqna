/**
 * Maps English location names (as stored in the DB) to Arabic display names.
 * Add entries here whenever a new city or area is introduced.
 */

const CITY_AR: Record<string, string> = {
  // Major Syrian cities
  aleppo: "حلب",
  damascus: "دمشق",
  homs: "حمص",
  hama: "حماة",
  latakia: "اللاذقية",
  tartus: "طرطوس",
  idlib: "إدلب",
  deir_ez_zor: "دير الزور",
  "deir ez-zor": "دير الزور",
  "deir ez zor": "دير الزور",
  raqqa: "الرقة",
  hasaka: "الحسكة",
  hasakah: "الحسكة",
  qamishli: "القامشلي",
  daraa: "درعا",
  sweida: "السويداء",
  "as-suwayda": "السويداء",
  quneitra: "القنيطرة",
  syria: "سوريا",
};

const AREA_AR: Record<string, string> = {
  // Aleppo districts
  "al-furqan": "الفرقان",
  furqan: "الفرقان",
  "al-aziziyah": "العزيزية",
  aziziyah: "العزيزية",
  "al-hamidiyah": "الحميدية",
  hamidiyah: "الحميدية",
  "al-jamiliyah": "الجميلية",
  jamiliyah: "الجميلية",
  "al-sulaymaniyah": "السليمانية",
  sulaymaniyah: "السليمانية",
  "al-midan": "الميدان",
  midan: "الميدان",
  "al-masharqa": "المشارقة",
  masharqa: "المشارقة",
  "al-sabil": "السبيل",
  sabil: "السبيل",
  "al-shaar": "الشعار",
  shaar: "الشعار",
  // Damascus districts
  "al-mazzeh": "المزة",
  mazzeh: "المزة",
  kafr_sousa: "كفر سوسة",
  "kafr sousa": "كفر سوسة",
  "abu rummaneh": "أبو رمانة",
  "abu-rummaneh": "أبو رمانة",
};

/** Normalise a raw location string for map lookup */
function normalise(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Return the Arabic display name for a city.
 * Falls back to the original value if no mapping is found.
 */
export function arabicCity(raw: string | undefined | null): string {
  if (!raw) return "";
  const key = normalise(raw);
  return CITY_AR[key] ?? raw;
}

/**
 * Return the Arabic display name for a district / area.
 * Falls back to the original value if no mapping is found.
 */
export function arabicArea(raw: string | undefined | null): string {
  if (!raw) return "";
  const key = normalise(raw);
  return AREA_AR[key] ?? raw;
}

/**
 * Format a full location string: "مدينة - منطقة" (or just "مدينة").
 */
export function formatLocation(
  city: string | undefined | null,
  area?: string | undefined | null
): string {
  const c = arabicCity(city);
  const a = area ? arabicArea(area) : "";
  if (c && a) return `${c} - ${a}`;
  return c || a;
}
