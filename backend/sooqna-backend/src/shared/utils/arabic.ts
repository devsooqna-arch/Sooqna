/**
 * Normalize Arabic text so equivalent letter forms match during search.
 *
 * Users and sellers spell the same word with different alef/yaa/taa shapes and
 * optional diacritics (e.g. "ايفون" vs "آيفون"). A literal substring match
 * misses these, so we fold the common variants into a single canonical form
 * before both storing the searchable text and comparing the query against it.
 *
 * Folding rules (kept in sync with the SQL backfill in scripts/backfill-search-text.ts):
 *  - alef variants  (U+0623/U+0625/U+0622/U+0671) -> U+0627 (ا)
 *  - alef maqsura   (U+0649)                       -> U+064A (ي)
 *  - taa marbuta    (U+0629)                       -> U+0647 (ه)
 *  - tatweel        (U+0640)                        -> removed
 *  - tashkeel / diacritics (U+0610-U+061A, U+064B-U+065F, U+0670) -> removed
 *  - collapse whitespace and lowercase (for Latin terms like "iPhone")
 */
export function normalizeArabic(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا") // alef variants -> ا
    .replace(/ى/g, "ي") // alef maqsura -> ي
    .replace(/ة/g, "ه") // taa marbuta -> ه
    .replace(/ـ/g, "") // tatweel
    .replace(/[ؐ-ًؚ-ٰٟ]/g, "") // tashkeel / diacritics
    .replace(/\s+/g, " ")
    .trim();
}

/** Build the normalized, searchable blob stored on a listing (title + description). */
export function buildListingSearchText(title: string, description: string): string {
  return normalizeArabic(`${title} ${description}`);
}
