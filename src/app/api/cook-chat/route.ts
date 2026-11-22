import { NextResponse } from "next/server";
import type { BudgetMealContext } from "@/features/student-mode/budgetMeal";
import { answerBudgetPastaQuestion } from "@/features/student-mode/budgetPasta";
import { answerCheeseNoodlesQuestion } from "@/features/student-mode/cheeseNoodles";
import {
  answerCookChatTurn,
  cookChatCatalogPrompt,
  type CookPantry,
} from "@/features/student-mode/cookChat";
import { enrichCookChatWithLiveSelver } from "@/features/student-mode/selverLiveSearch";
import { answerWeeklyMealQuestion } from "@/features/student-mode/weeklyMeals";

export const runtime = "nodejs";

const OPENAI_TIMEOUT_MS = 5_000;

type Body = {
  message: string;
  pantry?: CookPantry;
  recipeId?: string | null;
  budgetMeal?: BudgetMealContext | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCookChatBody(value: unknown): value is Body {
  if (!isRecord(value)) return false;
  const { message, pantry, recipeId, budgetMeal } = value;

  const validBudgetMeal =
    budgetMeal == null ||
    (isRecord(budgetMeal) &&
      (budgetMeal.budgetCents === null ||
        (typeof budgetMeal.budgetCents === "number" &&
          Number.isSafeInteger(budgetMeal.budgetCents) &&
          budgetMeal.budgetCents >= 0 &&
          budgetMeal.budgetCents <= 99_999_999)) &&
      (budgetMeal.dish === "cheese-noodles" ||
        (budgetMeal.dish === "weekly-meals" &&
          (budgetMeal.scope === null ||
            budgetMeal.scope === "all-meals" ||
            budgetMeal.scope === "dinners"))));

  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    (recipeId == null || typeof recipeId === "string") &&
    validBudgetMeal &&
    (pantry === undefined ||
      (isRecord(pantry) &&
        Object.values(pantry).every(
          (amount) =>
            typeof amount === "number" &&
            Number.isFinite(amount) &&
            amount >= 0,
        )))
  );
}

function budgetPastaResponse(
  result: { reply: string; readyToCook: boolean },
  pantry: CookPantry,
) {
  return NextResponse.json({
    ...result,
    pantry,
    recipeId: null,
    demo: true,
    shoppingEmpty: result.readyToCook,
  });
}

/**
 * Cook-chat turn. Prefer live OpenAI when OPENAI_API_KEY is set; always fall
 * back to a local recipe recommendation and example basket prices.
 * Budget / pantry / weekly intents from mnoormets; missing lines can be
 * enriched with live Selver search + catalog fallback.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isCookChatBody(body)) {
    return NextResponse.json({ error: "Invalid cook-chat input" }, { status: 400 });
  }

  const message = body.message.trim();
  const pantryIn = body.pantry ?? {};
  const forceRecipeId = body.recipeId ?? null;

  const weeklyReply = answerWeeklyMealQuestion(message, pantryIn, body.budgetMeal);
  if (weeklyReply) return NextResponse.json(weeklyReply);

  const budgetReply = answerBudgetPastaQuestion(message, pantryIn);
  if (budgetReply) return budgetPastaResponse(budgetReply, pantryIn);

  const noodleReply = answerCheeseNoodlesQuestion(message, pantryIn, body.budgetMeal);
  if (noodleReply) return NextResponse.json(noodleReply);

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      const ai = await callOpenAi(apiKey, message, pantryIn, forceRecipeId);
      if (ai) {
        if (ai.intent === "budget-minced-pasta-salad") {
          const reply = answerBudgetPastaQuestion(message, pantryIn, true);
          if (reply) return budgetPastaResponse(reply, pantryIn);
        }
        // Re-run pack maths so shopping list always matches catalog packs.
        const grounded = answerCookChatTurn(message, pantryIn, {
          demo: false,
          forceRecipeId: ai.recipeId ?? forceRecipeId,
        });
        const enriched = await enrichCookChatWithLiveSelver(grounded);
        return NextResponse.json({
          reply: enriched.readyToCook
            ? enriched.reply
            : `${ai.preamble ? `${ai.preamble} ` : ""}${enriched.reply}`,
          pantry: enriched.pantry,
          recipeId: enriched.recipeId,
          demo: false,
          readyToCook: enriched.readyToCook,
          shoppingEmpty: enriched.shoppingEmpty,
          liveHits: enriched.liveHits ?? [],
        });
      }
    } catch {
      // fall through to demo
    }
  }

  const demo = answerCookChatTurn(message, pantryIn, {
    demo: true,
    forceRecipeId,
  });
  const enriched = await enrichCookChatWithLiveSelver(demo);
  return NextResponse.json(enriched);
}

async function callOpenAi(
  apiKey: string,
  message: string,
  pantry: CookPantry,
  forceRecipeId: string | null,
): Promise<{
  recipeId: string | null;
  preamble: string;
  intent: string | null;
} | null> {
  const system = `${cookChatCatalogPrompt()}

Return JSON only with recipeId, preamble and intent.
If the user wants a single meal of minced-meat pasta with a side salad under a stated budget,
set intent to "budget-minced-pasta-salad" and recipeId to null. For other requests use null intent
and a catalog recipeId or null. Preamble is a short Estonian sentence without prices or quantities.
Current pantry (productId → amount): ${JSON.stringify(pantry)}
Preferred recipeId if any: ${forceRecipeId ?? "null"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COOK_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  const parsed = JSON.parse(raw) as {
    recipeId?: string | null;
    preamble?: string;
    intent?: string | null;
  };
  return {
    recipeId: parsed.recipeId ?? forceRecipeId,
    preamble: parsed.preamble ?? "",
    intent: parsed.intent ?? null,
  };
}
