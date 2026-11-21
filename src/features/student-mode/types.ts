export type QuantityUnit = "g" | "ml" | "pcs";
export type MealSlot = "breakfast" | "lunch" | "dinner";
export type DietPreference = "standard" | "vegetarian";

/**
 * Sole demo product record. `sourceUrl` keeps the original citation;
 * e-Selver fields are filled only when the pack was checked on selver.ee.
 * `priceCents` is updated only from a verified e-Selver pack price.
 */
export interface SelverProduct {
  id: string;
  name: string;
  packQuantity: number;
  unit: QuantityUnit;
  /** Pack price in euro cents (verified e-Selver when checkedAt is set). */
  priceCents: number;
  /** Original price-history / citation URL (soodsadhinnad etc.). */
  sourceUrl: string;
  /** Selver internal SKU, e.g. T000032551. */
  selverSku?: string;
  /** Direct e-Selver / selver.ee product page. */
  eSelverUrl?: string;
  /** ISO date (YYYY-MM-DD) when priceCents was verified on e-Selver. */
  checkedAt?: string;
}

export interface Recipe {
  id: string;
  title: string;
  totalMinutes: number;
  mealSlots: readonly MealSlot[];
  vegetarian: boolean;
  ingredients: readonly { productId: string; quantity: number }[];
}

export interface StudentProfile {
  budgetCents: number;
  diet: DietPreference;
  cookUnderMinutes: number;
}

export interface PlanDay {
  day: string;
  meals: Readonly<Record<MealSlot, string>>;
}
