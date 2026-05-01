import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_BASE = "https://api-m.paypal.com"; // LIVE

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAccessToken(clientId: string, secret: string): Promise<string> {
  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function sendOrderEmails(supabase: any, orderId: string, captureId: string) {
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.email_sent) return;

  const items = Array.isArray(order.items)
    ? (order.items as Array<{ name: string; priceUSD: number; quantity: number }>).map((i) => ({
        name: i.name, qty: i.quantity, price: i.priceUSD,
      }))
    : [];

  const baseData = {
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    address: order.customer_address,
    shipping: order.shipping_summary,
    shippingCourier: order.shipping_courier,
    shippingIsOther: order.shipping_courier === "Otro",
    shippingOther: order.shipping_other ?? undefined,
    reference: `PayPal: ${captureId}`,
    items,
    total: `$${Number(order.total_amount).toFixed(2)} (PayPal)`,
    paymentMethod: "PayPal",
  };

  let logisticsOk = false;
  let customerOk = false;

  try {
    const { error } = await supabase.functions.invoke("send-aromix-email", {
      body: { type: "checkout", replyTo: order.customer_email, to: "Aromix.pa@gmail.com", data: baseData },
    });
    if (error) console.error("Email logística error:", error); else logisticsOk = true;
  } catch (e) { console.error("Email logística exception:", e); }

  try {
    const { error } = await supabase.functions.invoke("send-aromix-email", {
      body: { type: "customer_checkout", to: order.customer_email, data: baseData },
    });
    if (error) console.error("Email cliente error:", error); else customerOk = true;
  } catch (e) { console.error("Email cliente exception:", e); }

  if (logisticsOk && customerOk) {
    await supabase.from("orders").update({ email_sent: true }).eq("id", orderId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
  const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return bad(500, "PayPal credentials not configured");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  let body: { paypalOrderId?: string; orderId?: string };
  try { body = await req.json(); } catch { return bad(400, "Invalid JSON"); }
  if (!body.paypalOrderId || !body.orderId) return bad(400, "Faltan paypalOrderId / orderId");

  try {
    const accessToken = await getAccessToken(PAYPAL_CLIENT_ID, PAYPAL_SECRET);

    const capRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${body.paypalOrderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const capData = await capRes.json();
    if (!capRes.ok) {
      console.error("Capture error:", capData);
      return bad(500, capData?.message || "Error capturando pago en PayPal");
    }

    const captureId = capData?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const status = capData?.status; // COMPLETED esperado

    if (status === "COMPLETED") {
      await supabase.from("orders").update({
        status: "paid",
        paypal_capture_id: captureId,
      }).eq("id", body.orderId);

      // Disparar correos (idempotente vs webhook por bandera email_sent)
      await sendOrderEmails(supabase, body.orderId, captureId ?? body.paypalOrderId);

      return new Response(JSON.stringify({ ok: true, status, captureId }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, status, captureId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PayPal capture exception:", err);
    return bad(500, err instanceof Error ? err.message : "Error inesperado");
  }
});
