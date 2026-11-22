import {
  computeBasketCents,
  eurosFromCents,
  formatEurosFromCents,
  type PantryStockCents,
} from "@/features/student-mode/computeBasket";
import { demoWeek } from "@/features/student-mode/data/demoWeek";
import { recipes } from "@/features/student-mode/data/recipes";
import { recipeEtTitle } from "@/features/student-mode/quickMeal";
import type { BasketLine, PlannedMeal, PlanResult, Prefs } from "./planner";

/** Pitch reference totals from the earlier hand-tuned full week (euro cents). */
export const LEGACY_DEMO_TOTAL_CENTS = 3424;
export const LEGACY_DEMO_PANTRY10_TOTAL_CENTS = 3235;

export const EGGS_PER_PACK = 10;
export const DEMO_EGG_PACK_PRICE = 1.89;

export type DemoPlanOptions = {
  budgetEuros?: number;
  days?: number;
  style?: Prefs["style"];
};

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

function styleLabel(style: Prefs["style"]): string {
  switch (style) {
    case "odav":
      return "soodne";
    case "kvaliteetne":
      return "kvaliteetne";
    case "taimne":
      return "taimne";
    case "liha":
      return "liha";
    case "sysivesikud":
      return "vähe süsivesikuid";
    default:
      return "kiire";
  }
}

function pickRecipeId(
  preferredId: string,
  style: Prefs["style"],
  slot: "breakfast" | "lunch" | "dinner",
): string {
  const preferred = recipeById(preferredId);
  if (
    style === "kiire" ||
    style === "odav" ||
    style === "kvaliteetne" ||
    style === "sysivesikud"
  ) {
    if (style === "sysivesikud") {
      const lowCarb = recipes.find(
        (r) =>
          !r.vegetarian &&
          r.mealSlots.includes(slot) &&
          !r.title.toLowerCase().includes("spaget") &&
          !r.title.toLowerCase().includes("pasta") &&
          !r.title.toLowerCase().includes("oats") &&
          !r.title.toLowerCase().includes("rice"),
      );
      return lowCarb?.id ?? preferredId;
    }
    return preferredId;
  }

  if (style === "taimne") {
    if (preferred.vegetarian) return preferredId;
    const veg = recipes.find(
      (r) => r.vegetarian && r.mealSlots.includes(slot),
    );
    return veg?.id ?? preferredId;
  }

  // liha — prefer non-vegetarian when swapping dinners/lunches
  if (preferred.vegetarian && slot !== "breakfast") {
    const meat = recipes.find(
      (r) => !r.vegetarian && r.mealSlots.includes(slot),
    );
    return meat?.id ?? preferredId;
  }
  return preferredId;
}

