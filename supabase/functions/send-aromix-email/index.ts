const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Aromix Citronela <pedidos@aromixcitronela.com>";
const DEFAULT_TO = "Aromix.pa@gmail.com";

const ALLOWED_ORIGINS = new Set([
  "https://aromixcitronela.lovable.app",
  "https://id-preview--2b6486c0-8c37-4f47-a9e7-67f09f28ab53.lovable.app",
]);
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+--2b6486c0-8c37-4f47-a9e7-67f09f28ab53\.lovable\.app$/i.test(origin)
    ? origin
    : "https://aromixcitronela.lovable.app";
  return { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigin, "Vary": "Origin" };
};
const isInternalRequest = (req: Request) => {
  const expected = Deno.env.get("EMAIL_FUNCTION_TOKEN") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return Boolean(expected && req.headers.get("x-internal-email-token") === expected);
};
const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const isEmail = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
const cleanText = (value: unknown, max = 500) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
const sanitizeItems = (items: unknown) => Array.isArray(items)
  ? items.slice(0, 20).map((i: any) => ({ name: cleanText(i?.name, 160), qty: Math.max(1, Math.min(99, Number(i?.qty || 1))), price: Math.max(0, Math.min(100000, Number(i?.price || 0))) }))
  : [];
const sanitizeData = (type: string, data: Record<string, any>) => ({
  ...data,
  name: cleanText(data.name, 120),
  email: cleanText(data.email, 255),
  phone: cleanText(data.phone, 40),
  address: cleanText(data.address, 1000),
  cedula: cleanText(data.cedula, 20),
  shipping: cleanText(data.shipping, 1200),
  shippingCourier: cleanText(data.shippingCourier, 80),
  reference: cleanText(data.reference, 120),
  bank: cleanText(data.bank, 80),
  paymentDate: cleanText(data.paymentDate, 30),
  total: cleanText(data.total, 80),
  paymentMethod: cleanText(data.paymentMethod, 80),
  formOrigin: cleanText(data.formOrigin, 80),
  fields: Array.isArray(data.fields) ? data.fields.slice(0, 12).map((f: any) => ({ label: cleanText(f?.label, 80), value: cleanText(f?.value, 1000) })) : undefined,
  items: sanitizeItems(data.items),
});
const publicSafeTypes = new Set(["checkout", "customer_pago_movil", "wholesale_lead"]);
function authorizeEmailRequest(req: Request, payload: any) {
  if (isInternalRequest(req)) return { ok: true, headers: getCorsHeaders(req), internal: true };
  const origin = req.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGINS.has(origin) && !/^https:\/\/[a-z0-9-]+--2b6486c0-8c37-4f47-a9e7-67f09f28ab53\.lovable\.app$/i.test(origin)) {
    return { ok: false, status: 403, error: "Origen no autorizado", headers: getCorsHeaders(req), internal: false };
  }
  if (!publicSafeTypes.has(payload?.type)) {
    return { ok: false, status: 403, error: "Tipo no autorizado", headers: getCorsHeaders(req), internal: false };
  }
  if (payload?.to && payload.type !== "customer_pago_movil") {
    return { ok: false, status: 403, error: "Destinatario no autorizado", headers: getCorsHeaders(req), internal: false };
  }
  if (payload?.type === "customer_pago_movil" && normalizeEmail(payload?.to) !== normalizeEmail(payload?.data?.email || payload?.to)) {
    return { ok: false, status: 403, error: "Destinatario no autorizado", headers: getCorsHeaders(req), internal: false };
  }
  return { ok: true, headers: getCorsHeaders(req), internal: false };
}

const BRAND_GREEN = "#7AB317";
const BRAND_DARK = "#2D4A0F";

