import {
  formatBudgetCents,
  isBudgetOnlyMessage,
  readBudgetCents,
  type BudgetMealContext,
  type WeeklyMealScope,
} from "./budgetMeal";
import { computeBasketCents, type PantryStockCents } from "./computeBasket";
import { recipes } from "./data/recipes";
import { recipeEtTitle } from "./quickMeal";

const days = ["E", "T", "K", "N", "R", "L", "P"];
const week = [
  ["berry-oats", "bean-pasta", "mince-rice"],
  ["egg-oats", "egg-pasta", "bean-rice"],
  ["berry-oats", "bean-rice", "mince-rice"],
  ["egg-oats", "bean-pasta", "egg-pasta"],
  ["berry-oats", "bean-pasta", "mince-rice"],
  ["egg-oats", "egg-pasta", "bean-rice"],
  ["berry-oats", "bean-pasta", "mince-rice"],
] as const;

function catalogMeal(id: string) {
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) throw new Error(`Missing weekly recipe: ${id}`);
  return { name: recipeEtTitle(id), ingredients: recipe.ingredients };
}

const meals = {
  "berry-oats": catalogMeal("berry-oats"),
  "egg-oats": catalogMeal("egg-oats"),
  "egg-pasta": catalogMeal("egg-pasta"),
  "milk-oats": {
    name: "Kaerapuder piimaga",
    ingredients: [
      { productId: "oats", quantity: 70 },
      { productId: "milk", quantity: 200 },
    ],
  },
  "bean-pasta": {
    name: "Oa-tomatipasta",
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "beans", quantity: 120 },
      { productId: "tomatoes", quantity: 80 },
      { productId: "mixed-veg", quantity: 80 },
    ],
  },
  "bean-rice": {
    name: "Riis ubade ja köögiviljadega",
    ingredients: [
      { productId: "rice", quantity: 90 },
      { productId: "beans", quantity: 120 },
      { productId: "mixed-veg", quantity: 80 },
    ],
  },
  "mince-rice": {
    name: "Hakklihaga köögiviljariis",
    ingredients: [
      { productId: "rice", quantity: 80 },
      { productId: "minced-meat", quantity: 100 },
      { productId: "mixed-veg", quantity: 100 },
    ],
  },
};

function weeklyBasket(scope: WeeklyMealScope, dayCount: number, pantry: PantryStockCents, cheaper: boolean) {
  const rows = week.slice(0, dayCount).map((day) => {
    const selected = scope === "dinners" ? [day[2]] : day;
    return selected.map((id) => meals[cheaper && id === "berry-oats" ? "milk-oats" : id]);
  });
  const plannedMeals = rows.flat();
  const basket = computeBasketCents(plannedMeals.flatMap((meal) => meal.ingredients), pantry);
  return { rows, plannedMeals, basket };
}

function describeWeek(scope: WeeklyMealScope, budgetCents: number, pantry: PantryStockCents) {
  const variations = scope === "dinners" ? [false] : [false, true];
  for (let dayCount = 7; dayCount >= 1; dayCount--) {
    for (const cheaper of variations) {
      const plan = weeklyBasket(scope, dayCount, pantry, cheaper);
      if (plan.basket.totalCents <= budgetCents) return plan;
    }
  }
  return null;
}

