import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const CheckoutForm = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, totalUSD, totalBs, tasaBCV, clearCart, items } = useCart();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("¡Pedido confirmado! Hemos recibido tu comprobante de pago. Te contactaremos pronto.");
    clearCart();
    setIsCheckoutOpen(false);
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Reporte de Pago Móvil</DialogTitle>
        </DialogHeader>

        <div className="bg-accent/50 rounded-xl p-4 space-y-2 text-sm">
          <p className="font-semibold text-foreground">Resumen del pedido</p>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-muted-foreground">
              <span>{i.name} × {i.quantity}</span>
              <span>${(i.priceUSD * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold text-foreground">
            <span>Total</span>
            <span>${totalUSD.toFixed(2)} / Bs {totalBs.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Tasa BCV: Bs {tasaBCV.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-sm font-semibold text-foreground">Datos de pago móvil</p>
          <div><Label htmlFor="referencia">Referencia del pago</Label><Input id="referencia" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="tel-origen">Teléfono origen</Label><Input id="tel-origen" type="tel" required /></div>
            <div><Label htmlFor="cedula">Cédula/RIF</Label><Input id="cedula" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="banco">Banco de origen</Label><Input id="banco" required /></div>
            <div><Label htmlFor="monto-bs">Monto en Bs</Label><Input id="monto-bs" type="number" step="0.01" defaultValue={totalBs.toFixed(2)} required /></div>
          </div>

          <Separator />
          <p className="text-sm font-semibold text-foreground">Datos de envío</p>
          <div><Label htmlFor="c-nombre">Nombre completo</Label><Input id="c-nombre" required /></div>
          <div><Label htmlFor="c-tel">Teléfono de contacto</Label><Input id="c-tel" type="tel" required /></div>
          <div><Label htmlFor="c-dir">Dirección de envío</Label><Input id="c-dir" required /></div>

          <Button type="submit" className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full" size="lg">
            Enviar comprobante y confirmar pedido
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;
