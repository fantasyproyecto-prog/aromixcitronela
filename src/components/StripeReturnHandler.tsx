import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const StripeReturnHandler = () => {
  const { clearCart, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripe = params.get("stripe");
    if (stripe === "success") {
      toast.success("¡Pago confirmado!", {
        description: "Recibirás un correo con la confirmación de tu pedido.",
        duration: 8000,
      });
      clearCart();
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      setShowSuccessCard(true);
      params.delete("stripe");
      params.delete("session_id");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
    } else if (stripe === "cancel") {
      toast.info("Pago cancelado", {
        description: "Puedes intentar de nuevo cuando quieras.",
        duration: 6000,
      });
      params.delete("stripe");
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [clearCart, setIsCartOpen, setIsCheckoutOpen]);

  if (!showSuccessCard) return null;

  return (
    <div className="fixed inset-x-4 top-24 z-50 mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-primary/20 bg-background shadow-2xl">
        <div className="flex flex-col gap-4 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">¡Pago Exitoso!</h2>
            <p className="text-base text-muted-foreground">
              Hemos recibido tu pedido y te enviamos un correo con los detalles.
            </p>
          </div>
          <div>
            <Button type="button" onClick={() => setShowSuccessCard(false)} className="rounded-full px-8">
              Entendido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeReturnHandler;
