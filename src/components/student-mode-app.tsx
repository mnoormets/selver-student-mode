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
  ExternalLink,
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

const SELVER_URL = "https://www.selver.ee";

function SelverLogoLink({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <a
      href={SELVER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-selver-red",
        className,
      )}
      aria-label="Ava Selveri veebileht"
      title="selver.ee"
    >
      <Image
        src="/selver-logo.png"
        alt="Selver — Hea mõte"
        width={190}
        height={220}
        priority={priority}
        className="h-auto w-full object-contain transition group-hover:scale-[1.02]"
      />
    </a>
  );
}

type Stage = "hero" | "setup" | "plan";

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
  const [stage, setStage] = useState<Stage>("hero");
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

  const prefs: Prefs = useMemo(
    () => ({ budget, days, style, delivery }),
    [budget, days, style, delivery],
  );

  function activate() {
    setModeOn(true);
    setStage("setup");
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
    <div className="relative flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SelverLogoLink className="w-[52px] sm:w-[60px]" priority />
              {modeOn && (
                <span className="pointer-events-none absolute -inset-1 rounded-xl border-2 border-selver-yellow animate-pulse-ring" />
              )}
            </div>
            <div>
              <p className="font-display text-xl font-extrabold uppercase leading-none tracking-wide text-selver-red sm:text-2xl">
                Selver
              </p>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-selver-navy/70">
                {modeOn ? "Tudengirežiim sees" : "Tudengirežiim"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modeOn && (
              <Badge className="bg-selver-yellow text-selver-navy hover:bg-selver-yellow">
                <GraduationCap className="size-3.5" />
                ISIC demo
              </Badge>
            )}
            <a
              href={SELVER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-selver-navy transition hover:border-selver-red hover:text-selver-red sm:inline-flex"
            >
              selver.ee
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-6">
          {stage === "hero" && (
            <section className="relative grid min-h-[78vh] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative z-10 space-y-7">
                <SelverLogoLink className="w-[120px] sm:w-[150px]" priority />
                <div className="space-y-2">
                  <p className="font-display text-5xl font-extrabold uppercase tracking-tight text-selver-red sm:text-7xl">
                    Selver
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-selver-navy">
                    Hea mõte
                  </p>
                </div>
                <h1 className="max-w-xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-selver-navy sm:text-5xl">
                  Tudengirežiim
                </h1>
                <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Ütle eelarve — saad nädala menüü, kampaaniakorvi ja
                  jääkide-abilise. Vähem raiskamist, rohkem täis kõhtu.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={activate}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-selver-red px-7 text-base font-medium text-white transition hover:bg-[#c50510]"
                  >
                    Lülita sisse
                    <ArrowRight className="size-4" />
                  </button>
                  <p className="text-sm text-muted-foreground">
                    Häkatoni prototüüp · ilma kontota
                  </p>
                </div>
              </div>

              <div className="relative produce-grid min-h-[340px] overflow-hidden rounded-[2rem] bg-selver-navy text-white shadow-[0_30px_80px_-40px_rgba(0,32,91,0.85)] sm:min-h-[420px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,#ffd10055,transparent_42%),radial-gradient(circle_at_85%_75%,#e3061344,transparent_40%)]" />
                <motion.div
                  className="absolute left-[8%] top-[18%] rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-selver-yellow">
                    Nädal 1
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">35 € eelarve</p>
                </motion.div>
                <motion.div
                  className="absolute bottom-[16%] right-[10%] max-w-[220px] rounded-3xl bg-selver-yellow px-5 py-4 text-selver-navy shadow-lg"
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                >
                  <p className="font-display text-lg font-bold">14 söögikorda</p>
                  <p className="mt-1 text-sm opacity-80">
                    AI paneb sama sibula mitmesse retsepti
                  </p>
                </motion.div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-selver-navy to-transparent" />
              </div>
            </section>
          )}

          {stage === "setup" && (
            <section className="mx-auto w-full max-w-2xl space-y-8 py-6 animate-enter">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Seadista oma nädal
                </h2>
                <p className="text-muted-foreground">
                  Kolm liugurit, üks stiil — menüü valmib sekundiga.
                </p>
              </div>

              <div className="space-y-6 rounded-[1.75rem] border border-border/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4 text-leaf" />
                      Nädala eelarve
                    </label>
                    <span className="font-display text-2xl font-bold text-grove">
                      {budget} €
                    </span>
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
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Timer className="size-4 text-leaf" />
                      Päevi planeerida
                    </label>
                    <span className="font-display text-2xl font-bold text-grove">
                      {days}
                    </span>
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
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-selver-red px-8 text-base font-medium text-white transition hover:bg-[#c50510] disabled:opacity-50 sm:w-auto"
              >
                <Sparkles className="size-4" />
                {pending ? "Planeerin…" : "Loo menüü ja korv"}
              </button>
            </section>
          )}

          {stage === "plan" && plan && (
            <section className="space-y-6 py-4 animate-enter">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Sinu nädal on valmis
                  </h2>
                  <p className="mt-1 max-w-xl text-muted-foreground">
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

              <div className="grid gap-3 sm:grid-cols-3">
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
          <div className="grid gap-3 md:grid-cols-3">
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
