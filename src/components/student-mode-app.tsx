"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { replyToStudent, type ChatMessage } from "@/lib/assistant";
import {
  buildPlan,
  dayLabel,
  type PlanResult,
  type Prefs,
} from "@/lib/planner";

const PARTNERKAART_URL = "https://www.partnerkaart.ee/et/app/";

const BOTTOM_TABS = [
  { id: "home", label: "Avaleht", icon: Home },
  { id: "list", label: "Nimekiri", icon: ListChecks },
  { id: "scan", label: "Skaneeri", icon: ScanLine },
  { id: "offers", label: "Soodustused", icon: Percent },
  { id: "more", label: "Veel", icon: Menu },
] as const;

/** Partnerkaart side menu — only Student Mode is interactive. */
const SIDE_MENU: {
  id: string;
  label: string;
  icon: LucideIcon;
  action?: "student-mode";
}[] = [
  { id: "home", label: "Avaleht", icon: Home },
  { id: "scan", label: "Skaneeri ja osta", icon: ScanLine },
  { id: "list", label: "Ostunimekiri", icon: ListChecks },
  { id: "card", label: "Esita Partnerkaart", icon: QrCode },
  { id: "offers", label: "Pakkumised", icon: Percent },
  { id: "student", label: "Student Mode", icon: GraduationCap, action: "student-mode" },
  { id: "pay", label: "Maksevahendid", icon: CreditCard },
  { id: "history", label: "Ostude ajalugu", icon: History },
  { id: "profile", label: "Minu andmed", icon: User },
  { id: "settings", label: "Seaded", icon: Settings },
  { id: "help", label: "Abi, kontaktid ja tagasiside", icon: Info },
];

type Stage = "home" | "hero" | "setup" | "plan";

const DELIVERY_OPTIONS = [
  "Kojutoomine täna",
  "Kojutoomine homme",
  "Express 2 h",
  "Tulen ise Selverisse järgi",
];

const STYLES: { id: Prefs["style"]; label: string; hint: string }[] = [
  { id: "odav", label: "Kõige odavam", hint: "Kirde + kampaaniad" },
  { id: "kiire", label: "Kiirelt valmis", hint: "≤ 20 min" },
  { id: "taimne", label: "Taimetoit", hint: "oad, tofu, kiker" },
  { id: "liha", label: "Sisaldab liha", hint: "kana & hakk" },
];

function euros(n: number) {
  return `${n.toFixed(2)} €`;
}