function renderWeeklyPlan(scope: WeeklyMealScope, budgetCents: number, pantry: PantryStockCents): string {
  const plan = describeWeek(scope, budgetCents, pantry);
  if (!plan) {
    const minimum = weeklyBasket(scope, 1, pantry, true).basket.totalCents;
    return `${formatBudgetCents(budgetCents)} eelarvesse ei mahu praeguse valikuga ükski päev. Esimese päeva ostukorv maksaks vähemalt ${formatBudgetCents(minimum)}. Hinnad on Selveri näidisandmestikust.`;
  }

  const { rows, plannedMeals, basket } = plan;
  const count = rows.length;
  const meatDays = rows.filter((row) => row.includes(meals["mince-rice"])).length;
  const vegMeals = plannedMeals.filter((meal) =>
    meal.ingredients.some(({ productId }) => productId === "mixed-veg"),
  ).length;
  const sections = [
    `Ühele inimesele · ${count}/7 päeva · ${plannedMeals.length} söögikorda · liha ${meatDays} päeval`,
    `Korv ${formatBudgetCents(basket.totalCents)} · alles ${formatBudgetCents(budgetCents - basket.totalCents)}.`,
  ];
  if (count < 7) {
    sections.push(`Selle eelarvega mahub valitud kavast ${count} päeva. Ülejäänud päevad on katmata.`);
    if (scope === "all-meals" && weeklyBasket("dinners", 7, pantry, false).basket.totalCents <= budgetCents) {
      sections.push("Sama eelarvega mahub seitse õhtusööki. Selle kava nägemiseks kirjuta „Ainult õhtusöögid“.");
    }
  }
  sections.push(
    `${scope === "dinners" ? "Õhtusöögid" : "Hommik · Lõuna · Õhtu"}\n${rows.map((row, day) =>
      `${days[day]} · ${row.map((meal) => meal.name).join(" · ")}`,
    ).join("\n")}`,
    basket.lines.length
      ? `Ühine ostukorv\n${basket.lines.map((line) =>
          `• ${line.packs} × ${line.name} (${line.packQuantity} ${line.unit === "pcs" ? "tk" : line.unit}) — ${formatBudgetCents(line.lineTotalCents)}`,
        ).join("\n")}`
      : "Kõik plaanis vajalik on kodus olemas.",
    `Köögiviljasegu jagub ${vegMeals} söögikorda. Ostu kogused on arvutatud terve plaani peale.`,
    "Hinnad on Selveri näidisandmestikust. Sool, pipar ja veidi õli on arvestatud kodustest varudest.",
  );
  return sections.join("\n\n");
}

function readScope(question: string): WeeklyMealScope | null {
  if (/k[õo]ik(?:i)?\s+(?:s[öo][öo]gi|toidu)kor[dr]|^k[õo]ik[.!?]?$|kolm s[öo][öo]gi|3 s[öo][öo]gi/.test(question) ||
      (/hommik/.test(question) && /l[õo]una/.test(question) && /[õo]htu/.test(question))) {
    return "all-meals";
  }
  if (/(?:ainult|seitse|7)\s+[õo]htus[öo][öo]|^[õo]htus[öo][öo][a-zõäöü]*[.!?]?$/.test(question)) {
    return "dinners";
  }
  return null;
}

export function answerWeeklyMealQuestion(
  message: string,
  pantry: PantryStockCents,
  context?: BudgetMealContext | null,
) {
  const question = message.toLowerCase().trim();
  const budget = readBudgetCents(question);
  const requestedScope = readScope(question);
  const previous = context?.dish === "weekly-meals" ? context : null;
  const weekly = /nädal|nadal|(?:7|seitse)\s+p[äa]ev/.test(question);
  const wantsMeat = /liha|kana/.test(question);
  if (/ilma\s+(?:liha|kana)|(?:ei taha|ei soovi|pole vaja)\s+(?:liha|kana)|taimetoit|vegan/.test(question)) {
    return null;
  }
  const starts = (weekly || requestedScope === "dinners") && wantsMeat;
  const continues = previous && (requestedScope || (budget !== null && isBudgetOnlyMessage(question)));
  if (!starts && !continues) return null;

  const budgetCents = budget ?? previous?.budgetCents ?? null;
  const scope = requestedScope ?? previous?.scope ?? null;
  const budgetMeal: BudgetMealContext = { dish: "weekly-meals", budgetCents, scope };
  const reply = scope === null
    ? "Kas soovid seitset õhtusööki või kolme söögikorda päevas? Vasta „Ainult õhtusöögid“ või „Kõik söögikorrad“."
    : budgetCents === null
      ? "Kui palju saad seitsme päeva toidule kulutada?"
      : renderWeeklyPlan(scope, budgetCents, pantry);
  return { reply, pantry, budgetMeal, recipeId: null, demo: true, readyToCook: false, shoppingEmpty: false };
}
