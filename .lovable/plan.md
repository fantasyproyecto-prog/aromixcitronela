# Plan: Páginas legales (Privacidad y Términos)

## 1. Nuevo componente compartido `LegalPage`
Crear `src/components/legal/LegalPage.tsx` — layout reutilizable, limpio y corporativo:
- Fondo `bg-background`, contenedor central `max-w-4xl mx-auto`, padding generoso (`px-6 py-16 md:py-24`).
- Botón "← Volver a la tienda" arriba (variant `outline`, `asChild` con `<Link to="/">`).
- Título principal grande (`text-4xl md:text-5xl font-bold`) + subtítulo opcional.
- Slot para `children` con tipografía legible (`prose`-like: `space-y-6`, `leading-relaxed`, `text-foreground/80`, encabezados `h2/h3` consistentes).
- Footer mínimo con enlace de regreso.

## 2. Página `/privacidad`
Crear `src/pages/Privacy.tsx` usando `LegalPage`. Contenido: secciones 1–12 del documento (Introducción → Contacto), encabezadas como `<h2>` numerados.

## 3. Página `/terminos`
Crear `src/pages/Terms.tsx` usando `LegalPage`. Contenido: "TÉRMINOS Y CONDICIONES BÁSICOS" puntos 1–6.

## 4. Rutas
Editar `src/App.tsx`: añadir `<Route path="/privacidad" element={<Privacy />} />` y `<Route path="/terminos" element={<Terms />} />` antes del catch-all.

## 5. Footer
Editar `src/components/landing/ClosingFooter.tsx`:
- Añadir, justo encima o dentro del bloque de copyright, una fila de enlaces: "Política de Privacidad" → `/privacidad`, "Términos y Condiciones" → `/terminos`.
- Usar `<Link>` de `react-router-dom` con estilo `underline hover:text-primary`.
- Mantener todo el copy y diseño existentes intactos.

## Notas técnicas
- Usar `react-router-dom` `Link` (ya instalado).
- Sin cambios de lógica, datos, pagos ni estilos globales.
- Añadir `<title>` por página vía `document.title` en un `useEffect` simple para SEO ligero.
