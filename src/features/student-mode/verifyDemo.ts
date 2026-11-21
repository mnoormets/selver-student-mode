import {
  applyPantryStock,
  buildHackathonDemoPlan,
  countEggsNeeded,
  demoEggPacksToBuy,
  LEGACY_DEMO_PANTRY10_TOTAL_CENTS,
  LEGACY_DEMO_TOTAL_CENTS,
} from "../../lib/demo-plan";
import { computeBasketCents, eurosFromCents } from "./computeBasket";
import { answerCookChatTurn } from "./cookChat";
import { answerPantryCookQuestion } from "./pantryCook";
import { answerSpaghettiEggsQuickMeal } from "./quickMeal";
import { validateDemoCatalog } from "./validateCatalog";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

/** Runnable checks for the locked hackathon demo maths. */
export function verifyDemoMath(): string[] {
  const logs: string[] = [];
  validateDemoCatalog();
  logs.push("catalog validation ok");

  const plan = buildHackathonDemoPlan();
  const eggsNeeded = countEggsNeeded(plan.meals);
  assert(eggsNeeded === 14, `expected 14 eggs needed, got ${eggsNeeded}`);
  logs.push(`eggs needed: ${eggsNeeded}`);

  for (const [home, packs] of [
    [0, 2],
    [10, 1],
    [14, 0],
  ] as const) {
    const got = demoEggPacksToBuy(home);
    assert(
      got === packs,
      `eggs at home ${home}: expected ${packs} packs, got ${got}`,
    );
    logs.push(`eggs@home ${home} → buy ${got} packs`);
  }

  const total0 = Math.round(plan.total * 100);
  // Milk pack verified on e-Selver at 139¢ (+10¢ vs older citation).
  const expected0 = LEGACY_DEMO_TOTAL_CENTS + 10;
  assert(total0 === expected0, `expected ${expected0}¢, got ${total0}¢`);
  assert(
    plan.summary.includes("Arvutatud korv") ||
      plan.summary.includes("Allikaviidetega"),
    "summary should explain computed vs legacy total",
  );
  logs.push(
    `basket @0 eggs: ${eurosFromCents(total0)} € (legacy pitch ${eurosFromCents(LEGACY_DEMO_TOTAL_CENTS)} €)`,
  );

  const pantry10 = applyPantryStock(plan, { eggs: 10 });
  const total10 = Math.round(pantry10.total * 100);
  const expected10 = LEGACY_DEMO_PANTRY10_TOTAL_CENTS + 10;
  assert(
    total10 === expected10,
    `expected ${expected10}¢ with 10 eggs, got ${total10}¢`,
  );
  assert(
    (pantry10.basket.find((l) => l.productId === "eggs")?.qty ?? 0) === 1,
    "expected 1 egg pack after 10 at home",
  );
  logs.push(`basket @10 eggs: ${eurosFromCents(total10)} €`);

  const pantry14 = applyPantryStock(plan, { eggs: 14 });
  assert(
    !pantry14.basket.some((l) => l.productId === "eggs"),
    "expected 0 egg packs with 14 at home",
  );
  logs.push(`basket @14 eggs: ${pantry14.total.toFixed(2)} € (no egg line)`);

  const quick = answerSpaghettiEggsQuickMeal({ spaghettiGrams: 100, eggs: 2 });
  assert(quick.recipeId === "egg-pasta", "expected egg-pasta recipe");
  assert(
    quick.missingVegGrams === 130,
    `expected 130g veg missing, got ${quick.missingVegGrams}`,
  );
  assert(
    quick.buy.length === 1 && quick.buy[0]?.productId === "mixed-veg",
    "expected one mixed-veg pack",
  );
  assert(quick.buy[0]?.packs === 1, "expected 1 veg pack");
  assert(
    quick.alreadyHave.some((r) => r.productId === "spaghetti"),
    "spaghetti should be covered",
  );
  assert(
    quick.alreadyHave.some((r) => r.productId === "eggs"),
    "eggs should be covered",
  );
  logs.push(quick.summaryEt);

  const cook1 = answerCookChatTurn(
    "Mul on 100 g spagette ja kaks muna. Mida ma kiiresti teha saaks?",
    {},
    { demo: true },
  );
  assert(cook1.recipeId === "egg-pasta", "cook-chat should pick egg-pasta");
  assert(cook1.reply.includes("Muna-köögiviljaspagetid"), "should name dish");
  assert(cook1.reply.includes("130"), "should mention 130 g missing veg");
  assert(
    cook1.reply.includes("600") && cook1.reply.includes("2.39"),
    "shopping list should show one 600 g pack at catalog price",
  );
  assert(cook1.reply.includes("Näidisvastus"), "offline reply must be labeled");
  assert(!cook1.readyToCook, "first turn still needs veg");

  const cook2 = answerCookChatTurn(
    "Mul on ka 130 g köögiviljasegu",
    cook1.pantry,
    { demo: true, forceRecipeId: cook1.recipeId },
  );
  assert(cook2.readyToCook, "with 130 g veg should be ready");
  assert(cook2.shoppingEmpty, "shopping list should be empty");
  assert(cook2.reply.includes("Saad kohe teha"), "should say ready to cook");
  assert(
    cook2.reply.includes("tühi") || cook2.reply.includes("osta ei pea"),
    "empty shopping list copy",
  );
  logs.push("cook-chat spaghetti→veg follow-up ok");

  assert(computeBasketCents([]).totalCents === 0, "empty basket should be 0");

  const plan20 = buildHackathonDemoPlan({ budgetEuros: 20, days: 7 });
  assert(plan20.budgetCents === 2000, "20€ plan should keep budgetCents");
  assert(plan20.days >= 1, "20€ should keep at least one day");
  assert(
    plan20.total <= 20.5,
    `20€ plan should stay near budget, got ${plan20.total}`,
  );
  assert(
    plan20.summary.includes("20 €") || plan20.summary.includes("eelarve 20"),
    "summary should mention selected 20€ budget",
  );
  logs.push(
    `budget 20€ → ${plan20.days} days, basket ${plan20.total.toFixed(2)} €, leftover ${plan20.leftoverBudget.toFixed(2)} €`,
  );

  const plan50 = buildHackathonDemoPlan({ budgetEuros: 50, days: 7 });
  assert(plan50.budgetCents === 5000, "50€ plan should keep budgetCents");
  assert(plan50.days === 7, "50€ should keep full week");
  assert(plan50.leftoverBudget > 10, "50€ should leave clear leftover");
  logs.push(
    `budget 50€ → ${plan50.days} days, basket ${plan50.total.toFixed(2)} €, leftover ${plan50.leftoverBudget.toFixed(2)} €`,
  );

  const hakkliha = answerPantryCookQuestion(
    "Mul on kodus taignast ja mune, tahaksin teha hakkliha pannkooke, mida peaksin poest ostma",
  );
  assert(hakkliha, "expected hakkliha pannkoogid answer");
  assert(hakkliha.includes("Hakkliha pannkoogid"), "expected dish title");
  assert(
    hakkliha.includes("Kodune hakkliha"),
    "expected minced meat buy line",
  );
  assert(
    hakkliha.includes("taigen") || hakkliha.includes("tainas"),
    "expected dough noted as already at home",
  );
  assert(
    hakkliha.includes("Munad M10") && hakkliha.includes("olemas"),
    "eggs at home should be covered, not bought",
  );
  assert(
    !hakkliha.includes("1× Munad"),
    "should not buy an egg pack when eggs are at home",
  );
  assert(!hakkliha.includes("Kana-tomati"), "must not fall back to week-menu blurb");
  logs.push(hakkliha);

  return logs;
}
