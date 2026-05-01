ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON public.orders(paypal_order_id);