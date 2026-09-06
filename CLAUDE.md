# Contexto del proyecto — "Nuestra Historia"

Página web romántica de regalo para la novia de Diego, sin dominio propio, para
compartir solo con un link (se publicará en GitHub Pages, cuenta `ddat03`, con nombre
de repo neutro). HTML + CSS + JavaScript plano, sin backend ni framework. Todo el
contenido personal vive en archivos JSON dentro de `/data`, no hardcodeado.

## Secciones (scroll único con nav flotante)

0. **Bóveda** — overlay inicial tipo caja fuerte, teclado 4 dígitos (`boveda.codigo`,
   default 0708). Al acertar: `dispararEntrada()` → arranca galaxia + música. Se
   recuerda en localStorage (`nh_entrada`). La galaxia y el `<audio>` quedan
   pausados con `alEntrar(cb)` hasta ese momento (el tap desbloquea el autoplay).
1. **Portada** — corazón de partículas 3D (Three.js r128 vía cdnjs, con SRI) con podio
   brillante y estrellas, estilo "corazón galáctico" en tonos rosa/dorado. Fallback:
   `iniciarFondoPortada()` (galaxia 2D en canvas) si no hay WebGL/THREE. Nombre de ella
   emergiendo de la base del corazón, contador en vivo, música de fondo.
2. **La carta** — sobre CSS/SVG que se abre con tap y revela el texto de `data/carta.json`.
3. **Nuestra historia** — línea de tiempo vertical desde `data/momentos.json`, con
   reveal por IntersectionObserver; alterna lados en escritorio.
4. **Nuestro mapa** — Leaflet (CDN cdnjs, con SRI) + tiles OSM, un pin-corazón por
   momento con `lugar` que tenga coordenadas. Popup con foto, descripción y nota.
5. **Galería** — dos carruseles 3D (mitad de las fotos giran en Y, mitad en X, animación
   CSS + arrastre) + botón "Ver todas" que despliega el grid masonry completo. Lightbox
   propio (sin CDN) con teclado y swipe. Los videos van en loop/autoplay (como gif).
6. **Cierre** — mensaje final, contador repetido, botones volver.

## Fechas confirmadas

- 9 nov 2024 — se conocieron
- 10 dic 2024 — Fiestas de Quito, primer beso
- 7 ene 2025 — oficializaron (ancla del contador, `fechaInicio` en config.json)

## Identidad visual

Paleta del plan: vino `#7a1f3d`, rosa `#b5495b`, dorado `#d4a056`, crema `#fdf3f0`.
Títulos en Dancing Script, cuerpo en Lora (Google Fonts). Animaciones suaves de scroll.
Mobile-first (se abre primero desde el celular). Respeta `prefers-reduced-motion`.

## Fondo

Capa fija `#ambiente`: por defecto un wash de color animado + pétalos; si
`config.json → fondo.imagen` tiene ruta (hoy `fotos/fondo.webp`, acuarela hecha por
Diego en Gemini) usa esa imagen a `fondo.opacidad`. Portada y cierre con `mask-image`
para fundirse con el fondo.

## Restricciones

- Rutas **siempre relativas** (se sirve desde subpath `ddat03.github.io/repo/`).
- Recursos externos: Google Fonts, Leaflet (cdnjs, SRI) y Three.js r128 (cdnjs, SRI).
  Todo lo demás es propio.
- `noindex` + `robots.txt Disallow: /` — no debe aparecer en buscadores.
- Las fotos originales viven en `IMAGES/` y NO se publican (`.gitignore`). El script
  `tools/optimizar-imagenes.js` las pasa a WebP en `fotos/galeria/`.
- Firma discreta "Creado por Diego Aleman" en el cierre (campo `firmaAutor`).

## Datos y fotos

- `IMAGES/{TIMELINE,MAPA,GALERIA}/` — originales de Diego (gitignored). Casi todas son
  originales del celular con EXIF (fecha + GPS).
- `tools/procesar.js` procesa las 3 carpetas: optimiza a WebP, lee EXIF, reverse-geocodifica
  el mapa con Nominatim (cache en `tools/geocache.json`), y genera `data/momentos.json`,
  `data/mapa.json`, `data/galeria.json`. Tabla `LUGARES` al inicio para nombres bonitos.
- Mapa = momentos con `lugar` + entradas de `mapa.json`. Puntos de `mapa.json` a <1.5 km
  de un hito se descartan (ya cubiertos).
- Nombre de ella: **Alison Adriana**, apodo "Mi Púa".

## Estado (2026-09-05)

Sitio funcional. Timeline con 13 hitos reales (mensajes de Diego, typos corregidos
levemente), 3 pines extra de mapa, 33 fotos/videos en galería. Pendiente de Diego:
texto de la carta (`carta.json`), revisar los mensajes de la timeline, decidir si suma
hitos "9 nov 2024 / 10 dic 2024" sin foto, y la galaxia elaborada de la portada (pasada
de pulido final).
