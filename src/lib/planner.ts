import {
  PRODUCTS,
  RECIPES,
  productById,
  unitPrice,
  type Recipe,
} from "./catalog";

export type Prefs = {
  budget: number;
  days: number;
  style: "kiire" | "odav" | "kvaliteetne" | "taimne" | "liha" | "sysivesikud";
  delivery: string;
};

/** UI meal recipe — catalog Recipe or sourced demo recipe adapter. */
export type MealRecipe = {
  id: string;
  name: string;
  minutes: number;
  servings?: number;
  tags?: string[];
  ingredients: { productId: string; qty: number }[];
  tip: string;
};

export type PlannedMeal = {
  day: number;
  slot: "hommik" | "lõuna" | "õhtu";
  recipe: MealRecipe;
  cost: number;
};

export type BasketLine = {
  productId: string;
  name: string;
  qty: number;
  unit: string;
  lineTotal: number;
  saved: number;
  privateLabel?: boolean;
  onPromo: boolean;
  sourceUrl?: string;
  selverSku?: string;
  eSelverUrl?: string;
};

export type PlanResult = {
  meals: PlannedMeal[];
  basket: BasketLine[];
  total: number;
  saved: number;
  leftoverBudget: number;
  summary: string;
  /** Selected student budget in euro cents (drives leftover display). */
  budgetCents: number;
  /** How many plan days were kept after budget fitting. */
  days: number;
};

const DAYS_ET = ["E", "T", "K", "N", "R", "L", "P"];

export function dayLabel(day: number): string {
  return DAYS_ET[(day - 1) % 7] ?? `P${day}`;
}

function recipeCost(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, ing) => {
    const p = productById(ing.productId);
    return sum + unitPrice(p) * ing.qty;
  }, 0);
}

function matchesStyle(recipe: Recipe, style: Prefs["style"]): boolean {
  if (style === "taimne") {
    return recipe.tags.includes("taimne") || recipe.tags.includes("hommik");
  }
  if (style === "liha") {
    return recipe.tags.includes("liha") || !recipe.tags.includes("taimne");
  }
  if (style === "kiire") {
    return recipe.minutes <= 22 || recipe.tags.includes("kiire");
  }
  if (style === "kvaliteetne") {
    return recipe.minutes >= 25 || !recipe.tags.includes("kiire");
  }
  if (style === "sysivesikud") {
    return (
      recipe.tags.includes("liha") ||
      recipe.tags.includes("valk") ||
      (!recipe.name.toLowerCase().includes("spaget") &&
        !recipe.name.toLowerCase().includes("pasta") &&
        !recipe.name.toLowerCase().includes("riis") &&
        !recipe.name.toLowerCase().includes("kaera"))
    );
  }
  return recipe.tags.includes("odav") || recipeCost(recipe) < 3.5;
}

function pickRecipe(
  pool: Recipe[],
  used: Set<string>,
  preferTags: string[],
): Recipe {
  const ranked = [...pool].sort((a, b) => {
    const aScore =
      (used.has(a.id) ? -5 : 0) +
      preferTags.filter((t) => a.tags.includes(t)).length * 2 -
      recipeCost(a);
    const bScore =
      (used.has(b.id) ? -5 : 0) +
      preferTags.filter((t) => b.tags.includes(t)).length * 2 -
      recipeCost(b);
    return bScore - aScore;
  });
  return ranked[0] ?? pool[0]!;
}

