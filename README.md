# Nuestra Historia

Página web personal de una sola experiencia: portada animada, una carta, una línea de
tiempo, un mapa de lugares y una galería de fotos. HTML + CSS + JavaScript plano, sin
backend. Todo el contenido vive en `data/*.json`.

## Previsualizar en local

`fetch()` no funciona abriendo `index.html` con doble clic. Usá un servidor:

- **VS Code + Live Server**, o
- `python -m http.server 8080` → `http://localhost:8080`, o
- `npx serve`

## Editar el contenido

Todo en `data/`:

| Archivo | Qué controla |
|---|---|
| `config.json` | Nombre, título, textos de portada y cierre, fecha del contador, clave de entrada, ruta de la música, imagen de fondo. |
| `carta.json` | Encabezado, párrafos y firma de la carta. |
| `momentos.json` | Línea de tiempo (y pines del mapa cuando el momento tiene `lugar`). |
| `mapa.json` | Pines extra del mapa. |
| `galeria.json` | Fotos y videos de la galería. |

## Fotos

Los originales van en `IMAGES/{TIMELINE,MAPA,GALERIA}/` (carpeta no incluida en el repo).
El script las procesa:

```bash
cd tools && npm install && node procesar.js
```

Optimiza a WebP, lee fecha/GPS del EXIF, reverse-geocodifica los puntos del mapa con
Nominatim y regenera los JSON. Necesita la variable `NOMINATIM_CONTACT_EMAIL`.

## Publicar en GitHub Pages

El repo ya trae `.nojekyll`, `robots.txt` (Disallow) y `<meta name="robots" content="noindex">`.
Todas las rutas son relativas, así que funciona desde `usuario.github.io/repo/`.
En **Settings → Pages**: rama `main`, carpeta `/ (root)`.

## Créditos

Música: *"Touching Story"* — Kevin MacLeod (incompetech.com), licencia CC BY 4.0.
Mapa: Leaflet + OpenStreetMap. Corazón 3D: Three.js.

_Creado por Diego Aleman._
