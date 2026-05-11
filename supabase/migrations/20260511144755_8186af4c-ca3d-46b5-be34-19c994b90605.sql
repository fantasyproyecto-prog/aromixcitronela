ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders (validated)" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read order by id" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;

CREATE POLICY "Public can create validated pending orders only"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'::text
  AND currency = 'USD'::text
  AND length(trim(customer_name)) BETWEEN 1 AND 120
  AND length(trim(customer_email)) BETWEEN 3 AND 255
  AND customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(customer_phone)) BETWEEN 5 AND 40
  AND length(trim(customer_address)) BETWEEN 1 AND 1000
  AND jsonb_typeof(items) = 'array'
  AND jsonb_array_length(items) BETWEEN 1 AND 50
  AND total_amount > 0
  AND total_amount < 100000
  AND payment_method IN ('pago-movil', 'stripe', 'paypal')
  AND length(trim(shipping_courier)) BETWEEN 1 AND 80
  AND length(trim(shipping_summary)) BETWEEN 1 AND 1200
  AND email_sent = false
);

DROP POLICY IF EXISTS "Payment receipts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can update payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete payment receipts" ON storage.objects;

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]::text[]
WHERE id = 'payment-receipts';

CREATE POLICY "Public can upload payment receipts only"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND owner IS NULL
  AND lower((storage.extension(name))) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
);
