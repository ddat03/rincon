# Página para [NOMBRE] — Plan de sitio web y prompts para VS Code

Documento de referencia para construir una página web romántica de regalo para tu novia:
sin dominio propio, con solo un link para compartir, con fotos de ustedes, una carta, una
línea de tiempo de la relación y un mapa con los lugares que han compartido. Nombre de
trabajo: **"Página para [NOMBRE]"** — reemplázalo por el nombre o apodo que quieras usar,
o por un título propio (ej. "Nuestra Historia", "Para Ti") cuando la construyas.

---

## 1. Lo que investigué antes de diseñar esto

Revisé los 4 ejemplos que mencionaste para entender qué tipo de efectos y secciones son
típicos en este tipo de páginas, y esto es lo que encontré:

- **Sitios como `dedicapag.com` y `tlanex.com`** son plataformas que venden plantillas
  HTML ya armadas (más de 30 tipos): sobres de carta animados, galaxias 3D explorables,
  juegos (memorama, atrapa-burbujas), "Netflix/Spotify del amor", candados con
  combinación, etc. Todas comparten un patrón: **una experiencia de entrada llamativa**
  (efecto visual fuerte) seguida de **secciones más simples y de lectura tranquila**
  (galería, mensaje, línea de tiempo).
- **El ejemplo del "corazón galáctico"** es justamente ese tipo de experiencia de
  entrada: un fondo de partículas/galaxia con un corazón o texto animado, pensado para
  la primera pantalla, no para sostenerse en toda la página (por rendimiento y porque
  pierde impacto si está todo el tiempo).
- **El ejemplo de "una cartita para ti"** es una plantilla de sobre animado: se abre con
  una animación y revela un mensaje de texto personalizado.

Con esto confirmo lo que ya intuías: **conviene seccionar por partes** en vez de meter
todos los efectos en una sola pantalla. La galaxia/corazón animado va de intro, el sobre
va en su propia sección, y el resto (línea de tiempo, mapa, galería) son secciones más
tranquilas visualmente pero con su propio toque de animación al hacer scroll.

---

## 2. Resumen del proyecto

- **Qué es:** una página web de una sola "experiencia" para tu novia, dividida en
  secciones/páginas, sin necesidad de dominio propio — se comparte con un link.
- **Cómo se ve y se comparte:** publicada en GitHub Pages (gratis, con tu cuenta
  `ddat03` que ya usas), da un link tipo `https://ddat03.github.io/nombre-del-repo/`.
  No aparece en buscadores a menos que alguien tenga el link exacto — no hace falta
  contraseña según lo que definiste, aunque dejo una nota sobre esto en la sección 8.
- **Contenido central que confirmaste:**
  - 9 de noviembre de 2024 — se conocieron.
  - 10 de diciembre de 2024 — Fiestas de Quito, primer beso.
  - 7 de enero de 2025 — empezaron la relación en serio (esta es la fecha que uso como
    ancla del contador de "tiempo juntos", pero se puede cambiar fácilmente).
  - Tienes fotos con fecha de ahí en adelante, lo cual es ideal: esas mismas fotos con
    fecha alimentan tanto la línea de tiempo como el mapa (ver sección 5, están
    pensadas como una sola fuente de datos).
- **Secciones que pediste incluir:** intro animada tipo galaxia/corazón, carta con sobre
  animado, línea de tiempo de la relación, contador de tiempo juntos — más lo que ya
  tenías claro desde el principio: galería de fotos dinámica y mapa con ubicaciones
  (cada una con foto, descripción y nota).

---

## 3. Estructura de la página (secciones/páginas)

Para que la galaxia y el mapa no compitan por rendimiento en la misma pantalla, la
página se organiza en **secciones separadas**, navegables con un menú simple (puede ser
scroll continuo con anclas, o páginas HTML separadas enlazadas — se lo dejamos a Claude
Code según cómo se vea mejor una vez armado):

