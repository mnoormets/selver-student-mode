/**
 * Legacy mock catalog for the generic planner / chat helpers.
 *
 * Hackathon demo week, pantry maths, and sourced prices live in
 * `src/features/student-mode/data/` (products.ts + recipes.ts + demoWeek.ts)
 * and are calculated via `computeBasketCents`.
 */
export type Product = {
  id: string;
  name: string;
  category: "valk" | "süsivesik" | "köögivili" | "puuvili" | "piim" | "muu";
  unit: string;
  price: number;
  promo?: number;
  privateLabel?: boolean;
  tags: string[];
};

export type Recipe = {
  id: string;
  name: string;
  minutes: number;
  servings: number;
  tags: string[];
  ingredients: { productId: string; qty: number }[];
  tip: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "pasta",
    name: "Kirde pasta 500g",
    category: "süsivesik",
    unit: "pk",
    price: 1.19,
    promo: 0.89,
    privateLabel: true,
    tags: ["odav", "kiire", "baas"],
  },
  {
    id: "riis",
    name: "Kirde riis 1kg",
    category: "süsivesik",
    unit: "pk",
    price: 1.79,
    privateLabel: true,
    tags: ["odav", "baas"],
  },
  {
    id: "kaerahelbed",
    name: "Kaerahelbed 1kg",
    category: "süsivesik",
    unit: "pk",
    price: 1.49,
    promo: 1.19,
    tags: ["hommik", "odav"],
  },
  {
    id: "leib",
    name: "Rukkileib 500g",
    category: "süsivesik",
    unit: "tk",
    price: 1.29,
    tags: ["hommik", "kiire"],
  },
  {
    id: "munad",
    name: "Munad M 10tk",
    category: "valk",
    unit: "pk",
    price: 2.49,
    promo: 1.99,
    tags: ["valk", "kiire", "baas"],
  },
  {
    id: "kana",
    name: "Kanakintsuliha 1kg",
    category: "valk",
    unit: "kg",
    price: 4.99,
    promo: 3.99,
    tags: ["valk", "liha"],
  },
  {
    id: "hakkliha",
    name: "Sea-veisehakkliha 400g",
    category: "valk",
    unit: "pk",
    price: 2.79,
    tags: ["valk", "liha"],
  },
  {
    id: "tofu",
    name: "Tofu 300g",
    category: "valk",
    unit: "pk",
    price: 2.29,
    tags: ["valk", "taimne"],
  },
  {
    id: "oad",
    name: "Kirde oad tomatikastmes 400g",
    category: "valk",
    unit: "tk",
    price: 1.09,
    privateLabel: true,
    tags: ["valk", "taimne", "odav", "konserv"],
  },
  {
    id: "kikerherned",
    name: "Kikerherned 400g",
    category: "valk",
    unit: "tk",
    price: 0.99,
    promo: 0.79,
    tags: ["valk", "taimne", "odav"],
  },
  {
    id: "piim",
    name: "Piim 2,5% 1l",
    category: "piim",
    unit: "l",
    price: 0.95,
    tags: ["hommik", "baas"],
  },
  {
    id: "jogurt",
    name: "Naturaalne jogurt 400g",
    category: "piim",
    unit: "tk",
    price: 1.19,
    tags: ["hommik", "vahepala"],
  },
  {
    id: "juust",
    name: "Eesti juust 300g",
    category: "piim",
    unit: "tk",
    price: 2.89,
    promo: 2.29,
    tags: ["valk", "kiire"],
  },
  {
    id: "banaan",
    name: "Banaanid 1kg",
    category: "puuvili",
    unit: "kg",
    price: 1.49,
    tags: ["puuvili", "hommik", "odav"],
  },
  {
    id: "oun",
    name: "Eesti õunad 1kg",
    category: "puuvili",
    unit: "kg",
    price: 1.69,
    tags: ["puuvili", "kohalik"],
  },
  {
    id: "porgand",
    name: "Porgandid 1kg",
    category: "köögivili",
    unit: "kg",
    price: 0.89,
    tags: ["köögivili", "odav", "baas"],
  },
  {
    id: "sibul",
    name: "Sibul 1kg",
    category: "köögivili",
    unit: "kg",
    price: 0.79,
    tags: ["köögivili", "baas"],
  },
  {
    id: "tomat",
    name: "Tomati konserv 400g",
    category: "köögivili",
    unit: "tk",
    price: 0.95,
    privateLabel: true,
    tags: ["köögivili", "odav", "konserv"],
  },
  {
    id: "brokoli",
    name: "Külmutatud brokoli 400g",
    category: "köögivili",
    unit: "pk",
    price: 1.59,
    tags: ["köögivili", "kiire"],
  },
  {
    id: "kartul",
    name: "Kartul 2kg",
    category: "süsivesik",
    unit: "pk",
    price: 1.99,
    tags: ["odav", "baas"],
  },
  {
    id: "oliivioli",
    name: "Päevalilleõli 1l",
    category: "muu",
    unit: "l",
    price: 2.19,
    tags: ["baas"],
  },
  {
    id: "vursts",
    name: "Vürtsisegu / sool",
    category: "muu",
    unit: "tk",
    price: 0.89,
    tags: ["baas"],
  },
];

