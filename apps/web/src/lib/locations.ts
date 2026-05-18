/**
 * Single source of truth for Syrian governorates.
 * Use `value` as the canonical DB/API key (lowercase, no spaces).
 * Import this wherever a city list or city selector is needed.
 */
export const SYRIAN_GOVERNORATES = [
  { value: "damascus",   labelAr: "دمشق",       labelEn: "Damascus" },
  { value: "rifdimashq", labelAr: "ريف دمشق",   labelEn: "Rif Dimashq" },
  { value: "aleppo",     labelAr: "حلب",         labelEn: "Aleppo" },
  { value: "homs",       labelAr: "حمص",         labelEn: "Homs" },
  { value: "hama",       labelAr: "حماة",        labelEn: "Hama" },
  { value: "latakia",    labelAr: "اللاذقية",    labelEn: "Latakia" },
  { value: "tartus",     labelAr: "طرطوس",       labelEn: "Tartus" },
  { value: "idlib",      labelAr: "إدلب",        labelEn: "Idlib" },
  { value: "daraa",      labelAr: "درعا",        labelEn: "Daraa" },
  { value: "sweida",     labelAr: "السويداء",    labelEn: "As-Suwayda" },
  { value: "quneitra",   labelAr: "القنيطرة",    labelEn: "Quneitra" },
  { value: "deirezzor",  labelAr: "دير الزور",   labelEn: "Deir ez-Zor" },
  { value: "raqqa",      labelAr: "الرقة",       labelEn: "Raqqa" },
  { value: "alhasakah",  labelAr: "الحسكة",      labelEn: "Al-Hasakah" },
] as const;

export type GovernorateValue = (typeof SYRIAN_GOVERNORATES)[number]["value"];

/** Quick lookup: value → Arabic label */
export function governorateAr(value: string): string {
  const found = SYRIAN_GOVERNORATES.find((g) => g.value === value.trim().toLowerCase());
  return found?.labelAr ?? value;
}
