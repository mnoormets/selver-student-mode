/**
 * Validate a recipe dump and write data/imports/extra-recipes.json
 *
 * Usage:
 *   npm run import:recipes -- ./my-recipes.json
 *
 * Each recipe must reference productIds that exist in the product catalog
 * (products.ts + imports). There is no built-in “all of the internet” recipe API —
 * curate student-relevant dishes, or import a partner/CMS dump.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { selverProducts } from "../src/features/student-mode/data/products";

type Incoming = {
  id?: string;
  title?: string;
  totalMinutes?: number;
  mealSlots?: string[];
  vegetarian?: boolean;
  ingredients?: { productId?: string; quantity?: number }[];
};

const SLOTS = new Set(["breakfast", "lunch", "dinner"]);

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(
      "Usage: npm run import:recipes -- ./path-to-recipes.json\n" +
        "JSON array of { id, title, totalMinutes, mealSlots, vegetarian, ingredients:[{productId,quantity}] }",
    );
    process.exit(1);
  }

  const abs = resolve(process.cwd(), inputPath);
  const raw = JSON.parse(readFileSync(abs, "utf8")) as unknown;
  const rows = Array.isArray(raw)
    ? (raw as Incoming[])
    : Array.isArray((raw as { recipes?: Incoming[] }).recipes)
      ? (raw as { recipes: Incoming[] }).recipes
      : null;
  if (!rows) {
    console.error("Expected a JSON array (or { recipes: [...] }).");
    process.exit(1);
  }

  const productIds = new Set(selverProducts.map((p) => p.id));
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  const errors: string[] = [];

  rows.forEach((r, i) => {
    const id = (r.id ?? "").trim();
    const title = (r.title ?? "").trim();
    if (!id || !title) {
      errors.push(`#${i}: id and title required`);
      return;
    }
    if (seen.has(id)) {
      errors.push(`#${i}: duplicate id ${id}`);
      return;
    }
    seen.add(id);
    const totalMinutes = Number(r.totalMinutes);
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
      errors.push(`#${i} (${id}): totalMinutes required`);
      return;
    }
    const mealSlots = (r.mealSlots ?? ["lunch", "dinner"]).filter((s) =>
      SLOTS.has(s),
    );
    if (!mealSlots.length) {
      errors.push(`#${i} (${id}): mealSlots must be breakfast|lunch|dinner`);
      return;
    }
    const ingredients = r.ingredients ?? [];
    if (!ingredients.length) {
      errors.push(`#${i} (${id}): ingredients required`);
      return;
    }
    for (const ing of ingredients) {
      if (!ing.productId || !productIds.has(ing.productId)) {
        errors.push(
          `#${i} (${id}): unknown productId "${ing.productId}" — import products first`,
        );
        return;
      }
      if (!Number.isFinite(Number(ing.quantity)) || Number(ing.quantity) <= 0) {
        errors.push(`#${i} (${id}): ingredient quantity required`);
        return;
      }
    }
    out.push({
      id,
      title,
      totalMinutes,
      mealSlots,
      vegetarian: Boolean(r.vegetarian),
      ingredients: ingredients.map((ing) => ({
        productId: ing.productId,
        quantity: Number(ing.quantity),
      })),
    });
  });

  if (errors.length) {
    console.error(`Rejected ${errors.length} issue(s):`);
    for (const e of errors.slice(0, 30)) console.error(" -", e);
    process.exit(1);
  }

  const dest = resolve(
    process.cwd(),
    "src/features/student-mode/data/imports/extra-recipes.json",
  );
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Wrote ${out.length} recipes → ${dest}`);
}

main();
