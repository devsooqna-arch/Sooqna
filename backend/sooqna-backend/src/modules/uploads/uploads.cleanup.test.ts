import * as path from "node:path";
import { resolveUploadFilePath } from "./uploads.cleanup";

describe("upload orphan cleanup", () => {
  it("resolves upload paths inside the uploads directory", () => {
    const root = path.resolve("uploads");

    expect(resolveUploadFilePath("uploads/listings/user-1/photo.png", root)).toBe(
      path.resolve(root, "listings/user-1/photo.png")
    );
  });

  it("rejects traversal and non-upload paths", () => {
    const root = path.resolve("uploads");

    expect(resolveUploadFilePath("uploads/../.env", root)).toBeNull();
    expect(resolveUploadFilePath("src/modules/uploads/file.png", root)).toBeNull();
  });
});
