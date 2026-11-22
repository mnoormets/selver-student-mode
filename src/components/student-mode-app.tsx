"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingBasket,
  MessageCircle,
  Sparkles,
  Timer,
  Wallet,
  GraduationCap,
  Check,
  Minus,
  Plus,
  ChevronLeft,
  Home,
  ListChecks,
  ScanLine,
  Percent,
  Menu,
  QrCode,
  CreditCard,
  History,
  User,
  Settings,
  Info,
  X,
  MapPin,
  Star,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

/** Measured from Partnerkaart app screenshot CTA — locked default. */
const PK_ORANGE = "#F97D00";

/** iPhone 14 screen (pt) — exact, then scaled to fit viewport. */
const IPHONE14 = {
  w: 390,
  h: 844,
  radius: 47.33,
  status: 47,
  notchW: 164,
  notchH: 32,
} as const;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { isSpaghettiEggsPrompt, replyToStudent, type ChatMessage } from "@/lib/assistant";
import { isAdditivePantryFollowUp } from "@/features/student-mode/cookChat";
import type { BudgetMealContext } from "@/features/student-mode/budgetMeal";
import {
  applyPantryStock,
  buildHackathonDemoPlan,
  countEggsNeeded,
} from "@/lib/demo-plan";
import { dayLabel, type PlanResult, type Prefs } from "@/lib/planner";

const BOTTOM_TABS = [
  { id: "home", label: "Avaleht", icon: Home },
  { id: "list", label: "Nimekiri", icon: ListChecks },
  { id: "scan", label: "Skaneeri", icon: ScanLine },
  { id: "offers", label: "Soodustused", icon: Percent },
  { id: "more", label: "Veel", icon: Menu },
] as const;

/** Side drawer — visual only (matches Partnerkaart “Veel”). */
const SIDE_MENU: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Avaleht", icon: Home },
  { id: "scan", label: "Skaneeri ja osta", icon: ScanLine },
  { id: "list", label: "Ostunimekiri", icon: ListChecks },
  { id: "card", label: "Esita Partnerkaart", icon: QrCode },
  { id: "offers", label: "Pakkumised", icon: Percent },
  { id: "pay", label: "Maksevahendid", icon: CreditCard },
  { id: "history", label: "Ostude ajalugu", icon: History },
  { id: "profile", label: "Minu andmed", icon: User },
  { id: "settings", label: "Seaded", icon: Settings },
  { id: "help", label: "Abi, kontaktid ja tagasiside", icon: Info },
];

/** Partnerkaart peamenüü — ainult Student Mode on klikitav. */
const MAIN_MENU: {
  id: string;
  label: string;
  icon: LucideIcon;
  notify?: string;
  action?: "student-mode";
}[] = [
  { id: "list", label: "Ostunimekiri", icon: ListChecks },
  { id: "selfserve", label: "Partnerkaardi iseteenindus", icon: Star },
  { id: "stores", label: "Kaupluste kontaktid", icon: MapPin },
  { id: "offers", label: "Pakkumised", icon: Percent, notify: "3" },
  { id: "student", label: "Student Mode", icon: GraduationCap, action: "student-mode" },
  { id: "feedback", label: "Tagasiside", icon: MessageSquare },
];

type Stage = "home" | "hero" | "setup" | "plan" | "cook-chat";

/** Fixed default — tarne UI removed from setup. */
const DEFAULT_DELIVERY = "Tulen ise Selverisse järgi";

const STYLES: { id: Prefs["style"]; label: string }[] = [
  { id: "odav", label: "Odav" },
  { id: "kiire", label: "Kiire" },
  { id: "kvaliteetne", label: "Kvaliteetne" },
  { id: "taimne", label: "Taimetoit" },
  { id: "liha", label: "Lihaga" },
  { id: "sysivesikud", label: "Vähe süsivesikuid" },
];

const CHAT_CHIPS = [
  "Mul on kodus 10 muna",
  "Mul on kodus taigen ja mune, tahan hakkliha pannkooke — mida osta?",
  "Mul on 100 g spagette ja kaks muna. Mida saan kiiresti teha?",
] as const;

function euros(n: number) {
  return `${n.toFixed(2)} €`;
}

