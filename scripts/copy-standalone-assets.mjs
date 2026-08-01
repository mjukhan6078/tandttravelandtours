import { cpSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const standaloneNext = join(standalone, ".next");

if (!existsSync(standalone)) {
  console.error("Standalone build not found. Run next build first.");
  process.exit(1);
}

mkdirSync(standaloneNext, { recursive: true });

cpSync(join(root, ".next", "static"), join(standaloneNext, "static"), {
  recursive: true,
});

cpSync(join(root, "public"), join(standalone, "public"), {
  recursive: true,
});

console.log("Copied static + public assets into .next/standalone");
