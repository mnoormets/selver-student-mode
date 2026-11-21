/**
 * Mass-import public recipes from TheMealDB and map ingredients onto the
 * Selver Student Mode catalog. Writes:
 *   src/features/student-mode/data/imports/extra-recipes.json
 *   src/features/student-mode/data/imports/themealdb-import-report.json
 *
 * Usage:
 *   npm run fetch:recipes
 *   npm run fetch:recipes -- --limit=80
 *
 * TheMealDB is free/public (themealdb.com). Only recipes that map cleanly to
 * our product ids are kept so the cook-chat shopping list stays coherent.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { productById, selverProducts } from "../src/features/student-mode/data/products";
import {
  isPantryStaple,
  mapIngredientToProductId,
  parseMeasureToQuantity,
} from "../src/features/student-mode/data/ingredientMap";
import type { MealSlot, Recipe } from "../src/features/student-mode/types";

const API = "https://www.themealdb.com/api/json/v1/1";
const CATEGORIES = [
  "Chicken",
  "Pasta",
  "Vegetarian",
  "Breakfast",
  "Vegan",
  "Side",
  "Beef",
] as const;

type MealSummary = { idMeal: string; strMeal: string };
type MealDetail = Record<string, string | null>;

function argLimit(): number {
  const hit = process.argv.find((a) => a.startsWith("--limit="));
  if (!hit) return 120;
  const n = Number(hit.split("=")[1]);
  return Number.isFinite(n) && n > 0 ? n : 120;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function titleEtGuess(title: string): string {
  // Light touch: keep original MealDB title; chat shows it as-is for imports.
  return title;
}

function aliasesFor(title: string, category: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["with", "and", "the", "from"].includes(w));
  // Title + distinctive words only (avoid bare "pasta"/"kana" flooding chat search).
  const out = new Set<string>([title.toLowerCase(), ...words.slice(0, 8)]);
  if (category.toLowerCase().includes("chicken") && !out.has("chicken")) {
    out.add("chicken");
  }
  return Array.from(out);
}

function slotsFor(category: string): MealSlot[] {
  if (category === "Breakfast") return ["breakfast"];
  return ["lunch", "dinner"];
}

function convertMeal(meal: MealDetail, category: string): {
  recipe: Recipe | null;
  skipReason?: string;
  unmapped: string[];
} {
  const name = (meal.strMeal ?? "").trim();
  const idMeal = meal.idMeal ?? "";
  if (!name || !idMeal) return { recipe: null, skipReason: "missing name", unmapped: [] };

  const rawIngs: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] ?? "").trim();
    const measure = (meal[`strMeasure${i}`] ?? "").trim();
    if (!ing) continue;
    rawIngs.push({ name: ing, measure });
  }

  const unmapped: string[] = [];
  const mapped: { productId: string; quantity: number }[] = [];
  let staples = 0;

  for (const row of rawIngs) {
    if (isPantryStaple(row.name)) {
      staples += 1;
      continue;
    }
    const productId = mapIngredientToProductId(row.name);
    if (!productId) {
      unmapped.push(row.name);
      continue;
    }
    try {
      const product = productById(productId);
      const quantity = parseMeasureToQuantity(row.measure, product.unit);
      const existing = mapped.find((m) => m.productId === productId);
      if (existing) existing.quantity += quantity;
      else mapped.push({ productId, quantity });
    } catch {
      unmapped.push(row.name);
    }
  }

  const nonStaple = rawIngs.length - staples;
  if (mapped.length < 2) {
    return { recipe: null, skipReason: "fewer than 2 mapped products", unmapped };
  }
  if (nonStaple > 0 && mapped.length / nonStaple < 0.45) {
    return {
      recipe: null,
      skipReason: `low map coverage ${mapped.length}/${nonStaple}`,
      unmapped,
    };
  }

  const vegetarian =
    category === "Vegetarian" ||
    category === "Vegan" ||
    (!mapped.some((m) => m.productId === "chicken" || m.productId === "minced-meat") &&
      !/chicken|beef|pork|lamb|fish|shrimp/i.test(name));

  const recipe: Recipe = {
    id: `mealdb-${idMeal}-${slug(name)}`.slice(0, 64),
    title: name,
    titleEt: titleEtGuess(name),
    totalMinutes: category === "Breakfast" ? 15 : 25,
    mealSlots: slotsFor(category),
    vegetarian,
    ingredients: mapped,
    aliases: aliasesFor(name, category),
    source: "themealdb",
    sourceUrl: meal.strSource?.trim() || meal.strMealThumb || `https://www.themealdb.com/meal/${idMeal}`,
  };

  return { recipe, unmapped };
}

async function main() {
  const limit = argLimit();
  const productIds = new Set(selverProducts.map((p) => p.id));
  console.log(`Catalog products: ${productIds.size}. Fetch limit: ${limit}.`);

  const summaries: { id: string; name: string; category: string }[] = [];
  for (const cat of CATEGORIES) {
    const data = await getJson<{ meals: MealSummary[] | null }>(
      `${API}/filter.php?c=${encodeURIComponent(cat)}`,
    );
    for (const m of data.meals ?? []) {
      summaries.push({ id: m.idMeal, name: m.strMeal, category: cat });
    }
  }

  // Prefer pasta/chicken/breakfast first for student demos.
  const rank = (c: string) =>
    ["Pasta", "Chicken", "Breakfast", "Vegetarian", "Vegan", "Beef", "Side"].indexOf(
      c,
    );
  summaries.sort((a, b) => rank(a.category) - rank(b.category));

  const picked = summaries.slice(0, limit);
  const recipes: Recipe[] = [];
  const report: {
    kept: number;
    skipped: { id: string; name: string; reason: string; unmapped: string[] }[];
    byCategory: Record<string, number>;
  } = { kept: 0, skipped: [], byCategory: {} };

  for (const row of picked) {
    const detail = await getJson<{ meals: MealDetail[] | null }>(
      `${API}/lookup.php?i=${row.id}`,
    );
    const meal = detail.meals?.[0];
    if (!meal) {
      report.skipped.push({
        id: row.id,
        name: row.name,
        reason: "lookup empty",
        unmapped: [],
      });
      continue;
    }
    const { recipe, skipReason, unmapped } = convertMeal(meal, row.category);
    if (!recipe) {
      report.skipped.push({
        id: row.id,
        name: row.name,
        reason: skipReason ?? "unknown",
        unmapped,
      });
      continue;
    }
    recipes.push(recipe);
    report.kept += 1;
    report.byCategory[row.category] = (report.byCategory[row.category] ?? 0) + 1;
    // gentle pacing
    await new Promise((r) => setTimeout(r, 40));
  }

  // Dedupe by id
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const out = Array.from(byId.values());

  const dest = resolve(
    process.cwd(),
    "src/features/student-mode/data/imports/extra-recipes.json",
  );
  const reportPath = resolve(
    process.cwd(),
    "src/features/student-mode/data/imports/themealdb-import-report.json",
  );
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  writeFileSync(
    reportPath,
    `${JSON.stringify({ ...report, written: out.length, fetched: picked.length }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Kept ${out.length}/${picked.length} recipes → ${dest}\nReport → ${reportPath}`,
  );
  console.log("By category:", report.byCategory);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
