CREATE TABLE IF NOT EXISTS public.exchange_rates (
  code TEXT PRIMARY KEY,
  rate NUMERIC(12, 4) NOT NULL,
  source TEXT NOT NULL DEFAULT 'fallback',
  fetched_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  raw JSONB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exchange rates are publicly readable" ON public.exchange_rates;
CREATE POLICY "Exchange rates are publicly readable"
ON public.exchange_rates
FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.set_exchange_rates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_exchange_rates_updated_at ON public.exchange_rates;
CREATE TRIGGER set_exchange_rates_updated_at
BEFORE UPDATE ON public.exchange_rates
FOR EACH ROW
EXECUTE FUNCTION public.set_exchange_rates_updated_at();

INSERT INTO public.exchange_rates (code, rate, source, fetched_at, raw)
VALUES ('BCV_USD', 475.95, 'fallback', now(), '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;