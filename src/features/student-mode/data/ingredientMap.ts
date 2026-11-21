/**
 * Map free-text recipe ingredients (EN/ET) → catalog product ids.
 * Staples are skipped (assumed at home) so shopping lists stay student-sized.
 */

export const PANTRY_STAPLES = [
  "salt",
  "pepper",
  "oil",
  "olive oil",
  "vegetable oil",
  "water",
  "sugar",
  "brown sugar",
  "garlic",
  "garlic clove",
  "garlic cloves",
  "onion",
  "onions",
  "shallot",
  "ginger",
  "spice",
  "spices",
  "paprika",
  "cumin",
  "coriander",
  "chili",
  "chilli",
  "parsley",
  "basil",
  "oregano",
  "thyme",
  "bay leaf",
  "bay leaves",
  "stock",
  "bouillon",
  "vinegar",
  "soy sauce",
  "worcestershire",
  "mustard",
  "ketchup",
  "honey",
  "lemon juice",
  "lime juice",
  "sool",
  "pipar",
  "õli",
  "oliiviõli",
  "vesi",
  "suhkur",
  "küüslauk",
  "sibul",
] as const;

/** Longer keys first when matching. */
export const INGREDIENT_TO_PRODUCT: { needle: string; productId: string }[] = [
  { needle: "chicken breast", productId: "chicken" },
  { needle: "chicken thighs", productId: "chicken" },
  { needle: "chicken thigh", productId: "chicken" },
  { needle: "chicken", productId: "chicken" },
  { needle: "minced beef", productId: "minced-meat" },
  { needle: "ground beef", productId: "minced-meat" },
  { needle: "beef mince", productId: "minced-meat" },
  { needle: "minced meat", productId: "minced-meat" },
  { needle: "hakkliha", productId: "minced-meat" },
  { needle: "spaghetti", productId: "spaghetti" },
  { needle: "spagett", productId: "spaghetti" },
  { needle: "pasta", productId: "spaghetti" },
  { needle: "penne", productId: "spaghetti" },
  { needle: "macaroni", productId: "spaghetti" },
  { needle: "noodle", productId: "spaghetti" },
  { needle: "chickpea", productId: "chickpeas" },
  { needle: "garbanzo", productId: "chickpeas" },
  { needle: "kikerherne", productId: "chickpeas" },
  { needle: "chopped tomato", productId: "tomatoes" },
  { needle: "tinned tomato", productId: "tomatoes" },
  { needle: "canned tomato", productId: "tomatoes" },
  { needle: "tomato puree", productId: "tomatoes" },
  { needle: "tomato sauce", productId: "tomatoes" },
  { needle: "passata", productId: "tomatoes" },
  { needle: "tomatoes", productId: "tomatoes" },
  { needle: "tomato", productId: "tomatoes" },
  { needle: "mixed vegetable", productId: "mixed-veg" },
  { needle: "stir-fry vegetable", productId: "mixed-veg" },
  { needle: "frozen vegetable", productId: "mixed-veg" },
  { needle: "vegetables", productId: "mixed-veg" },
  { needle: "vegetable", productId: "mixed-veg" },
  { needle: "köögiviljas", productId: "mixed-veg" },
  { needle: "bell pepper", productId: "mixed-veg" },
  { needle: "red pepper", productId: "mixed-veg" },
  { needle: "green pepper", productId: "mixed-veg" },
  { needle: "carrot", productId: "mixed-veg" },
  { needle: "peas", productId: "mixed-veg" },
  { needle: "broccoli", productId: "mixed-veg" },
  { needle: "spinach", productId: "mixed-veg" },
  { needle: "courgette", productId: "mixed-veg" },
  { needle: "zucchini", productId: "mixed-veg" },
  { needle: "cabbage", productId: "mixed-veg" },
  { needle: "celery", productId: "mixed-veg" },
  { needle: "leek", productId: "mixed-veg" },
  { needle: "egg", productId: "eggs" },
  { needle: "muna", productId: "eggs" },
  { needle: "oat", productId: "oats" },
  { needle: "porridge", productId: "oats" },
  { needle: "kaera", productId: "oats" },
  { needle: "milk", productId: "milk" },
  { needle: "piim", productId: "milk" },
  { needle: "berry", productId: "berries" },
  { needle: "berries", productId: "berries" },
  { needle: "raspberry", productId: "berries" },
  { needle: "blueberry", productId: "berries" },
  { needle: "strawberry", productId: "berries" },
  { needle: "marja", productId: "berries" },
  { needle: "brown rice", productId: "rice" },
  { needle: "white rice", productId: "rice" },
  { needle: "rice", productId: "rice" },
  { needle: "riis", productId: "rice" },
  { needle: "flour", productId: "flour" },
  { needle: "jahu", productId: "flour" },
  { needle: "butter", productId: "butter" },
  { needle: "võid", productId: "butter" },
  { needle: "või", productId: "butter" },
  { needle: "yogurt", productId: "yogurt" },
  { needle: "yoghurt", productId: "yogurt" },
  { needle: "jogurt", productId: "yogurt" },
  { needle: "kidney bean", productId: "beans" },
  { needle: "black bean", productId: "beans" },
  { needle: "baked bean", productId: "beans" },
  { needle: "beans", productId: "beans" },
  { needle: "oad", productId: "beans" },
  { needle: "cheddar", productId: "cheese" },
  { needle: "mozzarella", productId: "cheese" },
  { needle: "parmesan", productId: "cheese" },
  { needle: "cheese", productId: "cheese" },
  { needle: "juust", productId: "cheese" },
  { needle: "bread", productId: "bread" },
  { needle: "toast", productId: "bread" },
  { needle: "leib", productId: "bread" },
  { needle: "potato", productId: "potato" },
  { needle: "potatoes", productId: "potato" },
  { needle: "kartul", productId: "potato" },
];

