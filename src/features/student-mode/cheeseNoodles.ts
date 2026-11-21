import { affordableMeal, formatBudgetCents, readBudgetCents, type MealVariant } from "./budgetMeal";
import type { PantryStockCents } from "./computeBasket";

export type BudgetMealContext = {
  dish: "cheese-noodles";
  budgetCents: number | null;
};

// The user already owns the noodles. Reuse the dry-pasta quantity for portion
// math and keep both base ingredients out of the shopping basket.
const pantryOnly = ["spaghetti", "cheese"];
const noodles: MealVariant = {
  name: "Juustunuudlid",
  ingredients: [
    { productId: "spaghetti", quantity: 80 },
    { productId: "cheese", quantity: 25 },
  ],
  method: "Keeda nuudlid pakendi järgi. Jäta sorts keeduvett alles, sega kuumade nuudlite hulka juust ja lisa veidi keeduvett, et juust sulaks kastmeks.",
};
const noodlesWithExtras: MealVariant = {
  name: "Juustunuudlid muna ja köögiviljadega",
  ingredients: [
    ...noodles.ingredients,
    { productId: "eggs", quantity: 1 },
    { productId: "mixed-veg", quantity: 100 },
  ],
  method: "Kuumuta köögiviljasegu pannil ja küpseta muna läbi. Sega juustunuudlitega.",
};

function readGrams(message: string, ingredient: "nuudl" | "juust"): number | undefined {
  const before = new RegExp(`(?:^|[\\s,;])(\\d{1,6})\\s*g(?:rammi)?\\s+${ingredient}`, "i");
  const after = new RegExp(`\\b${ingredient}[a-zõäöü]*\\s+(?:on\\s+)?(\\d{1,6})\\s*g(?:rammi)?\\b`, "i");
  const match = message.match(before) ?? message.match(after);
  return match ? Number(match[1]) : undefined;
}

export function answerCheeseNoodlesQuestion(
  message: string,
  stock: PantryStockCents,
  context?: BudgetMealContext | null,
) {
  const question = message.toLowerCase();
  if (/nädal|nadal/.test(question)) return null;

  const noodleGrams = readGrams(question, "nuudl");
  const cheeseGrams = readGrams(question, "juust");
  const budget = readBudgetCents(question);
  const mentionsPantry = question.includes("nuudl") && question.includes("juust") &&
    /kodus|mul on|olemas/.test(question);
  const budgetOnly = /^(?:(?:mul on|eelarve on|aga|ainult)\s+)*(?:\d+(?:[.,]\d{1,2})?\s*(?:€|eur(?:ot?|i)?)|€\s*\d+(?:[.,]\d{1,2})?)[.!?\s]*$/.test(question);
  const continues = context && (noodleGrams !== undefined || cheeseGrams !== undefined || (budget !== null && budgetOnly));
  if (!mentionsPantry && !continues) return null;

  const budgetCents = budget ?? context?.budgetCents ?? null;
  const budgetMeal: BudgetMealContext = { dish: "cheese-noodles", budgetCents };
  const pantry: Record<string, number> = {
    ...Object.fromEntries(Object.entries(stock).filter(
      ([, amount]) => Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000,
    )),
    ...(noodleGrams !== undefined ? { noodles: noodleGrams } : {}),
    ...(cheeseGrams !== undefined ? { cheese: cheeseGrams } : {}),
  };
  const noodleStock = pantry.noodles;
  const cheeseStock = pantry.cheese;
  const respond = (reply: string, readyToCook = false) => ({
    reply, pantry, budgetMeal, recipeId: null, demo: true, readyToCook, shoppingEmpty: readyToCook,
  });
  if (noodleStock === undefined || cheeseStock === undefined) {
    const missing = noodleStock === undefined
      ? (cheeseStock === undefined ? "nuudleid ja juustu" : "nuudleid")
      : "juustu";
    return respond(
      `Saad teha juustunuudleid. Mitu grammi ${missing} sul on? Näiteks „200 g nuudleid ja 100 g juustu“.`,
    );
  }

  const mealStock = { ...pantry, spaghetti: noodleStock };
  const base = affordableMeal(noodles, 0, mealStock, pantryOnly);
  if (base.portions === 0) {
    return respond("Üheks portsjoniks arvesta 80 g nuudleid ja 25 g juustu. Praegustest kogustest jääb selleks väheks.");
  }

  const portions = `${base.portions} ${base.portions === 1 ? "portsjon" : "portsjonit"}`;
  const sections = [
    `Tee kohe · ${portions} juustunuudleid · 0,00 €`,
    `Kodus olemas: ${noodleStock} g nuudleid ja ${cheeseStock} g juustu. Kasuta ${base.portions * 80} g nuudleid ning ${base.portions * 25} g juustu.`,
    noodles.method,
  ];
  if (budgetCents === null) {
    sections.push("Kui tahad munade ja köögiviljadega varianti, ütle, kui palju saad juurdeostuks kulutada.");
    return respond(sections.join("\n\n"), true);
  }

  const upgraded = affordableMeal(noodlesWithExtras, budgetCents, mealStock, pantryOnly);
  if (upgraded.portions > 0) {
    const buy = upgraded.basket.lines.map((line) =>
      `• ${line.packs} × ${line.name} (${line.packQuantity} ${line.unit === "pcs" ? "tk" : line.unit}) — ${formatBudgetCents(line.lineTotalCents)}`,
    );
    sections.push(
      `Lisavariant · ${upgraded.variant.name} · ${upgraded.portions} ${upgraded.portions === 1 ? "portsjon" : "portsjonit"}`,
      buy.length ? `Osta\n${buy.join("\n")}` : "Muna ja köögiviljad on ka kodus olemas.",
      `Korv ${formatBudgetCents(upgraded.basket.totalCents)} · alles ${formatBudgetCents(budgetCents - upgraded.basket.totalCents)}.`,
      `Lisa ${upgraded.portions} muna ja ${upgraded.portions * 100} g köögiviljasegu. ${upgraded.variant.method}`,
    );
  } else {
    sections.push(`Muna ja köögiviljade lisamine ei mahu ${formatBudgetCents(budgetCents)} eelarvesse. Koduse variandiga jääb kogu eelarve alles.`);
  }
  sections.push("Ostuhinnad on Selveri näidisandmestikust.");
  return respond(sections.join("\n\n"), true);
}
