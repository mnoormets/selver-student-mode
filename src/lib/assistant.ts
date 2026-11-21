import { answerCookChatTurn } from "@/features/student-mode/cookChat";
import {
  answerPantryCookQuestion,
  isPantryCookQuestion,
} from "@/features/student-mode/pantryCook";
import { SPAGHETTI_EGGS_PROMPT } from "@/features/student-mode/quickMeal";
import { PRODUCTS, RECIPES, unitPrice } from "./catalog";
import type { PlanResult } from "./planner";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export { SPAGHETTI_EGGS_PROMPT };

function money(n: number): string {
  return `${n.toFixed(2)} €`;
}

function isSpaghettiEggsPrompt(q: string): boolean {
  const hasPasta =
    q.includes("spagett") || q.includes("pasta") || q.includes("spaget");
  const hasEggs = q.includes("muna");
  const hasGrams = /\d+\s*g/.test(q) || q.includes("100");
  return hasPasta && hasEggs && (hasGrams || q.includes("kaks") || q.includes("2"));
}

/** Week-plan pantry beat only — not “I want to cook X”. */
function isWeekEggPantryPrompt(q: string): boolean {
  if (isPantryCookQuestion(q) || isSpaghettiEggsPrompt(q)) return false;
  if (q.includes("pannkook") || q.includes("hakkliha") || q.includes("teha")) {
    return false;
  }
  return (
    (q.includes("kodus") || q.includes("mul on")) && q.includes("muna")
  );
}

export function replyToStudent(
  question: string,
  plan: PlanResult | null,
): string {
  const q = question.toLowerCase().trim();

  if (!q) {
    return "Küsi nt „mul on kodus taigen ja mune, tahan hakkliha pannkooke — mida osta?“";
  }

  if (isSpaghettiEggsPrompt(q)) {
    // Prefer shared cook-chat maths (same as /api/cook-chat demo path).
    return answerCookChatTurn(question, {}, { demo: false }).reply;
  }

  if (isPantryCookQuestion(q)) {
    const answer = answerPantryCookQuestion(question);
    if (answer) return answer;
  }

  if (isWeekEggPantryPrompt(q)) {
    return "Vajuta „Mul on kodus 10 muna“ või kirjuta täpselt nii — siis arvutan nädalakorvi uuesti (2 karpi → 1 karp).";
  }

  if (q.includes("5 euro") || q.includes("5€") || q.includes("viis euro")) {
    const picks = PRODUCTS.filter((p) => unitPrice(p) <= 2)
      .sort((a, b) => unitPrice(a) - unitPrice(b))
      .slice(0, 4);
    return `5 € eest saad näiteks: ${picks
      .map((p) => `${p.name} (${money(unitPrice(p))})`)
      .join(", ")}. Tee neist omlett + voileib — täis kõht alla 5 €.`;
  }

  if (q.includes("kana") && (q.includes("jääk") || q.includes("yle") || q.includes("üle") || q.includes("alles"))) {
    return "Kana jääkidest: 1) riisi-kana kauss sibula ja porgandiga, 2) kiire wrap leiva + jogurtiga, 3) prae tükid pasta sisse. Ära hoia toorelt üle 2 päeva.";
  }

  if (q.includes("taim") || q.includes("vegan") || q.includes("lihavaba")) {
    const veg = RECIPES.filter((r) => r.tags.includes("taimne")).slice(0, 3);
    return `Taimsed kiired valikud: ${veg
      .map((r) => `${r.name} (${r.minutes} min)`)
      .join("; ")}. Oad ja kikerherned on tudengi valgu-šampioonid.`;
  }

  if (q.includes("aeg") || q.includes("kiire") || q.includes("loeng")) {
    const fast = RECIPES.filter((r) => r.minutes <= 12);
    return `Alla 12 minuti: ${fast
      .map((r) => r.name)
      .join(", ")}. Hoia külmkapis keedetud mune ja valmis riisi — säästab poole ajast.`;
  }

  if (q.includes("raisk") || q.includes("jääk") || q.includes("halvemaks")) {
    return "Raiskamise vastu: osta külmutatud köögivilju, planeeri 1 „jäägipäev“ nädalas, hoia ürte klaasis veega. Tudengirežiim paneb sama sibula ja porgandi mitmesse retsepti.";
  }

  if (q.includes("eelarve") || q.includes("kallis") || q.includes("odav")) {
    if (plan) {
      return `Sinu praegune korv on ${money(plan.total)}. Kui pead allapoole minema, vaheta kallimad read soodsama pakendi vastu andmestikus.`;
    }
    return "Seatakse eelarve ja genereeri menüü — siis oskan öelda, kust kärpida.";
  }

  if (q.includes("hommik")) {
    return "Hommikuks: soe marjapuder või muna-köögiviljapuder. Kaerahelbed + piim + marjad tulevad soodsalt.";
  }

  if (plan) {
    const dinner = plan.meals.find((m) => m.slot === "õhtu");
    return `Sinu menüüs on nt ${dinner?.recipe.name ?? "õhtusöök"}. Küsi konkreetsemalt, nt „mul on kodus taigen ja mune, tahan hakkliha pannkooke — mida osta?“`;
  }

  return "Proovi: „mul on kodus taigen ja mune, tahan hakkliha pannkooke — mida osta?“, „mul on 100 g spagette ja kaks muna“ või „mul on kodus 10 muna“.";
}
