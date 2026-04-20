import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { estados, getOfficesByState } from "@/data/mrwOffices";
import { MapPin, CreditCard, CheckCircle, Paperclip, X, ArrowLeft } from "lucide-react";
import emailjs from "@emailjs/browser";
import { compressImage, dataUrlSizeKB } from "@/lib/compressImage";

const RATE_LIMIT_KEY = "aromix_checkout_last_send";
const RATE_LIMIT_MS = 5 * 60 * 1000;

type PaymentMethod = "pago-movil" | null;

const CheckoutForm = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, totalUSD, totalBs, tasaBCV, tasaLoading, clearCart, items } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string>("");
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const offices = selectedEstado ? getOfficesByState(selectedEstado) : [];
  const officeDetail = offices.find((o) => o.codigo === selectedOffice);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file, 600, 0.4);
      const sizeKB = dataUrlSizeKB(dataUrl);
      if (sizeKB > 50) {
        const smaller = await compressImage(file, 480, 0.3);
        setReceiptImage(smaller);
      } else {
        setReceiptImage(dataUrl);
      }
      setReceiptName(file.name);
      toast.success("Comprobante adjuntado correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo procesar la imagen");
    } finally {
      setCompressing(false);
    }
  };

  const removeReceipt = () => {
    setReceiptImage(null);
    setReceiptName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOffice) {
      toast.error("Selecciona una oficina MRW de destino");
      return;
    }
    if (!receiptImage) {
      toast.error("Adjunta el capture del comprobante de pago");
      return;
    }

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    // Honeypot check
    if (data.get("website_url")) {
      toast.success("¡Pedido confirmado! Te contactaremos pronto.");
      return;
    }

    // Rate limit check
    const lastSend = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (lastSend && Date.now() - Number(lastSend) < RATE_LIMIT_MS) {
      toast.error("Ya hemos recibido tu solicitud. Por favor espera unos minutos antes de enviar otra.");
      return;
    }

    setSending(true);

    const detallePedido = items.map((i) => `${i.name} x${i.quantity} - $${(i.priceUSD * i.quantity).toFixed(2)}`).join("; ");

    try {
      const nombreCliente = String(data.get("c-nombre") ?? "");
      const emailCliente = String(data.get("c-email") ?? "").trim();
      const telCliente = String(data.get("c-tel") ?? "");
      const dirCliente = String(data.get("c-dir") ?? "");
      const referencia = String(data.get("referencia") ?? "");
      const agenciaMrw = officeDetail
        ? `${officeDetail.nombre} - ${officeDetail.direccion} (Tel: ${officeDetail.telefono})`
        : selectedOffice;
      const shippingAddress = `${dirCliente} | Oficina MRW: ${agenciaMrw}`;

      await emailjs.send("service_o369fbm", "template_ah2kxfd", {
        // Asunto
        subject: `Nueva Orden de Compra - ${nombreCliente}`,
        // Variables que coinciden con la plantilla template_ah2kxfd
        user_name: nombreCliente,
        user_email: emailCliente || "No proporcionado",
        user_phone: telCliente,
        items: detallePedido,
        total_amount: `$${totalUSD.toFixed(2)} (Bs ${totalBs.toFixed(2)})`,
        shipping_address: shippingAddress,
        paid_reference: referencia,
        // Enviamos la imagen como Data URL completo para que EmailJS pueda
        // renderizarla directamente con <img src="{{payment_screenshot}}">
        payment_screenshot: receiptImage,
      }, "un_PzAS5mmnzH1bxY");

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      toast.success("¡Pedido confirmado! Hemos recibido tu comprobante de pago. Te contactaremos pronto.");
      clearCart();
      setSuccess(true);
    } catch {
      toast.error("Error al enviar el pedido. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = (open: boolean) => {
    setIsCheckoutOpen(open);
    if (!open) {
      setSuccess(false);
      setPaymentMethod(null);
      setSelectedEstado("");
      setSelectedOffice("");
      removeReceipt();
    }
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
            <CheckCircle className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">¡Pedido confirmado!</h3>
            <p className="text-muted-foreground">Hemos recibido tu comprobante de pago. Nuestro equipo te contactará pronto para coordinar el envío.</p>
            <Button onClick={() => handleClose(false)} className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-8">Cerrar</Button>
          </div>
        ) : !paymentMethod ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Elige tu método de pago</DialogTitle>
            </DialogHeader>
            <div className="bg-accent/50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>Total a pagar</span>
                <span>${totalUSD.toFixed(2)} / Bs {totalBs.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{tasaLoading ? "Cargando tasa BCV..." : `Tasa BCV: Bs ${tasaBCV.toFixed(2)} / $1`}</p>
            </div>

            <div className="space-y-3 mt-2">
              {/* Pago Móvil - activo */}
              <button
                type="button"
                onClick={() => setPaymentMethod("pago-movil")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary/40 hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Pago Móvil (Bs)</p>
                  <p className="text-xs text-muted-foreground">Banesco · Reporta tu pago y adjunta el comprobante</p>
                </div>
              </button>

              {/* Tarjeta Stripe - próximamente */}
              <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-muted/40 opacity-70 cursor-not-allowed">
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shrink-0">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-muted-foreground">Tarjeta internacional (USD)</p>
                  <p className="text-xs text-muted-foreground">Visa / Mastercard vía Stripe</p>
                </div>
                <span className="text-xs font-semibold bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">Próximamente</span>
              </div>

              {/* PayPal - próximamente */}
              <div className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-muted/40 opacity-70 cursor-not-allowed">
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shrink-0">
                  <span className="font-bold text-muted-foreground text-sm">PP</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-muted-foreground">PayPal</p>
                  <p className="text-xs text-muted-foreground">Pago internacional con cuenta PayPal</p>
                </div>
                <span className="text-xs font-semibold bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">Próximamente</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                Reporte de Pago Móvil
              </DialogTitle>
            </DialogHeader>

            <div className="bg-accent/50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Resumen del pedido</p>
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-muted-foreground">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.priceUSD * i.quantity).toFixed(2)} / Bs {(i.priceUSD * i.quantity * tasaBCV).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>${totalUSD.toFixed(2)} / Bs {totalBs.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{tasaLoading ? "Cargando tasa BCV..." : `Tasa BCV del día: Bs ${tasaBCV.toFixed(2)} / $1 USD`}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Honeypot */}
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="opacity-0 absolute -z-10 w-0 h-0" />

              <p className="text-sm font-semibold text-foreground">Datos de envío</p>
              <div><Label htmlFor="c-nombre">Nombre completo</Label><Input id="c-nombre" name="c-nombre" required /></div>
              <div><Label htmlFor="c-email">Correo electrónico</Label><Input id="c-email" name="c-email" type="email" required placeholder="tu@correo.com" /></div>
              <div><Label htmlFor="c-tel">Teléfono de contacto</Label><Input id="c-tel" name="c-tel" type="tel" required /></div>
              <div><Label htmlFor="c-dir">Dirección de envío</Label><Input id="c-dir" name="c-dir" required /></div>

              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Oficina MRW de destino
                </p>
                <div>
                  <Label htmlFor="mrw-estado">Estado</Label>
                  <select id="mrw-estado" value={selectedEstado} onChange={(e) => { setSelectedEstado(e.target.value); setSelectedOffice(""); }} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Selecciona un estado</option>
                    {estados.map((e) => (<option key={e} value={e}>{e}</option>))}
                  </select>
                </div>
                {selectedEstado && (
                  <div>
                    <Label htmlFor="mrw-oficina">Oficina MRW</Label>
                    <select id="mrw-oficina" value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecciona una oficina</option>
                      {offices.map((o) => (<option key={o.codigo} value={o.codigo}>{o.nombre}</option>))}
                    </select>
                  </div>
                )}
                {officeDetail && (
                  <div className="bg-accent/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">{officeDetail.nombre}</p>
                    <p>{officeDetail.direccion}</p>
                    <p>Tel: {officeDetail.telefono}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Instrucciones de Pago Móvil
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Banco:</strong> Banesco</p>
                  <p><strong>Teléfono:</strong> 0414-4141188</p>
                  <p><strong>Cédula:</strong> 11.357.379</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Realiza tu pago por el monto total en Bolívares y guarda el número de referencia.
                </p>
              </div>

              <div>
                <Label htmlFor="referencia">Número de Referencia (Últimos 4 o 6 dígitos)</Label>
                <Input id="referencia" name="referencia" placeholder="Ej: 123456" required />
              </div>

              <div className="space-y-2">
                <Label>Adjuntar capture del comprobante</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-file"
                />
                {!receiptImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary font-semibold rounded-xl py-4 px-4 transition-colors disabled:opacity-60"
                  >
                    <Paperclip className="h-5 w-5" />
                    {compressing ? "Procesando imagen..." : "Adjuntar Capture"}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 border border-border rounded-xl p-2 bg-accent/30">
                    <img src={receiptImage} alt="Comprobante" className="h-16 w-16 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{receiptName}</p>
                      <p className="text-xs text-muted-foreground">Listo para enviar</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Quitar comprobante"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={sending || compressing} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full disabled:opacity-50" size="lg">
                {sending ? "Procesando..." : "Enviar comprobante y confirmar pedido"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;
