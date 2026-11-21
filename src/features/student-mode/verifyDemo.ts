import {
  applyPantryStock,
  buildHackathonDemoPlan,
  countEggsNeeded,
  demoEggPacksToBuy,
  LEGACY_DEMO_PANTRY10_TOTAL_CENTS,
  LEGACY_DEMO_TOTAL_CENTS,
} from "../../lib/demo-plan";
import { computeBasketCents, eurosFromCents } from "./computeBasket";
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

  assert(computeBasketCents([]).totalCents === 0, "empty basket should be 0");

  return logs;
}
