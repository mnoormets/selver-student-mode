import type { SelverProduct } from '../types';

// Date the controlled snapshot was compiled. The linked price histories have their own observation dates.
export const priceSnapshotDate = '2026-11-21';

export const selverProducts: readonly SelverProduct[] = [
  {
    id: "oats",
    name: "Täistera kiirkaerahelbed, TARTU MILL",
    packQuantity: 1000,
    unit: "g",
    priceCents: 239,
    sourceUrl: "https://soodsadhinnad.ee/en/p/hsvd7t/taistera-kiirkaerahelbed-tartu-mill-1-kg?kategooria=hommikuhelbed",
  },
  {
    id: "milk",
    name: "Piim 2,5%, ALMA",
    packQuantity: 1500,
    unit: "ml",
    priceCents: 129,
    sourceUrl: "https://soodsadhinnad.ee/en/p/x5ww6f/piim-2-5-alma-1-5-l?kategooria=piim-koor",
  },
  {
    id: "berries",
    name: "Marjasegu vaarikatega, HORTEX",
    packQuantity: 300,
    unit: "g",
    priceCents: 329,
    sourceUrl: "https://soodsadhinnad.ee/en/p/rxd34k/marjasegu-vaarikatega-hortex-300-g?kategooria=kulm-koogiviljad",
  },
  {
    id: "eggs",
    name: "Munad M10 valged, SELVER",
    packQuantity: 10,
    unit: "pcs",
    priceCents: 189,
    sourceUrl: "https://soodsadhinnad.ee/en/p/tqcftg/munad-m10-valged-selver-10-tk?kategooria=munad",
  },
  {
    id: "spaghetti",
    name: "Spagetid, FIRST PRICE",
    packQuantity: 1000,
    unit: "g",
    priceCents: 229,
    sourceUrl: "https://soodsadhinnad.ee/p/v3b22p/spagetid-first-price-1-kg?kategooria=pasta",
  },
  {
    id: "chickpeas",
    name: "Kikerherned, FIRST PRICE",
    packQuantity: 240,
    unit: "g",
    priceCents: 99,
    sourceUrl: "https://soodsadhinnad.ee/en/p/r5v9j6/kikerherned-first-price-240-g?kategooria=aedviljakonservid",
  },
  {
    id: "tomatoes",
    name: "Tükeldatud mahe tomatid, FIRST PRICE",
    packQuantity: 400,
    unit: "g",
    priceCents: 189,
    sourceUrl: "https://soodsadhinnad.ee/en/p/3nv229/tukeldatud-mahe-tomatid-first-price-400-g?kategooria=aedviljakonservid",
  },
  {
    id: "mixed-veg",
    name: "Ameerika köögiviljasegu, FIRST PRICE",
    packQuantity: 600,
    unit: "g",
    priceCents: 239,
    sourceUrl: "https://soodsadhinnad.ee/en/p/qtzwkv/ameerika-koogiviljasegu-first-price-600-g?kategooria=kulm-koogiviljad",
  },
  {
    id: "chicken",
    name: "Eestimaine broileririnnafilee sisetükk, TALLEGG",
    packQuantity: 400,
    unit: "g",
    priceCents: 539,
    sourceUrl: "https://soodsadhinnad.ee/en/p/t64rn3/eestimaine-broileririnnafilee-sisetukk-tallegg-400-g?kategooria=linnuliha",
  },
];