1. **Portada / Intro** — fondo animado tipo galaxia/partículas o corazón (canvas o una
   librería ligera vía CDN), un título con el nombre de ella, y un botón tipo "Toca para
   entrar" o "Abrir tu regalo". Aquí también puede vivir el **contador de tiempo
   juntos** ("Llevamos X días, Y horas...") desde el 7 de enero de 2025.
2. **La carta** — un sobre animado que se abre al hacer clic y revela un mensaje escrito
   por ti (texto largo, editable, el corazón emocional de la página).
3. **Nuestra historia** — línea de tiempo vertical con los hitos: 9 nov 2024 (se
   conocieron), 10 dic 2024 (Fiestas de Quito, primer beso), 7 ene 2025 (oficializaron),
   y espacio abierto para agregar más hitos a medida que se te ocurran, cada uno con
   foto + texto corto.
4. **Nuestro mapa** — mapa interactivo con un pin por cada lugar importante que han
   compartido; cada pin abre una tarjeta con foto, descripción del lugar y una nota
   tuya. Ver sección 5 para cómo se relaciona con la línea de tiempo.
5. **Galería** — cuadrícula de fotos "dinámica": aparecen con animación al hacer scroll
   (no todas de golpe), con efecto hover y un visor a pantalla completa (lightbox) al
   hacer clic en cualquiera.
6. **Cierre** — pantalla final con un mensaje corto, quizás el contador repetido, y un
   botón para "volver a leer la carta" o reiniciar la experiencia.

---

## 4. Contenido que tienes que preparar antes (o durante) de construir

Esto es lo único que de verdad depende de ti — Claude Code puede armar toda la parte
técnica, pero el contenido emocional es tuyo:

- **El nombre o apodo** que va a aparecer en toda la página (lo dejamos como
  `[NOMBRE]` de placeholder en este documento, tal como pediste).
- **El texto de la carta** (sección 2 de la página) — puede ser largo, no hay límite
  técnico real.
- **Los hitos de la línea de tiempo**: ya tienes 3 (9 nov, 10 dic, 7 ene) — piensa si
  quieres sumar 1-2 más (primer viaje, alguna fecha graciosa, etc.) con una frase corta
  cada uno.
- **Los lugares para el mapa**: de las fotos con fecha que mencionas, elige cuáles
  tienen una ubicación clara (un parque, un restaurante, una ciudad) y para cada una
  ten a mano: nombre del lugar, una foto, una descripción corta de qué es ese lugar, y
  una nota/recuerdo personal tuyo sobre ese momento.
- **Las fotos en general** para la galería dinámica — entre más variadas mejor, pero
  conviene revisarlas y descartar duplicados o borrosas antes de subirlas (ver nota de
  optimización en la sección 8).

> Nota sobre línea de tiempo vs. mapa: no hace falta escribir el contenido dos veces.
> En la sección 5 propongo un solo archivo de datos por "momento" que tiene fecha (usado
> por la línea de tiempo) y, opcionalmente, coordenadas (usado por el mapa). Un momento
> sin coordenadas simplemente no aparece en el mapa pero sí en la línea de tiempo, y
> viceversa si algún día quieres un lugar sin fecha exacta.

---

## 5. Modelo de contenido (datos)

Para que sea fácil de editar sin tocar código, todo el contenido personal vive en
archivos de datos separados (JSON), no mezclado con el HTML/CSS/JS:

```
/data/momentos.json      // línea de tiempo + mapa (fuente compartida)
/data/galeria.json       // lista de fotos para la galería dinámica
/data/carta.json         // texto de la carta y remitente/firma
/data/config.json        // nombre de ella, fecha de inicio para el contador, textos generales
```

Ejemplo de `momentos.json` — cada objeto puede alimentar línea de tiempo Y mapa:

