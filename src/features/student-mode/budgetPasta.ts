import { affordableMeal, formatBudgetCents as formatCents, mealBasket, readBudgetCents, type MealVariant } from "./budgetMeal";
import type { PantryStockCents } from "./computeBasket";
import { productById } from "./data/products";

const variants: readonly MealVariant[] = [
  {
    name: "Hakklihapasta tomati-oakastme ja kapsa-porgandisalatiga",
    ingredients: [
      { productId: "spaghetti", quantity: 80 },
      { productId: "minced-meat", quantity: 70 },
      { productId: "tomatoes", quantity: 55 },
      { productId: "beans", quantity: 50 },
      { productId: "cabbage-carrot", quantity: 40 },
    ],
    method: "Keeda spagetid. Prae hakkliha läbi, lisa tomatid ja oad ning kuumuta kaste. Sega pastaga ja serveeri kapsa-porgandisalat kõrvale.",
  },
  {
    name: "Hakklihapasta tomatikastme ja kapsa-porgandisalatiga",
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "minced-meat", quantity: 100 },
      { productId: "tomatoes", quantity: 80 },
      { productId: "cabbage-carrot", quantity: 60 },
    ],
    method: "Keeda spagetid. Prae hakkliha läbi, lisa tomatid ja hauta kaste. Sega pastaga ja serveeri kapsa-porgandisalat kõrvale.",
  },
  {
    name: "Lihtne hakklihapasta kapsa-porgandisalatiga",
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "minced-meat", quantity: 100 },
      { productId: "cabbage-carrot", quantity: 60 },
    ],
    method: "Keeda spagetid. Prae hakkliha läbi ja sega spagettide ning sortsukese keeduveega. Serveeri kapsa-porgandisalat kõrvale.",
  },
];

export function answerBudgetPastaQuestion(
  message: string,
  stock: PantryStockCents,
  recognizedByAi = false,
): { reply: string; readyToCook: boolean } | null {
  const question = message.toLowerCase();
  if (/nädal|nadal/.test(question)) return null;
  const budgetCents = readBudgetCents(question);
  if (budgetCents === null) return null;
  if (!recognizedByAi && !(/hakklih/.test(question) && /past|spaget/.test(question) && /salat/.test(question))) {
    return null;
  }
  const pantry = Object.fromEntries(
    Object.entries(stock).filter(([, amount]) => Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000),
  );
  const candidates = variants.map((variant) => affordableMeal(variant, budgetCents, pantry));
  candidates.sort((a, b) => b.portions - a.portions || a.basket.totalCents - b.basket.totalCents);
  const best = candidates[0]!;
  if (best.portions === 0) {
    const minimum = Math.min(...variants.map((variant) => mealBasket(variant, 1, pantry).totalCents));
    return {
      readyToCook: false,
      reply: [
        `${formatCents(budgetCents)} eest ei mahu hakklihapasta ja salat näidiskorvi.`,
        `Odavaim proovitud variant maksab ${formatCents(minimum)}. Kodus olemasolevate koostisosade kasutamine võib korvi odavamaks teha.`,
        "Hinnad on Selveri näidisandmestikust.",
      ].join("\n\n"),
    };
  }

  const buy = best.basket.lines.map((line) =>
    `• ${line.packs} × ${line.name} (${line.packQuantity} g) — ${formatCents(line.lineTotalCents)}`,
  );
  const cheaper = candidates
    .filter((candidate) => candidate.portions > 0 && candidate.basket.totalCents < best.basket.totalCents)
    .sort((a, b) => a.basket.totalCents - b.basket.totalCents)[0];
  const reply = [
    `${best.portions} ${best.portions === 1 ? "portsjon" : "portsjonit"} · ${best.variant.name}`,
    `Korv ${formatCents(best.basket.totalCents)} · alles ${formatCents(budgetCents - best.basket.totalCents)} ${formatCents(budgetCents)} eelarvest.`,
    buy.length ? `Osta täispakid\n${buy.join("\n")}` : "Kõik vajalik on kodus olemas.",
    `Kasuta kokku\n${best.variant.ingredients.map(({ productId, quantity }) =>
      `• ${quantity * best.portions} g ${productById(productId).name.split(",")[0]}`,
    ).join("\n")}`,
    `Valmistamine\n${best.variant.method} Sool ja pipar arvestasin kodustest varudest.`,
    ...(cheaper ? [
      `Väiksem väljaminek: ${cheaper.portions} ${cheaper.portions === 1 ? "portsjon" : "portsjonit"} · ${cheaper.variant.name} · ${formatCents(cheaper.basket.totalCents)}.`,
    ] : []),
    `Võrdlesin ${variants.length} retseptivarianti. Hinnad on Selveri näidisandmestikust.`,
  ].join("\n\n");
  return { reply, readyToCook: buy.length === 0 };
}
