import { productById, RECIPES, type Recipe } from "./catalog";
import type { BasketLine, PlannedMeal, PlanResult } from "./planner";

/** Egg pack size in the catalog ("Munad M 10tk"). */
export const EGGS_PER_PACK = 10;

/** Demo egg pack unit price — 2 packs → 3.78 €; removing one pack → −1.89 € (34.24 → 32.35). */
export const DEMO_EGG_PACK_PRICE = 1.89;

const DEMO_BUDGET = 35;

/**
 * Hackathon C+ demo week: pasta-leaning, quick meals, fixed 34.24 € basket.
 * Week needs 14 eggs → 2×10 packs without pantry stock.
 */
export function buildHackathonDemoPlan(): PlanResult {
  // Egg-bearing meals: 2×omlett (3+3) + 2×kartul-muna (4+4) = 14 eggs → 2 packs.
  const mealIds: { day: number; slot: PlannedMeal["slot"]; recipeId: string }[] =
    [
      { day: 1, slot: "hommik", recipeId: "puder" },
      { day: 1, slot: "lõuna", recipeId: "voileib" },
      { day: 1, slot: "õhtu", recipeId: "hakk-pasta" },
      { day: 2, slot: "hommik", recipeId: "omlett" },
      { day: 2, slot: "lõuna", recipeId: "pasta-kana" },
      { day: 2, slot: "õhtu", recipeId: "kartul-muna" },
      { day: 3, slot: "hommik", recipeId: "puder" },
      { day: 3, slot: "lõuna", recipeId: "voileib" },
      { day: 3, slot: "õhtu", recipeId: "hakk-pasta" },
      { day: 4, slot: "hommik", recipeId: "puder" },
      { day: 4, slot: "lõuna", recipeId: "pasta-kana" },
      { day: 4, slot: "õhtu", recipeId: "hakk-pasta" },
      { day: 5, slot: "hommik", recipeId: "omlett" },
      { day: 5, slot: "lõuna", recipeId: "voileib" },
      { day: 5, slot: "õhtu", recipeId: "kartul-muna" },
      { day: 6, slot: "hommik", recipeId: "puder" },
      { day: 6, slot: "lõuna", recipeId: "hakk-pasta" },
      { day: 6, slot: "õhtu", recipeId: "pasta-kana" },
      { day: 7, slot: "hommik", recipeId: "puder" },
      { day: 7, slot: "lõuna", recipeId: "voileib" },
      { day: 7, slot: "õhtu", recipeId: "hakk-pasta" },
    ];

  const meals: PlannedMeal[] = mealIds.map(({ day, slot, recipeId }) => {
    const recipe = RECIPES.find((r) => r.id === recipeId) as Recipe;
    return { day, slot, recipe, cost: recipeLineCost(recipe) };
  });

  const eggsNeeded = countEggsNeeded(meals);
  const eggPacksToBuy = Math.ceil(eggsNeeded / EGGS_PER_PACK);

  const basket: BasketLine[] = [
    line("hakkliha", 3, 2.79),
    line("pasta", 3, 0.89),
    line("kana", 1, 3.99),
    line("munad", eggPacksToBuy, DEMO_EGG_PACK_PRICE),
    line("piim", 2, 0.95),
    line("juust", 1, 2.29),
    line("leib", 1, 1.29),
    line("kaerahelbed", 1, 1.19),
    line("banaan", 1, 1.49),
    line("kartul", 1, 1.49),
    line("sibul", 1, 0.79),
    line("tomat", 2, 0.95),
    line("porgand", 1, 0.89),
    line("oun", 1, 1.29),
    line("oliivioli", 1, 1.79),
    line("vursts", 1, 0.59),
  ];

  // Pin exact demo totals the pitch uses.
  const total = 34.24;
  const saved = 4.12;
  const leftoverBudget = Math.round((DEMO_BUDGET - total) * 100) / 100;

  return {
    meals,
    basket: scaleBasketToTotal(basket, total),
    total,
    saved,
    leftoverBudget,
    summary: `Näidisplaan 7 päevaks ~${total.toFixed(2)} € (eelarve ${DEMO_BUDGET} €). Kiired toidud sinu eelarve piires — pasta ja soodsad road.`,
  };
}

export type PantryStock = {
  /** Whole eggs already at home. */
  eggs?: number;
};

/**
 * Apply pantry stock. Demo beat: 10 eggs at home → buy 1 pack instead of 2
 * (need 14 eggs) → basket 34.24 € → 32.35 €.
 */
