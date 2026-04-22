import Stripe from "https://esm.sh/stripe@17.5.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Webhook público — sin CORS ni JWT
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("Faltan secretos de Stripe");
    return new Response("Server misconfigured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Firma inválida:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  console.log("Evento Stripe:", event.type);

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.error("Sesión sin order_id en metadata");
        return new Response("ok", { status: 200 });
      }

      // Marcar como pagado
      const { data: order, error: updErr } = await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("id", orderId)
        .select("*")
        .single();

      if (updErr || !order) {
        console.error("Error actualizando orden:", updErr);
        return new Response("DB error", { status: 500 });
      }

      // Disparar email si no se ha enviado
      if (!order.email_sent) {
        try {
          const items = Array.isArray(order.items)
            ? (order.items as Array<{ name: string; priceUSD: number; quantity: number }>).map((i) => ({
                name: i.name,
                qty: i.quantity,
                price: i.priceUSD,
              }))
            : [];

          const { error: fnErr } = await supabase.functions.invoke("send-aromix-email", {
            body: {
              type: "checkout",
              replyTo: order.customer_email,
              data: {
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.customer_address,
                shipping: order.shipping_summary,
                shippingCourier: order.shipping_courier,
                shippingIsOther: order.shipping_courier === "Otro",
                shippingOther: order.shipping_other ?? undefined,
                reference: `Stripe: ${session.id}`,
                items,
                total: `$${Number(order.total_amount).toFixed(2)} (Tarjeta - Stripe)`,
                paymentMethod: "Tarjeta (Stripe)",
              },
            },
          });
          if (fnErr) {
            console.error("Error enviando email:", fnErr);
          } else {
            await supabase.from("orders").update({ email_sent: true }).eq("id", orderId);
          }
        } catch (e) {
          console.error("Excepción enviando email:", e);
        }
      }
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: event.type.endsWith("expired") ? "cancelled" : "failed" })
          .eq("id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error procesando webhook:", err);
    return new Response("Internal error", { status: 500 });
  }
});
