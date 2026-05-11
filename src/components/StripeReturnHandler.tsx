import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const PENDING_FLAG_KEY = "aromix_pending_stripe_checkout";
const PENDING_ORDER_KEY = "aromix_pending_stripe_order";
// Si pasaron más de 2 horas desde que iniciamos el checkout, descartamos el flag.
const PENDING_FLAG_TTL_MS = 2 * 60 * 60 * 1000;

const StripeReturnHandler = () => {
  const { clearCart, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cleanUrl = () => {
      const params = new URLSearchParams(window.location.search);
      params.delete("stripe");
      params.delete("session_id");
      const newUrl =
        window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", newUrl);
    };

    const showSuccess = () => {
      if (cancelled) return;
      toast.success("¡Pago confirmado!", {
        description: "Recibirás un correo con la confirmación de tu pedido.",
        duration: 8000,
      });
      clearCart();
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      setShowSuccessCard(true);
      try {
        sessionStorage.removeItem(PENDING_FLAG_KEY);
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      } catch {
        /* ignore */
      }
      cleanUrl();
    };

    const params = new URLSearchParams(window.location.search);
    const stripe = params.get("stripe");

    // Caso 1: Stripe nos devolvió con ?stripe=success
    if (stripe === "success") {
      showSuccess();
      return () => {
        cancelled = true;
      };
    }

    // Caso 2: Stripe canceló
    if (stripe === "cancel") {
      toast.info("Pago cancelado", {
        description: "Puedes intentar de nuevo cuando quieras.",
        duration: 6000,
      });
      cleanUrl();
      try {
        sessionStorage.removeItem(PENDING_FLAG_KEY);
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      } catch {
        /* ignore */
      }
      return () => {
        cancelled = true;
      };
    }

    // Caso 3: La URL viene "limpia" pero teníamos un checkout pendiente.
    // Verificamos en la base si la orden ya está pagada (el webhook la marca).
    let pendingTs: string | null = null;
    let pendingOrderId: string | null = null;
    try {
      pendingTs = sessionStorage.getItem(PENDING_FLAG_KEY);
      pendingOrderId = sessionStorage.getItem(PENDING_ORDER_KEY);
    } catch {
      /* sessionStorage no disponible */
    }

    if (!pendingTs || !pendingOrderId) {
      return () => {
        cancelled = true;
      };
    }

    const ts = Number(pendingTs);
    if (!Number.isFinite(ts) || Date.now() - ts > PENDING_FLAG_TTL_MS) {
      try {
        sessionStorage.removeItem(PENDING_FLAG_KEY);
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      } catch {
        /* ignore */
      }
      return () => {
        cancelled = true;
      };
    }

    // Polling: el webhook puede tardar unos segundos en confirmar el pago.
    let attempts = 0;
    const maxAttempts = 8;
    const intervalMs = 2000;

    const poll = async () => {
      while (!cancelled && attempts < maxAttempts) {
        attempts++;
        try {
          const { data, error } = await supabase.functions.invoke("get-order-status", {
            body: { orderId: pendingOrderId },
          });

          if (!error && (data as { status?: string } | null)?.status === "paid") {
            showSuccess();
            return;
          }
        } catch {
          /* seguir intentando */
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
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
