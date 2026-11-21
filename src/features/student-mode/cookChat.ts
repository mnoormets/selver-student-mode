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

/** Short student-facing names (full catalog names stay in products.ts). */
const SHORT_NAMES: Record<string, string> = {
  oats: "Kaerahelbed",
  milk: "Piim",
  berries: "Marjasegu",
  eggs: "Munad",
  spaghetti: "Spagetid",
  chickpeas: "Kikerherned",
  tomatoes: "Tomatid (konserv)",
  "mixed-veg": "Köögiviljasegu",
  chicken: "Kanofilee",
  "minced-meat": "Hakkliha",
};

function shortName(productId: string): string {
  return SHORT_NAMES[productId] ?? productById(productId).name.split(",")[0]!;
}

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

/** Explicit dish intent — wins over leftover pantry inference. */
function detectExplicitRecipeId(q: string): string | null {
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
  if (
    (q.includes("kanaliha") || q.includes("kana")) &&
    (q.includes("hautis") || q.includes("hautist") || q.includes("stew"))
  ) {
    return "chicken-stew";
  }
  if (q.includes("hautis") || q.includes("hautist")) {
    return "chickpea-stew";
  }
  if (q.includes("kana") && (q.includes("spagett") || q.includes("pasta"))) {
    return "chicken-veg-pasta";
  }
  if (q.includes("kikerherne")) {
    return "chickpea-stew";
  }
  return null;
}

function detectRecipeId(q: string, pantry: CookPantry): string | null {
  const explicit = detectExplicitRecipeId(q);
  if (explicit) return explicit;

  // Leftover spaghetti + eggs → egg & vegetable spaghetti
  if ((pantry.spaghetti ?? 0) > 0 && (pantry.eggs ?? 0) > 0) {
    if (
      q.includes("teha") ||
      q.includes("süüa") ||
      q.includes("soovita") ||
      q.includes("mida") ||
      q.includes("kiire") ||
      q.includes("osta") ||
      q.includes("poest")
    ) {
      return "egg-pasta";
    }
    return "egg-pasta";
  }
  return null;
}

function unitLabel(unit: string): string {
  if (unit === "pcs") return "tk";
  if (unit === "ml") return "ml";
  return "g";
}

function formatHaveBullet(productId: string, have: number): string | null {
  if (have <= 0) return null;
  const product = productById(productId);
  const unit = unitLabel(product.unit);
  return `• ${shortName(productId)} — ${have} ${unit}`;
}

function formatBuyBullet(line: {
  productId: string;
  packs: number;
  packQuantity: number;
  unit: string;
  unitPriceCents: number;
}): string {
  const packUnit = unitLabel(line.unit);
  const packWord = line.packs === 1 ? "pakk" : "pakki";
  return `• ${shortName(line.productId)} — ${line.packs} ${packWord} (${line.packQuantity} ${packUnit}) · ${formatEurosFromCents(line.unitPriceCents)}`;
}

function explainIngredientWhy(
  q: string,
  recipeId: string | null,
): { text: string; recipeId: string | null } {
  const aboutVeg =
    q.includes("köögiviljas") ||
    q.includes("koogiviljas") ||
    q.includes("köögivilja");
  const aboutEggs = /\bmun/.test(q);
  const aboutMeat = q.includes("hakkliha") || q.includes("kana");

  const id =
    recipeId ??
    (q.includes("pannkook") || q.includes("hakkliha")
      ? "hakkliha-pannkoogid"
      : null) ??
    (q.includes("spagett") ? "egg-pasta" : null) ??
    (q.includes("hautis") ? "chicken-stew" : null);

  if (id === "hakkliha-pannkoogid" && aboutVeg) {
    return {
      recipeId: id,
      text: [
        "Hakklihapannkookide jaoks köögiviljasegu ei ole vaja.",
        "Poest piisab tavaliselt hakklihast (+ munad, kui taigen/munad kodus puuduvad).",
        "Sibul/maitseained eeldame kodustest varudest.",
      ].join("\n"),
    };
  }

  if (id === "egg-pasta" && aboutVeg) {
    return {
      recipeId: id,
      text: "Muna-köögiviljaspagettides on segu just see „köögivilja“ osa — muidu jääks ainult muna + pasta. Kui sul on 130 g juba, ütle nii ja ostunimekiri tühjeneb.",
    };
  }

  if (aboutVeg) {
    return {
      recipeId: id,
      text: "Köögiviljasegu on demoretseptis odav ja kiire viis portsjon täita. Kui sa seda ei taha, ütle millist rooga eelistad — pakun teise retsepti.",
    };
  }

  if (aboutEggs) {
    return {
      recipeId: id,
      text: "Munad on valgu jaoks — odav ja kiire. Kui sul on mune kodus, ütle mitu tükki.",
    };
  }

  if (aboutMeat) {
    return {
      recipeId: id,
      text: "Liha / hakkliha on retsepti peamine valk. Kui sul on juba kodus, ütle mitu grammi — arvutan pakid ümber.",
    };
  }

  return {
    recipeId: id,
    text: "Küsi julgelt „miks X vaja?“ konkreetse koostisosa kohta — selgitan lihtsalt. Või ütle, mis sul kodus on.",
  };
}

