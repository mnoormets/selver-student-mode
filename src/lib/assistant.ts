import {
  answerSpaghettiEggsQuickMeal,
  SPAGHETTI_EGGS_PROMPT,
} from "@/features/student-mode/quickMeal";
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

export function replyToStudent(
  question: string,
  plan: PlanResult | null,
): string {
  const q = question.toLowerCase().trim();

  if (!q) {
    return "Küsi nt „mul on 5 eurot“ või „mis teha kana jääkidest?“";
  }

  if (isSpaghettiEggsPrompt(q)) {
    return answerSpaghettiEggsQuickMeal({
      spaghettiGrams: 100,
      eggs: 2,
    }).summaryEt;
  }

  if (
    (q.includes("kodus") || q.includes("mul on")) &&
    q.includes("muna") &&
    !q.includes("spagett") &&
    !q.includes("spaget")
  ) {
    return "Vajuta „Mul on kodus 10 muna“ või kirjuta täpselt nii — siis arvutan korvi uuesti (34,24 € → 32,35 €).";
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
      return `Sinu praegune korv on ${money(plan.total)}. Kampaaniatelt säästad ~${money(plan.saved)}. Kui pead allapoole minema, vaheta juust/brokoli Kirde konservisegude vastu.`;
    }
    return "Seatakse eelarve ja genereeri menüü — siis oskan öelda, kust kärpida.";
  }

  if (q.includes("hommik")) {
    return "Hommikuks: banaanipuder, juustuvoileib või omlett. Kaerahelbed + piim + banaan tuleb alla 1 € portsjoni kohta.";
  }

  if (plan) {
    const dinner = plan.meals.find((m) => m.slot === "õhtu");
    return `Sinu menüüs on nt ${dinner?.recipe.name ?? "õhtusöök"}. Küsi konkreetsemalt: eelarve, kiirus, taimne või jäägid — aitan kohe.`;
  }

  return "Proovi: „mul on 5 eurot“, „kiire enne loengut“, „taimne õhtusöök“ või „kana jäägid“.";
}
