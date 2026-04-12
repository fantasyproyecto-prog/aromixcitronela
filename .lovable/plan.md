

## Plan: Tienda B2C + Presentaciones B2B con fotos reales

### Cambios

**1. Copiar las 4 fotos de producto a `src/assets/`**
- `user-uploads://Dispensador.jpg` -> `src/assets/dispensador-real.jpg`
- `user-uploads://Lata.jpg` -> `src/assets/lata-real.jpg`
- `user-uploads://Caja_de_12.jpg` -> `src/assets/caja-12.jpg`
- `user-uploads://Caja_de_72.jpg` -> `src/assets/caja-72.jpg`

**2. Actualizar `src/components/landing/Shop.tsx` (B2C)**
- Reemplazar las imágenes actuales por las fotos reales
- Producto 1: "Dispensador Aromix Citronela + Lata" con `dispensador-real.jpg`
- Producto 2: "Lata Refill Citronela" con `lata-real.jpg`
- Mantener toda la lógica del carrito bimonetario sin cambios

**3. Crear `src/components/landing/WholesaleProducts.tsx` (B2B)**
- Nueva sección con titulo "Presentaciones para Emprendedores y Distribuidores"
- Dos tarjetas con diseño diferenciado: borde dorado/verde oscuro y badge "Venta al Mayor"
- Producto 3: "Caja de 12 Unidades" con `caja-12.jpg`
- Producto 4: "Caja Master de 72 Unidades" con `caja-72.jpg`
- Sin precio visible, sin boton de carrito
- Boton "Solicitar lista de precios" que hace smooth scroll a `#formularios`

**4. Actualizar `src/pages/Index.tsx`**
- Importar y colocar `WholesaleProducts` entre `Shop` y `Distributors`

### Detalles tecnicos
- Las tarjetas B2B usan `border-2 border-amber-500/60` para el borde dorado y un badge absoluto con fondo amber
- El scroll suave se implementa con `document.getElementById('formularios')?.scrollIntoView({ behavior: 'smooth' })`
- Las fotos se importan como ES6 modules desde `src/assets/`

