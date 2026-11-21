/**
 * Validate a Selver product dump and write it into
 * src/features/student-mode/data/imports/extra-from-dump.json
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/import-selver-products.ts ./dump.json
 *
 * There is no official public “all Selver food & drink” API in this demo.
 * Feed a JSON array of { id, name, packQuantity, unit, priceCents, sourceUrl, ... }.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type Unit = "g" | "ml" | "pcs";

type Incoming = {
  id?: string;
  name?: string;
  packQuantity?: number;
  unit?: string;
  priceCents?: number;
  priceEur?: number;
  sourceUrl?: string;
  url?: string;
  eSelverUrl?: string;
  selverSku?: string;
  sku?: string;
  checkedAt?: string;
};

function slugId(name: string, i: number): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || `product-${i + 1}`;
}

function normalizeUnit(u: string | undefined): Unit {
  const v = (u ?? "g").toLowerCase();
  if (v === "pcs" || v === "tk" || v === "piece" || v === "pieces") return "pcs";
  if (v === "ml" || v === "l" || v === "liter") return v === "l" || v === "liter" ? "ml" : "ml";
  return "g";
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(
      "Usage: npm run import:products -- ./path-to-dump.json\n" +
        "Dump = JSON array of products (id, name, packQuantity, unit, priceCents|priceEur, sourceUrl).",
    );
    process.exit(1);
  }

  const abs = resolve(process.cwd(), inputPath);
  const raw = JSON.parse(readFileSync(abs, "utf8")) as unknown;
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { products?: unknown }).products)
      ? ((raw as { products: Incoming[] }).products)
      : null;

  if (!rows) {
    console.error("Expected a JSON array (or { products: [...] }).");
    process.exit(1);
  }

  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  const errors: string[] = [];

  rows.forEach((row, i) => {
    const r = row as Incoming;
    const name = (r.name ?? "").trim();
    if (!name) {
      errors.push(`#${i}: missing name`);
      return;
    }
    let id = (r.id ?? slugId(name, i)).trim();
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);

    const packQuantity = Number(r.packQuantity);
    if (!Number.isFinite(packQuantity) || packQuantity <= 0) {
      errors.push(`#${i} (${id}): packQuantity required`);
      return;
    }

    let priceCents = Number(r.priceCents);
    if (!Number.isFinite(priceCents) && r.priceEur != null) {
      priceCents = Math.round(Number(r.priceEur) * 100);
    }
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      errors.push(`#${i} (${id}): priceCents or priceEur required`);
      return;
    }

    const sourceUrl = (r.sourceUrl ?? r.url ?? "").trim();
    if (!sourceUrl) {
      errors.push(`#${i} (${id}): sourceUrl required`);
      return;
    }

    const unit = normalizeUnit(r.unit);
    // If someone passed liters as packQuantity with unit L, convert to ml.
    const pack =
      (r.unit ?? "").toLowerCase() === "l" || (r.unit ?? "").toLowerCase() === "liter"
        ? Math.round(packQuantity * 1000)
        : packQuantity;

    out.push({
      id,
      name,
      packQuantity: pack,
      unit,
      priceCents,
      sourceUrl,
      ...(r.eSelverUrl ? { eSelverUrl: r.eSelverUrl } : {}),
      ...(r.selverSku || r.sku
        ? { selverSku: r.selverSku ?? r.sku }
        : {}),
      ...(r.checkedAt ? { checkedAt: r.checkedAt } : {}),
    });
  });

  if (errors.length) {
    console.error(`Rejected ${errors.length} row(s):`);
    for (const e of errors.slice(0, 20)) console.error(" -", e);
    if (errors.length > 20) console.error(` ... +${errors.length - 20} more`);
    process.exit(1);
  }

  const dest = resolve(
    process.cwd(),
    "src/features/student-mode/data/imports/extra-from-dump.json",
  );
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${out.length} products → ${dest}`);
  console.log(
    "Restart the app. Catalog = products.ts + all imports/*.json (except README).",
  );
}

main();
