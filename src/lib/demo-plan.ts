import {
  computeBasketCents,
  eurosFromCents,
  formatEurosFromCents,
  type PantryStockCents,
} from "@/features/student-mode/computeBasket";
import { demoProfile, demoWeek } from "@/features/student-mode/data/demoWeek";
import { recipes } from "@/features/student-mode/data/recipes";
import { recipeEtTitle } from "@/features/student-mode/quickMeal";
import type { BasketLine, PlannedMeal, PlanResult } from "./planner";

/** Pitch reference totals from the earlier hand-tuned demo (euro cents). */
export const LEGACY_DEMO_TOTAL_CENTS = 3424;
export const LEGACY_DEMO_PANTRY10_TOTAL_CENTS = 3235;

export const EGGS_PER_PACK = 10;
export const DEMO_EGG_PACK_PRICE = 1.89;

const DEMO_BUDGET_CENTS = demoProfile.budgetCents;

const SLOT_ET = {
  breakfast: "hommik",
  lunch: "lõuna",
  dinner: "õhtu",
} as const;

const DAY_INDEX: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

function recipeById(id: string) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) throw new Error(`Unknown demo recipe ${id}`);
  return recipe;
}

function mealIngredients(meals: PlannedMeal[]) {
  return meals.flatMap((meal) =>
    meal.recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      quantity: ing.qty,
    })),
  );
}

function toBasketLines(
  centsBasket: ReturnType<typeof computeBasketCents>,
): BasketLine[] {
  return centsBasket.lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    qty: line.packs,
    unit: line.unit === "pcs" ? "karp" : "pk",
    lineTotal: eurosFromCents(line.lineTotalCents),
    saved: 0,
    onPromo: false,
    sourceUrl: line.sourceUrl,
    selverSku: line.selverSku,
    eSelverUrl: line.eSelverUrl,
  }));
}

function explainTotalDelta(computedCents: number, legacyCents: number): string {
  if (computedCents === legacyCents) {
    return `Allikaviidetega andmestikust: ${formatEurosFromCents(computedCents)} (sama mis vana demosumma ${formatEurosFromCents(legacyCents)}).`;
  }
  const delta = computedCents - legacyCents;
  const sign = delta > 0 ? "+" : "−";
  return `Arvutatud korv ${formatEurosFromCents(computedCents)} (vana demosumma oli ${formatEurosFromCents(legacyCents)}, vahe ${sign}${formatEurosFromCents(Math.abs(delta))} — nüüd kehtib andmestikust arvutatud summa).`;
}

/**
 * Hackathon C+ demo week from sourced Selver products + demoWeek recipes.
 * Week needs 14 eggs → 2 packs without pantry; total from products.ts cents.
 */
export function buildHackathonDemoPlan(): PlanResult {
  const meals: PlannedMeal[] = demoWeek.flatMap((day) => {
    const dayNum = DAY_INDEX[day.day] ?? 1;
    return (["breakfast", "lunch", "dinner"] as const).map((slot) => {
      const recipeId = day.meals[slot];
      const recipe = recipeById(recipeId);
      const costCents = computeBasketCents(
        recipe.ingredients.map((ing) => ({
          productId: ing.productId,
          quantity: ing.quantity,
        })),
      ).totalCents;

      return {
        day: dayNum,
        slot: SLOT_ET[slot],
        recipe: {
          id: recipe.id,
          name: recipeEtTitle(recipe.id),
          minutes: recipe.totalMinutes,
          servings: 1,
          tags: recipe.vegetarian
            ? ["kiire", "taimne"]
            : ["kiire", "liha"],
          ingredients: recipe.ingredients.map((ing) => ({
            productId: ing.productId,
            qty: ing.quantity,
          })),
          tip: "Retsepti kogused on seotud allikaviidetega toote ID-dega.",
        },
        cost: eurosFromCents(costCents),
      };
    });
  });

  const centsBasket = computeBasketCents(mealIngredients(meals));
  const totalCents = centsBasket.totalCents;
  const total = eurosFromCents(totalCents);
  const leftoverBudget = eurosFromCents(DEMO_BUDGET_CENTS - totalCents);
  const deltaNote = explainTotalDelta(totalCents, LEGACY_DEMO_TOTAL_CENTS);

  return {
    meals,
    basket: toBasketLines(centsBasket),
    total,
    saved: 0,
    leftoverBudget,
    summary: `Näidisplaan 7 päevaks — kiired toidud sinu eelarve piires (eelarve ${eurosFromCents(DEMO_BUDGET_CENTS).toFixed(0)} €). ${deltaNote}`,
  };
}

export type PantryStock = PantryStockCents & {
  /** Whole eggs already at home (alias for pantry.eggs). */
  eggs?: number;
};

/**
 * Apply pantry stock via the cents basket calculator.
 * Demo beat: 10 eggs at home → 1 pack instead of 2 (need 14 eggs).
 */
export function applyPantryStock(
  plan: PlanResult,
  stock: PantryStock,
): PlanResult {
  const eggsAtHome =
    typeof stock.eggs === "number" ? stock.eggs : (stock["eggs"] ?? 0);
  const pantry: PantryStockCents = { ...stock, eggs: eggsAtHome };

  const eggsNeeded = countEggsNeeded(plan.meals);
  const packsBefore = Math.ceil(eggsNeeded / EGGS_PER_PACK);
  const missingEggs = Math.max(0, eggsNeeded - (pantry.eggs ?? 0));
  const packsAfter = missingEggs <= 0 ? 0 : Math.ceil(missingEggs / EGGS_PER_PACK);

  const centsBasket = computeBasketCents(mealIngredients(plan.meals), pantry);
  const totalCents = centsBasket.totalCents;
  const total = eurosFromCents(totalCents);
  const leftoverBudget = eurosFromCents(DEMO_BUDGET_CENTS - totalCents);

  const legacyRef =
    (pantry.eggs ?? 0) === 10
      ? LEGACY_DEMO_PANTRY10_TOTAL_CENTS
      : (pantry.eggs ?? 0) === 0
        ? LEGACY_DEMO_TOTAL_CENTS
        : totalCents;
  const deltaNote = explainTotalDelta(totalCents, legacyRef);

  return {
    ...plan,
    basket: toBasketLines(centsBasket),
    total,
    leftoverBudget,
    saved: 0,
    summary: `Mul on kodus ${pantry.eggs ?? 0} muna. Nädalaks vaja ${eggsNeeded} tk → ostunimekirja ${packsAfter} karp (varem ${packsBefore}). Korv ${plan.total.toFixed(2)} € → ${total.toFixed(2)} €. ${deltaNote}`,
  };
}

export function countEggsNeeded(meals: PlannedMeal[]): number {
  let eggs = 0;
  for (const meal of meals) {
    for (const ing of meal.recipe.ingredients) {
      if (ing.productId === "eggs" || ing.productId === "munad") {
        // Sourced recipes store whole eggs; legacy catalog used pack fractions.
        eggs +=
          ing.productId === "munad"
            ? Math.round(ing.qty * EGGS_PER_PACK)
            : ing.qty;
      }
    }
  }
  return eggs;
}

/** Egg packs to buy for the demo week given eggs already at home. */
export function demoEggPacksToBuy(eggsAtHome: number): number {
  const plan = buildHackathonDemoPlan();
  const needed = countEggsNeeded(plan.meals);
  const missing = Math.max(0, needed - eggsAtHome);
  return missing <= 0 ? 0 : Math.ceil(missing / EGGS_PER_PACK);
}
