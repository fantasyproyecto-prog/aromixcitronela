import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_BASE = "https://api-m.paypal.com"; // LIVE

interface ItemIn { id: string; name?: string; priceUSD?: number; quantity: number; image?: string; }

// Authoritative server-side catalog. Client-supplied prices/names are ignored.
const CATALOG: Record<string, { name: string; priceUSD: number }> = {
  "dispensador": { name: "Dispensador Aromix", priceUSD: 22.0 },
  "refill": { name: "Refill Aromix", priceUSD: 23.5 },
  "combo-1": { name: "Combo 1 (Dispensador + Refill)", priceUSD: 44.0 },
  "combo-4": { name: "Combo 4 Refills", priceUSD: 168.0 },
  "combo-6": { name: "Combo 6 Refills", priceUSD: 234.0 },
};
interface Body {
  customer: { name: string; email: string; phone: string; address: string };
  shipping: { courier: string; summary: string; state?: string; office?: string; other?: { company: string; state: string; address: string } | null };
  items: ItemIn[];
}

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAccessToken(clientId: string, secret: string): Promise<string> {
  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
  const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) return bad(500, "PayPal credentials not configured");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: Body;
  try { body = await req.json(); } catch { return bad(400, "Invalid JSON"); }

  if (!body?.customer?.name || !body?.customer?.email || !body?.customer?.phone || !body?.customer?.address) {
    return bad(400, "Datos del cliente incompletos");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) return bad(400, "El carrito está vacío");
  if (!body.shipping?.courier || !body.shipping?.summary) return bad(400, "Datos de envío incompletos");
  const trustedItems: Array<{ id: string; name: string; priceUSD: number; quantity: number; image?: string }> = [];
  for (const it of body.items) {
    if (!it?.id || typeof it.id !== "string" || !Number.isInteger(it.quantity) || it.quantity <= 0 || it.quantity > 100) {
      return bad(400, "Item inválido en el carrito");
    }
    const entry = CATALOG[it.id];
    if (!entry) return bad(400, `Producto desconocido: ${it.id}`);
    trustedItems.push({
      id: it.id,
      name: entry.name,
      priceUSD: entry.priceUSD,
      quantity: it.quantity,
      image: typeof it.image === "string" ? it.image : undefined,
    });
  }

  const totalAmount = trustedItems.reduce((s, i) => s + i.priceUSD * i.quantity, 0);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customer.name,
      customer_email: body.customer.email,
      customer_phone: body.customer.phone,
      customer_address: body.customer.address,
      items: trustedItems,
      total_amount: totalAmount,
      currency: "USD",
      payment_method: "paypal",
      shipping_courier: body.shipping.courier,
      shipping_state: body.shipping.state ?? null,
      shipping_office: body.shipping.office ?? null,
      shipping_other: body.shipping.other ?? null,
      shipping_summary: body.shipping.summary,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("Error creando orden PayPal:", orderErr);
    return bad(500, "No se pudo crear el pedido");
  }

  try {
    const accessToken = await getAccessToken(PAYPAL_CLIENT_ID, PAYPAL_SECRET);

    const itemsTotal = body.items.reduce((s, i) => s + i.priceUSD * i.quantity, 0);

    const ppRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: order.id,
          custom_id: order.id,
          description: `Pedido Aromix Citronela #${order.id.slice(0, 8)}`,
          amount: {
            currency_code: "USD",
            value: itemsTotal.toFixed(2),
            breakdown: {
              item_total: { currency_code: "USD", value: itemsTotal.toFixed(2) },
            },
          },
          items: body.items.map((i) => ({
            name: i.name.slice(0, 127),
            quantity: String(i.quantity),
            unit_amount: { currency_code: "USD", value: i.priceUSD.toFixed(2) },
            category: "PHYSICAL_GOODS",
          })),
        }],
        application_context: {
          brand_name: "Aromix Citronela",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    });

    const ppData = await ppRes.json();
    if (!ppRes.ok) {
      console.error("PayPal create order error:", ppData);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return bad(500, ppData?.message || "Error creando orden en PayPal");
    }

    await supabase.from("orders").update({ paypal_order_id: ppData.id }).eq("id", order.id);

    return new Response(JSON.stringify({ paypalOrderId: ppData.id, orderId: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PayPal error:", err);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return bad(500, err instanceof Error ? err.message : "Error en PayPal");
  }
});
