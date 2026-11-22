import type { SelverProduct } from "../types";
import extraDemo from "./imports/extra-demo.json";
import extraFromDump from "./imports/extra-from-dump.json";

/**
 * Product catalog = demo core below + optional JSON imports
 * (`data/imports/*.json`). There is no built-in “entire Selver” feed —
 * see `data/imports/README.md` and `npm run import:products`.
 *
 * - `sourceUrl` = original citation (kept even after e-Selver checks).
 * - `priceCents` is updated only when `checkedAt` + e-Selver page confirm the pack price.
 */
export const priceSnapshotDate = "2026-11-21";

const coreProducts: readonly SelverProduct[] = [
  {
    id: "oats",
    name: "Täistera kiirkaerahelbed, TARTU MILL",
    packQuantity: 1000,
    unit: "g",
    // Exact 1 kg pack SKU not confirmed on e-Selver HTML; keep cited pack price.
    priceCents: 239,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/hsvd7t/taistera-kiirkaerahelbed-tartu-mill-1-kg?kategooria=hommikuhelbed",
    eSelverUrl: "https://www.selver.ee/taistera-kiirkaerahelbed-tartu-mill-1-kg",
  },
  {
    id: "milk",
    name: "Piim 2,5%, ALMA",
    packQuantity: 1500,
    unit: "ml",
    // e-Selver verified 1,39 € (was 1,29 € on citation snapshot).
    priceCents: 139,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/x5ww6f/piim-2-5-alma-1-5-l?kategooria=piim-koor",
    selverSku: "T000008889",
    eSelverUrl: "https://www.selver.ee/piim-2-5-alma-1-5-l",
    checkedAt: "2026-11-21",
  },
  {
    id: "berries",
    name: "Marjasegu vaarikatega, HORTEX",
    packQuantity: 300,
    unit: "g",
    priceCents: 329,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/rxd34k/marjasegu-vaarikatega-hortex-300-g?kategooria=kulm-koogiviljad",
    selverSku: "T000056734",
    eSelverUrl: "https://www.selver.ee/marjasegu-vaarikatega-hortex-300-g",
    checkedAt: "2026-11-21",
  },
  {
    id: "eggs",
    name: "Munad M10 valged, SELVER",
    packQuantity: 10,
    unit: "pcs",
    priceCents: 189,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/tqcftg/munad-m10-valged-selver-10-tk?kategooria=munad",
    selverSku: "T000032551",
    eSelverUrl: "https://www.selver.ee/munad-m10-valged-selver-10-tk",
    checkedAt: "2026-11-21",
  },
  {
    id: "spaghetti",
    name: "Spagetid, FIRST PRICE",
    packQuantity: 1000,
    unit: "g",
    // 1 kg FIRST PRICE spaghetti not listed on e-Selver; keep cited price.
    priceCents: 229,
    sourceUrl:
      "https://soodsadhinnad.ee/p/v3b22p/spagetid-first-price-1-kg?kategooria=pasta",
  },
  {
    id: "chickpeas",
    name: "Kikerherned, FIRST PRICE",
    packQuantity: 240,
    unit: "g",
    priceCents: 99,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/r5v9j6/kikerherned-first-price-240-g?kategooria=aedviljakonservid",
  },
  {
    id: "tomatoes",
    name: "Tükeldatud mahe tomatid, FIRST PRICE",
    packQuantity: 400,
    unit: "g",
    priceCents: 189,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/3nv229/tukeldatud-mahe-tomatid-first-price-400-g?kategooria=aedviljakonservid",
  },
  {
    id: "mixed-veg",
    name: "Ameerika köögiviljasegu, FIRST PRICE",
    packQuantity: 600,
    unit: "g",
    // Cited pack 600 g / 2,39 €; e-Selver listing cross-checked for demo.
    priceCents: 239,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/qtzwkv/ameerika-koogiviljasegu-first-price-600-g?kategooria=kulm-koogiviljad",
    eSelverUrl:
      "https://www.selver.ee/ameerika-koogiviljasegu-first-price-600-g",
    checkedAt: "2026-11-21",
  },
  {
    id: "chicken",
    name: "Eestimaine broileririnnafilee sisetükk, TALLEGG",
    packQuantity: 400,
    unit: "g",
    // Direct e-Selver product page + SKU not confirmed yet; keep cited pack price.
    priceCents: 539,
    sourceUrl:
      "https://soodsadhinnad.ee/en/p/t64rn3/eestimaine-broileririnnafilee-sisetukk-tallegg-400-g?kategooria=linnuliha",
  },
  {
    id: "minced-meat",
    name: "Kodune hakkliha, MAKS & MOORITS",
    packQuantity: 500,
    unit: "g",
    priceCents: 349,
    sourceUrl: "https://www.selver.ee/kodune-hakkliha-maks-moorits-500-g",
    selverSku: "T000027309",
    eSelverUrl: "https://www.selver.ee/kodune-hakkliha-maks-moorits-500-g",
    checkedAt: "2026-11-21",
  },
  {
    id: "cabbage-carrot",
    name: "Riivitud porgand ja kapsas, KADARBIKU KÖÖGIVILI",
    packQuantity: 300,
    unit: "g",
    priceCents: 139,
    sourceUrl: "https://www.selver.ee/ru/riivitud-porgand-ja-kapsas-kadarbiku-koogivili-300-g",
    selverSku: "T000070088",
    eSelverUrl: "https://www.selver.ee/riivitud-porgand-ja-kapsas-kadarbiku-koogivili-300-g",
    checkedAt: "2026-11-21",
  },
];

function mergeImported(
  core: readonly SelverProduct[],
  extras: readonly SelverProduct[],
): readonly SelverProduct[] {
  const byId = new Map<string, SelverProduct>();
  for (const p of core) byId.set(p.id, p);
  for (const p of extras) {
    if (!p?.id || !p.name) continue;
    byId.set(p.id, p);
  }
  return Array.from(byId.values());
}

const imported = [
  ...(extraDemo as SelverProduct[]),
  ...(extraFromDump as SelverProduct[]),
];

export const selverProducts: readonly SelverProduct[] = mergeImported(
  coreProducts,
  imported,
);

export function productById(id: string): SelverProduct {
  const product = selverProducts.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Unknown demo product id: ${id}`);
  }
  return product;
}
