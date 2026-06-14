import { normalizeArabic, buildListingSearchText } from "./arabic";

describe("normalizeArabic", () => {
  it("folds alef variants to plain alef", () => {
    expect(normalizeArabic("آيفون")).toBe("ايفون");
    expect(normalizeArabic("إعلان")).toBe("اعلان");
    expect(normalizeArabic("أحمد")).toBe("احمد");
  });

  it("makes alef-madda and plain-alef spellings of iPhone match", () => {
    expect(normalizeArabic("آيفون")).toBe(normalizeArabic("ايفون"));
  });

  it("folds alef maqsura (ى) to yaa (ي)", () => {
    expect(normalizeArabic("مصطفى")).toBe("مصطفي");
  });

  it("folds taa marbuta (ة) to haa (ه)", () => {
    expect(normalizeArabic("سيارة")).toBe("سياره");
  });

  it("strips tashkeel/diacritics", () => {
    expect(normalizeArabic("مُحَمَّد")).toBe("محمد");
    expect(normalizeArabic("سَيَّارَة")).toBe("سياره");
  });

  it("strips tatweel (kashida)", () => {
    expect(normalizeArabic("شـــاحن")).toBe("شاحن");
  });

  it("lowercases and collapses whitespace for mixed/Latin text", () => {
    expect(normalizeArabic("  iPhone   14  ")).toBe("iphone 14");
  });

  it("handles null/undefined/empty", () => {
    expect(normalizeArabic(undefined)).toBe("");
    expect(normalizeArabic(null)).toBe("");
    expect(normalizeArabic("")).toBe("");
  });

  it("buildListingSearchText combines title and description normalized", () => {
    expect(buildListingSearchText("آيفون 14", "بحالة ممتازة")).toBe(
      "ايفون 14 بحاله ممتازه"
    );
  });
});
