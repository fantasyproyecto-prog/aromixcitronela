UPDATE public.exchange_rates
SET
  rate = 517.9619,
  source = 'bcv.org.ve',
  fetched_at = now(),
  last_success_at = now(),
  last_error = NULL,
  error_count = 0,
  raw = jsonb_build_object(
    'provider', 'https://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc',
    'value', '517,96190000',
    'date', 'Martes, 19 Mayo 2026',
    'note', 'Corrección manual: usar fuente oficial BCV por diferencia detectada en proveedor secundario'
  )
WHERE code = 'BCV_USD';
