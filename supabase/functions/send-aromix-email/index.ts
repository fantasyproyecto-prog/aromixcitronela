const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Aromix Citronela <onboarding@resend.dev>";
const TO = "Aromix.pa@gmail.com";

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
      ? `<strong style="color:${BRAND_DARK};font-size:16px;">Envío por: ${escapeHtml(data.shippingOther?.company ?? "")} - Estado: ${escapeHtml(data.shippingOther?.state ?? "")} - Dirección: ${escapeHtml(data.shippingOther?.address ?? "")}</strong><div style="margin-top:6px;color:#b45309;font-size:12px;font-weight:600;">⚠️ Atención despacho: guía de envío personalizada indicada por el cliente.</div>`
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
        ${row("Email", e("email"))}
        ${row("Teléfono", e("phone"))}
        ${row("Dirección", e("address"))}
        ${shippingRow}
        ${row("Referencia Pago Móvil", e("reference"))}
      </table>
      <h3 style="margin:32px 0 12px;color:${BRAND_DARK};font-size:16px;">Detalle del pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef1e6;border-bottom:2px solid ${BRAND_GREEN};">
        ${itemsHtml}
        <tr><td style="padding:16px 0 4px;color:${BRAND_DARK};font-size:16px;font-weight:700;">TOTAL</td><td align="right" style="padding:16px 0 4px;color:${BRAND_GREEN};font-size:20px;font-weight:700;">${e("total")}</td></tr>
      </table>
      ${receipt}`;
    return { subject: `🛒 Nuevo pedido — ${data.name}${isOther ? " (Envío Otro ⚠️)" : ""}`, html: layout("Nuevo Pedido", body) };
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");

    const { type, data, replyTo, receiptPath } = await req.json();
    if (!type || !data) {
      return new Response(JSON.stringify({ error: "type y data son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si hay comprobante, descárgalo y adjúntalo (así no depende de la URL pública)
    let attachments: Array<{ filename: string; content: string }> | undefined;
    if (data.receiptUrl) {
      try {
        const imgRes = await fetch(data.receiptUrl);
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [TO], subject, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments ? { attachments } : {}),
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resend confirmó envío → eliminar archivo del Storage
    if (receiptPath) await deleteReceipt(receiptPath);

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-aromix-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
