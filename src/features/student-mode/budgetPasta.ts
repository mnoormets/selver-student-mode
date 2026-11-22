import {
  affordableMeal,
  formatBudgetCents as formatCents,
  mealBasket,
  readBudgetCents,
  type MealVariant,
} from "./budgetMeal";
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
    method:
      "Keeda spagetid. Prae hakkliha läbi, lisa tomatid ja oad ning kuumuta kaste. Sega pastaga ja serveeri kapsa-porgandisalat kõrvale.",
  },
  {
    name: "Hakklihapasta tomatikastme ja kapsa-porgandisalatiga",
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "minced-meat", quantity: 100 },
      { productId: "tomatoes", quantity: 80 },
      { productId: "cabbage-carrot", quantity: 60 },
    ],
    method:
      "Keeda spagetid. Prae hakkliha läbi, lisa tomatid ja hauta kaste. Sega pastaga ja serveeri kapsa-porgandisalat kõrvale.",
  },
  {
    name: "Lihtne hakklihapasta kapsa-porgandisalatiga",
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "minced-meat", quantity: 100 },
      { productId: "cabbage-carrot", quantity: 60 },
    ],
    method:
      "Keeda spagetid. Prae hakkliha läbi ja sega spagettide ning sortsukese keeduveega. Serveeri kapsa-porgandisalat kõrvale.",
  },
];

export type BudgetPastaChoice = {
  id: string;
  portions: number;
  totalCents: number;
  leftoverCents: number;
  totalLabel: string;
  leftoverLabel: string;
  dishName: string;
  shoppingLines: string[];
  useLines: string[];
  method: string;
  recommended: boolean;
};

export type BudgetPastaAnswer = {
  reply: string;
  readyToCook: boolean;
  choices?: BudgetPastaChoice[];
};

function buildChoice(
  id: string,
  candidate: ReturnType<typeof affordableMeal>,
  budgetCents: number,
  recommended: boolean,
): BudgetPastaChoice {
  const shoppingLines = candidate.basket.lines.map(
    (line) =>
      `${line.packs} × ${line.name} (${line.packQuantity} g) — ${formatCents(line.lineTotalCents)}`,
  );
  const useLines = candidate.variant.ingredients.map(({ productId, quantity }) => {
    const shortName = productById(productId).name.split(",")[0] ?? productId;
    return `${quantity * candidate.portions} g ${shortName}`;
  });
  return {
    id,
    portions: candidate.portions,
    totalCents: candidate.basket.totalCents,
    leftoverCents: budgetCents - candidate.basket.totalCents,
    totalLabel: formatCents(candidate.basket.totalCents),
    leftoverLabel: formatCents(budgetCents - candidate.basket.totalCents),
    dishName: candidate.variant.name,
    shoppingLines,
    useLines,
    method: `${candidate.variant.method} Sool ja pipar arvestasin kodustest varudest.`,
    recommended,
  };
}

export function answerBudgetPastaQuestion(
  message: string,
  stock: PantryStockCents,
  recognizedByAi = false,
): BudgetPastaAnswer | null {
  const question = message.toLowerCase();
  if (/nädal|nadal/.test(question)) return null;
  const budgetCents = readBudgetCents(question);
  if (budgetCents === null) return null;
  if (
    !recognizedByAi &&
    !(/hakklih/.test(question) && /past|spaget/.test(question) && /salat/.test(question))
  ) {
    return null;
  }
  const pantry = Object.fromEntries(
    Object.entries(stock).filter(
      ([, amount]) => Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000,
    ),
  );
  const candidates = variants.map((variant) =>
    affordableMeal(variant, budgetCents, pantry),
  );
  candidates.sort(
    (a, b) => b.portions - a.portions || a.basket.totalCents - b.basket.totalCents,
  );
  const best = candidates[0]!;
  if (best.portions === 0) {
    const minimum = Math.min(
      ...variants.map((variant) => mealBasket(variant, 1, pantry).totalCents),
    );
    return {
      readyToCook: false,
      reply: [
        `${formatCents(budgetCents)} eest ei mahu hakklihapasta ja salat näidiskorvi.`,
        `Odavaim proovitud variant maksab ${formatCents(minimum)}. Kodus olemasolevate koostisosade kasutamine võib korvi odavamaks teha.`,
      ].join("\n\n"),
    };
  }

  const cheaper = candidates
    .filter(
      (candidate) =>
        candidate.portions > 0 &&
        candidate.basket.totalCents < best.basket.totalCents,
    )
    .sort((a, b) => a.basket.totalCents - b.basket.totalCents)[0];

  const choices: BudgetPastaChoice[] = [
    buildChoice("max-portions", best, budgetCents, true),
  ];
  if (cheaper) {
    choices.push(buildChoice("lower-spend", cheaper, budgetCents, false));
  }

  const reply =
    choices.length > 1
      ? [
          `Eelarve ${formatCents(budgetCents)}. Vali portsjonid:`,
          `• ${best.portions} portsjonit · ${formatCents(best.basket.totalCents)} (alles ${formatCents(budgetCents - best.basket.totalCents)})`,
          `• ${cheaper!.portions} portsjonit · ${formatCents(cheaper!.basket.totalCents)} (alles ${formatCents(budgetCents - cheaper!.basket.totalCents)})`,
          "Ostunimekiri ja valmistamine avanevad valiku all.",
        ].join("\n")
      : [
          `${best.portions} ${best.portions === 1 ? "portsjon" : "portsjonit"} · ${best.variant.name}`,
          `Korv ${formatCents(best.basket.totalCents)} · alles ${formatCents(budgetCents - best.basket.totalCents)} ${formatCents(budgetCents)} eelarvest.`,
          choices[0]!.shoppingLines.length
            ? `Osta täispakid\n${choices[0]!.shoppingLines.map((line) => `• ${line}`).join("\n")}`
            : "Kõik vajalik on kodus olemas.",
          `Valmistamine\n${choices[0]!.method}`,
        ].join("\n\n");

  return {
    reply,
    readyToCook: choices[0]!.shoppingLines.length === 0,
    choices,
  };
}