function buildMealsForDays(
  dayCount: number,
  style: Prefs["style"],
): PlannedMeal[] {
  const weekSlice = demoWeek.slice(0, Math.max(1, Math.min(7, dayCount)));

  return weekSlice.flatMap((day) => {
    const dayNum = DAY_INDEX[day.day] ?? 1;
    return (["breakfast", "lunch", "dinner"] as const).map((slot) => {
      const recipeId = pickRecipeId(day.meals[slot], style, slot);
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
          tags: recipe.vegetarian ? ["kiire", "taimne"] : ["kiire", "liha"],
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
}

const CHEAP_DAY_TEMPLATES: {
  breakfast: string;
  lunch: string;
  dinner: string;
}[] = [
  {
    breakfast: "berry-oats",
    lunch: "chickpea-pasta",
    dinner: "chickpea-stew",
  },
  {
    breakfast: "egg-oats",
    lunch: "egg-pasta",
    dinner: "tomato-eggs",
  },
  {
    breakfast: "berry-oats",
    lunch: "chickpea-stew",
    dinner: "egg-pasta",
  },
];

function mealFromRecipe(
  dayNum: number,
  slot: PlannedMeal["slot"],
  recipeId: string,
): PlannedMeal {
  const recipe = recipeById(recipeId);
  const costCents = computeBasketCents(
    recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      quantity: ing.quantity,
    })),
  ).totalCents;
  return {
    day: dayNum,
    slot,
    recipe: {
      id: recipe.id,
      name: recipeEtTitle(recipe.id),
      minutes: recipe.totalMinutes,
      servings: 1,
      tags: recipe.vegetarian ? ["kiire", "taimne"] : ["kiire", "liha"],
      ingredients: recipe.ingredients.map((ing) => ({
        productId: ing.productId,
        qty: ing.quantity,
      })),
      tip: "Retsepti kogused on seotud allikaviidetega toote ID-dega.",
    },
    cost: eurosFromCents(costCents),
  };
}

/** Build as many cheap days as fit under budget (at least one day). */
function buildAffordablePlan(
  budgetCents: number,
  maxDays: number,
): PlannedMeal[] {
  const meals: PlannedMeal[] = [];
  for (let day = 1; day <= Math.max(1, Math.min(7, maxDays)); day++) {
    const template = CHEAP_DAY_TEMPLATES[(day - 1) % CHEAP_DAY_TEMPLATES.length]!;
    const candidate = [
      ...meals,
      mealFromRecipe(day, "hommik", template.breakfast),
      mealFromRecipe(day, "lõuna", template.lunch),
      mealFromRecipe(day, "õhtu", template.dinner),
    ];
    const total = computeBasketCents(mealIngredients(candidate)).totalCents;
    if (total > budgetCents && meals.length > 0) break;
    // Always accept the first day even if slightly over (pack rounding).
    meals.push(...candidate.slice(meals.length));
    if (total > budgetCents) break;
  }
  return meals;
}

/**
 * Fit meals into the selected budget by dropping trailing days, then falling
 * back to a cheaper vegetarian-leaning template if even one default day
 * exceeds the budget (e.g. 20 €).
 */
function fitMealsToBudget(
  meals: PlannedMeal[],
  budgetCents: number,
  maxDays: number,
): PlannedMeal[] {
  let current = meals;
  while (true) {
    const total = computeBasketCents(mealIngredients(current)).totalCents;
    if (total <= budgetCents) return current;
    const dayNums = [...new Set(current.map((m) => m.day))].sort(
      (a, b) => a - b,
    );
    if (dayNums.length <= 1) break;
    const drop = dayNums[dayNums.length - 1]!;
    current = current.filter((m) => m.day !== drop);
  }

  const singleTotal = computeBasketCents(mealIngredients(current)).totalCents;
  if (singleTotal <= budgetCents) return current;
  return buildAffordablePlan(budgetCents, maxDays);
}

/**
 * Hackathon demo plan from sourced products, fitted to the student's budget.
 */
export function buildHackathonDemoPlan(
  options: DemoPlanOptions = {},
): PlanResult {
  const budgetEuros = options.budgetEuros ?? 35;
  const requestedDays = options.days ?? 7;
  const style = options.style ?? "kiire";
  const budgetCents = Math.round(budgetEuros * 100);

  let meals = buildMealsForDays(requestedDays, style);
  meals = fitMealsToBudget(meals, budgetCents, requestedDays);

  const keptDays = new Set(meals.map((m) => m.day)).size;
  const centsBasket = computeBasketCents(mealIngredients(meals));
  const totalCents = centsBasket.totalCents;
  const total = eurosFromCents(totalCents);
  const leftoverBudget = eurosFromCents(budgetCents - totalCents);
  const deltaNote =
    keptDays === 7 && style === "kiire"
      ? explainTotalDelta(totalCents, LEGACY_DEMO_TOTAL_CENTS)
      : `Korv ${formatEurosFromCents(totalCents)} sinu ${budgetEuros} € eelarve jaoks.`;

  const fitNote =
    keptDays < requestedDays
      ? ` Mahutasime ${keptDays}/${requestedDays} päeva, et jääda eelarve sisse.`
      : "";

  return {
    meals,
    basket: toBasketLines(centsBasket),
    total,
    saved: 0,
    leftoverBudget,
    budgetCents,
    days: keptDays,
    summary: `Näidisplaan ${keptDays} päevaks — ${styleLabel(style)} toidud sinu eelarve piires (eelarve ${budgetEuros} €).${fitNote} ${deltaNote}`,
  };
}

export type PantryStock = PantryStockCents & {
  /** Whole eggs already at home (alias for pantry.eggs). */
  eggs?: number;
};

/**
 * Apply pantry stock via the cents basket calculator.
 * Demo beat (full 7-day plan): 10 eggs at home → 1 pack instead of 2.
 */
export function applyPantryStock(
  plan: PlanResult,
  stock: PantryStock,
): PlanResult {
  const eggsAtHome =
    typeof stock.eggs === "number" ? stock.eggs : (stock["eggs"] ?? 0);
  const pantry: PantryStockCents = { ...stock, eggs: eggsAtHome };
  const budgetCents = plan.budgetCents;

  const eggsNeeded = countEggsNeeded(plan.meals);
  const packsBefore = Math.ceil(eggsNeeded / EGGS_PER_PACK);
  const missingEggs = Math.max(0, eggsNeeded - (pantry.eggs ?? 0));
  const packsAfter =
    missingEggs <= 0 ? 0 : Math.ceil(missingEggs / EGGS_PER_PACK);

  const centsBasket = computeBasketCents(mealIngredients(plan.meals), pantry);
  const totalCents = centsBasket.totalCents;
  const total = eurosFromCents(totalCents);
  const leftoverBudget = eurosFromCents(budgetCents - totalCents);

  const legacyRef =
    plan.days === 7 && (pantry.eggs ?? 0) === 10
      ? LEGACY_DEMO_PANTRY10_TOTAL_CENTS
      : plan.days === 7 && (pantry.eggs ?? 0) === 0
        ? LEGACY_DEMO_TOTAL_CENTS
        : totalCents;
  const deltaNote = explainTotalDelta(totalCents, legacyRef);

  return {
    ...plan,
    basket: toBasketLines(centsBasket),
    total,
    leftoverBudget,
    saved: 0,
    summary: `Mul on kodus ${pantry.eggs ?? 0} muna. Plaaniks vaja ${eggsNeeded} tk → ostunimekirja ${packsAfter} karp (varem ${packsBefore}). Korv ${plan.total.toFixed(2)} € → ${total.toFixed(2)} € (eelarve ${eurosFromCents(budgetCents).toFixed(0)} €). ${deltaNote}`,
  };
}

export function countEggsNeeded(meals: PlannedMeal[]): number {
  let eggs = 0;
  for (const meal of meals) {
    for (const ing of meal.recipe.ingredients) {
      if (ing.productId === "eggs" || ing.productId === "munad") {
        eggs +=
          ing.productId === "munad"
            ? Math.round(ing.qty * EGGS_PER_PACK)
            : ing.qty;
      }
    }
  }
  return eggs;
}

/** Egg packs to buy for the default 35€ / 7-day demo week. */
export function demoEggPacksToBuy(eggsAtHome: number): number {
  const plan = buildHackathonDemoPlan({ budgetEuros: 35, days: 7 });
  const needed = countEggsNeeded(plan.meals);
  const missing = Math.max(0, needed - eggsAtHome);
  return missing <= 0 ? 0 : Math.ceil(missing / EGGS_PER_PACK);
}
