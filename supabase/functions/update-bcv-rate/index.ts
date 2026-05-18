import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const BCV_CODE = "BCV_USD";
const FALLBACK_RATE = 517.96;
const FETCH_TIMEOUT_MS = 8_000;

interface RateResult {
  rate: number;
  source: string;
  raw: unknown;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchWithTimeout(url: string, accept: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; AromixBCVRateUpdater/1.0)",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${url} respondió ${res.status}: ${text.slice(0, 180)}`);
    }

    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const res = await fetchWithTimeout(url, "application/json, text/plain, */*");
  return await res.json();
}

async function fetchTextWithTimeout(url: string): Promise<string> {
  const res = await fetchWithTimeout(url, "text/html, text/plain, */*");
  return await res.text();
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/\s/g, "").replace(/[^0-9.,-]/g, "");
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    const normalized = lastComma > -1 && lastDot > -1
      ? lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "")
      : cleaned.replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function parseBCVOfficialText(rawText: string, sourceUrl: string): RateResult {
  const patterns = [
    /id=["']dolar["'][\s\S]{0,1400}?<strong[^>]*>\s*([0-9]+(?:[.,][0-9]+)+)\s*<\/strong>/i,
    /USD\s*(?:\*\*)?\s*([0-9]+(?:[.,][0-9]+)+)/i,
    /USD[\s\S]{0,600}?([0-9]+,[0-9]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match = rawText.match(pattern);
    const rate = toPositiveNumber(match?.[1]);
    if (rate) {
      const date = rawText.match(/Fecha Valor:\s*([^\n<]+)/i)?.[1]?.trim()
        ?? rawText.match(/content=["'](\d{4}-\d{2}-\d{2})T/i)?.[1]
        ?? null;

      return {
        rate,
        source: "bcv.org.ve",
        raw: { provider: sourceUrl, value: match?.[1], date },
      };
    }
  }

  throw new Error("BCV oficial no entregó una tasa USD válida");
}

async function fetchBCVRate(): Promise<RateResult> {
  const providers: Array<() => Promise<RateResult>> = [
    async () => {
      const url = "https://r.jina.ai/http://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc";
      const rawText = await fetchTextWithTimeout(url);
      return parseBCVOfficialText(rawText, url);
    },
    async () => {
      const url = "https://r.jina.ai/http://www.bcv.org.ve/";
      const rawText = await fetchTextWithTimeout(url);
      return parseBCVOfficialText(rawText, url);
    },
    async () => {
      const raw = await fetchJsonWithTimeout("https://ve.dolarapi.com/v1/dolares/oficial");
      const data = raw as { promedio?: unknown; precio?: unknown };
      const rate = toPositiveNumber(data.promedio ?? data.precio);
      if (!rate) throw new Error("dolarapi no entregó una tasa BCV válida");
      return { rate, source: "ve.dolarapi.com", raw };
    },
    async () => {
      const raw = await fetchJsonWithTimeout("https://bcv-api.rafnixg.dev/rates/");
      const data = raw as { dollar?: unknown; usd?: unknown };
      const rate = toPositiveNumber(data.dollar ?? data.usd);
      if (!rate) throw new Error("rafnixg no entregó una tasa BCV válida");
      return { rate, source: "bcv-api.rafnixg.dev", raw };
    },
  ];

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await provider();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      console.warn("[update-bcv-rate] provider failed", message);
    }
  }

  throw new Error(errors.join(" | ") || "No se pudo obtener la tasa BCV");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json(405, { error: "Method not allowed" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Backend credentials not configured" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const result = await fetchBCVRate();

    const { error } = await supabase.from("exchange_rates").upsert({
      code: BCV_CODE,
      rate: result.rate,
      source: result.source,
      fetched_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      last_error: null,
      error_count: 0,
      raw: result.raw,
    });

    if (error) throw error;

    return json(200, {
      ok: true,
      rate: result.rate,
      source: result.source,
      updated: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[update-bcv-rate] failed; preserving previous rate", message);

    const { data: previous } = await supabase
      .from("exchange_rates")
      .select("rate,error_count")
      .eq("code", BCV_CODE)
      .maybeSingle();

    await supabase.from("exchange_rates").upsert({
      code: BCV_CODE,
      rate: previous?.rate ?? FALLBACK_RATE,
      source: previous ? "previous" : "fallback",
      fetched_at: new Date().toISOString(),
      last_error: message.slice(0, 500),
      error_count: (previous?.error_count ?? 0) + 1,
    });

    return json(200, {
      ok: false,
      preservedPreviousRate: true,
      rate: previous?.rate ?? FALLBACK_RATE,
      error: message,
    });
  }
});
