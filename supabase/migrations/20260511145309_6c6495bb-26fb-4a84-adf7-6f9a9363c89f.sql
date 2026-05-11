DROP POLICY IF EXISTS "Public cannot read orders" ON public.orders;
DROP POLICY IF EXISTS "Public cannot update orders" ON public.orders;
DROP POLICY IF EXISTS "Public cannot delete orders" ON public.orders;

CREATE POLICY "Public cannot read orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Public cannot update orders"
ON public.orders
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Public cannot delete orders"
ON public.orders
FOR DELETE
TO anon, authenticated
USING (false);

DROP POLICY IF EXISTS "Public cannot view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public cannot update payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public cannot delete payment receipts" ON storage.objects;

CREATE POLICY "Public cannot view payment receipts"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'payment-receipts' AND false);

CREATE POLICY "Public cannot update payment receipts"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'payment-receipts' AND false)
WITH CHECK (bucket_id = 'payment-receipts' AND false);

CREATE POLICY "Public cannot delete payment receipts"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'payment-receipts' AND false);
