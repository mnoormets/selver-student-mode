import {
  computeBasketCents,
  formatEurosFromCents,
  type PantryStockCents,
} from "./computeBasket";
import { recipes } from "./data/recipes";
import { selverProducts } from "./data/products";
import { recipeEtTitle } from "./quickMeal";

const DISH_ALIASES: { recipeId: string; needles: string[] }[] = [
  {
    recipeId: "hakkliha-pannkoogid",
    needles: ["hakkliha pannkook", "hakklihapannkook", "pannkook"],
  },
  {
    recipeId: "egg-pasta",
    needles: ["muna-köögiviljaspagett", "munaspagett", "egg pasta"],
  },
  {
    recipeId: "tomato-eggs",
    needles: ["tomati-muna", "munapanniroog"],
  },
  {
    recipeId: "chicken-tomato-pasta",
    needles: ["kana-tomati", "kanapasta", "kana spagett"],
  },
];

function detectRecipeId(q: string): string | null {
  for (const row of DISH_ALIASES) {
    if (row.needles.some((n) => q.includes(n))) return row.recipeId;
  }
  if (q.includes("hakkliha") && q.includes("pann")) {
    return "hakkliha-pannkoogid";
  }
  return null;
}

function parsePantry(q: string): {
  stock: Record<string, number>;
  notes: string[];
} {
  const stock: Record<string, number> = {};
  const notes: string[] = [];

  if (q.includes("taigen") || q.includes("taign") || q.includes("dough")) {
    notes.push("taigen / tainas (kodune, pole ostunimekirjas)");
  }

  // Estonian forms: muna / mune / muneid / munad
  if (/\bmun/.test(q)) {
    const m = q.match(/(\d+)\s*mun/);
    stock.eggs = m ? Number(m[1]) : 2;
    notes.push(`${stock.eggs} muna`);
  }

  const spaghetti = q.match(/(\d+)\s*g\s*spagett/);
  if (spaghetti) {
    stock.spaghetti = Number(spaghetti[1]);
    notes.push(`${stock.spaghetti} g spagette`);
  } else if (q.includes("spagett") || q.includes("spaget")) {
    stock.spaghetti = 100;
    notes.push("spagetid");
  }

  if (q.includes("hakkliha") && (q.includes("kodus") || q.includes("mul on"))) {
    // only if they claim to already have minced meat at home
    if (!q.includes("tahaksin") && !q.includes("teha") && !q.includes("osta")) {
      stock["minced-meat"] = 300;
      notes.push("hakkliha");
    }
  }

  return { stock, notes };
}

export function isPantryCookQuestion(q: string): boolean {
  const wantsBuy =
    q.includes("osta") ||
    q.includes("poest") ||
    q.includes("puudu") ||
    q.includes("mida peaks") ||
    q.includes("mida saan") ||
    q.includes("tahaksin teha") ||
    q.includes("tahan teha");
  const hasPantry =
    q.includes("kodus") || q.includes("mul on") || q.includes("alles");
  return Boolean(detectRecipeId(q) && (wantsBuy || hasPantry));
}

/**
 * Answer “I have X at home, I want to cook Y — what should I buy?”
 * using catalog recipes + cents basket maths.
 */
export function answerPantryCookQuestion(question: string): string | null {
  const q = question.toLowerCase().trim();
  const recipeId = detectRecipeId(q);
  if (!recipeId) return null;

  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return null;

  const { stock, notes } = parsePantry(q);

  const products = new Map(selverProducts.map((p) => [p.id, p]));
  const basket = computeBasketCents(
    recipe.ingredients.map((ing) => ({
      productId: ing.productId,
      quantity: ing.quantity,
    })),
    stock,
  );

  const haveLines = recipe.ingredients
    .map((ing) => {
      const product = products.get(ing.productId)!;
      const have = stock[ing.productId] ?? 0;
      if (have < ing.quantity) return null;
      const unit =
        product.unit === "pcs" ? "tk" : product.unit === "ml" ? "ml" : "g";
      return `${product.name} (${have} ${unit} olemas)`;
    })
    .filter(Boolean);

  if (notes.some((n) => n.includes("taigen"))) {
    haveLines.unshift("taigen / tainas kodus");
  }

  const buyLines = basket.lines.map((line) => {
    const unitLabel = line.unit === "pcs" ? "karp" : "pk";
    return `${line.packs}× ${line.name} (${formatEurosFromCents(line.unitPriceCents)}/${unitLabel} → ${formatEurosFromCents(line.lineTotalCents)})`;
  });

  const missing = recipe.ingredients
    .map((ing) => {
      const product = products.get(ing.productId)!;
      const have = stock[ing.productId] ?? 0;
      const need = Math.max(0, ing.quantity - have);
      if (need <= 0) return null;
      const unit =
        product.unit === "pcs" ? "tk" : product.unit === "ml" ? "ml" : "g";
      return `${need} ${unit} ${product.name}`;
    })
    .filter(Boolean);

  const title = recipeEtTitle(recipe.id);
  const parts = [
    `Sobib: ${title} (~${recipe.totalMinutes} min).`,
    `Juba olemas: ${haveLines.join("; ") || "—"}.`,
    missing.length ? `Retseptist puudu: ${missing.join("; ")}.` : null,
    buyLines.length
      ? `Poest: ${buyLines.join("; ")}. Kokku ${formatEurosFromCents(basket.totalCents)}.`
      : "Poest midagi juurde osta ei pea.",
    "Sool, pipar ja õli eeldame kodustest varudest.",
  ];

  return parts.filter(Boolean).join(" ");
}
