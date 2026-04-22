-- Tabla de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,

  -- Items y total
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Pago
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pago_movil', 'stripe')),
  payment_reference TEXT,
  receipt_url TEXT,
  receipt_path TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Envío
  shipping_courier TEXT NOT NULL,
  shipping_state TEXT,
  shipping_office TEXT,
  shipping_other JSONB,
  shipping_summary TEXT NOT NULL,

  -- Estado
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  email_sent BOOLEAN NOT NULL DEFAULT false
);

-- Índices útiles
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede crear un pedido (checkout público)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Nadie puede leer/actualizar/eliminar desde el cliente (solo service role bypassa RLS)
-- No creamos policies de SELECT/UPDATE/DELETE → bloqueado por defecto

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();