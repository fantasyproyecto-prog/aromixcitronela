

## Plan: API BCV + Selector de oficinas MRW en el checkout

### Resumen
Cambiar la API de tasa BCV a la solicitada por el usuario (con fallback robusto), mejorar la visualizacion bimonetaria, y agregar un selector completo de oficinas MRW por estado en el formulario de checkout.

**Nota importante:** La API `pydolarvenezuela-api.vercel.app` esta caida (404). Se intentara usar esa API primero, pero con fallback automatico a la API actual (`bcv-api.rafnixg.dev`) que si funciona y devuelve la tasa BCV real. Si ambas fallan, se usa el valor hardcodeado de 36.50 Bs.

### Cambios

**1. `src/contexts/CartContext.tsx` — Cambiar API y mejorar manejo de errores**
- Intentar primero `pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv`
- Si falla, usar fallback a `bcv-api.rafnixg.dev/rates/` (que actualmente devuelve `{"dollar":475.0083}`)
- Si ambas fallan, usar fallback de 36.50 y mostrar toast "Tasa BCV obtenida offline"
- Agregar timeout de 5 segundos con `AbortController`
- Renombrar internamente a `bcvRate` como pide el usuario (mantener compatibilidad en el contexto)

**2. `src/components/CartDrawer.tsx` — Mejorar visualizacion bimonetaria**
- Mostrar precio individual de cada item en USD y Bs lado a lado
- Texto superior claro: "Tasa BCV del dia: [valor] Bs/$"
- Totales en ambas monedas con formato de 2 decimales

**3. `src/components/CheckoutForm.tsx` — Agregar selector de oficinas MRW**
- Agregar seccion "Oficina MRW de destino" despues de los datos de envio
- Dropdown de estado (24 estados de Venezuela)
- Dropdown de oficina MRW que se filtra segun el estado seleccionado
- Mostrar direccion y telefono de la oficina seleccionada
- Datos de ~200+ oficinas MRW recopiladas de fuentes publicas, organizadas por estado

**4. `src/data/mrwOffices.ts` — Nuevo archivo con datos de oficinas MRW**
- Array de objetos con estructura: `{ estado, codigo, nombre, direccion, telefono }`
- Todos los 24 estados: Distrito Capital (~40 agencias), Miranda (~9), La Guaira (~1), Aragua (~14), Carabobo (~25), Cojedes (~2), Falcon (~5), Lara (~14), Yaracuy (~3), Zulia (~20), Apure (~2), Barinas (~8), Guarico (~6), Portuguesa (~3), Merida (~10), Tachira (~13), Trujillo (~6), Anzoategui (~11), Bolivar (~6), Delta Amacuro (~1), Monagas (~9), Nueva Esparta (~6), Sucre (~3), Amazonas (~1)

### Detalles tecnicos
- La API pydolarvenezuela esta desplegada en Vercel y actualmente retorna 404 (DEPLOYMENT_NOT_FOUND). El sistema lo manejara con fallback automatico.
- Los datos de MRW fueron recopilados de fuentes publicas actualizadas. Se almacenan como constante estatica para evitar dependencias externas.
- El selector de MRW usa dos dropdowns dependientes (estado -> oficina) sin librerias adicionales.