/**
 * One cook-chat turn: update pantry, pick a catalog recipe, pack-math shopping list.
 * Replies use short student-friendly lines; full SKUs stay in the catalog.
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
        "Ütle lühidalt, mis sul kodus on — nt „Mul on 100 g spagette ja kaks muna.“",
      ),
      pantry,
      recipeId: null,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  const recipeId =
    detectExplicitRecipeId(q) ??
    detectRecipeId(q, pantry) ??
    opts.forceRecipeId ??
    null;

  // “Miks X vaja?” — explain, don't ask for pantry grams.
  if (
    q.includes("miks") ||
    q.includes("milleks") ||
    q.includes("miks on vaja") ||
    (q.includes("vaja") && q.includes("jaoks"))
  ) {
    const why = explainIngredientWhy(q, recipeId);
    return {
      reply: demoPrefix(demo, why.text),
      pantry,
      recipeId: why.recipeId,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  // Only ask for veg grams when the student claims to HAVE some, without amount.
  const claimsVegAtHome =
    (q.includes("mul on") || q.includes("kodus") || q.includes("alles")) &&
    (q.includes("köögiviljas") || q.includes("koogiviljas"));
  if (
    claimsVegAtHome &&
    !/(\d+)\s*g\s*(?:ameerika\s+)?k[oö]ögiviljas/.test(q) &&
    pantry["mixed-veg"] == null
  ) {
    return {
      reply: demoPrefix(
        demo,
        "Palju köögiviljasegu sul on? Nt „Mul on 130 g köögiviljasegu“.",
      ),
      pantry,
      recipeId,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  const resolvedId = recipeId ?? "egg-pasta";
  const recipe = recipes.find((r) => r.id === resolvedId);
  if (!recipe) {
    return {
      reply: demoPrefix(demo, "Seda rooga ma veel ei tea — proovi teist nime."),
      pantry,
      recipeId: null,
      demo,
      readyToCook: false,
      shoppingEmpty: true,
    };
  }

  const wantsIdea =
    q.includes("teha") ||
    q.includes("süüa") ||
    q.includes("mida") ||
    q.includes("kiire") ||
    q.includes("soovita") ||
    q.includes("osta") ||
    q.includes("poest") ||
    q.includes("nimekiri") ||
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

  const haveBullets = recipe.ingredients
    .map((ing) => formatHaveBullet(ing.productId, pantry[ing.productId] ?? 0))
    .filter(Boolean) as string[];

  const buyBullets = basket.lines.map((line) => formatBuyBullet(line));

  const title = recipeEtTitle(recipe.id);
  const shoppingEmpty = basket.lines.length === 0;
  const readyToCook = shoppingEmpty;

  const lines: string[] = [];
  if (readyToCook) {
    lines.push(`Saad kohe teha: ${title} (~${recipe.totalMinutes} min)`);
    if (haveBullets.length) {
      lines.push("", "Sul on juba:", ...haveBullets);
    }
    lines.push("", "Poest midagi juurde osta ei pea.");
  } else {
    lines.push(`Tee nii: ${title} (~${recipe.totalMinutes} min)`);
    if (haveBullets.length) {
      lines.push("", "Sul on juba:", ...haveBullets);
    }
    lines.push("", "Osta poest:", ...buyBullets);
    lines.push("", `Kokku ~${formatEurosFromCents(basket.totalCents)}`);
  }

  return {
    reply: demoPrefix(demo, lines.join("\n")),
    pantry,
    recipeId: recipe.id,
    demo,
    readyToCook,
    shoppingEmpty,
  };
}

function demoPrefix(demo: boolean, text: string): string {
  if (!demo) return text;
  return `Näidisvastus:\n${text}`;
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
  return `You are Tudengiabi for Selver Student Mode. Pick ONLY from these recipes and products. Always compute shopping in whole packs. Reply in Estonian, short and clear for students: lead with what to cook, then "Sul on juba", then "Osta poest" with pack count and price. Use short product names.\n\nProducts:\n${productLines}\n\nRecipes:\n${recipeLines}`;
}
