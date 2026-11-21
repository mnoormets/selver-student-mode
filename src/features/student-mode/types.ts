export type QuantityUnit = 'g' | 'ml' | 'pcs';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner';
export type DietPreference = 'standard' | 'vegetarian';

export interface SelverProduct {
  id: string;
  name: string;
  packQuantity: number;
  unit: QuantityUnit;
  priceCents: number;
  sourceUrl: string;
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
