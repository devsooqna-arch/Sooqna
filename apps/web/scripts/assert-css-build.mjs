import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const cssDir = path.resolve(process.cwd(), ".next/static/css");

async function listCssFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listCssFiles(fullPath) : fullPath;
    })
  );
  return files.flat().filter((file) => file.endsWith(".css"));
}

const cssFiles = await listCssFiles(cssDir);
if (cssFiles.length === 0) {
  throw new Error("No CSS files were emitted by the Next.js build.");
}

const cssStats = await Promise.all(
  cssFiles.map(async (file) => {
    const info = await stat(file);
    const content = await readFile(file, "utf8");
    return {
      file,
      size: info.size,
      hasTailwindUtilities: content.includes(".hidden{display:none}") && content.includes(".grid{display:grid}"),
    };
  })
);

const validBundle = cssStats.find((item) => item.size > 10_000 && item.hasTailwindUtilities);
if (!validBundle) {
  throw new Error(
    `CSS build is missing Tailwind utilities. Bundles: ${cssStats
      .map((item) => `${path.basename(item.file)}:${item.size}`)
      .join(", ")}`
  );
}

console.log(`[css] valid bundle: ${path.relative(process.cwd(), validBundle.file)} (${validBundle.size} bytes)`);
