-- Create public bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', true);

-- Public read access (so receipts can be viewed in emails)
CREATE POLICY "Public can view payment receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts');

-- Anyone can upload (anonymous checkout)
CREATE POLICY "Anyone can upload payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-receipts');