const layout = (title: string, body: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d3a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(45,74,15,0.08);">
        <tr><td style="background:linear-gradient(135deg,${BRAND_GREEN} 0%,${BRAND_DARK} 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Aromix Citronela</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${title}</p>
        </td></tr>
        <tr><td style="padding:40px;">${body}</td></tr>
        <tr><td style="background:#f4f6f0;padding:24px 40px;text-align:center;border-top:1px solid #e5e9dd;">
          <p style="margin:0;color:#6b7758;font-size:12px;">© ${new Date().getFullYear()} Aromix Citronela · Notificación automática</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const row = (label: string, value: string) => `
  <tr><td style="padding:12px 0;border-bottom:1px solid #eef1e6;">
    <div style="color:#6b7758;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
    <div style="color:#2d3a1a;font-size:15px;font-weight:500;">${value || "—"}</div>
  </td></tr>`;

const escapeHtml = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function buildHtml(type: string, data: Record<string, any>): { subject: string; html: string } {
  const e = (k: string) => escapeHtml(data[k] ?? "");

  if (type === "checkout") {
    const itemsHtml = Array.isArray(data.items)
      ? data.items.map((i: any) =>
          `<tr><td style="padding:8px 0;color:#2d3a1a;font-size:14px;">${escapeHtml(i.name)} × ${i.qty}</td><td align="right" style="padding:8px 0;color:#2d3a1a;font-size:14px;font-weight:600;">$${Number(i.price * i.qty).toFixed(2)}</td></tr>`
        ).join("")
      : "";
    const receipt = data.receiptUrl
      ? `<div style="margin-top:24px;"><div style="color:#6b7758;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Comprobante de Pago Móvil</div><a href="${e("receiptUrl")}" target="_blank"><img src="${e("receiptUrl")}" alt="Comprobante" style="max-width:100%;border-radius:8px;border:1px solid #e5e9dd;"/></a><p style="margin:8px 0 0;font-size:12px;"><a href="${e("receiptUrl")}" style="color:${BRAND_GREEN};">Abrir imagen original</a></p></div>`
      : "";
    const isOther = data.shippingIsOther === true;
    const shippingLabel = isOther ? "⚠️ Envío personalizado (Otro)" : `Envío por ${escapeHtml(data.shippingCourier ?? "Courier")}`;
    const shippingValueHtml = isOther
      ? `<strong style="color:${BRAND_DARK};font-size:16px;">Envío por: ${escapeHtml(data.shippingOther?.company ?? "")} - Estado: ${escapeHtml(data.shippingOther?.state ?? "")} - Dirección: ${escapeHtml(data.shippingOther?.address ?? "")}</strong>`
      : escapeHtml(data.shipping ?? "");
    const shippingRow = `
      <tr><td style="padding:12px 0;border-bottom:1px solid #eef1e6;${isOther ? `background:#fffbeb;border-left:4px solid #f59e0b;padding-left:12px;` : ""}">
        <div style="color:#6b7758;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${shippingLabel}</div>
        <div style="color:#2d3a1a;font-size:15px;font-weight:500;">${shippingValueHtml || "—"}</div>
      </td></tr>`;
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">Nuevo pedido recibido</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Un cliente acaba de completar una compra en la tienda.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Cliente", e("name"))}
        ${row("Cédula", e("cedula"))}
        ${row("Email", e("email"))}
        ${row("Teléfono", e("phone"))}
        ${row("Dirección", e("address"))}
        ${shippingRow}
      </table>
      <h3 style="margin:32px 0 12px;color:${BRAND_DARK};font-size:16px;">💳 Datos del Pago Móvil</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7e6;border-radius:8px;padding:8px 16px;">
        ${row("Banco emisor", e("bank"))}
        ${row("Referencia", e("reference"))}
        ${row("Fecha del pago", e("paymentDate"))}
      </table>
      <h3 style="margin:32px 0 12px;color:${BRAND_DARK};font-size:16px;">Detalle del pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef1e6;border-bottom:2px solid ${BRAND_GREEN};">
        ${itemsHtml}
        <tr><td style="padding:16px 0 4px;color:${BRAND_DARK};font-size:16px;font-weight:700;">TOTAL</td><td align="right" style="padding:16px 0 4px;color:${BRAND_GREEN};font-size:20px;font-weight:700;">${e("total")}</td></tr>
      </table>
      ${receipt}`;
    return { subject: `🛒 Nuevo pedido Pago Móvil — ${data.name}${isOther ? " (Envío Otro ⚠️)" : ""}`, html: layout("Nuevo Pedido — Pago Móvil", body) };
  }

  if (type === "customer_pago_movil") {
    const itemsHtml = Array.isArray(data.items)
      ? data.items.map((i: any) =>
          `<tr><td style="padding:8px 0;color:#2d3a1a;font-size:14px;">${escapeHtml(i.name)} × ${i.qty}</td><td align="right" style="padding:8px 0;color:#2d3a1a;font-size:14px;font-weight:600;">$${Number(i.price * i.qty).toFixed(2)}</td></tr>`
        ).join("")
      : "";
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">¡Gracias por tu pedido, ${e("name")}!</h2>
      <p style="margin:0 0 16px;color:#2d3a1a;font-size:15px;line-height:1.6;">
        Hemos recibido tu pedido y los datos de tu transferencia. <strong>Estamos validando el pago</strong> y uno de nuestros vendedores te contactará a la brevedad posible para coordinar la entrega.
      </p>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin:16px 0 24px;">
        <p style="margin:0;color:#92400e;font-size:13px;">⏳ Tu pedido está <strong>pendiente de validación</strong>. Te avisaremos en cuanto confirmemos el pago en el banco.</p>
      </div>
      <h3 style="margin:24px 0 12px;color:${BRAND_DARK};font-size:16px;">Datos del pago reportado</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Banco emisor", e("bank"))}
        ${row("Referencia", e("reference"))}
        ${row("Fecha del pago", e("paymentDate"))}
      </table>
      <h3 style="margin:32px 0 12px;color:${BRAND_DARK};font-size:16px;">Resumen del pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Envío", e("shipping"))}
        ${row("Dirección", e("address"))}
        ${row("Cédula", e("cedula"))}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef1e6;border-bottom:2px solid ${BRAND_GREEN};margin-top:12px;">
        ${itemsHtml}
        <tr><td style="padding:16px 0 4px;color:${BRAND_DARK};font-size:16px;font-weight:700;">TOTAL</td><td align="right" style="padding:16px 0 4px;color:${BRAND_GREEN};font-size:20px;font-weight:700;">${e("total")}</td></tr>
      </table>
      <p style="margin:24px 0 0;color:#6b7758;font-size:13px;">Si tienes alguna duda, responde a este correo.</p>`;
    return { subject: `✅ Recibimos tu pedido — Validando pago`, html: layout("Pedido Recibido", body) };
  }

  if (type === "wholesale_lead") {
    const fieldsHtml = Array.isArray(data.fields)
      ? data.fields.map((field: any) => row(escapeHtml(field?.label ?? "Campo"), escapeHtml(field?.value ?? ""))).join("")
      : "";
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">Nueva solicitud desde Ventas al Mayor</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Se recibió un nuevo formulario de contacto comercial.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Origen del Formulario", e("formOrigin"))}
        ${fieldsHtml}
      </table>`;
    return { subject: `📨 ${data.formOrigin ?? "Nueva solicitud comercial"} — Aromix Citronela`, html: layout("Solicitud Comercial", body) };
  }

  if (type === "emprendedor") {
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">Solicitud de Emprendimiento</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Una persona quiere emprender con Aromix.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Nombre", e("name"))}
        ${row("Email", e("email"))}
        ${row("Teléfono", e("phone"))}
        ${row("Dirección", e("address"))}
        ${row("Zona", e("zone"))}
        ${row("Inversión estimada", `${e("investment")} USD`)}
      </table>`;
    return { subject: `🌱 Nueva solicitud de Emprendedor — ${data.name}`, html: layout("Solicitud de Emprendedor", body) };
  }

  if (type === "distribuidor") {
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">Solicitud de Distribución Masiva</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Una empresa quiere distribuir Aromix.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Empresa", e("company"))}
        ${row("Contacto", e("name"))}
        ${row("RIF", e("rif"))}
        ${row("Email", e("email"))}
        ${row("Teléfono", e("phone"))}
        ${row("Dirección", e("address"))}
        ${row("Segmento", e("segment"))}
        ${row("Fuerza de ventas", `${e("salesforce")} vendedores`)}
        ${row("¿Producto similar?", e("similar"))}
        ${row("Detalle", e("detail"))}
      </table>`;
    return { subject: `🤝 Nueva solicitud de Distribuidor — ${data.company}`, html: layout("Solicitud de Distribuidor", body) };
  }

  if (type === "mayorista") {
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">Solicitud de Cotización al Mayor</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Un interesado quiere cotizar producto al mayor.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Nombre / Empresa", e("name"))}
        ${row("Email", e("email"))}
        ${row("Teléfono", e("phone"))}
        ${row("Ciudad / País", e("location"))}
        ${row("Presentación de interés", e("product"))}
        ${row("Cantidad estimada", e("quantity"))}
        ${row("Mensaje", e("message"))}
      </table>`;
    return { subject: `📦 Nueva cotización al Mayor — ${data.name}`, html: layout("Cotización al Mayor", body) };
  }

  if (type === "customer_checkout") {
    const itemsHtml = Array.isArray(data.items)
      ? data.items.map((i: any) =>
          `<tr><td style="padding:8px 0;color:#2d3a1a;font-size:14px;">${escapeHtml(i.name)} × ${i.qty}</td><td align="right" style="padding:8px 0;color:#2d3a1a;font-size:14px;font-weight:600;">$${Number(i.price * i.qty).toFixed(2)}</td></tr>`
        ).join("")
      : "";
    const body = `
      <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:22px;">¡Gracias por tu compra, ${e("name")}!</h2>
      <p style="margin:0 0 24px;color:#6b7758;font-size:14px;">Hemos recibido tu pedido con éxito. Aquí tienes el resumen:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Método de pago", e("paymentMethod"))}
        ${row("Envío", e("shipping"))}
        ${row("Dirección", e("address"))}
      </table>
      <h3 style="margin:32px 0 12px;color:${BRAND_DARK};font-size:16px;">Detalle del pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef1e6;border-bottom:2px solid ${BRAND_GREEN};">
        ${itemsHtml}
        <tr><td style="padding:16px 0 4px;color:${BRAND_DARK};font-size:16px;font-weight:700;">TOTAL</td><td align="right" style="padding:16px 0 4px;color:${BRAND_GREEN};font-size:20px;font-weight:700;">${e("total")}</td></tr>
      </table>
      <p style="margin:24px 0 0;color:#6b7758;font-size:14px;">Pronto coordinaremos el despacho contigo. Si tienes alguna duda, responde a este correo.</p>`;
    return { subject: `✅ Confirmación de tu pedido — Aromix Citronela`, html: layout("Confirmación de Pedido", body) };
  }

  throw new Error(`Tipo de correo desconocido: ${type}`);
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function deleteReceipt(path: string) {
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/payment-receipts/${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
    });
    if (!r.ok) console.error("Storage delete failed:", await r.text());
    else console.log("Receipt deleted:", path);
  } catch (e) {
    console.error("Delete error:", e);
  }
}

Deno.serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: dynamicCorsHeaders });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");

    const payload = await req.json();
    const authz = authorizeEmailRequest(req, payload);
    if (!authz.ok) {
      return new Response(JSON.stringify({ error: authz.error }), {
        status: authz.status ?? 403, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      });
    }
    const { type, replyTo, receiptPath, to } = payload;
    const data = sanitizeData(type, payload.data ?? {});
    if (!type || !data) {
      return new Response(JSON.stringify({ error: "type y data son requeridos" }), {
        status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si hay comprobante, descárgalo y adjúntalo (así no depende de la URL pública)
    let attachments: Array<{ filename: string; content: string }> | undefined;
    if (receiptPath) {
      try {
        const imgRes = await fetch(`${SUPABASE_URL}/storage/v1/object/payment-receipts/${receiptPath}`, {
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
        });
        if (imgRes.ok) {
          const buf = new Uint8Array(await imgRes.arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
          const b64 = btoa(bin);
          const ext = (receiptPath?.split(".").pop() || "jpg").toLowerCase();
          attachments = [{ filename: `comprobante-pago.${ext}`, content: b64 }];
          // Quitamos la URL del HTML porque ya va adjunta
          data.receiptUrl = "";
        }
      } catch (e) {
        console.error("No se pudo adjuntar comprobante:", e);
      }
    }

    const { subject, html } = buildHtml(type, data);
    const requestedRecipients = Array.isArray(to) ? to : (to ? [to] : [DEFAULT_TO]);
    const recipients = authz.internal
      ? requestedRecipients.filter(isEmail).slice(0, 3)
      : (type === "customer_pago_movil" && isEmail(to) ? [String(to).trim()] : [DEFAULT_TO]);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: recipients, subject, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments ? { attachments } : {}),
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: res.status, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resend confirmó envío → eliminar archivo del Storage
    if (receiptPath) await deleteReceipt(receiptPath);

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-aromix-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });
  }
});
