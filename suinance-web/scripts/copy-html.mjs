// Copies the static HTML edition (../html) into public/html before each build,
// so Vercel serves it from the same domain as the API:
//   /html/index.html            → static website
//   /html/dashboard/index.html  → member dashboard
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "..", "html");
const dest = join(root, "public", "html");

if (!existsSync(src)) {
  console.warn(`[copy-html] ${src} not found, skipping. The /html pages will not be published.`);
  process.exit(0);
}
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true, filter: (p) => !p.endsWith("README.md") });
console.log(`[copy-html] copied ${src} → ${dest}`);
