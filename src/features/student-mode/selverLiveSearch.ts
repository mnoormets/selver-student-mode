/**
 * Lightweight Selver product search for the Student Mode demo.
 * Inspired by martparve/selver-mcp (Klevu public client key used by selver.ee).
 * Demo-only: one-shot search with short timeout + catalog fallback.
 */

import type { CookChatTurnResult } from "./cookChat";
import { formatEurosFromCents } from "./computeBasket";
import { productById } from "./data/products";

/** Public client-side key from Selver.ee's own search box (same as selver-mcp). */
const KLEVU_API_KEY = "klevu-14410928010151845";
const KLEVU_SEARCH_URL = "https://eucs3v2.ksearchnet.com/cs/v2/search";

export type LiveSelverHit = {
  name: string;
  priceLabel: string;
  url: string;
  sku?: string;
  packHint?: string;
  source: "live" | "catalog";
  query: string;
};

type KlevuRecord = {
  sku?: string;
  name?: string;
  salePrice?: string;
  price?: string;
  url?: string;
  inStock?: string;
};

const QUERY_BY_PRODUCT: Record<string, string> = {
  "mixed-veg": "ameerika köögiviljasegu",
  eggs: "munad M10",
  spaghetti: "spagetid",
  chicken: "broileririnnafilee",
  "minced-meat": "kodune hakkliha",
};

export function searchQueryForProduct(productId: string): string {
  return QUERY_BY_PRODUCT[productId] ?? productId;
}

async function klevuSearch(
  term: string,
  limit = 5,
  timeoutMs = 2500,
): Promise<KlevuRecord[]> {
  const body = {
    context: { apiKeys: [KLEVU_API_KEY] },
    recordQueries: [
      {
        id: "q",
        typeOfRequest: "SEARCH",
        settings: {
          query: { term },
          limit,
          offset: 0,
          sort: "RELEVANCE",
          typeOfRecords: ["KLEVU_PRODUCT"],
          fields: ["sku", "name", "salePrice", "price", "inStock", "url"],
        },
      },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(KLEVU_SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Klevu HTTP ${res.status}`);
    const data = (await res.json()) as {
      queryResults?: { records?: KlevuRecord[] }[];
    };
    return data.queryResults?.[0]?.records ?? [];
  } finally {
    clearTimeout(timer);
  }
}

function catalogFallback(productId: string, query: string): LiveSelverHit {
  const p = productById(productId);
  return {
    name: p.name,
    priceLabel: formatEurosFromCents(p.priceCents),
    url: p.eSelverUrl ?? p.sourceUrl,
    sku: p.selverSku,
    packHint: `${p.packQuantity} ${p.unit}`,
    source: "catalog",
    query,
  };
}

/**
 * Search Selver (Klevu) for a demo product id. Falls back to products.ts.
 */
export async function searchSelverForProduct(
  productId: string,
): Promise<LiveSelverHit> {
  const query = searchQueryForProduct(productId);
  try {
    const records = await klevuSearch(query, 5, 2500);
    const hit =
      records.find((r) => (r.inStock ?? "yes") !== "no") ?? records[0];
    if (!hit?.name) return catalogFallback(productId, query);

    const priceRaw = hit.salePrice || hit.price;
    const priceNum = priceRaw ? Number(priceRaw) : NaN;
    const priceLabel = Number.isFinite(priceNum)
      ? `${priceNum.toFixed(2)} €`
      : catalogFallback(productId, query).priceLabel;

    const packMatch = hit.name.match(/(\d[\d\s]*(?:g|kg|ml|l|tk))/i);
    return {
      name: hit.name,
      priceLabel,
      url:
        hit.url ||
        `https://www.selver.ee/otsing?q=${encodeURIComponent(query)}`,
      sku: hit.sku,
      packHint: packMatch?.[1]?.replace(/\s+/g, " "),
      source: "live",
      query,
    };
  } catch {
    return catalogFallback(productId, query);
  }
}

export function formatLiveHitLine(hit: LiveSelverHit): string {
  const pack = hit.packHint ? ` · ${hit.packHint}` : "";
  const sku = hit.sku ? ` · ${hit.sku}` : "";
  const tag = hit.source === "live" ? "Live Selver" : "Kataloog (fallback)";
  return `• ${hit.name}${pack} — ${hit.priceLabel}${sku}\n  ${tag}: ${hit.url}`;
}

/**
 * Demo enrich: when the basket still needs mixed-veg (spagett+muna case),
 * run one Selver search and append pack / price / source to the reply.
 */
export async function enrichCookChatWithLiveSelver(
  result: CookChatTurnResult,
): Promise<CookChatTurnResult & { liveHits?: LiveSelverHit[] }> {
  const missing = result.missingProductIds ?? [];
  if (result.readyToCook || missing.length === 0) return result;

  // Pitch path: always live-search köögiviljasegu when it's missing.
  // Otherwise enrich at most the first missing line.
  const targets = missing.includes("mixed-veg")
    ? (["mixed-veg"] as const)
    : ([missing[0]!] as string[]);

  const liveHits = await Promise.all(
    targets.map((id) => searchSelverForProduct(id)),
  );

  const block = [
    "",
    "Selveri otsing (puudu olev toode):",
    ...liveHits.map(formatLiveHitLine),
  ].join("\n");

  return {
    ...result,
    reply: `${result.reply}\n${block}`,
    liveHits,
  };
}
