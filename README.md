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
| `data/momentos.json` | Línea de tiempo **y** mapa. Cada momento: `fecha`, `titulo`, `descripcion`, `foto`, `nota` y `lugar` opcional (`{ nombre, lat, lng }`). Sin `lugar` → solo aparece en la línea de tiempo. |
| `data/galeria.json` | Lista de fotos/videos de la galería. Generado por el script de imágenes (ver abajo); puedes reordenar y agregar `texto` a cada uno. |

### Coordenadas para el mapa

Busca el lugar en <https://nominatim.openstreetmap.org/ui/search.html>, copia la
latitud y longitud, y pégalas en el campo `lugar` de ese momento en `momentos.json`.
Respeta el límite de 1 búsqueda por segundo del servicio.

---

## Fotos

Las fotos originales van en la carpeta `IMAGES/` (no se publica — está en `.gitignore`).
El script las optimiza a WebP y genera miniaturas:

```bash
cd tools
npm install
npm run optimize
```

Esto crea `fotos/galeria/gNN.webp` (grande) + `fotos/galeria/thumbs/gNN.webp` (miniatura)
y reescribe `data/galeria.json` con la lista completa. Después edita ese JSON para
descartar las fotos que no quieras y ponerles un texto.

Para las fotos de la línea de tiempo, reemplaza los archivos de `fotos/momentos/`
(`conocerse.webp`, `primer-beso.webp`, `empezamos.webp`) por las tuyas, o cambia la
ruta `foto` en `momentos.json`.

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
  momentos/      fotos de la línea de tiempo
  galeria/       fotos optimizadas + thumbs/
tools/           script de optimización de imágenes (no se publica)
```