export function isPantryStaple(ingredient: string): boolean {
  const s = ingredient.toLowerCase().trim();
  // Word-boundary-ish: avoid "oil" matching inside unrelated tokens wrongly,
  // but still catch "olive oil", "black pepper".
  return PANTRY_STAPLES.some((p) => {
    if (s === p) return true;
    if (p.length <= 3) return new RegExp(`(?:^|\\b)${p}(?:\\b|$)`).test(s);
    return s.includes(p);
  });
}

export function mapIngredientToProductId(ingredient: string): string | null {
  const s = ingredient.toLowerCase().trim();
  if (!s) return null;
  // Prefer catalog hits before staple skip (e.g. bell pepper → mixed-veg).
  const hit = INGREDIENT_TO_PRODUCT.find((row) => s.includes(row.needle));
  if (hit) return hit.productId;
  if (isPantryStaple(s)) return null;
  return null;
}

/** Rough measure → catalog units (g / ml / pcs). */
export function parseMeasureToQuantity(
  measure: string,
  unit: "g" | "ml" | "pcs",
): number {
  const m = measure.toLowerCase().trim();
  if (!m) {
    return unit === "pcs" ? 1 : unit === "ml" ? 100 : 100;
  }

  const numMatch = m.match(/(\d+[.,]?\d*)/);
  const n = numMatch ? Number(numMatch[1]!.replace(",", ".")) : NaN;

  if (unit === "pcs") {
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.round(n));
    if (m.includes("few")) return 2;
    return 1;
  }

  if (m.includes("kg")) return Math.round((Number.isFinite(n) ? n : 1) * 1000);
  if (m.includes("lb") || m.includes("pound"))
    return Math.round((Number.isFinite(n) ? n : 1) * 450);
  if (m.includes("oz")) return Math.round((Number.isFinite(n) ? n : 1) * 28);

  if (unit === "ml") {
    if (m.includes("cup")) return Math.round((Number.isFinite(n) ? n : 1) * 240);
    if (m.includes("tbsp") || m.includes("tablespoon"))
      return Math.round((Number.isFinite(n) ? n : 1) * 15);
    if (m.includes("tsp") || m.includes("teaspoon"))
      return Math.round((Number.isFinite(n) ? n : 1) * 5);
    if (m.includes("ml")) return Math.round(Number.isFinite(n) ? n : 100);
    if (m.includes("l ") || m.endsWith("l") || m.includes("liter"))
      return Math.round((Number.isFinite(n) ? n : 1) * 1000);
    if (Number.isFinite(n)) return Math.round(n * (m.includes("cup") ? 240 : 1));
    return 100;
  }

  // grams
  if (m.includes("cup")) return Math.round((Number.isFinite(n) ? n : 1) * 150);
  if (m.includes("tbsp") || m.includes("tablespoon"))
    return Math.round((Number.isFinite(n) ? n : 1) * 10);
  if (m.includes("tsp") || m.includes("teaspoon"))
    return Math.round((Number.isFinite(n) ? n : 1) * 3);
  if (m.includes("g") && Number.isFinite(n)) return Math.round(n);
  if (Number.isFinite(n) && n >= 20) return Math.round(n);
  if (Number.isFinite(n)) return Math.round(n * 100);
  return 100;
}
