import { selverProducts } from "./data/products";
import type { SelverProduct } from "./types";

/** Needed amount of a product in the product's native unit (g / ml / pcs). */
export type IngredientNeed = {
  productId: string;
  quantity: number;
};

/** Pantry stock keyed by product id, same units as recipes. */
export type PantryStockCents = Readonly<Record<string, number>>;

export type BasketLineCents = {
  productId: string;
  name: string;
  /** Amount still needed after pantry (native unit). */
  neededQuantity: number;
  /** Full packs to buy. */
  packs: number;
  packQuantity: number;
  unit: SelverProduct["unit"];
  unitPriceCents: number;
  lineTotalCents: number;
  sourceUrl: string;
};

export type BasketResultCents = {
  lines: BasketLineCents[];
  /** Sum of line totals in euro cents. */
  totalCents: number;
  /** Aggregated recipe need before pantry, by product id. */
  neededByProduct: Record<string, number>;
};

function productMap(): Map<string, SelverProduct> {
  return new Map(selverProducts.map((p) => [p.id, p]));
}

/**
 * Aggregate recipe ingredient quantities, subtract pantry stock, round each
 * missing amount up to whole packs, and sum the basket in euro cents.
 * Every line price comes from the sourced product dataset.
 */
export function computeBasketCents(
  ingredients: readonly IngredientNeed[],
  pantry: PantryStockCents = {},
): BasketResultCents {
  const products = productMap();
  const neededByProduct: Record<string, number> = {};

  for (const ing of ingredients) {
    if (!products.has(ing.productId)) {
      throw new Error(`Unknown product id in recipe: ${ing.productId}`);
    }
    neededByProduct[ing.productId] =
      (neededByProduct[ing.productId] ?? 0) + ing.quantity;
  }

  const lines: BasketLineCents[] = [];

  for (const [productId, needed] of Object.entries(neededByProduct)) {
    const product = products.get(productId)!;
    const atHome = Math.max(0, pantry[productId] ?? 0);
    const missing = Math.max(0, needed - atHome);
    const packs =
      missing <= 0 ? 0 : Math.ceil(missing / product.packQuantity);
    if (packs <= 0) continue;

    lines.push({
      productId,
      name: product.name,
      neededQuantity: missing,
      packs,
      packQuantity: product.packQuantity,
      unit: product.unit,
      unitPriceCents: product.priceCents,
      lineTotalCents: packs * product.priceCents,
      sourceUrl: product.sourceUrl,
    });
  }

  lines.sort((a, b) => b.lineTotalCents - a.lineTotalCents);

  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);

  return { lines, totalCents, neededByProduct };
}

export function eurosFromCents(cents: number): number {
  return Math.round(cents) / 100;
}

export function formatEurosFromCents(cents: number): string {
  return `${eurosFromCents(cents).toFixed(2)} €`;
}
