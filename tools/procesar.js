/**
 * Procesa IMAGES/{TIMELINE,MAPA,GALERIA} y genera:
 *   fotos/timeline/*.webp   + data/momentos.json
 *   fotos/mapa/*.webp       + data/mapa.json
 *   fotos/galeria/*.webp    + fotos/galeria/thumbs/*.webp + data/galeria.json
 *
 * De cada foto saca fecha y ubicación del EXIF (si los tiene). Para el mapa,
 * reverse-geocodifica con Nominatim y guarda una "referencia cercana" (no la
 * dirección exacta). Cachea las respuestas en tools/geocache.json.
 *
 * Uso:  cd tools && npm install && node procesar.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const exifr = require('exifr');

const BASE = path.join(__dirname, '..', 'IMAGES');
const OUT = path.join(__dirname, '..', 'fotos');
const DATA = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(__dirname, 'geocache.json');
const CONTACT = process.env.NOMINATIM_CONTACT_EMAIL || 'diegodavidaleman@gmail.com';
const UA = 'RegaloWebNuestraHistoria/1.0 (proyecto personal; ' + CONTACT + ')';

/* Nombres bonitos de lugares (el reverse-geocode a veces da la calle o algo vago).
   Se aplica al punto más cercano dentro de ~1.2 km. Editá libremente. */
