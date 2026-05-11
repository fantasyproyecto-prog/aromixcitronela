
-- Lock down orders: remove public SELECT
DROP POLICY IF EXISTS "Anyone can read order by id" ON public.orders;

-- Keep INSERT only for anon/authenticated (already exists)
-- Ensure no UPDATE/DELETE policies exist (none currently). Service role bypasses RLS.

-- Storage: remove public listing policy
DROP POLICY IF EXISTS "Public can view payment receipts" ON storage.objects;

-- Restrict INSERT policy on payment-receipts to enforce bucket + size + mime
DROP POLICY IF EXISTS "Anyone can upload payment receipts" ON storage.objects;

CREATE POLICY "Anon can upload payment receipts (restricted)"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
);

-- Bucket-level limits: 5MB, images + PDF only. Keep public for direct URL access only.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/jpg','image/webp','application/pdf']
WHERE id = 'payment-receipts';
