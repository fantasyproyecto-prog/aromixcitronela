import Stripe from "https://esm.sh/stripe@17.5.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ItemIn {
  id: string;
  name: string;
  priceUSD: number;
  quantity: number;
  image?: string;
}

interface Body {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  shipping: {
    courier: string;
    summary: string;
    state?: string;
    office?: string;
    other?: { company: string; state: string; address: string } | null;
  };
  items: ItemIn[];
  successUrl: string;
  cancelUrl: string;
}

function bad(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad(405, "Method not allowed");

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  if (!STRIPE_SECRET_KEY) return bad(500, "STRIPE_SECRET_KEY not configured");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON");
  }

  // Validación básica
  if (!body?.customer?.name || !body?.customer?.email || !body?.customer?.phone || !body?.customer?.address) {
    return bad(400, "Datos del cliente incompletos");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return bad(400, "El carrito está vacío");
  }
  if (!body.shipping?.courier || !body.shipping?.summary) {
    return bad(400, "Datos de envío incompletos");
  }
  if (!body.successUrl || !body.cancelUrl) {
    return bad(400, "URLs de redirección requeridas");
  }
  for (const it of body.items) {
    if (!it.name || typeof it.priceUSD !== "number" || it.priceUSD <= 0 || !Number.isInteger(it.quantity) || it.quantity <= 0) {
      return bad(400, "Item inválido en el carrito");
    }
  }

  const totalAmount = body.items.reduce((s, i) => s + i.priceUSD * i.quantity, 0);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Crear orden 'pending'
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customer.name,
      customer_email: body.customer.email,
      customer_phone: body.customer.phone,
      customer_address: body.customer.address,
      items: body.items,
      total_amount: totalAmount,
      currency: "USD",
      payment_method: "stripe",
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
    console.error("Error creando orden:", orderErr);
    return bad(500, "No se pudo crear el pedido");
  }

  // 2. Crear sesión de Stripe Checkout
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: body.customer.email,
      line_items: body.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.priceUSD * 100),
          product_data: {
            name: i.name,
            ...(i.image ? { images: [i.image] } : {}),
          },
        },
      })),
      metadata: {
        order_id: order.id,
      },
      success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl,
    });

    // 3. Guardar session id
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe error:", err);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    const msg = err instanceof Error ? err.message : "Error en Stripe";
    return bad(500, msg);
  }
});
