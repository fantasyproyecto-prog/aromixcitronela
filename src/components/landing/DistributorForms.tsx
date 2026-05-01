import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RATE_LIMIT_KEY = "aromix_dist_last_send";
const RATE_LIMIT_MS = 30 * 1000;

type WholesaleTab = "mayorista" | "emprender";
type WholesaleOrigin = "Cotizar al mayor" | "Quiero emprender";

interface LeadField {
  label: string;
  value: string;
}

const DistributorForms = () => {
  const [tab, setTab] = useState<WholesaleTab>("mayorista");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mayoristaProducto, setMayoristaProducto] = useState("");
  const [emprenderInversion, setEmprenderInversion] = useState("");

  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === "#formularios-mayorista") {
        setTab("mayorista");
        document.getElementById("formularios")?.scrollIntoView({ behavior: "smooth" });
      } else if (window.location.hash === "#formularios-emprender") {
        setTab("emprender");
        document.getElementById("formularios")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const checkRateLimit = (): boolean => {
    const lastSend = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (lastSend && Date.now() - Number(lastSend) < RATE_LIMIT_MS) {
      toast.error("Ya hemos recibido tu solicitud. Por favor espera unos minutos antes de enviar otra.");
      return false;
    }
    return true;
  };

  const submitWholesaleLead = async ({
    formOrigin,
    replyTo,
    fields,
    successMessage,
  }: {
    formOrigin: WholesaleOrigin;
    replyTo: string;
    fields: LeadField[];
    successMessage: string;
  }) => {
    if (!checkRateLimit()) return;

    setSending(true);
    try {
      const { data: response, error } = await supabase.functions.invoke("send-aromix-email", {
        body: {
          type: "wholesale_lead",
          replyTo,
          data: {
            formOrigin,
            fields,
          },
        },
      });

      if (error || !response?.ok) {
        throw error ?? new Error("El backend no confirmó el envío del correo");
      }

      sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
      toast.success(successMessage);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar. Por favor, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmitMayorista = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (data.get("company_website")) return;

    if (!mayoristaProducto) {
      toast.error("Selecciona una presentación de interés.");
      return;
    }

    const nombre = String(data.get("m-nombre") ?? "");
    const email = String(data.get("m-email") ?? "");
    const telefono = String(data.get("m-tel") ?? "");
    const ubicacion = String(data.get("m-ubicacion") ?? "");
    const cantidad = String(data.get("m-cantidad") ?? "");
    const mensaje = String(data.get("m-mensaje") ?? "");

    await submitWholesaleLead({
      formOrigin: "Cotizar al mayor",
      replyTo: email,
      successMessage: "¡Cotización solicitada! Te contactaremos pronto.",
      fields: [
        { label: "Nombre o empresa", value: nombre },
        { label: "Email", value: email },
        { label: "Teléfono / WhatsApp", value: telefono },
        { label: "Ciudad / País", value: ubicacion },
        { label: "Presentación de interés", value: mayoristaProducto },
        { label: "Cantidad estimada", value: cantidad },
        { label: "Mensaje", value: mensaje || "Sin mensaje adicional" },
      ],
    });
  };

  const handleSubmitEmprender = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    if (data.get("company_website")) return;

    if (!emprenderInversion) {
      toast.error("Selecciona un monto de inversión.");
      return;
    }

    const nombre = String(data.get("e-nombre") ?? "");
    const zona = String(data.get("e-zona") ?? "");
    const direccion = String(data.get("e-dir") ?? "");
    const telefono = String(data.get("e-tel") ?? "");
    const email = String(data.get("e-email") ?? "");

    await submitWholesaleLead({
      formOrigin: "Quiero emprender",
      replyTo: email,
      successMessage: "¡Cotización solicitada! Te contactaremos pronto.",
      fields: [
        { label: "Nombre completo", value: nombre },
        { label: "Email", value: email },
        { label: "Teléfono", value: telefono },
        { label: "Dirección", value: direccion },
        { label: "Zona donde se encuentra", value: zona },
        { label: "Monto de inversión", value: emprenderInversion },
      ],
    });
  };


  const tabClass = (selectedTab: WholesaleTab) =>
    `flex-1 py-3 px-6 text-sm font-semibold rounded-full transition-all ${tab === selectedTab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`;

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
              <div className="flex flex-wrap gap-2 p-1.5 bg-muted rounded-full mb-8">
                <button type="button" className={tabClass("mayorista")} onClick={() => setTab("mayorista")}>Cotizar al mayor</button>
                <button type="button" className={tabClass("emprender")} onClick={() => setTab("emprender")}>Quiero emprender</button>
              </div>

              {tab === "mayorista" && (
                <form onSubmit={handleSubmitMayorista} className="space-y-4">
                  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="opacity-0 absolute -z-10 w-0 h-0" />
                  <div><Label htmlFor="m-nombre">Nombre o empresa</Label><Input id="m-nombre" name="m-nombre" required /></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="m-tel">Teléfono / WhatsApp</Label><Input id="m-tel" name="m-tel" type="tel" required /></div>
                    <div><Label htmlFor="m-email">Email</Label><Input id="m-email" name="m-email" type="email" required /></div>
                  </div>
                  <div><Label htmlFor="m-ubicacion">Ciudad / País</Label><Input id="m-ubicacion" name="m-ubicacion" required /></div>
                  <div>
                    <Label>Presentación de interés</Label>
                    <Select value={mayoristaProducto} onValueChange={setMayoristaProducto}>
                      <SelectTrigger><SelectValue placeholder="Selecciona una presentación" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Caja de 12 unidades">Caja de 12 unidades</SelectItem>
                        <SelectItem value="Caja Master de 72 unidades">Caja Master de 72 unidades</SelectItem>
                        <SelectItem value="Ambas">Ambas presentaciones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="m-cantidad">Cantidad estimada (cajas)</Label><Input id="m-cantidad" name="m-cantidad" placeholder="Ej: 10 cajas" required /></div>
                  <div><Label htmlFor="m-mensaje">Mensaje (opcional)</Label><Input id="m-mensaje" name="m-mensaje" /></div>
                  <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full disabled:opacity-50" size="lg">
                    {sending ? "Enviando..." : "Solicitar cotización al mayor"}
                  </Button>
                </form>
              )}

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
                    <Select value={emprenderInversion} onValueChange={setEmprenderInversion}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un rango" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$200 - $600">$200 - $600</SelectItem>
                        <SelectItem value="$600 - $1,000">$600 - $1,000</SelectItem>
                        <SelectItem value="Más de $1,500">Más de $1,500</SelectItem>
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
                    <Select value={empresaSimilar} onValueChange={setEmpresaSimilar}>
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
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