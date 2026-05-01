import { useEffect, useMemo } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShippingPayload {
  courier: string;
  summary: string;
  state?: string;
  office?: string;
  other?: { company: string; state: string; address: string } | null;
}

interface Customer { name: string; email: string; phone: string; address: string; }

interface ItemPayload { id: string; name: string; priceUSD: number; quantity: number; image?: string; }

interface Props {
  clientId: string;
  customer: Customer;
  shipping: ShippingPayload;
  items: ItemPayload[];
  onApproved: () => void;
}

const PayPalCheckout = ({ clientId, customer, shipping, items, onApproved }: Props) => {
  const options = useMemo(
    () => ({
      clientId,
      currency: "USD",
      intent: "capture" as const,
    }),
    [clientId]
  );

  return (
    <PayPalScriptProvider options={options}>
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
        forceReRender={[items, customer, shipping]}
        createOrder={async () => {
          const { data, error } = await supabase.functions.invoke("paypal-create-order", {
            body: { customer, shipping, items },
          });
          if (error) {
            console.error("PayPal create-order error:", error);
            toast.error("No se pudo iniciar el pago con PayPal");
            throw error;
          }
          if (!data?.paypalOrderId || !data?.orderId) {
            toast.error("Respuesta inválida de PayPal");
            throw new Error("Invalid response");
          }
          try {
            sessionStorage.setItem("aromix_paypal_internal_order", data.orderId);
          } catch {}
          return data.paypalOrderId as string;
        }}
        onApprove={async (data) => {
          const internalOrderId = sessionStorage.getItem("aromix_paypal_internal_order");
          const { data: cap, error } = await supabase.functions.invoke("paypal-capture-order", {
            body: { paypalOrderId: data.orderID, orderId: internalOrderId },
          });
          if (error || !cap?.ok) {
            console.error("PayPal capture error:", error, cap);
            toast.error("No se pudo confirmar el pago con PayPal");
            return;
          }
          try { sessionStorage.removeItem("aromix_paypal_internal_order"); } catch {}
          onApproved();
        }}
        onError={(err) => {
          console.error("PayPal button error:", err);
          toast.error("Error en el pago con PayPal");
        }}
        onCancel={() => {
          toast.info("Pago con PayPal cancelado");
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;
