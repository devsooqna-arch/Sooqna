import { readFile } from "node:fs/promises";
import path from "node:path";

const logoPath = path.resolve(process.cwd(), "public/branding/logo-transparent.png");
const bytes = await readFile(logoPath);

const pngSignature = "89504e470d0a1a0a";
if (bytes.subarray(0, 8).toString("hex") !== pngSignature) {
  throw new Error("Transparent logo asset is not a PNG.");
}

const colorType = bytes[25];
if (colorType !== 6) {
  throw new Error("Transparent logo must be RGBA so the mobile dark header has no white logo box.");
}

console.log("[branding] transparent logo asset is RGBA");