export const RECIPES: Recipe[] = [
  {
    id: "pasta-kana",
    name: "Kreemjas kanapasta",
    minutes: 25,
    servings: 2,
    tags: ["liha", "kiire"],
    ingredients: [
      { productId: "pasta", qty: 0.5 },
      { productId: "kana", qty: 0.35 },
      { productId: "sibul", qty: 0.15 },
      { productId: "piim", qty: 0.2 },
    ],
    tip: "Küpseta kana ühe panniga, et ühiselamus vähem nõusid tekitada.",
  },
  {
    id: "omlett",
    name: "Köögiviljaomlett",
    minutes: 12,
    servings: 1,
    tags: ["kiire", "taimne", "hommik"],
    ingredients: [
      { productId: "munad", qty: 0.3 },
      { productId: "porgand", qty: 0.1 },
      { productId: "sibul", qty: 0.1 },
      { productId: "juust", qty: 0.1 },
    ],
    tip: "Jääkporgand riivi peeneks — valmib kiiremini.",
  },
  {
    id: "oad-riis",
    name: "Oad riisiga",
    minutes: 18,
    servings: 2,
    tags: ["taimne", "odav"],
    ingredients: [
      { productId: "oad", qty: 1 },
      { productId: "riis", qty: 0.25 },
      { productId: "sibul", qty: 0.15 },
      { productId: "tomat", qty: 0.5 },
    ],
    tip: "Lisa külmutatud brokolit, kui tahad rohkem rohelist.",
  },
  {
    id: "kiker-kauss",
    name: "Kikerherneste kauss",
    minutes: 20,
    servings: 2,
    tags: ["taimne", "odav"],
    ingredients: [
      { productId: "kikerherned", qty: 1 },
      { productId: "riis", qty: 0.2 },
      { productId: "porgand", qty: 0.2 },
      { productId: "jogurt", qty: 0.25 },
    ],
    tip: "Prae kikerherned krõbedaks — tundub nagu restoranitoit.",
  },
  {
    id: "hakk-pasta",
    name: "Kiire bolonese",
    minutes: 22,
    servings: 3,
    tags: ["liha", "odav"],
    ingredients: [
      { productId: "pasta", qty: 0.6 },
      { productId: "hakkliha", qty: 1 },
      { productId: "tomat", qty: 1 },
      { productId: "sibul", qty: 0.2 },
    ],
    tip: "Tee korraga 3 portsjonit — järgmine päev on juba valmis.",
  },
  {
    id: "tofu-wok",
    name: "Tofu wok köögiviljadega",
    minutes: 20,
    servings: 2,
    tags: ["taimne", "kiire"],
    ingredients: [
      { productId: "tofu", qty: 1 },
      { productId: "brokoli", qty: 0.5 },
      { productId: "riis", qty: 0.2 },
      { productId: "sibul", qty: 0.1 },
    ],
    tip: "Kuivata tofu paberrätikuga, siis saab ilusa praepinna.",
  },
  {
    id: "kartul-muna",
    name: "Ahjukartul munaga",
    minutes: 35,
    servings: 2,
    tags: ["odav", "liha"],
    ingredients: [
      { productId: "kartul", qty: 0.4 },
      { productId: "munad", qty: 0.4 },
      { productId: "porgand", qty: 0.2 },
      { productId: "oliivioli", qty: 0.05 },
    ],
    tip: "Kui aega pole, keeda kartulid — 15 minutiga valmis.",
  },
  {
    id: "puder",
    name: "Banaanipuder",
    minutes: 8,
    servings: 1,
    tags: ["hommik", "kiire", "taimne", "odav"],
    ingredients: [
      { productId: "kaerahelbed", qty: 0.08 },
      { productId: "piim", qty: 0.25 },
      { productId: "banaan", qty: 0.2 },
    ],
    tip: "Valmista kaerahelbed õhtul üleöö — hommikul ainult soojenda.",
  },
  {
    id: "voileib",
    name: "Juustuvoileib õunaga",
    minutes: 5,
    servings: 1,
    tags: ["kiire", "hommik", "vahepala"],
    ingredients: [
      { productId: "leib", qty: 0.2 },
      { productId: "juust", qty: 0.08 },
      { productId: "oun", qty: 0.25 },
    ],
    tip: "Loengutevaheline 5-minutiline päästerõngas.",
  },
];

export function productById(id: string): Product {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown product ${id}`);
  return p;
}

export function unitPrice(p: Product): number {
  return p.promo ?? p.price;
}
