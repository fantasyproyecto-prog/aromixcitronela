import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { estados, getOfficesByState } from "@/data/mrwOffices";
import { MapPin, CreditCard, CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

const RATE_LIMIT_KEY = "aromix_checkout_last_send";
const RATE_LIMIT_MS = 5 * 60 * 1000;

const CheckoutForm = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, totalUSD, totalBs, tasaBCV, tasaLoading, clearCart, items } = useCart();
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const offices = selectedEstado ? getOfficesByState(selectedEstado) : [];
  const officeDetail = offices.find((o) => o.codigo === selectedOffice);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOffice) {
      toast.error("Selecciona una oficina MRW de destino");
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
      await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        tipo: "Pedido B2C",
        nombre: data.get("c-nombre"),
        telefono: data.get("c-tel"),
        direccion: data.get("c-dir"),
        detalle_pedido: detallePedido,
        total_usd: `$${totalUSD.toFixed(2)}`,
        total_bs: `Bs ${totalBs.toFixed(2)}`,
        referencia_pago: data.get("referencia"),
        agencia_mrw: officeDetail ? `${officeDetail.nombre} - ${officeDetail.direccion}` : selectedOffice,
      }, "YOUR_PUBLIC_KEY");

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
      setSelectedEstado("");
      setSelectedOffice("");
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
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Reporte de Pago Móvil</DialogTitle>
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

              <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full disabled:opacity-50" size="lg">
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
