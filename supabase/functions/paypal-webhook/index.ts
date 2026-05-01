import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PAYPAL_BASE = "https://api-m.paypal.com"; // LIVE

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

async function sendOrderEmails(supabase: any, orderId: string, reference: string) {
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
    reference: `PayPal: ${reference}`,
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

// Webhook público — sin CORS ni JWT
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
  const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
  const PAYPAL_WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !PAYPAL_WEBHOOK_ID) {
    console.error("Faltan secretos PayPal");
    return new Response("Server misconfigured", { status: 500 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const rawBody = await req.text();
  let event: any;
  try { event = JSON.parse(rawBody); } catch { return new Response("Invalid JSON", { status: 400 }); }

  // Verificar firma con PayPal
  try {
    const accessToken = await getAccessToken(PAYPAL_CLIENT_ID, PAYPAL_SECRET);
    const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: req.headers.get("paypal-auth-algo"),
        cert_url: req.headers.get("paypal-cert-url"),
        transmission_id: req.headers.get("paypal-transmission-id"),
        transmission_sig: req.headers.get("paypal-transmission-sig"),
        transmission_time: req.headers.get("paypal-transmission-time"),
        webhook_id: PAYPAL_WEBHOOK_ID,
        webhook_event: event,
      }),
    });
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      console.error("Firma PayPal inválida:", verifyData);
      return new Response("Invalid signature", { status: 400 });
    }
  } catch (e) {
    console.error("Error verificando firma:", e);
    return new Response("Verification error", { status: 500 });
  }

  console.log("Evento PayPal:", event.event_type);

  try {
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const captureId = resource?.id;
      // custom_id viene del purchase_unit
      const orderId = resource?.custom_id
        || resource?.supplementary_data?.related_ids?.order_id
        || null;

      let targetOrderId = orderId;
      if (!targetOrderId && resource?.supplementary_data?.related_ids?.order_id) {
        // Buscar por paypal_order_id
        const ppOrderId = resource.supplementary_data.related_ids.order_id;
        const { data } = await supabase.from("orders").select("id").eq("paypal_order_id", ppOrderId).single();
        targetOrderId = data?.id ?? null;
      }

      if (!targetOrderId) {
        console.error("No se pudo determinar order_id en webhook");
        return new Response("ok", { status: 200 });
      }

      await supabase.from("orders").update({
        status: "paid",
        paypal_capture_id: captureId,
      }).eq("id", targetOrderId);

      await sendOrderEmails(supabase, targetOrderId, captureId);
    } else if (
      event.event_type === "PAYMENT.CAPTURE.DENIED" ||
      event.event_type === "PAYMENT.CAPTURE.DECLINED"
    ) {
      const resource = event.resource;
      const orderId = resource?.custom_id;
      if (orderId) {
        await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error procesando webhook PayPal:", err);
    return new Response("Internal error", { status: 500 });
  }
});
