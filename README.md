# Nuestra Historia

Página web romántica de regalo — una sola experiencia con portada animada, carta en
sobre, línea de tiempo, mapa de lugares y galería de fotos. HTML + CSS + JavaScript
plano, sin backend. Todo el contenido personal vive en `data/*.json`.

_Creado por Diego Aleman._

---

## Cómo previsualizar en local

`fetch()` no funciona abriendo el `index.html` con doble clic (`file://`). Necesitas un
servidor local:

- **VS Code + Live Server:** instala la extensión _Live Server_, clic derecho sobre
  `index.html` → _Open with Live Server_.
- **O con Python:** en la carpeta del proyecto, `python -m http.server 8080` y abre
  `http://localhost:8080`.
- **O con Node:** `npx serve` en la carpeta del proyecto.

---

## Editar el contenido (sin tocar código)

Todo está en la carpeta `data/`:

| Archivo | Qué controla |
|---|---|
| `data/config.json` | Nombre/apodo de ella, título del sitio, textos de portada y cierre, **fecha de inicio del contador** (`fechaInicio`). |
| `data/carta.json` | Encabezado, párrafos (uno por línea del arreglo) y firma de la carta. |
| `data/momentos.json` | Línea de tiempo. Cada momento: `fecha`, `titulo`, `foto`, `nota` y `lugar` opcional (`{ nombre, lat, lng }`). Un momento con `lugar` también sale en el mapa (con su nota). |
| `data/mapa.json` | Pines extra del mapa que **no** son hitos de la línea de tiempo. Cada uno: `fecha`, `foto`, `lugar { nombre, lat, lng }`. |
| `data/galeria.json` | Lista de fotos/videos de la galería. `texto` opcional por foto. |

Los tres últimos los **genera el script** a partir de las fotos (ver abajo). Después
puedes editarlos a mano: cambiar un título, un texto, borrar un elemento, reordenar.

---

## Fotos — flujo automático

Las fotos originales van en `IMAGES/`, repartidas en **3 subcarpetas** (esta carpeta
no se publica, está en `.gitignore`):

```
IMAGES/
  TIMELINE/   hitos de la línea de tiempo
  MAPA/       fotos solo para el mapa
  GALERIA/    todo el resto (y videos .mp4)
```

**Nombre de archivo:** si la foto salió del celular (`IMG_AAAAMMDD_HHMMSS...`), el
script saca fecha y ubicación del EXIF solo. Si no tiene EXIF, ponle la fecha
adelante: `2025-08-24 ...`. En `TIMELINE/` el texto después de la fecha/hora es el
mensaje de ese hito, y `@ Lugar` al final fija el nombre del lugar.

Luego:

```bash
cd tools
npm install
node procesar.js
```

El script:
- optimiza todo a WebP (`fotos/timeline/`, `fotos/mapa/`, `fotos/galeria/` + `thumbs/`),
- lee fecha y GPS del EXIF de cada foto,
- reverse-geocodifica los puntos del mapa con **Nominatim** (cachea en `tools/geocache.json`),
- reescribe `data/momentos.json`, `data/mapa.json` y `data/galeria.json`.

Necesita un email de contacto para Nominatim: `NOMINATIM_CONTACT_EMAIL` (variable de
entorno; si no está, usa uno por defecto). Nombres de lugares que queden feos se
corrigen en la tabla `LUGARES` al principio de `tools/procesar.js` o a mano en el JSON.

Si algún lugar del mapa no tiene EXIF con GPS, búscalo en
<https://nominatim.openstreetmap.org/ui/search.html> y pega `lat`/`lng` en el JSON.

---

## Publicar en GitHub Pages

1. Crea un repo en la cuenta `ddat03` **con nombre neutro** (que no diga "regalo" ni el
   nombre de ella), por ejemplo `notas-2025`.
2. `git remote add origin https://github.com/ddat03/<nombre-repo>.git`
3. `git add . && git commit -m "Sitio" && git push -u origin main`
4. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)`. Guarda.
5. A los ~1-2 minutos el sitio queda en `https://ddat03.github.io/<nombre-repo>/`.

El repo debe ser **público** para GitHub Pages gratis. El archivo `.nojekyll` ya está
incluido para que Pages sirva las carpetas tal cual. `robots.txt` y la meta
`noindex` evitan que aparezca en buscadores.

Todas las rutas son relativas, así que funciona bien desde el subpath
`usuario.github.io/repo/`.

---

## Estructura

```
index.html
css/styles.css
js/app.js
data/            contenido personal (JSON)
fotos/
  timeline/      fotos de la línea de tiempo (WebP)
  mapa/          fotos de los pines extra del mapa (WebP)
  galeria/       fotos optimizadas + thumbs/
tools/           procesar.js + optimizar-imagenes.js (no se publica)
IMAGES/          originales (no se publica)
```
