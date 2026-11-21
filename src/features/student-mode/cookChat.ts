import {
  computeBasketCents,
  formatEurosFromCents,
  type PantryStockCents,
} from "./computeBasket";
import { recipes } from "./data/recipes";
import { productById, selverProducts } from "./data/products";
import { recipeEtTitle } from "./quickMeal";

export type CookPantry = PantryStockCents;

export type CookChatTurnResult = {
  reply: string;
  pantry: CookPantry;
  recipeId: string | null;
  demo: boolean;
  readyToCook: boolean;
  shoppingEmpty: boolean;
};

const WORD_NUMBERS: Record<string, number> = {
  üks: 1,
  uhe: 1,
  ühe: 1,
  kaks: 2,
  kahe: 2,
  kolm: 3,
  nelja: 4,
  neli: 4,
  viis: 5,
  kuus: 6,
  seitse: 7,
  kaheksa: 8,
  üheksa: 9,
  uheksa: 9,
  kymme: 10,
  kümme: 10,
};

function parseNumberToken(raw: string): number | null {
  const n = Number(raw.replace(",", "."));
  if (Number.isFinite(n)) return n;
  return WORD_NUMBERS[raw.toLowerCase()] ?? null;
}

/** Merge pantry mentions from one student utterance. */
export function mergePantryFromUtterance(
  text: string,
  pantry: CookPantry = {},
): CookPantry {
  const q = text.toLowerCase();
  const next: Record<string, number> = { ...pantry };

  const eggDigit = q.match(/(\d+)\s*mun/);
  const eggWord = q.match(
    /\b(üks|ühe|uhe|kaks|kahe|kolm|neli|nelja|viis|kuus|seitse|kaheksa|üheksa|uheksa|kümme|kymme)\s+mun/,
  );
  if (eggDigit) {
    next.eggs = Number(eggDigit[1]);
  } else if (eggWord) {
    next.eggs = parseNumberToken(eggWord[1]!) ?? next.eggs ?? 2;
  } else if (/\bmun/.test(q) && (q.includes("mul on") || q.includes("kodus"))) {
    next.eggs = next.eggs ?? 2;
  }

  const spaghetti = q.match(/(\d+)\s*g\s*spagett/);
  if (spaghetti) {
    next.spaghetti = Number(spaghetti[1]);
  } else if (q.includes("spagett") || q.includes("spaget")) {
    next.spaghetti = next.spaghetti ?? 100;
  }

  const veg =
    q.match(/(\d+)\s*g\s*(?:ameerika\s+)?köögiviljas/) ||
    q.match(/(\d+)\s*g\s*(?:ameerika\s+)?koogiviljas/) ||
    q.match(/(\d+)\s*g\s*mixed[- ]?veg/);
  if (veg) {
    next["mixed-veg"] = Number(veg[1]);
  } else if (
    (q.includes("köögiviljas") || q.includes("koogiviljas")) &&
    (q.includes("mul on") || q.includes("ka "))
  ) {
    // Quantity missing — leave unset so the turn can ask.
  }

  const minced = q.match(/(\d+)\s*g\s*hakkliha/);
  if (minced) {
    next["minced-meat"] = Number(minced[1]);
  }

  const chicken = q.match(/(\d+)\s*g\s*kana/);
  if (chicken) {
    next.chicken = Number(chicken[1]);
  }

  return next;
}

function detectRecipeId(q: string, pantry: CookPantry): string | null {
  if (
    q.includes("muna-köögiviljaspagett") ||
    q.includes("munaspagett") ||
    q.includes("egg pasta")
  ) {
    return "egg-pasta";
  }
  if (q.includes("hakkliha") && q.includes("pann")) {
    return "hakkliha-pannkoogid";
  }
  if (q.includes("tomati") && q.includes("mun")) {
    return "tomato-eggs";
  }
  if (q.includes("kana") && (q.includes("spagett") || q.includes("pasta"))) {
    return "chicken-veg-pasta";
  }
  // Leftover spaghetti + eggs → egg & vegetable spaghetti
  if (
    (pantry.spaghetti ?? 0) > 0 &&
    (pantry.eggs ?? 0) > 0 &&
    (q.includes("teha") ||
      q.includes("süüa") ||
      q.includes("soovita") ||
      q.includes("mida") ||
      q.includes("kiire"))
  ) {
    return "egg-pasta";
  }
  if ((pantry.spaghetti ?? 0) > 0 && (pantry.eggs ?? 0) > 0) {
    return "egg-pasta";
  }
  return null;
}

function unitLabel(unit: string): string {
  if (unit === "pcs") return "tk";
  if (unit === "ml") return "ml";
  return "g";
}

function formatHaveLine(
  productId: string,
  have: number,
  need: number,
): string | null {
  if (have <= 0) return null;
  const product = productById(productId);
  const unit = unitLabel(product.unit);
  const enough = have >= need ? "" : ` / vaja ${need} ${unit}`;
  return `${product.name} (${have} ${unit} olemas${enough})`;
}

/**
 * One cook-chat turn: update pantry, pick a catalog recipe, pack-math shopping list.
 * When `demo` is true, reply is prefixed as a sample answer (no live AI).
 */