export function buildPlan(prefs: Prefs): PlanResult {
  const pool = RECIPES.filter((r) => matchesStyle(r, prefs.style));
  const usable = pool.length >= 3 ? pool : RECIPES;
  const used = new Set<string>();
  const meals: PlannedMeal[] = [];

  for (let day = 1; day <= prefs.days; day++) {
    const breakfast = pickRecipe(usable, used, ["hommik", "kiire"]);
    used.add(breakfast.id);
    const lunch = pickRecipe(usable, used, ["kiire", "odav"]);
    used.add(lunch.id);
    const dinner = pickRecipe(usable, used, [
      prefs.style === "taimne" ? "taimne" : "liha",
      "odav",
    ]);
    used.add(dinner.id);

    for (const [slot, recipe] of [
      ["hommik", breakfast],
      ["lõuna", lunch],
      ["õhtu", dinner],
    ] as const) {
      meals.push({
        day,
        slot,
        recipe,
        cost: recipeCost(recipe),
      });
    }
  }

  const qtyMap = new Map<string, number>();
  for (const meal of meals) {
    for (const ing of meal.recipe.ingredients) {
      qtyMap.set(
        ing.productId,
        (qtyMap.get(ing.productId) ?? 0) + ing.qty,
      );
    }
  }

  // Always include pantry staples for student kitchens
  for (const id of ["oliivioli", "vursts"] as const) {
    if (!qtyMap.has(id)) qtyMap.set(id, 1);
  }

  let basket: BasketLine[] = [...qtyMap.entries()].map(([productId, rawQty]) => {
    const p = productById(productId);
    const qty = Math.max(1, Math.ceil(rawQty * 10) / 10);
    const pay = unitPrice(p) * qty;
    const full = p.price * qty;
    return {
      productId,
      name: p.name,
      qty,
      unit: p.unit,
      lineTotal: Math.round(pay * 100) / 100,
      saved: Math.round((full - pay) * 100) / 100,
      privateLabel: p.privateLabel,
      onPromo: p.promo !== undefined,
    };
  });

  basket.sort((a, b) => b.lineTotal - a.lineTotal);

  let total = basket.reduce((s, l) => s + l.lineTotal, 0);
  let saved = basket.reduce((s, l) => s + l.saved, 0);

  // Trim expensive non-essentials if over budget
  if (total > prefs.budget) {
    const trimOrder = ["juust", "brokoli", "jogurt", "oun", "tofu"];
    for (const id of trimOrder) {
      if (total <= prefs.budget) break;
      const idx = basket.findIndex((l) => l.productId === id);
      if (idx >= 0) {
        const line = basket[idx]!;
        total -= line.lineTotal;
        saved -= line.saved;
        basket.splice(idx, 1);
        // also drop meals that heavily depend on it? keep meals for demo honesty
      }
    }
  }

  // Prefer swapping to promo private-label if still over
  if (total > prefs.budget) {
    basket = basket.map((line) => {
      const cheaper = PRODUCTS.find(
        (p) =>
          p.category === productById(line.productId).category &&
          unitPrice(p) < unitPrice(productById(line.productId)) &&
          p.privateLabel,
      );
      if (!cheaper || total <= prefs.budget) return line;
      const newTotal = unitPrice(cheaper) * line.qty;
      total = total - line.lineTotal + newTotal;
      return {
        ...line,
        productId: cheaper.id,
        name: cheaper.name,
        lineTotal: Math.round(newTotal * 100) / 100,
        privateLabel: true,
        onPromo: cheaper.promo !== undefined,
      };
    });
  }

  total = Math.round(total * 100) / 100;
  saved = Math.round(Math.max(0, saved) * 100) / 100;
  const leftoverBudget = Math.round((prefs.budget - total) * 100) / 100;

  const summary =
    leftoverBudget >= 0
      ? `Mahud ${prefs.days} päeva menüü ~${total.toFixed(2)} € sisse. Jääb ${leftoverBudget.toFixed(2)} € puhvriks või kohvikuks.`
      : `Eelarve on napilt ülepaisutatud (${Math.abs(leftoverBudget).toFixed(2)} €). Eelista Kirde oma kaubamärki ja kampaaniatoidet.`;

  return {
    meals,
    basket,
    total,
    saved,
    leftoverBudget,
    summary,
    budgetCents: Math.round(prefs.budget * 100),
    days: prefs.days,
  };
}