```json
[
  {
    "id": "conocerse",
    "fecha": "2024-11-09",
    "titulo": "Nos conocimos",
    "descripcion": "Texto corto de este momento.",
    "foto": "fotos/momentos/conocerse.jpg",
    "nota": "Un recuerdo personal tuyo sobre ese día.",
    "lugar": {
      "nombre": "Nombre del lugar",
      "lat": 0.0,
      "lng": 0.0
    }
  },
  {
    "id": "primer-beso",
    "fecha": "2024-12-10",
    "titulo": "Fiestas de Quito — primer beso",
    "descripcion": "Texto corto de este momento.",
    "foto": "fotos/momentos/primer-beso.jpg",
    "nota": "Otro recuerdo personal.",
    "lugar": { "nombre": "Quito", "lat": -0.1807, "lng": -78.4678 }
  },
  {
    "id": "empezamos",
    "fecha": "2025-01-07",
    "titulo": "Empezamos en serio",
    "descripcion": "Texto corto de este momento.",
    "foto": "fotos/momentos/empezamos.jpg",
    "nota": "Recuerdo personal.",
    "lugar": null
  }
]
```

El campo `lugar` es opcional: si un momento no tiene coordenadas, el mapa simplemente lo
ignora y solo aparece en la línea de tiempo. Las coordenadas (`lat`/`lng`) se obtienen
una sola vez por lugar, a mano, con **Nominatim** (el mismo servicio de geocodificación
gratuita que ya usas): buscas el lugar en
[nominatim.openstreetmap.org/ui/search.html](https://nominatim.openstreetmap.org/ui/search.html)
y copias la latitud/longitud que te da — no hace falta que el sitio final haga esa
consulta en vivo, con guardar el número una vez alcanza.

---

## 6. Stack técnico sugerido

| Capa | Herramienta | Por qué |
|---|---|---|
| Sitio | **HTML + CSS + JavaScript plano** (sin framework pesado) | Es una página de contenido fijo, no una app — así se mantiene liviana, rápida en GitHub Pages, y fácil de tocar a mano si algún día quieres cambiar un texto sin recompilar nada. |
| Hosting / link | **GitHub Pages** (cuenta `ddat03` ya en uso) | Gratis, sin dominio propio, da un link estable en minutos. Ver nota de privacidad en la sección 8. |
| Mapa interactivo | **Leaflet.js** (vía CDN) + tiles de **OpenStreetMap** | Gratis, sin necesitar API key, liviano — el mismo ecosistema que Nominatim (que ya usas para geocodificar). |
| Geocodificación de lugares | **Nominatim** (uso puntual, a mano, una vez por lugar) | Ya es una cuenta/herramienta que usas; no hace falta nada nuevo. |
| Efecto de galaxia/partículas (intro) | **tsParticles** o **particles.js** (vía CDN) | Librerías ligeras hechas justo para este tipo de fondo animado, no hace falta programar el efecto desde cero. |
| Galería dinámica + visor | **CSS Grid/Masonry + IntersectionObserver** (nativo) y una librería liviana tipo **PhotoSwipe** o **GLightbox** (vía CDN) para el visor a pantalla completa | Cubre el "aparecer con animación al hacer scroll" y el zoom/lightbox sin backend. |
| Contador de tiempo juntos | JavaScript plano (`setInterval` + diferencia de fechas) | No necesita librería, es un cálculo simple en el navegador. |

> Todo esto es una sugerencia de punto de partida — Claude Code puede ajustar el stack
> si al revisar su propia biblioteca de plantillas (Jarvis) encuentra algo que calce
> mejor para este tipo de página estática.

---

## 7. Identidad visual

- Tono cálido y personal, no corporativo: tipografía con algo de personalidad para
  títulos (ej. una fuente manuscrita de Google Fonts como "Dancing Script" o "Caveat"
  para títulos, combinada con una fuente legible para el cuerpo de texto).
- Paleta sugerida: tonos rosados/vino cálidos con acentos dorados o lavanda (ej. `#7A1F3D`
  o `#B5495B` como color principal, `#F7E7DA` o `#FDF3F0` de fondo, un dorado suave
  `#D4A056` para detalles) — ajustable a lo que sepas que le gusta a ella (su color
  favorito, por ejemplo).
- Animaciones suaves al hacer scroll (fade-in, deslizar) en vez de todo apareciendo de
  golpe, coherente con la idea de "ir revelando" la sorpresa poco a poco.
- Totalmente responsive: es muy probable que ella lo abra desde el celular primero.

---

## 8. Prompts listos para pegar en VS Code

Pensados para usarse en orden con Claude Code. El Prompt 0 es de contexto general —
pégalo primero, una sola vez (por ejemplo en un archivo `CLAUDE.md` en la raíz del
proyecto), para que el asistente recuerde el contexto completo en los siguientes
prompts.

### Prompt 0 — Contexto general del proyecto (pegar primero, una sola vez)

```
Estoy construyendo una página web romántica de regalo para mi novia [NOMBRE], sin
dominio propio, para compartir solo con un link (se va a publicar en GitHub Pages).
Es HTML + CSS + JavaScript plano, sin backend ni base de datos, con contenido personal
guardado en archivos JSON separados para poder editarlo fácil.

Secciones de la página, en este orden:
1. Portada/Intro: fondo animado tipo galaxia/partículas (usar tsParticles o
   particles.js vía CDN), título con el nombre de ella, botón "Toca para entrar", y el
   contador en vivo de "tiempo juntos" (días, horas, minutos, segundos) calculado desde
   el 7 de enero de 2025.
2. La Carta: un sobre animado que se abre con clic/tap y revela un mensaje de texto
   largo y personalizado (el texto sale de data/carta.json).
3. Nuestra Historia: línea de tiempo vertical con los momentos de data/momentos.json
   (cada uno con fecha, título, descripción, foto y nota), animada al hacer scroll.
4. Nuestro Mapa: mapa interactivo con Leaflet.js + tiles de OpenStreetMap, con un pin
   por cada momento de data/momentos.json que tenga campo "lugar" con coordenadas; al
   tocar un pin se abre una tarjeta con foto, descripción y nota de ese lugar.
5. Galería: cuadrícula de fotos de data/galeria.json que aparecen con animación al
   hacer scroll (IntersectionObserver), con un visor a pantalla completa tipo
   lightbox al hacer clic (usar PhotoSwipe o GLightbox vía CDN).
6. Cierre: mensaje final corto y un botón para volver a la carta o reiniciar.

Todo el contenido personal (textos, fechas, fotos, lugares) vive en archivos JSON
separados dentro de una carpeta /data, no hardcodeado en el HTML/JS, para poder
editarlo después sin tocar código. El modelo de datos de momentos.json es:
[pega aquí el bloque JSON de ejemplo de la sección 5 de este documento]

Identidad visual: tono cálido y personal, tipografía manuscrita para títulos (ej.
Dancing Script de Google Fonts) combinada con una fuente legible para el cuerpo,
paleta en tonos rosado/vino con acentos dorados, animaciones suaves de scroll (no todo
apareciendo de golpe), totalmente responsive porque se va a ver primero desde celular.

No hay dominio propio: se va a publicar en GitHub Pages, así que todas las rutas de
archivos (imágenes, JSON) deben ser relativas para funcionar bien desde un subpath
tipo usuario.github.io/nombre-repo/.

Cuando te pida cosas en los siguientes prompts, mantén todo este contexto.
```

### Prompt 1 — Scaffolding del proyecto

```
Crea la estructura inicial del proyecto: index.html, carpetas /css, /js, /data,
/fotos (con subcarpetas /fotos/momentos y /fotos/galeria), y un README breve con
instrucciones de cómo previsualizar el sitio localmente (por ejemplo con la extensión
Live Server de VS Code) y cómo publicarlo en GitHub Pages (rama, carpeta, y ajustes en
GitHub). Crea los archivos data/momentos.json, data/galeria.json, data/carta.json y
data/config.json con la estructura de ejemplo de este documento pero con contenido
de relleno ("Lorem ipsum" / fotos placeholder), listo para que yo los reemplace
después con mi contenido real.
```

### Prompt 2 — Portada con intro animada y contador

```
Crea la sección de Portada en index.html: un fondo de partículas/galaxia animado con
tsParticles (o particles.js) cargado vía CDN, configurado en tonos oscuros con
partículas rosadas/doradas y algunas en forma sutil de corazón si la librería lo
permite. Encima, un título grande con el nombre de ella (desde data/config.json), un
subtítulo corto, y un botón "Toca para entrar" que hace scroll o navega a la siguiente
sección. Debajo del título, agrega un contador en vivo (días, horas, minutos, segundos)
de "tiempo juntos" calculado en JavaScript puro a partir de una fecha de inicio que
también viene de data/config.json. Que se vea bien y no se sienta pesado en un celular
de gama media.
```

### Prompt 3 — La Carta (sobre animado)

```
Crea la sección "La Carta": un sobre ilustrado (puede ser CSS/SVG, no hace falta una
imagen) que al hacer clic o tap se abre con una animación (la solapa se abre, la carta
sale y se despliega) y muestra el texto que viene de data/carta.json (mensaje y firma).
El texto debe soportar varios párrafos. Agrega un botón para "cerrar" la carta y volver
a verla de nuevo si se quiere.
```

### Prompt 4 — Nuestra Historia (línea de tiempo)

```
Crea la sección "Nuestra Historia": una línea de tiempo vertical que lee
data/momentos.json y por cada momento muestra, en orden cronológico, la fecha, el
título, la descripción, la foto y la nota. Cada tarjeta debe aparecer con una animación
de fade-in/deslizamiento al entrar en pantalla (usa IntersectionObserver, no una
librería pesada). En escritorio la línea de tiempo puede alternar tarjetas a izquierda y
derecha de una línea central; en celular debe verse como una sola columna.
```

### Prompt 5 — Nuestro Mapa

```
Crea la sección "Nuestro Mapa" con Leaflet.js (vía CDN) y tiles de OpenStreetMap. Lee
data/momentos.json y agrega un marcador por cada momento que tenga el campo "lugar" con
coordenadas válidas (ignora los que no lo tengan). Al hacer clic en un marcador, abre un
popup o panel lateral con la foto, la descripción del lugar y la nota de ese momento.
Centra el mapa inicial de forma que se vean todos los marcadores a la vez (usa los
bounds de Leaflet). Asegúrate de que los assets de Leaflet (CSS/JS) se carguen bien
también quedando publicado en un subpath de GitHub Pages, no solo en localhost.
```

### Prompt 6 — Galería dinámica

```
Crea la sección "Galería": una cuadrícula (CSS Grid o estilo masonry) que lee
data/galeria.json (lista de rutas de fotos y, opcional, un texto corto por foto). Cada
foto debe aparecer con una animación de entrada al hacer scroll (IntersectionObserver),
con un efecto hover sutil. Al hacer clic en cualquier foto, ábrela en un visor a
pantalla completa tipo lightbox (usa PhotoSwipe o GLightbox vía CDN) que permita
navegar entre todas las fotos de la galería con flechas o swipe en celular. Usa
`loading="lazy"` en las imágenes para no cargar todo de golpe.
```

### Prompt 7 — Cierre

```
Crea una última sección de "Cierre": un mensaje corto final (texto editable, desde
data/config.json o un nuevo campo), opcionalmente repite el contador de tiempo juntos,
y agrega dos botones: uno que hace scroll hacia arriba para "volver a leer la carta" y
otro que hace scroll hasta arriba del todo (portada).
```

### Prompt 8 — Optimización de imágenes y rendimiento

```
Revisa todas las imágenes referenciadas en /fotos y sugiere/aplica una estrategia de
optimización: conversión a formato WebP donde tenga sentido, tamaños máximos
razonables para web (no subir fotos a resolución de cámara completa), y lazy loading
en todas las imágenes fuera de la portada. Si hay muchas fotos, sugiere si conviene
generar miniaturas separadas para la vista de cuadrícula de la galería y cargar la
versión completa solo al abrir el lightbox.
```

### Prompt 9 — Pulido visual y responsive

```
Revisa toda la página con la identidad visual definida (tipografía manuscrita para
títulos, paleta rosado/vino con acentos dorados, animaciones suaves de scroll) y
asegúrate de que se vea bien y sea fácil de navegar en celular (que es donde
probablemente se abra primero), tablet y escritorio. Revisa que las transiciones entre
secciones no se sientan bruscas y que el sitio cargue rápido incluso en una conexión
móvil normal.
```

### Prompt 10 — Publicación en GitHub Pages

```
Prepara el proyecto para publicarse en GitHub Pages: revisa que todas las rutas de
archivos (CSS, JS, JSON, imágenes) sean relativas y funcionen correctamente en un
subpath tipo usuario.github.io/nombre-repo/, no solo en localhost. Agrega un archivo
robots.txt que desaliente la indexación (Disallow: /) y una meta etiqueta
`<meta name="robots" content="noindex">` en el head, ya que el sitio no debe aparecer
en buscadores. Dame los pasos exactos para activar GitHub Pages en este repo desde la
configuración de GitHub (qué rama y carpeta elegir) y cuál sería el link final.
```

### Prompt 11 — Revisión final

```
Revisa todo el proyecto: que no haya rutas rotas de imágenes o de archivos JSON, que el
contador de tiempo funcione con cualquier fecha que se le ponga en config.json, que el
mapa cargue bien sus marcadores incluso si algún momento no tiene "lugar", que el sitio
completo funcione sin errores de consola, y que se vea bien tanto en modo claro como si
el celular está en modo oscuro (si el navegador fuerza colores oscuros por sistema).
Sugiere mejoras si encuentras algo.
```

---

## 9. Más ideas para cuando quieras ampliarlo

- **Música de fondo:** una canción especial sonando bajito con un botón de
  pausa/play — fácil de sumar más adelante con un `<audio>` y un archivo mp3 propio
  (cuidado con subir canciones con derechos de autor a un repo público; mejor una
  grabación propia o algo libre de regalías).
- **Más hitos en la línea de tiempo:** como el modelo de datos ya está pensado para
  crecer, puedes ir agregando momentos nuevos (viajes, aniversarios futuros) sin tocar
  código, solo editando `momentos.json`.
- **Modo "sorpresa" con contraseña:** si más adelante cambias de opinión sobre la
  privacidad, se puede agregar una pantalla simple de "ingresa la clave" antes de
  mostrar el contenido (no es seguridad real, pero evita que alguien que encuentre el
  link por casualidad vea todo).
- **QR para compartir:** generar un código QR del link final (hay librerías JS gratuitas
  para esto) por si quieres imprimirlo o mandarlo de una forma más física/sorpresa.

---

## 10. Siguientes pasos sugeridos

1. Reunir el contenido de la sección 4 (texto de la carta, hitos, lugares con fotos y
   notas, fotos para la galería) — no hace falta tenerlo perfecto, se puede ir
   completando mientras Claude Code arma la parte técnica.
2. Para cada lugar del mapa, buscar sus coordenadas una vez en
   [nominatim.openstreetmap.org/ui/search.html](https://nominatim.openstreetmap.org/ui/search.html)
   y guardarlas junto al resto del contenido de ese lugar.
3. Crear un repositorio nuevo en tu cuenta de GitHub (`ddat03`) para este proyecto.
4. Ir pegando los prompts en orden (0 al 11) en VS Code con Claude Code, revisando cada
   sección antes de pasar a la siguiente — recuerda que Claude Code va a revisar
   primero su propia biblioteca de plantillas (Jarvis) antes de armar cada parte desde
   cero, así que puede ajustar detalles técnicos de este plan si encuentra algo que
   calce mejor.
5. Antes de compartir el link con ella, revisar el sitio completo desde un celular
   (no solo desde la computadora) para confirmar que todo se vea y cargue bien.
6. Nota de privacidad a tener en cuenta: GitHub Pages gratis para una cuenta personal
   requiere que el repositorio sea público para poder publicarlo (a menos que tengas
   GitHub Pro/Team). El link en sí no se comparte en ningún buscador, pero el
   repositorio (con las fotos) queda técnicamente visible para alguien que llegue a tu
   perfil de GitHub y lo busque a propósito. Si eso te incomoda, una alternativa simple
   es ponerle al repositorio un nombre neutro (que no diga "regalo" ni el nombre de
   ella) para que no llame la atención en tu lista de repos.