export function StudentModeApp() {
  const [stage, setStage] = useState<Stage>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [budget, setBudget] = useState(35);
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState<Prefs["style"]>("kiire");
  const delivery = DEFAULT_DELIVERY;
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [basePlan, setBasePlan] = useState<PlanResult | null>(null);
  const [pantryApplied, setPantryApplied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"menu" | "basket" | "chat">("menu");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Tere! Ütle nt „Mul on kodus 10 muna“ — arvutan ostukorvi uuesti.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [cookChat, setCookChat] = useState<ChatMessage[]>([
    {
      id: "cook-welcome",
      role: "assistant",
      text: "Tere! Ütle, mis sul kodus on või mille järele isu on. Pakun roa ja näitan, mida juurde osta.",
    },
  ]);
  const [cookDraft, setCookDraft] = useState("");
  const [cookPantry, setCookPantry] = useState<Record<string, number>>({});
  const [cookRecipeId, setCookRecipeId] = useState<string | null>(null);
  const [cookBudgetMeal, setCookBudgetMeal] = useState<BudgetMealContext | null>(null);
  const [cookPending, setCookPending] = useState(false);

  const inStudentMode = stage !== "home";
  const prefs: Prefs = useMemo(
    () => ({ budget, days, style, delivery }),
    [budget, days, style],
  );
  const eggLine = plan?.basket.find(
    (l) => l.productId === "eggs" || l.productId === "munad",
  );
  const eggsNeeded = plan ? countEggsNeeded(plan.meals) : 0;

  function openStudentMode() {
    setMenuOpen(false);
    setStage("hero");
  }

  function activate() {
    setStage("setup");
  }

  function openCookChat() {
    setChatSheetOpen(false);
    setMenuOpen(false);
    setStage("cook-chat");
  }

  function goHome() {
    setStage("home");
    setMenuOpen(false);
    setChatSheetOpen(false);
  }

  function resetCookChatSession() {
    setCookChat([
      {
        id: "cook-welcome",
        role: "assistant",
        text: "Tere! Ütle, mis sul kodus on või mille järele isu on. Pakun roa ja näitan, mida juurde osta.",
      },
    ]);
    setCookDraft("");
    setCookPantry({});
    setCookRecipeId(null);
    setCookBudgetMeal(null);
  }

  function generate() {
    startTransition(() => {
      const next = buildHackathonDemoPlan({
        budgetEuros: budget,
        days,
        style,
      });
      setBasePlan(next);
      setPlan(next);
      setPantryApplied(false);
      setStage("plan");
      setTab("menu");
      setChat([
        {
          id: "welcome",
          role: "assistant",
          text: `Näidisplaan on valmis (${budget} € eelarve). Proovi: „Mul on kodus 10 muna“.`,
        },
        {
          id: `plan-${Date.now()}`,
          role: "assistant",
          text: next.summary,
        },
      ]);
    });
  }

  function applyEggsAtHome(eggs = 10) {
    if (!basePlan) return;
    startTransition(() => {
      const next = applyPantryStock(basePlan, { eggs });
      setPlan(next);
      setPantryApplied(true);
      setTab("basket");
      setChat((c) => [
        ...c,
        {
          id: `u-pantry-${Date.now()}`,
          role: "user",
          text: `Mul on kodus ${eggs} muna`,
        },
        {
          id: `a-pantry-${Date.now()}`,
          role: "assistant",
          text: next.summary,
        },
      ]);
    });
  }

  function sendChat() {
    const text = draft.trim();
    if (!text || cookPending) return;
    const lower = text.toLowerCase();
    if (
      isSpaghettiEggsPrompt(lower) ||
      isAdditivePantryFollowUp(lower) ||
      (cookRecipeId === "egg-pasta" && /k[oö][oö]giviljaseg/.test(lower))
    ) {
      void sendCookChat("plan");
      return;
    }
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };

    const isCookIntent =
      lower.includes("teha") ||
      lower.includes("pannkook") ||
      lower.includes("hakkliha") ||
      lower.includes("osta") ||
      lower.includes("poest") ||
      ((lower.includes("spagett") || lower.includes("spaget") || lower.includes("pasta")) &&
        lower.includes("muna"));
    const eggMatch = lower.match(/(\d+)\s*muna/);
    const wantsWeekEggPantry =
      !isCookIntent &&
      (lower.includes("kodus") || lower.includes("mul on")) &&
      lower.includes("muna");

    if (wantsWeekEggPantry && basePlan) {
      const eggs = eggMatch ? Number(eggMatch[1]) : 10;
      setDraft("");
      applyEggsAtHome(eggs);
      return;
    }

    const answer: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: replyToStudent(text, plan),
    };
    setChat((c) => [...c, userMsg, answer]);
    setDraft("");
  }

  async function sendCookChat(destination: "cook" | "plan" = "cook") {
    const text = (destination === "plan" ? draft : cookDraft).trim();
    if (!text || cookPending) return;
    const append = destination === "plan" ? setChat : setCookChat;
    const clearDraft = destination === "plan" ? setDraft : setCookDraft;
    const userMsg: ChatMessage = {
      id: `cu-${Date.now()}`,
      role: "user",
      text,
    };
    append((c) => [...c, userMsg]);
    clearDraft("");
    setCookPending(true);
    try {
      const res = await fetch("/api/cook-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          pantry: cookPantry,
          recipeId: cookRecipeId,
          budgetMeal: cookBudgetMeal,
        }),
      });
      if (!res.ok) throw new Error(`Cook chat request failed (${res.status})`);
      const data = (await res.json()) as {
        reply?: string;
        pantry?: Record<string, number>;
        recipeId?: string | null;
        budgetMeal?: BudgetMealContext;
      };
      const reply =
        data.reply ??
        "Vestlus ei saanud praegu vastata. Proovi hetke pärast uuesti.";
      if (data.pantry) setCookPantry((previous) => ({ ...previous, ...data.pantry }));
      if (data.budgetMeal) setCookRecipeId(null);
      else if (data.recipeId) setCookRecipeId(data.recipeId);
      setCookBudgetMeal(data.budgetMeal ?? null);
      append((c) => [
        ...c,
        {
          id: `ca-${Date.now()}`,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch {
      append((c) => [
        ...c,
        {
          id: `ca-${Date.now()}`,
          role: "assistant",
          text: "Vestlus ei saanud praegu vastata. Proovi hetke pärast uuesti.",
        },
      ]);
    } finally {
      setCookPending(false);
    }
  }

  const statusLight = stage === "home";
  const bezel = 12;
  const frameW = IPHONE14.w + bezel * 2;
  const frameH = IPHONE14.h + bezel * 2;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-neutral-950 px-3 py-4">
      {/* Exact iPhone 14 canvas (390×844), scaled to viewport */}
      <div
        className="relative shrink-0"
        style={{
          width: frameW,
          height: frameH,
          transform: `scale(min(1, (100vw - 24px) / ${frameW}, (100dvh - 32px) / ${frameH}))`,
          transformOrigin: "center center",
        }}
      >
        <div
          aria-hidden
          className="absolute -left-[3px] top-[120px] h-8 w-[3px] rounded-l-sm bg-[#3a3a3c]"
        />
        <div
          aria-hidden
          className="absolute -left-[3px] top-[168px] h-14 w-[3px] rounded-l-sm bg-[#3a3a3c]"
        />
        <div
          aria-hidden
          className="absolute -left-[3px] top-[232px] h-14 w-[3px] rounded-l-sm bg-[#3a3a3c]"
        />
        <div
          aria-hidden
          className="absolute -right-[3px] top-[190px] h-20 w-[3px] rounded-r-sm bg-[#3a3a3c]"
        />

        <div
          className="relative h-full w-full border border-[#2c2c2e] bg-[#1c1c1e] shadow-[0_40px_100px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
          style={{ borderRadius: IPHONE14.radius + bezel, padding: bezel }}
        >
          <div
            className={cn(
              "relative flex flex-col overflow-hidden",
              statusLight ? "bg-black" : "bg-white",
            )}
            style={{
              width: IPHONE14.w,
              height: IPHONE14.h,
              borderRadius: IPHONE14.radius,
            }}
          >
            {/* iPhone 14 notch */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 bg-black"
              style={{
                width: IPHONE14.notchW,
                height: IPHONE14.notchH,
                borderRadius: "0 0 18px 18px",
              }}
              aria-hidden
            />

            {/* Status bar — safe area 47pt */}
            <div
              className={cn(
                "relative z-30 flex shrink-0 items-end justify-between px-6 pb-1.5",
                "bg-black text-white",
              )}
              style={{ height: IPHONE14.status }}
            >
              <span className="w-[64px] text-[15px] font-semibold tracking-tight">
                9:41
              </span>
              <div className="flex w-[64px] items-center justify-end gap-1.5 text-[12px] font-medium">
                <span className="opacity-90">5G</span>
                <span className="inline-flex h-[11px] w-[24px] items-center rounded-[3px] border border-current/80 p-[1px]">
                  <span className="h-full w-[70%] rounded-[1px] bg-current" />
                </span>
              </div>
            </div>

        {inStudentMode ? (
          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  if (stage === "plan") setStage("setup");
                  else if (stage === "setup") setStage("hero");
                  else if (stage === "cook-chat") setStage("hero");
                  else goHome();
                }}
                className="inline-flex size-9 items-center justify-center rounded-full text-black hover:bg-neutral-100"
                aria-label="Tagasi"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className="font-display text-[11px] font-bold lowercase tracking-tight"
                  style={{ color: PK_ORANGE }}
                >
                  partner
                </p>
                <p className="truncate font-display text-lg font-bold leading-tight text-black">
                  {stage === "cook-chat" ? "Tudengiabi" : "Student Mode"}
                </p>
              </div>
              <span
                className="inline-flex size-9 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: PK_ORANGE }}
              >
                <GraduationCap className="size-4" />
              </span>
            </div>
          </header>
        ) : null}

        {/* Side drawer — visual only; Student Mode elab peamenüüs */}
        {menuOpen && (
          <div className="absolute inset-0 z-50 flex">
            <button
              type="button"
              className="h-full flex-1 bg-black/45"
              aria-label="Sulge menüü"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="flex h-full w-[82%] flex-col bg-[#1c1c1c] text-white shadow-2xl animate-enter">
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Menüü
                </p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
                  aria-label="Sulge"
                >
                  <X className="size-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto pb-8">
                {SIDE_MENU.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5 opacity-90"
                      aria-disabled
                    >
                      <Icon
                        className="size-[22px] shrink-0"
                        style={{ color: PK_ORANGE }}
                        strokeWidth={1.7}
                      />
                      <span className="font-display text-[15px] font-bold leading-snug text-white">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto",
            stage === "home" ? "bg-black px-0 pb-0 pt-0" : "px-4 pb-28 pt-4",
          )}
        >
          {stage === "home" && (
            <section className="flex min-h-full flex-col animate-enter font-display">
              <div className="bg-black px-5 pb-4 pt-1 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <User className="size-[22px] text-white" strokeWidth={1.6} />
                    <p className="text-[17px] font-bold tracking-tight">
                      Aaron Siimon
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="inline-flex size-[42px] items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: PK_ORANGE }}
                    aria-label="Ava kõrvalmenüü"
                  >
                    <Menu className="size-5" strokeWidth={2.6} />
                  </button>
                </div>

                <div className="mb-5 flex items-stretch gap-4">
                  <div className="flex gap-3">
                    <div
                      className="w-[3px] self-stretch rounded-full"
                      style={{ backgroundColor: PK_ORANGE }}
                    />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                        Boonuspunktid
                      </p>
                      <p className="mt-0.5 text-[28px] font-bold leading-none tracking-tight text-white">
                        0,47 €
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-px self-stretch"
                    style={{ backgroundColor: PK_ORANGE }}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className="text-[13px] font-bold uppercase leading-tight tracking-wide underline decoration-2 underline-offset-2"
                      style={{ color: PK_ORANGE }}
                    >
                      Soovid maksta hiljem?
                    </p>
                    <span className="mt-1.5 inline-flex rounded-[4px] bg-[#e30613] px-1.5 py-[2px] text-[10px] font-bold uppercase tracking-wide text-white">
                      Uus!
                    </span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[14px] bg-white px-4 pb-3.5 pt-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                  <Star
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-4 size-40 rotate-12 opacity-[0.12]"
                    style={{ color: PK_ORANGE }}
                    strokeWidth={1.2}
                    fill="currentColor"
                  />
                  <p
                    className="relative text-[18px] font-bold lowercase tracking-tight"
                    style={{ color: PK_ORANGE }}
                  >
                    partner
                  </p>
                  <div className="relative my-5 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-[10px] border border-black/80 bg-white px-4 py-2.5 shadow-[0_0_0_3px_rgba(255,106,0,0.18)]">
                      <QrCode className="size-4 text-black" strokeWidth={2} />
                      <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-black">
                        Esita Partnerkaart
                      </span>
                    </div>
                  </div>
                  <div className="relative flex items-end justify-between font-mono text-[12px] font-medium tracking-wider text-black">
                    <span>9233 6600 4795 1885</span>
                    <span>10/2028</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col rounded-t-[22px] bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
                <div className="mb-1 flex justify-center py-1.5" aria-hidden>
                  <div className="h-1 w-10 rounded-full bg-neutral-300" />
                </div>
                <ul className="flex-1">
                  {MAIN_MENU.map((item, index) => {
                    const Icon = item.icon;
                    const rowClass =
                      "flex w-full items-center gap-3.5 px-5 py-[15px] text-left";
                    const border =
                      index < MAIN_MENU.length - 1
                        ? "border-b border-neutral-200"
                        : "";
                    if (item.action === "student-mode") {
                      return (
                        <li key={item.id} className={border}>
                          <button
                            type="button"
                            onClick={openStudentMode}
                            className={cn(rowClass, "active:bg-neutral-50")}
                          >
                            <Icon
                              className="size-[22px] shrink-0"
                              style={{ color: PK_ORANGE }}
                              strokeWidth={1.85}
                            />
                            <span className="flex-1 text-[17px] font-bold tracking-tight text-black">
                              {item.label}
                            </span>
                            <span className="inline-flex rounded-[4px] bg-[#e30613] px-1.5 py-[2px] text-[10px] font-bold uppercase tracking-wide text-white">
                              Uus!
                            </span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={item.id} className={border}>
                        <div className={rowClass} aria-disabled>
                          <Icon
                            className="size-[22px] shrink-0"
                            style={{ color: PK_ORANGE }}
                            strokeWidth={1.85}
                          />
                          <span className="flex-1 text-[17px] font-bold tracking-tight text-black">
                            {item.label}
                          </span>
                          {item.notify && (
                            <span className="inline-flex size-[22px] items-center justify-center rounded-full bg-[#e30613] text-[11px] font-bold text-white">
                              {item.notify}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="px-5 pb-2 pt-3">
                  <div
                    className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-bold uppercase tracking-[0.06em] text-white"
                    style={{ backgroundColor: PK_ORANGE }}
                  >
                    <ScanLine className="size-5" strokeWidth={2.2} />
                    Skaneeri ja osta
                  </div>
                </div>
              </div>
            </section>
          )}

          {stage === "hero" && (
            <section className="space-y-4 animate-enter font-display">
              <div className="overflow-hidden rounded-[14px] bg-black p-5 text-white">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: PK_ORANGE }}
                >
                  Partnerkaart
                </p>
                <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
                  Student Mode
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Vali nädala eelarve 20–60 € vahemikus, saa näidisplaan ja
                  ostukorv selle piires.
                </p>
                <button
                  type="button"
                  onClick={activate}
                  className="mt-5 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold uppercase tracking-[0.04em] text-black"
                  style={{ backgroundColor: PK_ORANGE }}
                >
                  Alusta
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <HeroCookCard onOpen={openCookChat} />
            </section>
          )}

          {stage === "cook-chat" && (
            <section className="flex min-h-[520px] flex-col space-y-3 animate-enter font-display">
              <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                Ostukorvi summad põhinevad näidishindadel. Kui kuvatakse
                „Live Selver“, pärinevad selle toote hind ja link e-Selveri otsingust.
              </div>
              <ChatView
                chat={cookChat}
                draft={cookDraft}
                setDraft={setCookDraft}
                onSend={() => void sendCookChat()}
                chips={[
                  "30 € nädalaks, soovin ka liha",
                  "10 € eest hakklihapastat ja salatit",
                  "Kodus on nuudlid ja juust, eelarve 5 €",
                  "Mul on 100 g spagette ja kaks muna. Mida ma kiiresti teha saaks?",
                  "Mul on ka 130 g köögiviljasegu",
                  "Mul on kodus taigen ja mune, tahan hakkliha pannkooke — mida osta?",
                ]}
                sending={cookPending}
              />
              <button
                type="button"
                onClick={resetCookChatSession}
                className="text-xs font-bold text-neutral-500 underline-offset-2 hover:underline"
              >
                Nulli vestlus
              </button>
            </section>
          )}

          {stage === "setup" && (
            <section className="space-y-5 animate-enter font-display">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-black">
                  Seadista oma nädal
                </h2>
              </div>

              <div className="space-y-6 rounded-[14px] border border-neutral-200 bg-white p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-black">
                      <Wallet className="size-4" style={{ color: PK_ORANGE }} />
                      Nädala eelarve
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Vähenda eelarvet"
                        onClick={() => setBudget((b) => Math.max(20, b - 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-black active:scale-95"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-[4.5rem] text-center text-3xl font-bold tabular-nums text-black">
                        {budget} €
                      </span>
                      <button
                        type="button"
                        aria-label="Suurenda eelarvet"
                        onClick={() => setBudget((b) => Math.min(60, b + 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-black active:scale-95"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Slider
                    value={[budget]}
                    min={20}
                    max={60}
                    step={1}
                    onValueChange={(v) =>
                      setBudget(Array.isArray(v) ? (v[0] ?? 35) : v)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {[20, 35, 50, 60].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudget(preset)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-bold transition",
                          budget === preset
                            ? "border-transparent text-white"
                            : "border-neutral-200 bg-white text-black",
                        )}
                        style={
                          budget === preset
                            ? { backgroundColor: PK_ORANGE }
                            : undefined
                        }
                      >
                        {preset} €
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-black">
                      <Timer className="size-4" style={{ color: PK_ORANGE }} />
                      Päevi planeerida
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Vähenda päevi"
                        onClick={() => setDays((d) => Math.max(3, d - 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-black active:scale-95"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-3xl font-bold tabular-nums text-black">
                        {days}
                      </span>
                      <button
                        type="button"
                        aria-label="Suurenda päevi"
                        onClick={() => setDays((d) => Math.min(7, d + 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-black active:scale-95"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Slider
                    value={[days]}
                    min={3}
                    max={7}
                    step={1}
                    onValueChange={(v) =>
                      setDays(Array.isArray(v) ? (v[0] ?? 5) : v)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-[12px] border px-3 py-3.5 text-left transition",
                        style === s.id
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 bg-white text-black",
                      )}
                    >
                      <p className="text-sm font-bold leading-snug">{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={pending}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold uppercase tracking-[0.04em] text-white disabled:opacity-50"
                style={{ backgroundColor: PK_ORANGE }}
              >
                <Sparkles className="size-4" />
                {pending ? "Planeerin…" : "Loo menüü ja korv"}
              </button>

              <HeroCookCard onOpen={openCookChat} />
            </section>
          )}

          {stage === "plan" && plan && (
            <section className="space-y-5 animate-enter font-display">
              <div className="space-y-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ backgroundColor: PK_ORANGE }}
                    >
                      {budget} €
                    </span>
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {style === "odav"
                        ? "odav"
                        : style === "kvaliteetne"
                          ? "kvaliteetne"
                          : style === "taimne"
                            ? "taimetoit"
                            : style === "liha"
                              ? "lihaga"
                              : style === "sysivesikud"
                                ? "vähe süsivesikuid"
                                : "kiire"}
                    </span>
                    <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] font-bold text-black">
                      {plan.days} päeva
                    </span>
                    <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] font-bold text-neutral-500">
                      näidisplaan
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-black">
                    Sinu {plan.days === 7 ? "nädal" : `${plan.days} päeva`} on
                    valmis
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full border-neutral-200 font-bold text-black"
                    onClick={() => setStage("setup")}
                  >
                    Muuda seadeid
                  </Button>
                  {!pantryApplied ? (
                    <Button
                      className="rounded-full font-bold text-white hover:opacity-90"
                      style={{ backgroundColor: PK_ORANGE }}
                      onClick={() => applyEggsAtHome(10)}
                    >
                      Mul on kodus 10 muna
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full border-neutral-200 font-bold text-black"
                      onClick={() => {
                        if (basePlan) {
                          setPlan(basePlan);
                          setPantryApplied(false);
                        }
                      }}
                    >
                      Lähtesta korv
                    </Button>
                  )}
                </div>
                {pantryApplied && (
                  <div
                    className="rounded-[12px] border px-3 py-2.5 text-sm font-bold"
                    style={{
                      borderColor: PK_ORANGE,
                      backgroundColor: "#fff0e3",
                      color: "#000",
                    }}
                  >
                    Korv {euros(basePlan?.total ?? plan.total)} → {euros(plan.total)}.
                    Munad: {eggsNeeded} tk nädalaks · ostad {eggLine?.qty ?? 1}{" "}
                    karbi (varem 2).
                  </div>
                )}
              </div>

              <PlanAskCard
                draft={draft}
                setDraft={setDraft}
                onSend={() => {
                  sendChat();
                  setTab("chat");
                }}
                onPantryDemo={() => {
                  applyEggsAtHome(10);
                  setTab("basket");
                }}
                onOpenChat={() => setTab("chat")}
                lastAssistant={
                  [...chat].reverse().find((m) => m.role === "assistant")?.text
                }
              />

              <div className="grid grid-cols-1 gap-2">
                <Stat
                  label="Korvi summa"
                  value={euros(plan.total)}
                  hint={`eelarve ${budget} €`}
                />
                <Stat
                  label="Kampaania sääst"
                  value={euros(plan.saved)}
                  hint="vs tavahind"
                />
                <Stat
                  label="Järelejäänud"
                  value={euros(Math.max(0, plan.leftoverBudget))}
                  hint="eelarvest"
                />
              </div>

              <div className="flex gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
                {(
                  [
                    ["menu", "Menüü"],
                    ["basket", "Ostukorv"],
                    ["chat", "Vestlus"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-sm font-bold transition",
                      tab === id
                        ? "bg-black text-white"
                        : "text-neutral-500 hover:text-black",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "menu" && <MenuView plan={plan} />}
              {tab === "basket" && (
                <BasketView plan={plan} highlightEggs={pantryApplied} />
              )}
              {tab === "chat" && (
                <ChatView
                  chat={chat}
                  draft={draft}
                  setDraft={setDraft}
                  onSend={sendChat}
                  onPantryDemo={() => applyEggsAtHome(10)}
                  sending={cookPending}
                />
              )}

              <div className="rounded-[14px] border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-bold text-black">Järgmine samm</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Tulevikus võiks selle nimekirjaga jätkata e-Selveris.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-[0.04em] text-white"
                  style={{ backgroundColor: PK_ORANGE }}
                >
                  Jätka e-Selveris
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </section>
          )}
        </main>

            {inStudentMode && (
              <>
                {stage !== "cook-chat" &&
                  !(stage === "plan" && tab === "chat") &&
                  !chatSheetOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        if (stage === "plan") {
                          setTab("chat");
                          setChatSheetOpen(false);
                        } else {
                          openCookChat();
                        }
                      }}
                      className="absolute bottom-[78px] right-3 z-40 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(249,125,0,0.45)]"
                      style={{ backgroundColor: PK_ORANGE }}
                      aria-label="Ava tudengiabi"
                    >
                      <MessageCircle className="size-4" strokeWidth={2.4} />
                      Abi
                    </button>
                  )}
              </>
            )}

            {inStudentMode ? (
              <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-border/70 bg-white/95 px-1 pb-5 pt-1 backdrop-blur-md">
                <div className="grid grid-cols-5">
                  {BOTTOM_TABS.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.id === "more" ||
                      (stage === "plan" && item.id === "list");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "more") setMenuOpen(true);
                          else if (item.id === "home") goHome();
                        }}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium",
                          active ? "text-[#F97D00]" : "text-neutral-400",
                          item.id !== "more" &&
                            item.id !== "home" &&
                            "pointer-events-none",
                        )}
                      >
                        <Icon
                          className="size-5"
                          strokeWidth={active ? 2.4 : 1.8}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-center pb-1 pt-1" aria-hidden>
                  <div className="h-[5px] w-[134px] rounded-full bg-black/80" />
                </div>
              </nav>
            ) : (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center"
                aria-hidden
              >
                <div className="h-[5px] w-[134px] rounded-full bg-black/85" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-bold text-black">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{hint}</p>
    </div>
  );
}

function MenuView({ plan }: { plan: PlanResult }) {
  const byDay = useMemo(() => {
    const map = new Map<number, typeof plan.meals>();
    for (const meal of plan.meals) {
      const list = map.get(meal.day) ?? [];
      list.push(meal);
      map.set(meal.day, list);
    }
    return [...map.entries()];
  }, [plan.meals]);

  return (
    <div className="space-y-4">
      {byDay.map(([day, meals], i) => (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-[14px] border border-neutral-200 bg-white p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-bold text-white"
              style={{ backgroundColor: PK_ORANGE }}
            >
              {dayLabel(day)}
            </span>
            <p className="font-display text-lg font-bold text-black">
              Päev {day}
            </p>
          </div>
          <div className="grid gap-2">
            {meals.map((meal) => (
              <div
                key={`${meal.day}-${meal.slot}`}
                className="rounded-[12px] bg-neutral-50 px-3 py-3"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {meal.slot}
                </p>
                <p className="mt-1 font-semibold leading-snug">
                  {meal.recipe.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="size-3" />
                    {meal.recipe.minutes} min
                  </span>
                  <span>·</span>
                  <span>{euros(meal.cost)}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {meal.recipe.tip}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BasketView({
  plan,
  highlightEggs,
}: {
  plan: PlanResult;
  highlightEggs?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="size-4" style={{ color: PK_ORANGE }} />
          <p className="font-display text-lg font-bold text-black">Ostukorv</p>
        </div>
        <p className="font-display text-xl font-bold text-black">
          {euros(plan.total)}
        </p>
      </div>
      <ul className="divide-y divide-neutral-200">
        {plan.basket.map((line, i) => (
          <motion.li
            key={line.productId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "flex items-start justify-between gap-3 px-4 py-3 sm:px-5",
              highlightEggs &&
                (line.productId === "eggs" || line.productId === "munad") &&
                "bg-[#fff0e3]",
            )}
          >
            <div>
              <p className="font-medium leading-snug">{line.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {line.qty} {line.unit}
                </span>
                {line.privateLabel && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    Kirde
                  </Badge>
                )}
                {line.onPromo && (
                  <Badge
                    className="h-5 text-[10px] text-white hover:opacity-90"
                    style={{ backgroundColor: PK_ORANGE }}
                  >
                    Kampaania
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-black">{euros(line.lineTotal)}</p>
              {line.saved > 0 && (
                <p className="text-xs font-bold" style={{ color: PK_ORANGE }}>
                  −{euros(line.saved)}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
      <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Check className="size-4" style={{ color: PK_ORANGE }} />
          Hinnad allikaviidetega andmestikust; kogused ühendatakse retsepti
          toote ID-dega ja ümardatakse täispakkideks.
        </div>
      </div>
    </div>
  );
}

function HeroCookCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="space-y-5 rounded-[16px] border border-neutral-200 bg-white px-5 pb-5 pt-6">
      <div className="flex flex-col items-start gap-3">
        <span
          className="inline-flex size-14 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: PK_ORANGE }}
        >
          <MessageCircle className="size-7" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="font-display text-xl font-bold leading-snug text-black">
            Mida ma täna süüa teeks?
          </h2>
          <p className="text-[15px] leading-relaxed text-neutral-600">
            Ütle, mis sul kodus on või mille järele isu on. Pakun roa ja näitan,
            mida vajadusel juurde osta.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 text-[15px] font-bold text-black"
        style={{ borderColor: PK_ORANGE }}
      >
        Ava vestlus
        <ArrowRight className="size-4" style={{ color: PK_ORANGE }} />
      </button>
    </div>
  );
}

function PlanAskCard({
  draft,
  setDraft,
  onSend,
  onPantryDemo,
  onOpenChat,
  lastAssistant,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onPantryDemo?: () => void;
  onOpenChat: () => void;
  lastAssistant?: string;
}) {
  return (
    <div
      className="rounded-[14px] border-2 bg-white p-4 shadow-[0_8px_24px_rgba(249,125,0,0.12)]"
      style={{ borderColor: PK_ORANGE }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5" style={{ color: PK_ORANGE }} />
          <div>
            <p className="font-display text-base font-bold text-black">
              Küsi tudengiabilt
            </p>
            <p className="text-xs text-neutral-500">
              Ütle, mis kodus on — arvutame, mida osta.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenChat}
          className="shrink-0 text-xs font-bold underline underline-offset-2"
          style={{ color: PK_ORANGE }}
        >
          Ava vestlus
        </button>
      </div>

      {lastAssistant && (
        <p className="mb-3 line-clamp-3 rounded-[10px] bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-700">
          {lastAssistant}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {CHAT_CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              if (c.includes("10 muna") && onPantryDemo) {
                onPantryDemo();
                return;
              }
              setDraft(c);
            }}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-left text-[11px] font-bold leading-snug text-neutral-700 hover:border-[#F97D00]"
          >
            {c.length > 42 ? `${c.slice(0, 40)}…` : c}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nt: mul on kodus taigen ja mune…"
          className="min-h-[44px] resize-none bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button
          className="h-auto rounded-[12px] px-4 font-bold text-white hover:opacity-90"
          style={{ backgroundColor: PK_ORANGE }}
          onClick={onSend}
        >
          Saada
        </Button>
      </div>
    </div>
  );
}

function linkifyChatText(text: string, onOrange = false) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const href = part.replace(/[),.;!?]+$/g, "");
      const trailing = part.slice(href.length);
      return (
        <span key={i}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "break-all underline underline-offset-2",
              onOrange
                ? "text-white decoration-white/80 hover:decoration-white"
                : "font-semibold decoration-[#F97D00]/80 hover:text-[#F97D00]",
            )}
            style={onOrange ? undefined : { color: PK_ORANGE }}
            onClick={(e) => e.stopPropagation()}
          >
            {href}
          </a>
          {trailing}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function ChatView({
  chat,
  draft,
  setDraft,
  onSend,
  onPantryDemo,
  compact = false,
  chips,
  sending = false,
}: {
  chat: ChatMessage[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onPantryDemo?: () => void;
  compact?: boolean;
  chips?: readonly string[];
  sending?: boolean;
}) {
  const chipList = chips ?? CHAT_CHIPS;
  // Hide starter chips after the first exchange so long answers stay readable.
  const showChips = !chat.some((m) => m.role === "user");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat, sending]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-white",
        compact
          ? "min-h-[280px] max-h-[420px] rounded-[12px] border border-neutral-200"
          : "min-h-[420px] rounded-[14px] border border-neutral-200",
      )}
    >
      {!compact && (
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <MessageCircle className="size-4" style={{ color: PK_ORANGE }} />
          <p className="font-display text-lg font-bold text-black">Vestlus</p>
        </div>
      )}
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {chat.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[92%] rounded-[12px] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
              m.role === "assistant"
                ? "bg-neutral-100 text-black"
                : "ml-auto text-white",
            )}
            style={
              m.role === "user" ? { backgroundColor: PK_ORANGE } : undefined
            }
          >
            {linkifyChatText(m.text, m.role === "user")}
          </div>
        ))}
        {sending && (
          <div className="max-w-[90%] rounded-[12px] bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-500">
            Mõtlen…
          </div>
        )}
      </div>
      <div className="space-y-3 border-t border-neutral-200 px-4 py-3">
        {showChips && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chipList.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  if (c.includes("10 muna") && onPantryDemo) {
                    onPantryDemo();
                    return;
                  }
                  setDraft(c);
                }}
                className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-bold text-neutral-600 hover:border-[#F97D00] hover:text-black"
              >
                {c.length > 36 ? `${c.slice(0, 34)}…` : c}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Küsi midagi…"
            className="min-h-[44px] resize-none bg-white"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button
            className="h-auto rounded-[12px] px-4 font-bold text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: PK_ORANGE }}
            onClick={onSend}
            disabled={sending}
          >
            Saada
          </Button>
        </div>
      </div>
    </div>
  );
}
