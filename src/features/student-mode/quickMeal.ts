import { computeBasketCents, formatEurosFromCents } from "./computeBasket";
import { recipes } from "./data/recipes";
import { selverProducts } from "./data/products";

/** Demo chat prompt for the egg–vegetable spaghetti leftover case. */
export const SPAGHETTI_EGGS_PROMPT =
  "Mul on 100 g spagette ja kaks muna. Mida saan kiiresti teha?";

const EGG_PASTA_ID = "egg-pasta";

export type QuickMealAnswer = {
  recipeId: string;
  recipeTitle: string;
  minutes: number;
  alreadyHave: { productId: string; name: string; have: number; need: number; unit: string }[];
  missingVegGrams: number;
  buy: {
    productId: string;
    name: string;
    packs: number;
    packQuantity: number;
    unit: string;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  totalCents: number;
  summaryEt: string;
};

/**
 * Sample case: 100 g spaghetti + 2 eggs at home → egg-pasta recipe.
 * Reports what is covered, how much mixed veg is still missing, and packs to buy.
 */
export function answerSpaghettiEggsQuickMeal(
  pantry: { spaghettiGrams?: number; eggs?: number } = {
    spaghettiGrams: 100,
    eggs: 2,
  },
): QuickMealAnswer {
  const recipe = recipes.find((r) => r.id === EGG_PASTA_ID);
  if (!recipe) throw new Error(`Missing recipe ${EGG_PASTA_ID}`);

  const products = new Map(selverProducts.map((p) => [p.id, p]));
  const spaghettiHave = pantry.spaghettiGrams ?? 0;
  const eggsHave = pantry.eggs ?? 0;

  const stock: Record<string, number> = {
    spaghetti: spaghettiHave,
    eggs: eggsHave,
  };

  const basket = computeBasketCents(
    recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      quantity: ing.quantity,
    })),
    stock,
  );

  const alreadyHave = recipe.ingredients
    .map((ing) => {
      const product = products.get(ing.productId)!;
      const have = stock[ing.productId] ?? 0;
      return {
        productId: ing.productId,
        name: product.name,
        have,
        need: ing.quantity,
        unit: product.unit,
        covered: have >= ing.quantity,
      };
    })
    .filter((row) => row.covered)
    .map(({ productId, name, have, need, unit }) => ({
      productId,
      name,
      have,
      need,
      unit,
    }));

  const vegNeed =
    recipe.ingredients.find((ing) => ing.productId === "mixed-veg")?.quantity ??
    0;
  const missingVegGrams = Math.max(0, vegNeed - (stock["mixed-veg"] ?? 0));

  const buy = basket.lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    packs: line.packs,
    packQuantity: line.packQuantity,
    unit: line.unit,
    unitPriceCents: line.unitPriceCents,
    lineTotalCents: line.lineTotalCents,
  }));

  const coveredEt = alreadyHave
    .map((row) => `${row.name} (${row.have}${row.unit === "pcs" ? " tk" : ` ${row.unit}`})`)
    .join("; ");

  const buyEt = buy
    .map(
      (line) =>
        `${line.packs}× ${line.name} (${formatEurosFromCents(line.unitPriceCents)}/pk → ${formatEurosFromCents(line.lineTotalCents)})`,
    )
    .join("; ");

  const summaryEt = [
    `Kiire valik: ${recipeEtTitle(recipe.id)} (${recipe.totalMinutes} min).`,
    `Juba olemas: ${coveredEt || "—"}.`,
    `Puudu köögiviljasegu: ${missingVegGrams} g.`,
    buy.length
      ? `Osta: ${buyEt}. Kokku ${formatEurosFromCents(basket.totalCents)}.`
      : "Lisaks midagi osta ei pea.",
  ].join(" ");

  return {
    recipeId: recipe.id,
    recipeTitle: recipeEtTitle(recipe.id),
    minutes: recipe.totalMinutes,
    alreadyHave,
    missingVegGrams,
    buy,
    totalCents: basket.totalCents,
    summaryEt,
  };
}

export function recipeEtTitle(id: string): string {
  const titles: Record<string, string> = {
    "berry-oats": "Soe marjapuder",
    "egg-oats": "Muna-köögiviljapuder",
    "chickpea-pasta": "Tomati-kikerherne spagetid",
    "egg-pasta": "Muna-köögiviljaspagetid",
    "chickpea-stew": "Kikerherne-köögiviljahautis",
    "chicken-tomato-pasta": "Kana-tomati spagetid",
    "chicken-veg-pasta": "Kana-köögivilja spagetid",
    "tomato-eggs": "Tomati-munapanniroog",
    "hakkliha-pannkoogid": "Hakkliha pannkoogid",
    "chicken-stew": "Kanalihahautis",
  };
  return titles[id] ?? id;
}
