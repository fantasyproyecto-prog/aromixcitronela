

## Plan: Obtener la tasa BCV del dia automaticamente

### Problema
La tasa BCV esta hardcodeada en `36.5` dentro de `CartContext.tsx`. Necesitas la tasa real y actualizada.

### Solucion
Usar la API gratuita `https://bcv-api.rafnixg.dev/rates/` que devuelve la tasa del dia en formato `{"dollar":475.0083,"date":"2026-04-08"}`. Se consultara al montar el `CartProvider` con un `useEffect`.

### Cambios

**1. `src/contexts/CartContext.tsx`**
- Agregar un `useEffect` que al montar el componente haga `fetch("https://bcv-api.rafnixg.dev/rates/")` y actualice `tasaBCV` con el valor `data.dollar`.
- Cambiar el valor inicial de `36.5` a `0` (para evitar mostrar una tasa incorrecta antes de cargar).
- Agregar estado `tasaLoading: boolean` al contexto para que los componentes puedan mostrar un indicador mientras carga.
- Si el fetch falla, usar un fallback hardcodeado razonable (ej. `75`) y mostrar un `console.warn`.

**2. `src/components/landing/Shop.tsx`**
- Si `tasaBCV === 0` (cargando), mostrar "Cargando..." en lugar del precio en Bs.

**3. `src/components/CartDrawer.tsx`**
- Mismo ajuste: si la tasa aun no cargo, mostrar "Cargando tasa..." en el label de tasa BCV.

**4. `src/components/CheckoutForm.tsx`**
- Mismo ajuste para la linea de tasa BCV en el resumen del pedido.

### Detalles tecnicos
- La API es publica, no requiere API key ni CORS proxy — responde con headers CORS permisivos.
- Se consulta una sola vez al montar `CartProvider`, no en cada render.
- El fallback garantiza que la app no se rompa si la API esta caida.

