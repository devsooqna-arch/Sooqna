/**
 * If API/DB stored titles with a site suffix, strip it so root `title.template` in layout
 * does not produce "… | سوقنا | سوقنا".
 */
export function listingTitleForPageMetadata(title: string): string {
  return title.replace(/\s*\|\s*سوقنا\s*$/i, "").trim() || "إعلان";
}
