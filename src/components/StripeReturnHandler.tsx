import { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const StripeReturnHandler = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripe = params.get("stripe");
    if (stripe === "success") {
      toast.success("¡Pago confirmado!", {
        description: "Recibirás un correo con la confirmación de tu pedido.",
        duration: 8000,
      });
      clearCart();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default StripeReturnHandler;
