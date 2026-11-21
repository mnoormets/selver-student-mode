import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lovableDemoJson } from "../src/features/student-mode/exportLovable";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");
const outFile = join(outDir, "lovable-demo-data.json");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, lovableDemoJson("2026-11-21T00:00:00.000Z"), "utf8");
console.log(`Wrote ${outFile}`);
