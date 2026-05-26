import {
  hasAllowedImageExtension,
  hasValidImageSignature,
  isAllowedImageMimeType,
} from "./uploads.config";

describe("upload security validation", () => {
  it("rejects executable extensions even when MIME type claims to be an image", () => {
    expect(isAllowedImageMimeType("image/png")).toBe(true);
    expect(hasAllowedImageExtension("avatar.png.exe")).toBe(false);
  });

  it("accepts real PNG/JPEG/WEBP magic bytes and rejects disguised scripts", () => {
    expect(hasValidImageSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      true
    );
    expect(hasValidImageSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(true);
    expect(hasValidImageSignature(Buffer.from("RIFFxxxxWEBP"))).toBe(true);
    expect(hasValidImageSignature(Buffer.from("<script>alert(1)</script>"))).toBe(false);
  });
});
