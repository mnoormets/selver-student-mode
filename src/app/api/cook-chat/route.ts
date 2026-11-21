import { NextResponse } from "next/server";
import {
  answerCookChatTurn,
  cookChatCatalogPrompt,
  type CookPantry,
} from "@/features/student-mode/cookChat";

export const runtime = "nodejs";

type Body = {
  message?: string;
  pantry?: CookPantry;
  recipeId?: string | null;
};

/**
 * Cook-chat turn. Prefer live OpenAI when OPENAI_API_KEY is set; always fall
 * back to deterministic catalog maths (clearly marked as näidisvastus).
 * The API key never leaves the server.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  const pantryIn = body.pantry ?? {};
  const forceRecipeId = body.recipeId ?? null;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      const ai = await callOpenAi(apiKey, message, pantryIn, forceRecipeId);
      if (ai) {
        // Re-run pack maths so shopping list always matches catalog packs.
        const grounded = answerCookChatTurn(message, pantryIn, {
          demo: false,
          forceRecipeId: ai.recipeId ?? forceRecipeId,
        });
        return NextResponse.json({
          reply: grounded.readyToCook
            ? grounded.reply
            : `${ai.preamble ? `${ai.preamble} ` : ""}${grounded.reply}`,
          pantry: grounded.pantry,
          recipeId: grounded.recipeId,
          demo: false,
          readyToCook: grounded.readyToCook,
          shoppingEmpty: grounded.shoppingEmpty,
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
  return NextResponse.json(demo);
}

async function callOpenAi(
  apiKey: string,
  message: string,
  pantry: CookPantry,
  forceRecipeId: string | null,
): Promise<{ recipeId: string | null; preamble: string } | null> {
  const system = `${cookChatCatalogPrompt()}

Return JSON only: {"recipeId":"<id or null>","preamble":"<one short Estonian sentence>"}
Current pantry (productId → amount): ${JSON.stringify(pantry)}
Preferred recipeId if any: ${forceRecipeId ?? "null"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
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
  };
  return {
    recipeId: parsed.recipeId ?? forceRecipeId,
    preamble: parsed.preamble ?? "",
  };
}
