DROP POLICY IF EXISTS "Public can upload payment receipts only" ON storage.objects;

CREATE POLICY "Public can upload payment receipts only"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','pdf'])
);