export function answerCookChatTurn(
  question: string,
  pantryIn: CookPantry = {},
  opts: { demo?: boolean; forceRecipeId?: string | null } = {},
): CookChatTurnResult {
  const demo = opts.demo ?? true;
  const q = question.toLowerCase().trim();
  const pantry = mergePantryFromUtterance(question, pantryIn);

  if (!q) {
    return {
      reply: demoPrefix(
        demo,
        "Ütle, mis sul kodus on või mille järele isu on — nt „Mul on 100 g spagette ja kaks muna.“",
      ),
      pantry,
      recipeId: null,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  // Ask for missing quantity when veg is mentioned without grams
  if (
    (q.includes("köögiviljas") || q.includes("koogiviljas")) &&
    !/(\d+)\s*g\s*(?:ameerika\s+)?k[oö]ögiviljas/.test(q) &&
    pantry["mixed-veg"] == null
  ) {
    return {
      reply: demoPrefix(
        demo,
        "Palju köögiviljasegu sul on (grammides)? Nt „Mul on 130 g köögiviljasegu“.",
      ),
      pantry,
      recipeId: opts.forceRecipeId ?? detectRecipeId(q, pantry),
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  const recipeId =
    opts.forceRecipeId ?? detectRecipeId(q, pantry) ?? "egg-pasta";
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) {
    return {
      reply: demoPrefix(demo, "Seda retsepti andmestikus ei leia."),
      pantry,
      recipeId: null,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  // If they only said ingredients with no cook intent and we still lack key amounts
  const wantsIdea =
    q.includes("teha") ||
    q.includes("süüa") ||
    q.includes("mida") ||
    q.includes("kiire") ||
    q.includes("soovita") ||
    q.includes("ka ") ||
    Object.keys(pantry).length > 0;

  if (!wantsIdea) {
    return {
      reply: demoPrefix(
        demo,
        "Küsi nt „Mul on 100 g spagette ja kaks muna. Mida ma kiiresti teha saaks?“",
      ),
      pantry,
      recipeId: null,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  const basket = computeBasketCents(
    recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      quantity: ing.quantity,
    })),
    pantry,
  );

  const haveLines = recipe.ingredients
    .map((ing) => formatHaveLine(ing.productId, pantry[ing.productId] ?? 0, ing.quantity))
    .filter(Boolean) as string[];

  const missing = recipe.ingredients
    .map((ing) => {
      const have = pantry[ing.productId] ?? 0;
      const need = Math.max(0, ing.quantity - have);
      if (need <= 0) return null;
      const product = productById(ing.productId);
      return `${need} ${unitLabel(product.unit)} ${product.name}`;
    })
    .filter(Boolean) as string[];

  const buyLinesFixed = basket.lines.map((line) => {
    const packUnit = line.unit === "pcs" ? "tk" : line.unit;
    return `${line.packs}× ${line.name} (${line.packQuantity} ${packUnit}, ${formatEurosFromCents(line.unitPriceCents)})`;
  });

  const title = recipeEtTitle(recipe.id);
  const shoppingEmpty = basket.lines.length === 0;
  const readyToCook = shoppingEmpty && missing.length === 0;

  let body: string;
  if (readyToCook) {
    body = [
      `Saad kohe teha: ${title} (~${recipe.totalMinutes} min).`,
      `Juba olemas: ${haveLines.join("; ") || "—"}.`,
      "Ostunimekiri: tühi — midagi juurde osta ei pea.",
      "Sool, pipar ja õli eeldame kodustest varudest.",
    ].join(" ");
  } else {
    body = [
      `Sobib: ${title} (~${recipe.totalMinutes} min).`,
      `Juba olemas: ${haveLines.join("; ") || "—"}.`,
      missing.length ? `Puudu: ${missing.join("; ")}.` : null,
      buyLinesFixed.length
        ? `Ostunimekiri: ${buyLinesFixed.join("; ")}.`
        : "Ostunimekiri: tühi.",
      "Sool, pipar ja õli eeldame kodustest varudest.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return {
    reply: demoPrefix(demo, body),
    pantry,
    recipeId: recipe.id,
    demo,
    readyToCook,
    shoppingEmpty,
  };
}

function demoPrefix(demo: boolean, text: string): string {
  if (!demo) return text;
  return `Näidisvastus (AI ühenduseta): ${text}`;
}

/** Catalog snapshot for an LLM system prompt (no secrets). */
export function cookChatCatalogPrompt(): string {
  const productLines = selverProducts
    .map(
      (p) =>
        `- ${p.id}: ${p.name}, pack ${p.packQuantity}${p.unit}, ${formatEurosFromCents(p.priceCents)}${p.eSelverUrl ? `, ${p.eSelverUrl}` : ` (${p.sourceUrl})`}${p.checkedAt ? `, checked ${p.checkedAt}` : ""}`,
    )
    .join("\n");
  const recipeLines = recipes
    .map((r) => {
      const ings = r.ingredients
        .map((i) => `${i.quantity} ${i.productId}`)
        .join(", ");
      return `- ${r.id} (${recipeEtTitle(r.id)}, ${r.totalMinutes} min): ${ings}`;
    })
    .join("\n");
  return `You are Tudengiabi for Selver Student Mode. Pick ONLY from these recipes and products. Always compute shopping in whole packs. Reply in Estonian. If a quantity is needed and missing, ask for it.\n\nProducts:\n${productLines}\n\nRecipes:\n${recipeLines}`;
}
