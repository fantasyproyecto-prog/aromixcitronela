
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Anyone can create orders (validated)"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND length(customer_name) > 0
  AND length(customer_email) > 0
  AND length(customer_phone) > 0
  AND total_amount > 0
  AND email_sent = false
);
