CREATE POLICY "Anyone can read order by id"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);