import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RATE_LIMIT_KEY = "aromix_dist_last_send";
const RATE_LIMIT_MS = 5 * 60 * 1000;

const DistributorForms = () => {
  const [tab, setTab] = useState<"mayorista" | "emprender" | "empresa">("mayorista");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const checkRateLimit = (): boolean => {
    const lastSend = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (lastSend && Date.now() - Number(lastSend) < RATE_LIMIT_MS) {
      toast.error("Ya hemos recibido tu solicitud. Por favor espera unos minutos antes de enviar otra.");
      return false;
    }
    return true;
  };

  const handleSubmitMayorista = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (data.get("company_website")) {
      toast.success("¡Solicitud enviada con éxito!");
      return;
    }
    if (!checkRateLimit()) return;

    setSending(true);
    try {
      const nombre = String(data.get("m-nombre") ?? "");
      const email = String(data.get("m-email") ?? "");
      const telefono = String(data.get("m-tel") ?? "");
      const ubicacion = String(data.get("m-ubicacion") ?? "");
      const producto = String(data.get("m-producto") ?? "");
      const cantidad = String(data.get("m-cantidad") ?? "");
      const mensaje = String(data.get("m-mensaje") ?? "");

      const { error } = await supabase.functions.invoke("send-aromix-email", {
        body: {
          type: "mayorista",
          replyTo: email,
          data: { name: nombre, email, phone: telefono, location: ubicacion, product: producto, quantity: cantidad, message: mensaje },
        },
      });
      if (error) throw error;

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      toast.success("¡Cotización solicitada! Te contactaremos pronto.");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar. Por favor, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmitEmprender = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (data.get("company_website")) {
      toast.success("¡Solicitud enviada con éxito!");
      return;
    }
    if (!checkRateLimit()) return;

    setSending(true);
    try {
      const nombre = String(data.get("e-nombre") ?? "");
      const zona = String(data.get("e-zona") ?? "");
      const inversion = String(data.get("e-inversion") ?? "");
      const direccion = String(data.get("e-dir") ?? "");
      const telefono = String(data.get("e-tel") ?? "");
      const email = String(data.get("e-email") ?? "");

      const { error } = await supabase.functions.invoke("send-aromix-email", {
        body: {
          type: "emprendedor",
          replyTo: email,
          data: { name: nombre, email, phone: telefono, address: direccion, zone: zona, investment: inversion },
        },
      });
      if (error) throw error;

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      toast.success("¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar. Por favor, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmitEmpresa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (data.get("company_website")) {
      toast.success("¡Información recibida!");
      return;
    }
    if (!checkRateLimit()) return;

    setSending(true);
    try {
      const nombre = String(data.get("d-nombre") ?? "");
      const empresa = String(data.get("d-empresa") ?? "");
      const rif = String(data.get("d-rif") ?? "");
      const telefono = String(data.get("d-tel") ?? "");
      const email = String(data.get("d-email") ?? "");
      const direccion = String(data.get("d-dir") ?? "");
      const segmento = String(data.get("d-segmento") ?? "");
      const fuerza = String(data.get("d-fuerza") ?? "");
      const similar = String(data.get("d-similar") ?? "No especificado");
      const detalle = String(data.get("d-detalle") ?? "Sin detalles adicionales");

      const { error } = await supabase.functions.invoke("send-aromix-email", {
        body: {
          type: "distribuidor",
          replyTo: email,
          data: {
            name: nombre, company: empresa, rif, phone: telefono, email,
            address: direccion, segment: segmento, salesforce: fuerza, similar, detail: detalle,
          },
        },
      });
      if (error) throw error;

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      toast.success("¡Información recibida! Nuestro equipo revisará tu solicitud.");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar. Por favor, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const tabClass = (t: string) =>
    `flex-1 py-3 px-6 text-sm font-semibold rounded-full transition-all ${tab === t ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <section id="formularios" className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Forma parte de Aromix</h2>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">¡Solicitud recibida!</h3>
              <p className="text-muted-foreground">Nuestro equipo revisará tu información y te contactará pronto.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 p-1.5 bg-muted rounded-full mb-8">
                <button className={tabClass("emprender")} onClick={() => setTab("emprender")}>Quiero emprender</button>
                <button className={tabClass("empresa")} onClick={() => setTab("empresa")}>Tengo una empresa distribuidora</button>
              </div>

              {tab === "emprender" && (
                <form onSubmit={handleSubmitEmprender} className="space-y-4">
                  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="opacity-0 absolute -z-10 w-0 h-0" />
                  <div><Label htmlFor="e-nombre">Nombre completo</Label><Input id="e-nombre" name="e-nombre" required /></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="e-tel">Teléfono</Label><Input id="e-tel" name="e-tel" type="tel" required /></div>
                    <div><Label htmlFor="e-email">Email</Label><Input id="e-email" name="e-email" type="email" required /></div>
                  </div>
                  <div><Label htmlFor="e-dir">Dirección</Label><Input id="e-dir" name="e-dir" required /></div>
                  <div><Label htmlFor="e-zona">Zona donde se encuentra</Label><Input id="e-zona" name="e-zona" required /></div>
                  <div>
                    <Label>Monto que estás dispuesto a invertir</Label>
                    <Select name="e-inversion" required>
                      <SelectTrigger><SelectValue placeholder="Selecciona un rango" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200-600">$200 - $600</SelectItem>
                        <SelectItem value="600-1000">$600 - $1,000</SelectItem>
                        <SelectItem value="1500+">Más de $1,500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full disabled:opacity-50" size="lg">
                    {sending ? "Procesando..." : "Enviar solicitud"}
                  </Button>
                </form>
              )}

              {tab === "empresa" && (
                <form onSubmit={handleSubmitEmpresa} className="space-y-4">
                  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="opacity-0 absolute -z-10 w-0 h-0" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="d-nombre">Nombre completo</Label><Input id="d-nombre" name="d-nombre" required /></div>
                    <div><Label htmlFor="d-empresa">Nombre de la empresa</Label><Input id="d-empresa" name="d-empresa" required /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="d-rif">RIF</Label><Input id="d-rif" name="d-rif" required /></div>
                    <div><Label htmlFor="d-tel">Teléfono</Label><Input id="d-tel" name="d-tel" type="tel" required /></div>
                  </div>
                  <div><Label htmlFor="d-email">Email</Label><Input id="d-email" name="d-email" type="email" required /></div>
                  <div><Label htmlFor="d-dir">Dirección</Label><Input id="d-dir" name="d-dir" required /></div>
                  <div><Label htmlFor="d-segmento">Segmento o rubro</Label><Input id="d-segmento" name="d-segmento" placeholder="Retail, Food Service, etc." required /></div>
                  <div><Label htmlFor="d-fuerza">Fuerza de ventas (cantidad de vendedores)</Label><Input id="d-fuerza" name="d-fuerza" type="number" required /></div>
                  <div>
                    <Label>¿Ha comercializado un producto similar?</Label>
                    <Select name="d-similar">
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="d-detalle">Detalle (opcional)</Label><Input id="d-detalle" name="d-detalle" /></div>
                  <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full disabled:opacity-50" size="lg">
                    {sending ? "Procesando..." : "Enviar información"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DistributorForms;
