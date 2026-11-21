import {
  computeBasketCents,
  type IngredientNeed,
  type PantryStockCents,
} from "./computeBasket";
import { productById } from "./data/products";

export type MealVariant = {
  name: string;
  ingredients: readonly IngredientNeed[];
  method: string;
};

export type WeeklyMealScope = "all-meals" | "dinners";

export type BudgetMealContext =
  | { dish: "cheese-noodles"; budgetCents: number | null }
  | { dish: "weekly-meals"; budgetCents: number | null; scope: WeeklyMealScope | null };

const euroFormat = new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" });

export function formatBudgetCents(cents: number): string {
  return euroFormat.format(cents / 100).replaceAll("\u00a0", " ");
}

export function readBudgetCents(message: string): number | null {
  const budget = message.match(
    /(?:^|\s|\()(?:(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:€|eur(?:ot?|i)?\b)|€\s*(\d{1,6}(?:[.,]\d{1,2})?)(?!\d|[.,]\d))/i,
  );
  return budget ? Math.round(Number((budget[1] ?? budget[2]).replace(",", ".")) * 100) : null;
}

export function isBudgetOnlyMessage(message: string): boolean {
  return /^(?:(?:mul on|eelarve on|aga|ainult)\s+)*(?:\d+(?:[.,]\d{1,2})?\s*(?:€|eur(?:ot?|i)?)|€\s*\d+(?:[.,]\d{1,2})?)[.!?\s]*$/i.test(message);
}

export function mealBasket(variant: MealVariant, portions: number, pantry: PantryStockCents) {
  return computeBasketCents(
    variant.ingredients.map(({ productId, quantity }) => ({
      productId,
      quantity: quantity * portions,
    })),
    pantry,
  );
}

export function affordableMeal(
  variant: MealVariant,
  budgetCents: number,
  pantry: PantryStockCents,
  pantryOnly: readonly string[] = [],
) {
  // Each ingredient bounds the portions even if all the money were spent on it.
  let upper = Math.min(...variant.ingredients.map(({ productId, quantity }) => {
    const product = productById(productId);
    const packs = pantryOnly.includes(productId) ? 0 : Math.floor(budgetCents / product.priceCents);
    return Math.floor(((pantry[productId] ?? 0) + packs * product.packQuantity) / quantity);
  }));
  // Whole-pack basket cost never decreases when adding portions.
  let portions = 0;
  while (portions < upper) {
    const middle = portions + Math.ceil((upper - portions) / 2);
    if (mealBasket(variant, middle, pantry).totalCents <= budgetCents) {
      portions = middle;
    } else {
      upper = middle - 1;
    }
  }
  return { variant, portions, basket: mealBasket(variant, portions, pantry) };
}