export function StudentModeApp() {
  const [stage, setStage] = useState<Stage>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modeOn, setModeOn] = useState(false);
  const [budget, setBudget] = useState(35);
  const [days, setDays] = useState(5);
  const [style, setStyle] = useState<Prefs["style"]>("odav");
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0]!);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"menu" | "basket" | "chat">("menu");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Tere! Olen Selveri tudengiabi. Küsi eelarve, kiiruse või jääkide kohta.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const inStudentMode = stage !== "home";
  const prefs: Prefs = useMemo(
    () => ({ budget, days, style, delivery }),
    [budget, days, style, delivery],
  );

  function openStudentMode() {
    setMenuOpen(false);
    setModeOn(true);
    setStage("hero");
  }

  function activate() {
    setModeOn(true);
    setStage("setup");
  }

  function goHome() {
    setStage("home");
    setMenuOpen(false);
  }

  function generate() {
    startTransition(() => {
      const next = buildPlan(prefs);
      setPlan(next);
      setStage("plan");
      setTab("menu");
      setChat((prev) => [
        ...prev,
        {
          id: `plan-${Date.now()}`,
          role: "assistant",
          text: next.summary,
        },
      ]);
    });
  }

  function sendChat() {
    const text = draft.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    const answer: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: replyToStudent(text, plan),
    };
    setChat((c) => [...c, userMsg, answer]);
    setDraft("");
  }

  return (
    <div className="relative flex flex-1 flex-col items-center bg-[#0b1220] px-3 py-4 sm:px-6 sm:py-8">
      <div className="mb-3 flex w-full max-w-[430px] items-center justify-between px-1 text-[11px] text-white/55">
        <span>Partnerkaart äpp</span>
        <a
          href={PARTNERKAART_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:text-white hover:underline"
        >
          partnerkaart.ee
        </a>
      </div>

      <div className="relative flex w-full max-w-[430px] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#f4f6fb] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]">
        <div
          className={cn(
            "flex items-center justify-between px-5 pb-1 pt-3 text-[11px] font-medium",
            stage === "home" ? "bg-[#1a1a1a] text-white/90" : "bg-selver-navy text-white/90",
          )}
        >
          <span>9:41</span>
          <span className="h-1.5 w-20 rounded-full bg-white/25" />
          <span>5G · 88%</span>
        </div>

        {inStudentMode ? (
          <header className="sticky top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  if (stage === "plan") setStage("setup");
                  else if (stage === "setup") setStage("hero");
                  else goHome();
                }}
                className="inline-flex size-9 items-center justify-center rounded-full text-selver-navy hover:bg-mist"
                aria-label="Tagasi"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-selver-navy/55">
                  Partnerkaart · Selver
                </p>
                <p className="truncate font-display text-lg font-bold leading-tight text-selver-navy">
                  Tudengirežiim
                </p>
              </div>
              <Image
                src="/selver-logo.png"
                alt="Selver"
                width={36}
                height={42}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2 border-t border-border/40 bg-mist/70 px-4 py-1.5">
              <Badge className="bg-selver-yellow text-selver-navy hover:bg-selver-yellow">
                Äpi moodul
              </Badge>
              {modeOn && (
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="size-3" />
                  ISIC · Partnerkaart
                </Badge>
              )}
            </div>
          </header>
        ) : (
          <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-full bg-[#f15a22] text-white shadow-md"
                aria-label="Ava menüü"
              >
                <Menu className="size-5" strokeWidth={2.4} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-selver-navy/55">
                  Partnerkaart
                </p>
                <p className="truncate font-display text-lg font-bold leading-tight text-selver-navy">
                  Avaleht
                </p>
              </div>
              <Image
                src="/selver-logo.png"
                alt="Selver"
                width={36}
                height={42}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
          </header>
        )}

        {/* Partnerkaart side drawer */}
        {menuOpen && (
          <div className="absolute inset-0 z-50 flex">
            <button
              type="button"
              className="h-full w-[18%] bg-black/45"
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
                  const active = item.action === "student-mode";
                  if (active) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={openStudentMode}
                        className="flex w-full items-center gap-3 border-b border-white/10 px-5 py-3.5 text-left transition hover:bg-white/5"
                      >
                        <Icon
                          className="size-[22px] shrink-0 text-[#f15a22]"
                          strokeWidth={1.7}
                        />
                        <span className="text-[15px] font-medium leading-snug text-white">
                          {item.label}
                        </span>
                        <ArrowRight className="ml-auto size-4 text-[#f15a22]" />
                      </button>
                    );
                  }
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5 opacity-90"
                      aria-disabled
                    >
                      <Icon
                        className="size-[22px] shrink-0 text-[#f15a22]"
                        strokeWidth={1.7}
                      />
                      <span className="text-[15px] font-medium leading-snug text-white">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-4">
          {stage === "home" && (
            <section className="space-y-4 animate-enter">
              <div className="overflow-hidden rounded-[1.5rem] bg-selver-navy p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-selver-yellow">
                  Partnerkaart
                </p>
                <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
                  Tere tulemast
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Ava menüü (☰) ja vali <span className="text-selver-yellow">Student Mode</span>,
                  et jõuda tudengirežiimini.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-white p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Teised menüüpunktid on näidisena — ainult Student Mode viib edasi.
                </p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f15a22] px-6 text-sm font-medium text-white"
                >
                  <Menu className="size-4" />
                  Ava menüü
                </button>
              </div>
            </section>
          )}

          {stage === "hero" && (
            <section className="space-y-5 animate-enter">
              <div className="overflow-hidden rounded-[1.5rem] bg-selver-navy p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-selver-yellow">
                      Uus Partnerkaardi moodul
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
                      Tudengirežiim
                    </h1>
                  </div>
                  <Image
                    src="/selver-logo.png"
                    alt=""
                    width={56}
                    height={64}
                    className="h-14 w-auto object-contain opacity-95"
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Eraldiseisev osa Partnerkaardi äpist: AI paneb nädala menüü ja
                  Selveri korvi kokku sinu eelarve järgi.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/10 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-selver-yellow">
                      Nädal
                    </p>
                    <p className="font-display text-xl font-bold">35 €</p>
                  </div>
                  <div className="rounded-2xl bg-selver-yellow px-3 py-2.5 text-selver-navy">
                    <p className="text-[10px] uppercase tracking-wider opacity-70">
                      Boonus
                    </p>
                    <p className="font-display text-xl font-bold">+ punktid</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-white p-4 shadow-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ütle eelarve — saad menüü, kampaaniakorvi ja jääkide-abilise.
                  Ostunimekiri läheb edasi Partnerkaardi äppi.
                </p>
                <button
                  type="button"
                  onClick={activate}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-selver-red px-7 text-base font-medium text-white transition hover:bg-[#c50510]"
                >
                  Ava tudengirežiim
                  <ArrowRight className="size-4" />
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Häkatoni prototüüp · Partnerkaart × Selver
                </p>
              </div>
            </section>
          )}

          {stage === "setup" && (
            <section className="space-y-5 animate-enter">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold tracking-tight text-selver-navy">
                  Seadista oma nädal
                </h2>
                <p className="text-sm text-muted-foreground">
                  Eelarve, päevad ja stiil — menüü valmib sekundiga.
                </p>
              </div>

              <div className="space-y-6 rounded-[1.5rem] border border-border/70 bg-white p-4 shadow-sm sm:p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4 text-leaf" />
                      Nädala eelarve
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Vähenda eelarvet"
                        onClick={() => setBudget((b) => Math.max(15, b - 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-selver-navy transition hover:border-selver-red hover:text-selver-red active:scale-95"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-[4.5rem] text-center font-display text-3xl font-bold tabular-nums text-grove">
                        {budget} €
                      </span>
                      <button
                        type="button"
                        aria-label="Suurenda eelarvet"
                        onClick={() => setBudget((b) => Math.min(60, b + 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-selver-navy transition hover:border-selver-red hover:text-selver-red active:scale-95"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Slider
                    value={[budget]}
                    min={15}
                    max={60}
                    step={1}
                    onValueChange={(v) =>
                      setBudget(Array.isArray(v) ? (v[0] ?? 35) : v)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {[20, 35, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudget(preset)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition",
                          budget === preset
                            ? "border-selver-red bg-selver-red text-white"
                            : "border-border bg-white text-selver-navy hover:border-selver-red",
                        )}
                      >
                        {preset} €
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Timer className="size-4 text-leaf" />
                      Päevi planeerida
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Vähenda päevi"
                        onClick={() => setDays((d) => Math.max(3, d - 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-selver-navy transition hover:border-selver-red hover:text-selver-red active:scale-95"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-[2.5rem] text-center font-display text-3xl font-bold tabular-nums text-grove">
                        {days}
                      </span>
                      <button
                        type="button"
                        aria-label="Suurenda päevi"
                        onClick={() => setDays((d) => Math.min(7, d + 1))}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-selver-navy transition hover:border-selver-red hover:text-selver-red active:scale-95"
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

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-left transition",
                        style === s.id
                          ? "border-selver-navy bg-selver-navy text-white"
                          : "border-border bg-white/80 hover:border-leaf/40",
                      )}
                    >
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          style === s.id
                            ? "text-leaf-foreground/75"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.hint}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Tarne üle Eesti</p>
                  <p className="text-xs text-muted-foreground">
                    e-Selveri kojutoomine — kiire ja üleriigiline
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDelivery(option)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition",
                          delivery === option
                            ? "border-citrus bg-citrus text-accent-foreground"
                            : "border-border bg-white/70 text-foreground hover:border-leaf/40",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={pending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-selver-red px-8 text-base font-medium text-white transition hover:bg-[#c50510] disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                {pending ? "Planeerin…" : "Loo menüü ja korv"}
              </button>
            </section>
          )}

          {stage === "plan" && plan && (
            <section className="space-y-5 animate-enter">
              <div className="space-y-3">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-selver-navy">
                    Sinu nädal on valmis
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setStage("setup")}
                  >
                    Muuda seadeid
                  </Button>
                  <Button
                    className="rounded-full bg-selver-red text-white hover:bg-[#c50510]"
                    onClick={generate}
                  >
                    Genereeri uuesti
                  </Button>
                </div>
              </div>

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
                  hint={delivery}
                />
              </div>

              <div className="flex gap-2 rounded-full border border-border/70 bg-white/60 p-1 backdrop-blur">
                {(
                  [
                    ["menu", "Menüü"],
                    ["basket", "Ostukorv"],
                    ["chat", "Abi"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-2 text-sm font-medium transition",
                      tab === id
                        ? "bg-selver-navy text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "menu" && <MenuView plan={plan} />}
              {tab === "basket" && <BasketView plan={plan} />}
              {tab === "chat" && (
                <ChatView
                  chat={chat}
                  draft={draft}
                  setDraft={setDraft}
                  onSend={sendChat}
                />
              )}
            </section>
          )}
        </main>

        <nav className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-white/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md">
          <div className="grid grid-cols-5">
            {BOTTOM_TABS.map((item) => {
              const Icon = item.icon;
              const active =
                (stage === "home" && item.id === "home") ||
                (inStudentMode && item.id === "more") ||
                (stage === "plan" && item.id === "list");
              const openMenu = item.id === "more" || item.id === "home";
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
                    active ? "text-selver-red" : "text-selver-navy/45",
                    !openMenu && "pointer-events-none",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="pb-1 text-center text-[10px] text-muted-foreground">
            {stage === "home"
              ? "Partnerkaart · menüüst Student Mode"
              : "Tudengirežiim · Partnerkaardi äpi moodul"}
          </p>
        </nav>
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
    <div className="rounded-[1.5rem] border border-border/70 bg-white/75 px-5 py-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-bold text-grove">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
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
          className="rounded-[1.5rem] border border-border/70 bg-white/75 p-4 backdrop-blur sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-citrus font-display text-sm font-bold text-accent-foreground">
              {dayLabel(day)}
            </span>
            <p className="font-display text-lg font-bold">Päev {day}</p>
          </div>
          <div className="grid gap-2">
            {meals.map((meal) => (
              <div
                key={`${meal.day}-${meal.slot}`}
                className="rounded-2xl bg-mist/80 px-3 py-3"
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

function BasketView({ plan }: { plan: PlanResult }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="size-4 text-leaf" />
          <p className="font-display text-lg font-bold">Ostukorv</p>
        </div>
        <p className="font-display text-xl font-bold text-grove">
          {euros(plan.total)}
        </p>
      </div>
      <ul className="divide-y divide-border/50">
        {plan.basket.map((line, i) => (
          <motion.li
            key={line.productId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5"
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
                  <Badge className="h-5 bg-citrus text-[10px] text-accent-foreground hover:bg-citrus">
                    Kampaania
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{euros(line.lineTotal)}</p>
              {line.saved > 0 && (
                <p className="text-xs text-leaf">−{euros(line.saved)}</p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
      <div className="border-t border-border/60 bg-mist/70 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="size-4 text-leaf" />
          Sama sibul ja porgand jagunevad mitme retsepti peale — vähem raiskamist.
        </div>
      </div>
    </div>
  );
}

function ChatView({
  chat,
  draft,
  setDraft,
  onSend,
}: {
  chat: ChatMessage[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}) {
  const chips = [
    "Mul on 5 eurot",
    "Kiire enne loengut",
    "Taimne õhtusöök",
    "Kana jäägid",
  ];

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <MessageCircle className="size-4 text-leaf" />
        <p className="font-display text-lg font-bold">Tudengiabi</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-mist text-foreground"
                : "ml-auto bg-selver-red text-white",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-border/60 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setDraft(c)}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground hover:border-leaf/40 hover:text-foreground"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Küsi midagi…"
            className="min-h-[44px] resize-none bg-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button
            className="h-auto rounded-2xl bg-selver-red px-4 text-white hover:bg-[#c50510]"
            onClick={onSend}
          >
            Saada
          </Button>
        </div>
      </div>
    </div>
  );
}