const LUGARES = [
  { lat: -1.0985, lng: -78.5929, nombre: 'Salcedo' },
  { lat: -1.0991, lng: -78.5926, nombre: 'Laguna de Yambo' },
  { lat: -0.1816, lng: -78.4950, nombre: 'Quito' },
  { lat: -0.2082, lng: -78.5034, nombre: 'Quito' },
  { lat: -0.2243, lng: -78.5140, nombre: 'Centro Histórico de Quito' },
  { lat: -0.2188, lng: -78.5116, nombre: 'Centro Histórico de Quito' },
  { lat: -1.0445, lng: -78.5924, nombre: 'Hacienda cerca de Salcedo' },
  { lat: -0.9298, lng: -78.6172, nombre: 'Latacunga' },
  { lat: -0.9168, lng: -78.6576, nombre: 'Once de Noviembre, Latacunga' },
  { lat: -0.1108, lng: -78.2970, nombre: 'El Quinche' },
  { lat: -1.2349, lng: -78.6264, nombre: 'Ambato' },
  { lat: -1.2287, lng: -78.6247, nombre: 'Ambato' },
  { lat: -0.9656, lng: -78.4054, nombre: 'Reserva Llanganates' },
  { lat: -0.9909, lng: -78.4292, nombre: 'Reserva Llanganates' },
  { lat: -1.0324, lng: -78.5009, nombre: 'Cumbijín' },
  { lat: -0.0020, lng: -78.4558, nombre: 'Mitad del Mundo' },
  { lat: -0.5400, lng: -78.2246, nombre: 'Cotundo, Napo' }
];
function distKm(a, b, c, d) {
  const R = 6371, r = Math.PI / 180;
  const x = (c - a) * r, y = (d - b) * r * Math.cos((a + c) / 2 * r);
  return Math.sqrt(x * x + y * y) * R;
}
function nombreBonito(lat, lng, fallback) {
  let mejor = null, min = 1.2;
  for (const l of LUGARES) {
    const dd = distKm(lat, lng, l.lat, l.lng);
    if (dd < min) { min = dd; mejor = l.nombre; }
  }
  return mejor || fallback;
}
function tituloCase(s) {
  const min = ['de', 'del', 'la', 'el', 'y', 'en'];
  return String(s).toLowerCase().split(/\s+/).map((w, i) =>
    (i > 0 && min.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE)) : {};
function guardarCache() { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2)); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- fechas ---------- */
function fechaDeNombre(name) {
  const m = name.match(/(20\d{2})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  return { iso: `${m[1]}-${m[2]}-${m[3]}`, hora: `${m[4]}:${m[5]}` };
}
function fechaLegible(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------- geocoding ---------- */
async function reverseGeocode(lat, lng) {
  const key = 'r:' + lat.toFixed(5) + ',' + lng.toFixed(5);
  if (cache[key]) return cache[key];
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}` +
    `&format=jsonv2&accept-language=es&zoom=16`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const j = await res.json();
  const a = j.address || {};
  // "mejor referencia cercana": prioriza puntos de interés / barrio / localidad
  const referencia = [
    a.tourism || a.leisure || a.amenity || a.building || a.road || a.neighbourhood ||
      a.suburb || a.hamlet || a.village || a.town || a.city_district,
    a.city || a.town || a.village || a.county
  ].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 2).join(', ');
  const out = {
    referencia: referencia || j.name || j.display_name || 'Ecuador',
    ciudad: a.city || a.town || a.village || a.county || a.state || '',
    display: j.display_name || ''
  };
  cache[key] = out;
  guardarCache();
  await sleep(1200);
  return out;
}

/* ---------- imágenes ---------- */
async function webp(src, dst, max, q) {
  await sharp(src).rotate().resize(max, max, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: q }).toFile(dst);
}
function md5(p) { return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex'); }

async function leerCarpeta(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) return [];
  const vistos = new Set();
  const items = [];
  for (const f of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) continue;
    const ext = path.extname(f).toLowerCase();
    if (!/\.(jpe?g|png|mp4|mov)$/.test(ext)) continue;
    const h = md5(full);
    if (vistos.has(h)) { console.log('  (dup) ' + f); continue; }
    vistos.add(h);

    const esVideo = /\.(mp4|mov)$/.test(ext);
    let exif = {};
    if (!esVideo) { try { exif = (await exifr.parse(full, { gps: true, exif: true })) || {}; } catch (e) {} }

    const fn = fechaDeNombre(f);
    const iso = fn ? fn.iso
      : (exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString().slice(0, 10) : null);

    const mensajeMatch = f.match(/^\S+\s+(.*?)\s*(?:@\s*([^.@]+))?\s*\.\w+$/);
    let mensaje = '', lugarTxt = '';
    if (mensajeMatch) {
      mensaje = (mensajeMatch[1] || '').replace(/_[A-Z0-9]+\b/g, '').trim();
      lugarTxt = (mensajeMatch[2] || '').trim();
    }
    const presente = /^PRESENTE/i.test(f);
    if (presente) { mensaje = f.replace(/^PRESENTE\s*-\s*/i, '').replace(/\.\w+$/, '').trim(); }

    items.push({
      archivo: f, ruta: full, esVideo, hash: h,
      fechaISO: iso,
      lat: typeof exif.latitude === 'number' ? exif.latitude : null,
      lng: typeof exif.longitude === 'number' ? exif.longitude : null,
      mensaje, lugarTxt, presente
    });
  }
  return items;
}

/* ---------- main ---------- */
(async () => {
  fs.mkdirSync(path.join(OUT, 'timeline'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'mapa'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'galeria', 'thumbs'), { recursive: true });
  const limpiar = (p) => {
    if (!fs.existsSync(p)) return;
    fs.readdirSync(p).forEach((f) => {
      const fp = path.join(p, f);
      if (fs.statSync(fp).isFile() && /\.(webp|mp4|mov|jpg|jpeg|png)$/i.test(f)) fs.unlinkSync(fp);
    });
  };
  [ 'timeline', 'mapa', 'galeria', 'galeria/thumbs', 'momentos' ].forEach((d) => limpiar(path.join(OUT, d)));

  /* ---- TIMELINE ---- */
  const tl = await leerCarpeta('TIMELINE');
  tl.sort((a, b) => String(a.fechaISO || '9999').localeCompare(String(b.fechaISO || '9999')));
  const momentos = [];
  let i = 0;
  for (const it of tl) {
    i += 1;
    const id = 't' + String(i).padStart(2, '0');
    if (!it.esVideo) await webp(it.ruta, path.join(OUT, 'timeline', id + '.webp'), 1400, 80);
    let ref = '';
    if (it.lat != null) {
      try { ref = (await reverseGeocode(it.lat, it.lng)).referencia; }
      catch (e) { console.log('  geo err', it.archivo, e.message); }
    }
    const nombreLugar = it.presente ? ''
      : (it.lat != null ? nombreBonito(it.lat, it.lng, it.lugarTxt ? tituloCase(it.lugarTxt) : ref)
        : (it.lugarTxt ? tituloCase(it.lugarTxt) : ''));
    momentos.push({
      id,
      fecha: it.fechaISO,
      titulo: it.presente ? 'Hoy' : (nombreLugar || 'Un momento nuestro'),
      descripcion: '',
      foto: 'fotos/timeline/' + id + '.webp',
      nota: capitalizarFrase(it.mensaje),
      lugar: it.lat != null ? {
        nombre: nombreLugar || ref,
        lat: +it.lat.toFixed(4),
        lng: +it.lng.toFixed(4)
      } : null
    });
    console.log(`TL ${id}  ${it.fechaISO || '(sin fecha)'}  ${nombreLugar}  ${ref ? '['+ref+']' : ''}`);
  }

  /* ---- MAPA ---- */
  const mp = await leerCarpeta('MAPA');
  mp.sort((a, b) => String(a.fechaISO).localeCompare(String(b.fechaISO)));
  const tlPts = momentos.filter((m) => m.lugar).map((m) => [ m.lugar.lat, m.lugar.lng ]);
  const mapa = [];
  i = 0;
  for (const it of mp) {
    if (it.lat == null) { console.log('  (mapa sin GPS, se omite) ' + it.archivo); continue; }
    const cerca = tlPts.some((p) => distKm(it.lat, it.lng, p[0], p[1]) < 1.5);
    if (cerca) { console.log('  (mapa ya cubierto por la línea de tiempo) ' + it.archivo); continue; }
    i += 1;
    const id = 'm' + String(i).padStart(2, '0');
    await webp(it.ruta, path.join(OUT, 'mapa', id + '.webp'), 1000, 78);
    let g = { referencia: '', ciudad: '' };
    try { g = await reverseGeocode(it.lat, it.lng); } catch (e) { console.log('  geo err', it.archivo, e.message); }
    mapa.push({
      id,
      fecha: it.fechaISO,
      foto: 'fotos/mapa/' + id + '.webp',
      lugar: {
        nombre: nombreBonito(it.lat, it.lng, g.referencia || g.ciudad || 'Un lugar nuestro'),
        ciudad: g.ciudad || '',
        lat: +it.lat.toFixed(4),
        lng: +it.lng.toFixed(4)
      }
    });
    console.log(`MP ${id}  ${it.fechaISO}  ${g.referencia}  (${g.ciudad})`);
  }

  /* ---- GALERIA ---- */
  const gl = await leerCarpeta('GALERIA');
  gl.sort((a, b) => String(a.fechaISO || '0').localeCompare(String(b.fechaISO || '0')));
  const galeria = [];
  i = 0;
  for (const it of gl) {
    i += 1;
    const id = 'g' + String(i).padStart(2, '0');
    if (it.esVideo) {
      fs.copyFileSync(it.ruta, path.join(OUT, 'galeria', id + '.mp4'));
      galeria.push({ tipo: 'video', src: 'fotos/galeria/' + id + '.mp4', fecha: it.fechaISO || '', texto: '' });
      continue;
    }
    await webp(it.ruta, path.join(OUT, 'galeria', id + '.webp'), 1600, 80);
    await webp(it.ruta, path.join(OUT, 'galeria', 'thumbs', id + '.webp'), 640, 72);
    galeria.push({
      tipo: 'foto',
      src: 'fotos/galeria/' + id + '.webp',
      thumb: 'fotos/galeria/thumbs/' + id + '.webp',
      fecha: it.fechaISO || '',
      texto: ''
    });
  }

  fs.writeFileSync(path.join(DATA, 'momentos.json'), JSON.stringify(momentos, null, 2) + '\n');
  fs.writeFileSync(path.join(DATA, 'mapa.json'), JSON.stringify(mapa, null, 2) + '\n');
  fs.writeFileSync(path.join(DATA, 'galeria.json'), JSON.stringify(galeria, null, 2) + '\n');

  console.log('\n=== LISTO ===');
  console.log('  timeline:', momentos.length, '| mapa:', mapa.length, '| galeria:', galeria.length);
  console.log('  Revisá data/momentos.json (títulos y notas) y data/mapa.json (referencias).');
})();

function capitalizarFrase(s) {
  if (!s) return '';
  s = s.trim().toLowerCase();
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s.replace(/([.!?]\s+)([a-záéíóúñ])/g, (m, p, c) => p + c.toUpperCase());
}
