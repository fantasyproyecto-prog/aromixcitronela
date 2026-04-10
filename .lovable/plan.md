

## Plan: Tasa BCV 100% automática + GitHub Pages fix

### Cambios

**1. `src/contexts/CartContext.tsx` — Nueva API primaria**
- Cambiar la API primaria a `https://ve.dolarapi.com/v1/dolares/oficial` (soporta CORS, responde `{ promedio: number }`)
- Mantener `https://pydolarvenezuela-api.vercel.app/...` como segundo intento
- Mantener `https://bcv-api.rafnixg.dev/rates/` como tercer intento
- Fallback hardcodeado: `475.95` (valor actualizado)
- Si se usa fallback, mostrar toast "Tasa BCV obtenida offline"

**2. `vite.config.ts` — Base path para GitHub Pages**
- Agregar `base: '/aromixcitronela/'` para que los assets se resuelvan correctamente en GitHub Pages

**3. `src/App.tsx` — HashRouter para GitHub Pages**
- Reemplazar `BrowserRouter` por `HashRouter` de `react-router-dom` para evitar 404 en GitHub Pages

**Nota importante sobre Lovable hosting:** La app publicada en `aromixcitronela.lovable.app` usa SPA fallback nativo, por lo que `BrowserRouter` funciona ahí. Sin embargo, para GitHub Pages es necesario `HashRouter`. El cambio a `HashRouter` funciona en ambos entornos.

