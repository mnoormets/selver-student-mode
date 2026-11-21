import { demoProfile, demoWeek } from "./data/demoWeek";
import { priceSnapshotDate, selverProducts } from "./data/products";
import { recipes } from "./data/recipes";
import { validateDemoCatalog } from "./validateCatalog";

/** Payload Lovable (or any external demo) can import as-is. */
export type LovableDemoExport = {
  exportedAt: string;
  priceSnapshotDate: string;
  profile: typeof demoProfile;
  products: typeof selverProducts;
  recipes: typeof recipes;
  demoWeek: typeof demoWeek;
};

export function buildLovableDemoExport(
  exportedAt: string = new Date().toISOString(),
): LovableDemoExport {
  validateDemoCatalog();
  return {
    exportedAt,
    priceSnapshotDate,
    profile: demoProfile,
    products: selverProducts,
    recipes,
    demoWeek,
  };
}

export function lovableDemoJson(exportedAt?: string): string {
  return `${JSON.stringify(buildLovableDemoExport(exportedAt), null, 2)}\n`;
}
