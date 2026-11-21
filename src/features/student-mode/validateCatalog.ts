import { selverProducts } from "./data/products";
import { recipes } from "./data/recipes";
import type { Recipe, SelverProduct } from "./types";

export class CatalogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogValidationError";
  }
}

function assertProductShape(product: SelverProduct): void {
  if (!product.id?.trim()) {
    throw new CatalogValidationError("Product is missing id");
  }
  if (!Number.isFinite(product.packQuantity) || product.packQuantity <= 0) {
    throw new CatalogValidationError(
      `Product "${product.id}" is missing a valid packQuantity`,
    );
  }
  if (!Number.isFinite(product.priceCents) || product.priceCents <= 0) {
    throw new CatalogValidationError(
      `Product "${product.id}" is missing a valid priceCents`,
    );
  }
  if (product.checkedAt && !product.eSelverUrl) {
    throw new CatalogValidationError(
      `Product "${product.id}" has checkedAt but no eSelverUrl`,
    );
  }
}

/**
 * Ensures every recipe ingredient points at a catalog product with pack size
 * and price. Throws CatalogValidationError on the first problem.
 */
export function validateDemoCatalog(
  products: readonly SelverProduct[] = selverProducts,
  recipeList: readonly Recipe[] = recipes,
): void {
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const product of products) {
    assertProductShape(product);
  }

  for (const recipe of recipeList) {
    if (!recipe.ingredients.length) {
      throw new CatalogValidationError(
        `Recipe "${recipe.id}" has no ingredients`,
      );
    }
    for (const ing of recipe.ingredients) {
      const product = byId.get(ing.productId);
      if (!product) {
        throw new CatalogValidationError(
          `Recipe "${recipe.id}" references missing product "${ing.productId}"`,
        );
      }
      assertProductShape(product);
      if (!Number.isFinite(ing.quantity) || ing.quantity <= 0) {
        throw new CatalogValidationError(
          `Recipe "${recipe.id}" has invalid quantity for "${ing.productId}"`,
        );
      }
    }
  }
}