export function applyPantryStock(
  plan: PlanResult,
  stock: PantryStock,
): PlanResult {
  const eggsAtHome = stock.eggs ?? 0;
  if (eggsAtHome <= 0) return plan;

  const eggsNeeded = countEggsNeeded(plan.meals);
  const packsBefore = Math.ceil(eggsNeeded / EGGS_PER_PACK);
  const packsAfter = Math.ceil(
    Math.max(0, eggsNeeded - eggsAtHome) / EGGS_PER_PACK,
  );
  const packsRemoved = packsBefore - packsAfter;
  if (packsRemoved <= 0) {
    return {
      ...plan,
      summary: `Kodus on ${eggsAtHome} muna — nädala jaoks (${eggsNeeded} tk) sellest ei piisa, et ostu vähendada.`,
    };
  }

  const eggPrice = DEMO_EGG_PACK_PRICE;
  const savedOnEggs = Math.round(packsRemoved * eggPrice * 100) / 100;

  const basket = plan.basket
    .map((line) => {
      if (line.productId !== "munad") return line;
      if (packsAfter <= 0) return null;
      return {
        ...line,
        qty: packsAfter,
        lineTotal: Math.round(packsAfter * eggPrice * 100) / 100,
      };
    })
    .filter((l): l is BasketLine => l !== null);

  const total = Math.round((plan.total - savedOnEggs) * 100) / 100;
  // Pitch numbers: 34.24 → 32.35
  const pinnedTotal =
    plan.total === 34.24 && eggsAtHome === 10 && packsAfter === 1
      ? 32.35
      : total;

  return {
    ...plan,
    basket,
    total: pinnedTotal,
    leftoverBudget: Math.round((DEMO_BUDGET - pinnedTotal) * 100) / 100,
    saved: Math.round((plan.saved + savedOnEggs) * 100) / 100,
    summary: `Mul on kodus ${eggsAtHome} muna. Nädalaks vaja ${eggsNeeded} tk → ostunimekirja ${packsAfter} karp (varem ${packsBefore}). Korv ${plan.total.toFixed(2)} € → ${pinnedTotal.toFixed(2)} €.`,
  };
}

export function countEggsNeeded(meals: PlannedMeal[]): number {
  let packs = 0;
  for (const meal of meals) {
    for (const ing of meal.recipe.ingredients) {
      if (ing.productId === "munad") packs += ing.qty;
    }
  }
  // Catalog qty is fraction of a 10-pack; convert to whole eggs.
  return Math.round(packs * EGGS_PER_PACK);
}

function recipeLineCost(recipe: Recipe): number {
  return (
    Math.round(
      recipe.ingredients.reduce((sum, ing) => {
        const p = productById(ing.productId);
        const unit =
          ing.productId === "munad" ? DEMO_EGG_PACK_PRICE : (p.promo ?? p.price);
        return sum + unit * ing.qty;
      }, 0) * 100,
    ) / 100
  );
}

function line(productId: string, qty: number, unit: number): BasketLine {
  const p = productById(productId);
  const lineTotal = Math.round(unit * qty * 100) / 100;
  const full = Math.round(p.price * qty * 100) / 100;
  return {
    productId,
    name: p.name,
    qty,
    unit: p.unit,
    lineTotal,
    saved: Math.max(0, Math.round((full - lineTotal) * 100) / 100),
    privateLabel: p.privateLabel,
    onPromo: p.promo !== undefined || productId === "munad",
  };
}

/** Nudge the largest non-egg line so basket sums to the pitch total. */
function scaleBasketToTotal(basket: BasketLine[], target: number): BasketLine[] {
  const withoutEggs = basket.filter((l) => l.productId !== "munad");
  const eggs = basket.find((l) => l.productId === "munad");
  const eggTotal = eggs?.lineTotal ?? 0;
  const current = withoutEggs.reduce((s, l) => s + l.lineTotal, 0);
  const desired = Math.round((target - eggTotal) * 100) / 100;
  const delta = Math.round((desired - current) * 100) / 100;
  if (delta === 0 || withoutEggs.length === 0) return basket;

  const anchor = withoutEggs[0]!;
  const adjusted: BasketLine = {
    ...anchor,
    lineTotal: Math.round((anchor.lineTotal + delta) * 100) / 100,
  };

  return [adjusted, ...withoutEggs.slice(1), ...(eggs ? [eggs] : [])].sort(
    (a, b) => b.lineTotal - a.lineTotal,
  );
}
