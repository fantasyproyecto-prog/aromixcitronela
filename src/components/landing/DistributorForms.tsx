import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const DistributorForms = () => {
  const [tab, setTab] = useState<"emprender" | "empresa">("emprender");
  const [sending, setSending] = useState(false);

  const handleSubmitEmprender = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setSending(true);
    try {
      await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        tipo: "Quiero emprender",
        nombre: data.get("e-nombre"),
        telefono: data.get("e-tel"),
        email: data.get("e-email"),
        direccion: data.get("e-dir"),
        zona: data.get("e-zona"),
        inversion: data.get("e-inversion"),
      }, "YOUR_PUBLIC_KEY");
      toast.success("¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.");
      form.reset();
    } catch {
      toast.error("Error al enviar. Por favor, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmitEmpresa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setSending(true);
    try {
      await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        tipo: "Empresa distribuidora",
        nombre: data.get("d-nombre"),
        empresa: data.get("d-empresa"),
        rif: data.get("d-rif"),
        telefono: data.get("d-tel"),
        email: data.get("d-email"),
        direccion: data.get("d-dir"),
        segmento: data.get("d-segmento"),
        fuerza_ventas: data.get("d-fuerza"),
        producto_similar: data.get("d-similar"),
        detalle: data.get("d-detalle"),
      }, "YOUR_PUBLIC_KEY");
      toast.success("¡Información recibida! Nuestro equipo revisará tu solicitud.");
      form.reset();
    } catch {
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

          <div className="flex gap-2 p-1.5 bg-muted rounded-full mb-8">
            <button className={tabClass("emprender")} onClick={() => setTab("emprender")}>Quiero emprender</button>
            <button className={tabClass("empresa")} onClick={() => setTab("empresa")}>Tengo una empresa distribuidora</button>
          </div>

          {tab === "emprender" && (
            <form onSubmit={handleSubmitEmprender} className="space-y-4">
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
              <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full" size="lg">
                {sending ? "Procesando..." : "Enviar solicitud"}
              </Button>
            </form>
          )}

          {tab === "empresa" && (
            <form onSubmit={handleSubmitEmpresa} className="space-y-4">
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
              <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full" size="lg">
                {sending ? "Procesando..." : "Enviar información"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default DistributorForms;
